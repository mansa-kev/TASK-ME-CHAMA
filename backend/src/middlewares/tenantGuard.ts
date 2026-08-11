import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'TCM_SUPER_ADMIN' | 'CHAMA_ADMIN' | 'MEMBER';
  chamaId?: string | null;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  chamaId?: string;
}

/**
 * Enforces strict multi-tenant boundary.
 * Super Admins can pass an explicit chamaId via query/header if needed for administrative oversight.
 * Group Officials & Members are strictly locked to their own verified JWT chamaId.
 */
export const tenantGuard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Super Admin bypass / explicit tenant scoping
  if (user.role === 'TCM_SUPER_ADMIN') {
    const targetChamaId = (req.query.chamaId as string) || (req.headers['x-chama-id'] as string) || user.chamaId;
    if (targetChamaId) {
      req.chamaId = targetChamaId;
    }
    return next();
  }

  // Non-super-admins MUST have an assigned chamaId
  if (!user.chamaId) {
    return res.status(403).json({ error: 'No Chama group associated with this account' });
  }

  try {
    const chama = await prisma.chama.findUnique({
      where: { id: user.chamaId },
      include: {
        subscription: true
      }
    });

    if (!chama) {
      return res.status(404).json({ error: 'Chama group not found or has been deactivated' });
    }

    if (chama.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This Chama group has been suspended. Please contact platform support.' });
    }

    // Attach verified tenant ID to the request object
    req.chamaId = user.chamaId;
    next();
  } catch (error) {
    console.error('Tenant verification error:', error);
    return res.status(500).json({ error: 'Internal tenant verification failure' });
  }
};

/**
 * Utility helper to ensure a resource belongs to the current tenant before manipulation.
 */
export const assertTenantOwnership = (resourceChamaId: string | null | undefined, req: AuthenticatedRequest): boolean => {
  if (req.user?.role === 'TCM_SUPER_ADMIN') return true;
  if (!resourceChamaId || !req.chamaId) return false;
  return resourceChamaId === req.chamaId;
};
