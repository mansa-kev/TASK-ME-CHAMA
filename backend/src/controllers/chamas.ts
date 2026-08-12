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
        regNo: chama.registration,
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
      meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled, officials 
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

    if (officials && Array.isArray(officials) && officials.length > 0) {
      for (const official of officials) {
        if (official.memberId) {
          await prisma.user.update({
            where: { id: official.memberId },
            data: {
              chamaId: newChama.id,
              officialPosition: official.position,
              role: 'CHAMA_ADMIN'
            }
          });
        }
      }
    }

    res.status(201).json(newChama);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create Chama' });
  }
};

export const updateChama = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { 
      name, phone, county, registration, formationDate,
      meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled
    } = req.body;
    
    const updatedChama = await prisma.chama.update({
      where: { id },
      data: {
        ...(name             && { name }),
        ...(phone            !== undefined && { phone }),
        ...(county           !== undefined && { county }),
        ...(registration     && { registration }),
        ...(formationDate    && { formationDate: new Date(formationDate) }),
        ...(meetingFrequency && { meetingFrequency }),
        ...(standardContribution !== undefined && standardContribution !== '' && { standardContribution: parseFloat(standardContribution) }),
        ...(lateFine         !== undefined && lateFine !== '' && { lateFine: parseFloat(lateFine) }),
        ...(missedFine       !== undefined && missedFine !== '' && { missedFine: parseFloat(missedFine) }),
        ...(roscaEnabled     !== undefined && { roscaEnabled: Boolean(roscaEnabled) }),
      }
    });

    res.json(updatedChama);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update Chama' });
  }
};

export const assignChamaOfficial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const { memberId, position } = req.body;

    if (!memberId || !position) {
      return res.status(400).json({ error: 'memberId and position are required' });
    }

    // Clear anyone currently holding this exact position in this chama
    await prisma.user.updateMany({
      where: { chamaId: id, officialPosition: position },
      data: { officialPosition: null, role: 'MEMBER' }
    });

    // Assign the new official
    const updated = await prisma.user.update({
      where: { id: memberId },
      data: {
        chamaId: id,
        officialPosition: position,
        role: 'CHAMA_ADMIN'
      }
    });

    res.json({ success: true, member: { id: updated.id, name: updated.name, officialPosition: updated.officialPosition } });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to assign official' });
  }
};

export const addMemberToChama = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const { memberId } = req.body;

    if (!memberId) return res.status(400).json({ error: 'memberId is required' });

    const user = await prisma.user.update({
      where: { id: memberId },
      data: { chamaId: id }
    });

    res.json({ success: true, member: { id: user.id, name: user.name, chamaId: user.chamaId } });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add member to chama' });
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

    const nextMember = chama.members[Math.floor(Math.random() * chama.members.length)];

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

export const getChamaById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params as { id: string };
    const chama = await prisma.chama.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true, name: true, phone: true, officialPosition: true, role: true }
        },
        ledgers: true,
        _count: { select: { members: true } }
      }
    });

    if (!chama) return res.status(404).json({ error: 'Chama not found' });

    // Build leadership object from officials
    const chairperson = chama.members.find(m => m.officialPosition === 'Chairperson');
    const treasurer   = chama.members.find(m => m.officialPosition === 'Treasurer');
    const secretary   = chama.members.find(m => m.officialPosition === 'Secretary');

    const totalSavings = chama.ledgers.reduce((s, l) => s + l.savingsBalance + l.sharesBalance, 0);
    const activeLoans  = chama.ledgers.reduce((s, l) => s + l.activeLoanBalance, 0);

    res.json({
      id: chama.id,
      name: chama.name,
      registration: chama.registration,
      regNo: chama.registration,
      phone: chama.phone,
      county: chama.county,
      formationDate: chama.formationDate,
      meetingFreq: chama.meetingFrequency,
      meetingFrequency: chama.meetingFrequency,
      contribution: chama.standardContribution ?? 0,
      standardContribution: chama.standardContribution ?? 0,
      lateFine: chama.lateFine ?? 0,
      missedFine: chama.missedFine ?? 0,
      roscaEnabled: chama.roscaEnabled,
      status: chama.status,
      stats: {
        totalMembers: chama._count.members,
        totalSavings,
        activeLoans,
        finesFund: 0,
        cycleNumber: 1
      },
      leadership: {
        chairperson: chairperson?.name ?? null,
        chairpersonId: chairperson?.id ?? null,
        treasurer: treasurer?.name ?? null,
        treasurerId: treasurer?.id ?? null,
        secretary: secretary?.name ?? null,
        secretaryId: secretary?.id ?? null,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChamaMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const members = await prisma.user.findMany({
      where: { chamaId: id },
      select: { id: true, name: true, phone: true, email: true, officialPosition: true, role: true, status: true, createdAt: true }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChamaTableBanking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const collections = await prisma.meetingCollection.findMany({
      where: { chamaId: id },
      orderBy: { date: 'desc' }
    });
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
        amount: parseFloat(amount),
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
        amount: parseFloat(amount)
      }
    });
    res.json(penalty);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
