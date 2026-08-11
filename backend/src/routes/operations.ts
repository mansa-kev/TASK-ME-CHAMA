import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

// ─── OPERATIONS TASKS ─────────────────────────────────────────────

router.get("/tasks", async (_req: Request, res: Response) => {
  try {
    const data = await (prisma as any).operationsTask.findMany({ orderBy: { createdAt: "desc" } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/tasks", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).operationsTask.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.put("/tasks/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const data = await (prisma as any).operationsTask.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task status" });
  }
});

router.delete("/tasks/:id", async (req: Request, res: Response) => {
  try {
    await (prisma as any).operationsTask.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ─── PAYROLL RECORDS ─────────────────────────────────────────────

router.get("/payroll", async (_req: Request, res: Response) => {
  try {
    const data = await (prisma as any).payrollRecord.findMany({ orderBy: { createdAt: "desc" } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payroll" });
  }
});

router.post("/payroll", async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).payrollRecord.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create payroll record" });
  }
});

router.delete("/payroll/:id", async (req: Request, res: Response) => {
  try {
    await (prisma as any).payrollRecord.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete payroll record" });
  }
});

export default router;
