import { Router } from 'express';
import { getMembers, createMember, getMyProfile, getMyFines, updateKyc, updateMemberKycAdmin, updateMySettings, resetMemberPasswordAdmin, getMemberShares, getMemberAudit, memberDeposit, memberDisburse, memberPenalty, exportMemberSavingsCsv } from '../controllers/member';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMyProfile);
router.get('/me/fines', getMyFines);
router.get('/me/savings/export-csv', exportMemberSavingsCsv);
router.put('/me/kyc', updateKyc);
router.put('/me/settings', updateMySettings);
router.get('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getMembers);
router.post('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), createMember);
router.put('/:id/kyc', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), updateMemberKycAdmin);
router.post('/:id/reset-password', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), resetMemberPasswordAdmin);

router.get('/:id/shares', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getMemberShares);
router.get('/:id/audit', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getMemberAudit);
router.post('/:id/deposit', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'OFFICIAL']), memberDeposit);
router.post('/:id/disburse', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'OFFICIAL']), memberDisburse);
router.post('/:id/penalty', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'OFFICIAL']), memberPenalty);

export default router;

