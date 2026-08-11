"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bylaws_1 = require("../controllers/bylaws");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tenantGuard_1 = require("../middlewares/tenantGuard");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, tenantGuard_1.tenantGuard, bylaws_1.getChamaBylaws);
router.put('/', authMiddleware_1.authMiddleware, tenantGuard_1.tenantGuard, (0, authMiddleware_1.requireRole)(['TCM_SUPER_ADMIN', 'CHAMA_ADMIN']), bylaws_1.updateChamaBylaws);
exports.default = router;
//# sourceMappingURL=bylaws.js.map