"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_1 = require("../controllers/ledger");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'CREDIT_OFFICER']), ledger_1.getLedgers);
router.post('/transaction', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'TELLER']), ledger_1.postTransaction);
router.post('/transaction/batch', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'TELLER']), ledger_1.postBatchTransaction);
exports.default = router;
//# sourceMappingURL=ledger.js.map