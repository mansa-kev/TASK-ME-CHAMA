import { Request } from 'express';
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
export declare const logAuditEvent: ({ req, action, entity, entityId, details, previousState, newState, status, chamaId }: AuditParams) => Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map