import { Router } from 'express';
import { getLedgers, postTransaction, postBatchTransaction, exportChamasLedgerCsv } from '../controllers/ledger';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/chamas/export-csv', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), exportChamasLedgerCsv);
router.get('/', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'CREDIT_OFFICER']), getLedgers);
router.post('/transaction', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'TELLER']), postTransaction);
router.post('/transaction/batch', requireRole(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'TELLER']), postBatchTransaction);

export default router;

