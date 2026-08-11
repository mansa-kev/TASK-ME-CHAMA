"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_1 = require("../controllers/stats");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get('/', (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), stats_1.getStats);
exports.default = router;
//# sourceMappingURL=stats.js.map