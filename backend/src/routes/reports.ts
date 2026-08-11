import { Router } from 'express';
import { getStaffPerformance, getMemberStatement } from '../controllers/reports';

const router = Router();

router.get('/staff-performance', getStaffPerformance);
router.get('/member-statement/:id', getMemberStatement);

export default router;
