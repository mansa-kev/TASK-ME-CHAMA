"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_1 = require("../controllers/reports");
const router = (0, express_1.Router)();
router.get('/staff-performance', reports_1.getStaffPerformance);
router.get('/member-statement/:id', reports_1.getMemberStatement);
exports.default = router;
//# sourceMappingURL=reports.js.map