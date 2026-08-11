"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saas_1 = require("../controllers/saas");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantGuard_1 = require("../middlewares/tenantGuard");
const securityLimiter_1 = require("../middlewares/securityLimiter");
const router = (0, express_1.Router)();
// Public self-service Chama registration
router.post('/register-chama', securityLimiter_1.authLimiter, saas_1.registerChamaTenant);
router.get('/plans/public', saas_1.getSubscriptionPlans);
// Tenant-scoped routes (Requires Login & Active Chama Guard)
router.get('/subscription/current', authMiddleware_1.authMiddleware, tenantGuard_1.tenantGuard, saas_1.getCurrentSubscription);
router.get('/subscription', authMiddleware_1.authMiddleware, tenantGuard_1.tenantGuard, saas_1.getCurrentSubscription);
// Super Admin platform management routes
router.get('/plans', authMiddleware_1.authMiddleware, saas_1.getSubscriptionPlans);
router.post('/plans', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.upsertSubscriptionPlan);
router.get('/tenants', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getTenants);
router.put('/tenants/:id/status', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.updateTenantStatus);
router.get('/analytics', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getPlatformAnalytics);
router.get('/audit-logs', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getAuditLogs);
// SMS Gateway & Broadcast routes
router.get('/sms-gateway/logs', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getSmsLogs);
router.post('/sms-gateway/broadcast', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.sendSmsBroadcast);
// Daraja M-Pesa Gateway routes
router.get('/daraja-gateway/status', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getDarajaStatus);
router.get('/daraja-gateway/logs', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.getDarajaLogs);
router.post('/daraja-gateway/test-stk', authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), saas_1.testStkPush);
exports.default = router;
//# sourceMappingURL=saas.js.map