import { Router } from 'express';
import { getStaffPerformance, getMemberStatement, generateReport, saveReport, getSavedReports } from '../controllers/reports';

const router = Router();

router.get('/staff-performance', getStaffPerformance);
router.get('/member-statement/:id', getMemberStatement);
router.post('/generate', generateReport);
router.post('/save', saveReport);
router.get('/saved', getSavedReports);

export default router;
