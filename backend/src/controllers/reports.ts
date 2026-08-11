import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getStaffPerformance = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['TCM_ADMIN', 'CHAMA_ADMIN'] } },
      select: { id: true, name: true, createdAt: true }
    });

    const performance = await Promise.all(staff.map(async (s) => {
      const tasksCompleted = await prisma.operationsTask.count({
        where: { assignedTo: s.id, status: 'COMPLETED' }
      });

      const membersRegistered = await prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } }
      });

      const loansProcessed = await prisma.loan.count({
        where: { status: 'APPROVED' }
      });

      return {
        id: s.id,
        name: s.name,
        membersRegistered: membersRegistered,
        loansProcessed: loansProcessed,
        tasksCompleted,
        lastActivity: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'
      };
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff performance' });
  }
};

export const getMemberStatement = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Get the member's name to find their ledger entries
    const member = await prisma.user.findUnique({ where: { id }, select: { name: true } });
    
    const ledgers = await prisma.accountLedger.findMany({
      where: { accountName: { contains: member?.name || id as string } },
      orderBy: { createdAt: 'asc' }
    });

    res.json(ledgers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member statement' });
  }
};
