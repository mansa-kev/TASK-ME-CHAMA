import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getChamas = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Super admin sees all chamas, others only see their own
    const whereClause = user.role === 'TCM_SUPER_ADMIN' 
      ? {} 
      : { members: { some: { id: user.id } } };

    const chamas = await prisma.chama.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true }
        },
        ledgers: true
      }
    });

    // Map to frontend expected format
    const formattedChamas = chamas.map(chama => {
      const totalPool = chama.ledgers.reduce((sum, l) => sum + l.savingsBalance + l.sharesBalance, 0);
      const activeLoans = chama.ledgers.reduce((sum, l) => sum + l.activeLoanBalance, 0);
      
      return {
        id: chama.id,
        name: chama.name,
        registration: chama.registration,
        memberCount: chama._count.members,
        meetingFrequency: chama.meetingFrequency || 'Monthly',
        totalPool,
        activeLoans,
        nextPayoutDate: chama.nextPayoutDate ? chama.nextPayoutDate.toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextPayoutMember: chama.nextPayoutMember || 'Pending Rotation'
      };
    });

    res.json(formattedChamas);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChama = async (req: Request, res: Response) => {
  try {
    const { 
      name, registration, phone, county, formationDate, 
      meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled 
    } = req.body;
    
    const newChama = await prisma.chama.create({
      data: {
        name,
        registration,
        phone,
        county,
        formationDate: formationDate ? new Date(formationDate) : null,
        meetingFrequency,
        standardContribution: standardContribution ? parseFloat(standardContribution) : null,
        lateFine: lateFine ? parseFloat(lateFine) : null,
        missedFine: missedFine ? parseFloat(missedFine) : null,
        roscaEnabled: roscaEnabled || false
      }
    });

    res.status(201).json(newChama);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create Chama' });
  }
};

export const updateChama = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { 
      name, phone, county
    } = req.body;
    
    const updatedChama = await prisma.chama.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(county && { county }),
      }
    });

    res.json(updatedChama);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update Chama' });
  }
};

export const rotateMerryGoRound = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const chama = await prisma.chama.findUnique({
      where: { id: id as string },
      include: { members: true }
    });

    if (!chama) {
      return res.status(404).json({ error: 'Chama not found' });
    }

    if (!chama.roscaEnabled || !chama.members || chama.members.length === 0) {
      return res.status(400).json({ error: 'Merry-Go-Round is not enabled or no members available' });
    }

    // Logic to rotate cycle
    // Pick next member. For simplicity, we just pick a random member or the next one in the array
    // Since we don't have an order saved, let's pick a random member to simulate rotation
    const nextMember = chama.members[Math.floor(Math.random() * chama.members.length)];
    
    // Deduct shares logic can be added here if needed (e.g. creating Journal Vouchers or updating ledgers)

    // Set next payout date (+1 month)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const updatedChama = await prisma.chama.update({
      where: { id: id as string },
      data: {
        nextPayoutDate: nextDate,
        nextPayoutMember: nextMember.name
      }
    });

    res.json(updatedChama);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to rotate Merry-Go-Round cycle' });
  }
};

export const getMyChama = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.chamaId) {
       return res.status(404).json({ error: 'Chama not found for this user' });
    }
    const chama = await prisma.chama.findUnique({ where: { id: dbUser.chamaId } });
    
    const profile = await (prisma as any).chamaProfile.findFirst();

    // Get officials
    const officials = await prisma.user.findMany({
      where: {
        chamaId: dbUser.chamaId,
        role: 'CHAMA_ADMIN'
      }
    });

    return res.json({ chama, officials, profile });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChamaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const chama = await prisma.chama.findUnique({ where: { id } });
    if (!chama) return res.status(404).json({ error: 'Chama not found' });
    res.json(chama);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChamaMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const members = await prisma.user.findMany({ where: { chamaId: id } });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChamaTableBanking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const collections = await prisma.meetingCollection.findMany({ where: { chamaId: id } });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const chamaDeposit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount, reference, memberId } = req.body;
    const payment = await prisma.payment.create({
      data: {
        chamaId: id,
        amount,
        receiptNo: reference || `REC-${Date.now()}`,
        type: 'INBOUND'
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const chamaPenalty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { amount, reason, memberId } = req.body;
    const penalty = await prisma.disciplinaryRecord.create({
      data: {
        chamaId: id,
        memberId: memberId || 'UNKNOWN',
        type: 'FINE',
        reason: reason || 'Penalty',
        amount: amount
      }
    });
    res.json(penalty);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
