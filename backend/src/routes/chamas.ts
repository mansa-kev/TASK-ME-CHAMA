import { Router } from 'express';
import { getChamas, createChama, updateChama, rotateMerryGoRound, getMyChama, getChamaById, getChamaMembers, getChamaTableBanking, chamaDeposit, chamaPenalty } from '../controllers/chamas';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/mine', getMyChama);
router.get('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getChamas);
router.post('/', requireRole(['TCM_SUPER_ADMIN']), createChama);
router.put('/:id', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), updateChama);
router.post('/:id/merry-go-round', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), rotateMerryGoRound);

export default router;

router.get('/:id', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getChamaById);
router.get('/:id/members', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getChamaMembers);
router.get('/:id/table-banking', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), getChamaTableBanking);
router.post('/:id/deposit', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), chamaDeposit);
router.post('/:id/penalty', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), chamaPenalty);
