"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', auth_1.register);
router.post('/login', auth_1.login);
router.post('/change-password', authMiddleware_1.authMiddleware, auth_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map