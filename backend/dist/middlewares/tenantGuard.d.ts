import { Request, Response, NextFunction } from 'express';
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
export declare const tenantGuard: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Utility helper to ensure a resource belongs to the current tenant before manipulation.
 */
export declare const assertTenantOwnership: (resourceChamaId: string | null | undefined, req: AuthenticatedRequest) => boolean;
//# sourceMappingURL=tenantGuard.d.ts.map