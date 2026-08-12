"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_1 = require("../controllers/reports");
const router = (0, express_1.Router)();
router.get('/staff-performance', reports_1.getStaffPerformance);
router.get('/member-statement/:id', reports_1.getMemberStatement);
router.post('/generate', reports_1.generateReport);
router.post('/save', reports_1.saveReport);
router.get('/saved', reports_1.getSavedReports);
exports.default = router;
//# sourceMappingURL=reports.js.map