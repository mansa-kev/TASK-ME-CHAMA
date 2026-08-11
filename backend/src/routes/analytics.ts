import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getAnalytics);

export default router;
