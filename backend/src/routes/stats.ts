import { Router } from 'express';
import { getStats } from '../controllers/stats';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getStats);

export default router;
