import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

// ─── PAYROLL ───────────────────────────────────────────────

router.get("/payroll", async (_req: Request, res: Response) => {
  try { res.json(await (prisma as any).payrollRecord.findMany({ orderBy: { createdAt: "desc" } })); }
  catch { res.status(500).json({ error: "Failed to fetch payroll" }); }
});

router.post("/payroll", async (req: Request, res: Response) => {
  try { res.status(201).json(await (prisma as any).payrollRecord.create({ data: req.body })); }
  catch { res.status(500).json({ error: "Failed to create payroll record" }); }
});

router.put("/payroll/:id", async (req: Request, res: Response) => {
  try { res.json(await (prisma as any).payrollRecord.update({ where: { id: req.params.id }, data: req.body })); }
  catch { res.status(500).json({ error: "Failed to update payroll record" }); }
});

// ─── MESSAGE TEMPLATES ─────────────────────────────────────

router.get("/message-templates", async (_req: Request, res: Response) => {
  try { res.json(await (prisma as any).messageTemplate.findMany({ orderBy: { createdAt: "desc" } })); }
  catch { res.status(500).json({ error: "Failed to fetch templates" }); }
});

router.post("/message-templates", async (req: Request, res: Response) => {
  try { res.status(201).json(await (prisma as any).messageTemplate.create({ data: req.body })); }
  catch { res.status(500).json({ error: "Failed to create template" }); }
});

router.put("/message-templates/:id", async (req: Request, res: Response) => {
  try { res.json(await (prisma as any).messageTemplate.update({ where: { id: req.params.id }, data: req.body })); }
  catch { res.status(500).json({ error: "Failed to update template" }); }
});

router.delete("/message-templates/:id", async (req: Request, res: Response) => {
  try { await (prisma as any).messageTemplate.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch { res.status(500).json({ error: "Failed to delete template" }); }
});

// ─── ROLES ─────────────────────────────────────────────────

router.get("/roles", async (_req: Request, res: Response) => {
  try { res.json(await (prisma as any).role.findMany({ orderBy: { name: "asc" } })); }
  catch { res.status(500).json({ error: "Failed to fetch roles" }); }
});

router.post("/roles", async (req: Request, res: Response) => {
  try { res.status(201).json(await (prisma as any).role.create({ data: req.body })); }
  catch { res.status(500).json({ error: "Failed to create role" }); }
});

router.put("/roles/:id", async (req: Request, res: Response) => {
  try { res.json(await (prisma as any).role.update({ where: { id: req.params.id }, data: req.body })); }
  catch { res.status(500).json({ error: "Failed to update role" }); }
});

router.delete("/roles/:id", async (req: Request, res: Response) => {
  try { await (prisma as any).role.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch { res.status(500).json({ error: "Failed to delete role" }); }
});

// ─── MEMBER TYPES ──────────────────────────────────────────

router.get("/member-types", async (_req: Request, res: Response) => {
  try { res.json(await (prisma as any).memberType.findMany({ orderBy: { name: "asc" } })); }
  catch { res.status(500).json({ error: "Failed to fetch member types" }); }
});

router.post("/member-types", async (req: Request, res: Response) => {
  try { res.status(201).json(await (prisma as any).memberType.create({ data: req.body })); }
  catch { res.status(500).json({ error: "Failed to create member type" }); }
});

router.put("/member-types/:id", async (req: Request, res: Response) => {
  try { res.json(await (prisma as any).memberType.update({ where: { id: req.params.id }, data: req.body })); }
  catch { res.status(500).json({ error: "Failed to update member type" }); }
});

router.delete("/member-types/:id", async (req: Request, res: Response) => {
  try { await (prisma as any).memberType.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch { res.status(500).json({ error: "Failed to delete member type" }); }
});

// ─── SYSTEM CONSTANTS ──────────────────────────────────────

router.get("/system-constants", async (_req: Request, res: Response) => {
  try { res.json(await (prisma as any).systemConstant.findMany({ orderBy: { key: "asc" } })); }
  catch { res.status(500).json({ error: "Failed to fetch constants" }); }
});

router.post("/system-constants", async (req: Request, res: Response) => {
  try { res.status(201).json(await (prisma as any).systemConstant.create({ data: req.body })); }
  catch { res.status(500).json({ error: "Failed to create constant" }); }
});

router.put("/system-constants/:id", async (req: Request, res: Response) => {
  try { res.json(await (prisma as any).systemConstant.update({ where: { id: req.params.id }, data: req.body })); }
  catch { res.status(500).json({ error: "Failed to update constant" }); }
});

router.delete("/system-constants/:id", async (req: Request, res: Response) => {
  try { await (prisma as any).systemConstant.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch { res.status(500).json({ error: "Failed to delete constant" }); }
});

// ─── USERS MANAGEMENT ──────────────────────────────────────

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await (prisma as any).user.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, chamaId: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch { res.status(500).json({ error: "Failed to fetch users" }); }
});

router.put("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const user = await (prisma as any).user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch { res.status(500).json({ error: "Failed to update user role" }); }
});

router.put("/users/:id/profile", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, password } = req.body;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const dataToUpdate: any = { phone };
    if (name) dataToUpdate.name = name;
    
    if (password) {
       const bcrypt = require('bcryptjs');
       dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    const user = await (prisma as any).user.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json(user);
  } catch (error) { 
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" }); 
  }
});

// ─── QUICK SEARCH ──────────────────────────────────────────

router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q) return res.json({ members: [], loans: [], chamas: [], accounts: [] });

    const [members, loans, chamas, accounts] = await Promise.all([
      (prisma as any).user.findMany({
        where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      }),
      (prisma as any).loan.findMany({
        where: { OR: [{ memberName: { contains: q, mode: "insensitive" } }, { productName: { contains: q, mode: "insensitive" } }] },
        select: { id: true, memberName: true, productName: true, principal: true, status: true },
        take: 5,
      }),
      (prisma as any).chama.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, registration: true },
        take: 5,
      }),
      (prisma as any).accountLedger.findMany({
        where: { accountName: { contains: q, mode: "insensitive" } },
        select: { id: true, accountName: true, accountType: true, balance: true },
        take: 5,
      }),
    ]);

    res.json({ members, loans, chamas, accounts });
  } catch { res.status(500).json({ error: "Search failed" }); }
});

// ─── LOCK / UNLOCK USER ────────────────────────────────────

router.put("/users/:id/lock", async (req: Request, res: Response) => {
  try {
    const user = await (prisma as any).user.findUnique({ where: { id: req.params.id }, select: { locked: true } });
    const newLocked = !(user?.locked || false);
    const updated = await (prisma as any).user.update({
      where: { id: req.params.id },
      data: { locked: newLocked },
      select: { id: true, name: true, email: true, locked: true },
    });
    res.json(updated);
  } catch { res.status(500).json({ error: "Failed to toggle user lock" }); }
});

// ─── RESET PASSWORD ────────────────────────────────────────

router.post("/users/:id/reset-password", async (req: Request, res: Response) => {
  try {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let tempPass = '';
    for (let i = 0; i < 10; i++) tempPass += chars.charAt(Math.floor(Math.random() * chars.length));

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPass, 10);
    await (prisma as any).user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
    });
    res.json({ tempPassword: tempPass });
  } catch { res.status(500).json({ error: "Failed to reset password" }); }
});

export default router;
