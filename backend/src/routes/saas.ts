import { Router } from 'express';
import {
  getSubscriptionPlans,
  upsertSubscriptionPlan,
  getTenants,
  updateTenantStatus,
  deleteTenant,
  getPlatformAnalytics,
  getAuditLogs,
  registerChamaTenant,
  getCurrentSubscription,
  getSmsLogs,
  sendSmsBroadcast,
  getDarajaStatus,
  getDarajaLogs,
  testStkPush
} from '../controllers/saas';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { tenantGuard } from '../middlewares/tenantGuard';
import { authLimiter } from '../middlewares/securityLimiter';

const router = Router();

// Public self-service Chama registration
router.post('/register-chama', authLimiter, registerChamaTenant);
router.get('/plans/public', getSubscriptionPlans);

// Tenant-scoped routes (Requires Login & Active Chama Guard)
router.get('/subscription/current', authMiddleware, tenantGuard, getCurrentSubscription);
router.get('/subscription', authMiddleware, tenantGuard, getCurrentSubscription);

// Super Admin platform management routes
router.get('/plans', authMiddleware, getSubscriptionPlans);
router.post('/plans', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), upsertSubscriptionPlan);
router.get('/tenants', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getTenants);
router.put('/tenants/:id/status', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), updateTenantStatus);
router.get('/analytics', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getPlatformAnalytics);
router.get('/audit-logs', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getAuditLogs);

// SMS Gateway & Broadcast routes
router.get('/sms-gateway/logs', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getSmsLogs);
router.post('/sms-gateway/broadcast', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), sendSmsBroadcast);

// Daraja M-Pesa Gateway routes
router.get('/daraja-gateway/status', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getDarajaStatus);
router.get('/daraja-gateway/logs', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), getDarajaLogs);
router.post('/daraja-gateway/test-stk', authMiddleware, requireRole(['TCM_SUPER_ADMIN']), testStkPush);

export default router;
