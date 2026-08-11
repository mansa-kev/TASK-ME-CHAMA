"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = void 0;
const prisma_1 = require("../prisma");
/**
 * Asynchronously writes an immutable audit record to the database for forensic and security tracking.
 */
const logAuditEvent = async ({ req, action, entity, entityId, details, previousState, newState, status = 'SUCCESS', chamaId }) => {
    try {
        const user = req.user;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'UNKNOWN';
        const userAgent = req.headers['user-agent'] || 'UNKNOWN';
        const effectiveChamaId = chamaId || req.chamaId || user?.chamaId || null;
        if (!user?.id) {
            return;
        }
        await prisma_1.prisma.auditLog.create({
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
    }
    catch (error) {
        console.error('⚠️ Failed to write audit log:', error);
    }
};
exports.logAuditEvent = logAuditEvent;
//# sourceMappingURL=auditLogger.js.map