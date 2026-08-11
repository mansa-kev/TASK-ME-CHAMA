import { Router } from 'express';
import { getChamaBylaws, updateChamaBylaws } from '../controllers/bylaws';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { tenantGuard } from '../middlewares/tenantGuard';

const router = Router();

router.get('/', authMiddleware, tenantGuard, getChamaBylaws);
router.put('/', authMiddleware, tenantGuard, requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), updateChamaBylaws);

export default router;
