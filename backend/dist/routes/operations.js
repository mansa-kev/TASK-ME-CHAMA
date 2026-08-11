"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// ─── OPERATIONS TASKS ─────────────────────────────────────────────
router.get("/tasks", async (_req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.findMany({ orderBy: { createdAt: "desc" } });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});
router.post("/tasks", async (req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});
router.put("/tasks/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const data = await prisma_1.prisma.operationsTask.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update task status" });
    }
});
router.delete("/tasks/:id", async (req, res) => {
    try {
        await prisma_1.prisma.operationsTask.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});
// ─── PAYROLL RECORDS ─────────────────────────────────────────────
router.get("/payroll", async (_req, res) => {
    try {
        const data = await prisma_1.prisma.payrollRecord.findMany({ orderBy: { createdAt: "desc" } });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payroll" });
    }
});
router.post("/payroll", async (req, res) => {
    try {
        const data = await prisma_1.prisma.payrollRecord.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create payroll record" });
    }
});
router.delete("/payroll/:id", async (req, res) => {
    try {
        await prisma_1.prisma.payrollRecord.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete payroll record" });
    }
});
exports.default = router;
//# sourceMappingURL=operations.js.map