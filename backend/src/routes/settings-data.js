"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// ─── PAYROLL ───────────────────────────────────────────────
router.get("/payroll", async (_req, res) => {
    try {
        res.json(await prisma_1.prisma.payrollRecord.findMany({ orderBy: { createdAt: "desc" } }));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch payroll" });
    }
});
router.post("/payroll", async (req, res) => {
    try {
        res.status(201).json(await prisma_1.prisma.payrollRecord.create({ data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to create payroll record" });
    }
});
router.put("/payroll/:id", async (req, res) => {
    try {
        res.json(await prisma_1.prisma.payrollRecord.update({ where: { id: req.params.id }, data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to update payroll record" });
    }
});
// ─── MESSAGE TEMPLATES ─────────────────────────────────────
router.get("/message-templates", async (_req, res) => {
    try {
        res.json(await prisma_1.prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } }));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch templates" });
    }
});
router.post("/message-templates", async (req, res) => {
    try {
        res.status(201).json(await prisma_1.prisma.messageTemplate.create({ data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to create template" });
    }
});
router.put("/message-templates/:id", async (req, res) => {
    try {
        res.json(await prisma_1.prisma.messageTemplate.update({ where: { id: req.params.id }, data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to update template" });
    }
});
router.delete("/message-templates/:id", async (req, res) => {
    try {
        await prisma_1.prisma.messageTemplate.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: "Failed to delete template" });
    }
});
// ─── ROLES ─────────────────────────────────────────────────
router.get("/roles", async (_req, res) => {
    try {
        res.json(await prisma_1.prisma.role.findMany({ orderBy: { name: "asc" } }));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch roles" });
    }
});
router.post("/roles", async (req, res) => {
    try {
        res.status(201).json(await prisma_1.prisma.role.create({ data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to create role" });
    }
});
router.put("/roles/:id", async (req, res) => {
    try {
        res.json(await prisma_1.prisma.role.update({ where: { id: req.params.id }, data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to update role" });
    }
});
// ─── MEMBER TYPES ──────────────────────────────────────────
router.get("/member-types", async (_req, res) => {
    try {
        res.json(await prisma_1.prisma.memberType.findMany({ orderBy: { name: "asc" } }));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch member types" });
    }
});
router.post("/member-types", async (req, res) => {
    try {
        res.status(201).json(await prisma_1.prisma.memberType.create({ data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to create member type" });
    }
});
router.put("/member-types/:id", async (req, res) => {
    try {
        res.json(await prisma_1.prisma.memberType.update({ where: { id: req.params.id }, data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to update member type" });
    }
});
// ─── SYSTEM CONSTANTS ──────────────────────────────────────
router.get("/system-constants", async (_req, res) => {
    try {
        res.json(await prisma_1.prisma.systemConstant.findMany({ orderBy: { key: "asc" } }));
    }
    catch {
        res.status(500).json({ error: "Failed to fetch constants" });
    }
});
router.post("/system-constants", async (req, res) => {
    try {
        res.status(201).json(await prisma_1.prisma.systemConstant.create({ data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to create constant" });
    }
});
router.put("/system-constants/:id", async (req, res) => {
    try {
        res.json(await prisma_1.prisma.systemConstant.update({ where: { id: req.params.id }, data: req.body }));
    }
    catch {
        res.status(500).json({ error: "Failed to update constant" });
    }
});
// ─── USERS MANAGEMENT ──────────────────────────────────────
router.get("/users", async (_req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, chamaId: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(users);
    }
    catch {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
router.put("/users/:id/role", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.role },
            select: { id: true, name: true, email: true, role: true },
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: "Failed to update user role" });
    }
});
router.put("/users/:id/profile", async (req, res) => {
    try {
        const { firstName, lastName, phone, password } = req.body;
        const dataToUpdate = { firstName, lastName, phone };
        if (password) {
            // Ideally hash the password before saving, assuming bcrypt is setup
            const bcrypt = require('bcryptjs');
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: req.params.id },
            data: dataToUpdate,
            select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, role: true },
        });
        res.json(user);
    }
    catch {
        res.status(500).json({ error: "Failed to update profile" });
    }
});
// ─── QUICK SEARCH ──────────────────────────────────────────
router.get("/search", async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q)
            return res.json({ members: [], loans: [], chamas: [], accounts: [] });
        const [members, loans, chamas, accounts] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
                select: { id: true, name: true, email: true, role: true },
                take: 5,
            }),
            prisma_1.prisma.loan.findMany({
                where: { OR: [{ memberName: { contains: q, mode: "insensitive" } }, { productName: { contains: q, mode: "insensitive" } }] },
                select: { id: true, memberName: true, productName: true, principal: true, status: true },
                take: 5,
            }),
            prisma_1.prisma.chama.findMany({
                where: { name: { contains: q, mode: "insensitive" } },
                select: { id: true, name: true, registration: true },
                take: 5,
            }),
            prisma_1.prisma.accountLedger.findMany({
                where: { accountName: { contains: q, mode: "insensitive" } },
                select: { id: true, accountName: true, accountType: true, balance: true },
                take: 5,
            }),
        ]);
        res.json({ members, loans, chamas, accounts });
    }
    catch {
        res.status(500).json({ error: "Search failed" });
    }
});
exports.default = router;
//# sourceMappingURL=settings-data.js.map