"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chamas_1 = require("../controllers/chamas");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), chamas_1.getChamas);
router.post('/', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN']), chamas_1.createChama);
router.put('/:id', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), chamas_1.updateChama);
router.post('/:id/merry-go-round', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), chamas_1.rotateMerryGoRound);
exports.default = router;
//# sourceMappingURL=chamas.js.map