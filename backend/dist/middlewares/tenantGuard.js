"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertTenantOwnership = exports.tenantGuard = void 0;
const prisma_1 = require("../prisma");
/**
 * Enforces strict multi-tenant boundary.
 * Super Admins can pass an explicit chamaId via query/header if needed for administrative oversight.
 * Group Officials & Members are strictly locked to their own verified JWT chamaId.
 */
const tenantGuard = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    // Super Admin bypass / explicit tenant scoping
    if (user.role === 'TCM_SUPER_ADMIN') {
        const targetChamaId = req.query.chamaId || req.headers['x-chama-id'] || user.chamaId;
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
        const chama = await prisma_1.prisma.chama.findUnique({
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
    }
    catch (error) {
        console.error('Tenant verification error:', error);
        return res.status(500).json({ error: 'Internal tenant verification failure' });
    }
};
exports.tenantGuard = tenantGuard;
/**
 * Utility helper to ensure a resource belongs to the current tenant before manipulation.
 */
const assertTenantOwnership = (resourceChamaId, req) => {
    if (req.user?.role === 'TCM_SUPER_ADMIN')
        return true;
    if (!resourceChamaId || !req.chamaId)
        return false;
    return resourceChamaId === req.chamaId;
};
exports.assertTenantOwnership = assertTenantOwnership;
//# sourceMappingURL=tenantGuard.js.map