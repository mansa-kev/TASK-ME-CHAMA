import { Request, Response } from 'express';
import { prisma } from '../prisma';

export interface AuditParams {
  req: Request;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  previousState?: any;
  newState?: any;
  status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  chamaId?: string;
}

/**
 * Asynchronously writes an immutable audit record to the database for forensic and security tracking.
 */
export const logAuditEvent = async ({
  req,
  action,
  entity,
  entityId,
  details,
  previousState,
  newState,
  status = 'SUCCESS',
  chamaId
}: AuditParams) => {
  try {
    const user = (req as any).user;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || 'UNKNOWN';
    const userAgent = req.headers['user-agent'] || 'UNKNOWN';
    const effectiveChamaId = chamaId || (req as any).chamaId || user?.chamaId || null;

    if (!user?.id) {
      return;
    }

    await prisma.auditLog.create({
      data: {
        chamaId: effectiveChamaId,
        userId: user.id,
        userEmail: user.email || null,
        userRole: user.role || null,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent).substring(0, 500),
        action,
        entity,
        entityId,
        details: details || null,
        previousState: previousState || null,
        newState: newState || null,
        status
      }
    });
  } catch (error) {
    console.error('⚠️ Failed to write audit log:', error);
  }
};
