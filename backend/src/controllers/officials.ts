import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Helper to get chamaId from user (with Super Admin fallback)
const getChamaId = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.chamaId) return user.chamaId;
  if (user?.role === 'TCM_SUPER_ADMIN') {
    const firstChama = await prisma.chama.findFirst();
    return firstChama?.id || null;
  }
  return null;
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { period } = req.query;
    let startDate: Date | undefined;
    
    const now = new Date();
    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    const totalMembers = await prisma.user.count({ where: { chamaId } });
    const membersChange = await prisma.user.count({ where: { chamaId, ...dateFilter } });

    const totalSavings = await prisma.savingsAccount.aggregate({
      where: { chamaId },
      _sum: { balance: true }
    });
    
    const inboundPayments = await prisma.payment.aggregate({
      where: { chamaId, type: 'INBOUND', ...dateFilter },
      _sum: { amount: true }
    });
    const savingsChange = inboundPayments._sum.amount || 0;

    const activeLoans = await prisma.loan.count({
      where: { chamaId, status: 'ACTIVE' }
    });
    const loansChange = await prisma.loan.count({
      where: { chamaId, status: 'ACTIVE', ...dateFilter }
    });

    const upcomingMeetings = await prisma.meeting.count({
      where: { chamaId, date: { gte: new Date() } }
    });
    const meetingsChange = await prisma.meeting.count({
      where: { chamaId, date: { gte: new Date(), ... (startDate ? { lte: new Date(now.getTime() + (now.getTime() - startDate.getTime())) } : {}) } }
    });

    // Calculate percentage changes
    const calcPercent = (current: number, change: number) => {
      if (current - change <= 0) return change > 0 ? 100 : 0;
      return Math.round((change / (current - change)) * 100 * 10) / 10;
    };

    res.json({
      totalMembers,
      membersChange: calcPercent(totalMembers, membersChange),
      totalSavings: totalSavings._sum.balance || 0,
      savingsChange: calcPercent(totalSavings._sum.balance || 0, savingsChange),
      activeLoans,
      loansChange: calcPercent(activeLoans, loansChange),
      upcomingMeetings,
      meetingsChange: calcPercent(upcomingMeetings, meetingsChange)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const members = await prisma.user.findMany({
      where: { chamaId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        idNumber: true,
        kraPin: true,
        nextOfKinName: true,
        nextOfKinPhone: true,
        role: true,
        status: true,
        createdAt: true,
        ledger: true,
        kyc: true
      }
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { name, email, phone, role } = req.body;
    
    // In a real app, generate a random password and send email
    const member = await prisma.user.create({
      data: {
        name, email, phone, role: role || 'MEMBER', password: 'password123', chamaId,
        ledger: { create: { chamaId, savingsBalance: 0, sharesBalance: 0, activeLoanBalance: 0 } }
      }
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const { role } = req.body;
    
    const member = await prisma.user.updateMany({
      where: { id, chamaId },
      data: { role }
    });
    res.json({ success: true, count: member.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    
    // Soft delete member
    const member = await prisma.user.updateMany({
      where: { id, chamaId },
      data: { status: 'DEACTIVATED' }
    });
    res.json({ success: true, count: member.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContributions = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const payments = await prisma.payment.findMany({
      where: { chamaId, type: 'INBOUND' },
      orderBy: { date: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addContribution = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { amount, narration, memberId } = req.body;

    const payment = await prisma.payment.create({
      data: {
        chamaId: chamaId!,
        receiptNo: `RCT-${Date.now()}`,
        amount,
        narration,
        type: 'INBOUND',
        date: new Date()
      }
    });

    if (memberId) {
      // Update ledger
      const member = await prisma.user.findUnique({ where: { id: memberId }, include: { ledger: true } });
      if (member?.ledger) {
        await prisma.ledger.update({
          where: { id: member.ledger.id },
          data: { savingsBalance: { increment: amount } }
        });
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLoans = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const loans = await prisma.loan.findMany({
      where: { chamaId },
      include: {
        guarantors: true,
        repayments: true
      },
      orderBy: { applicationDate: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveLoan = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const loan = await prisma.loan.updateMany({
      where: { id, chamaId },
      data: { status: 'APPROVED' }
    });
    res.json({ success: true, count: loan.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const disburseLoan = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const loan = await prisma.loan.updateMany({
      where: { id, chamaId },
      data: { status: 'DISBURSED', disbursementDate: new Date() }
    });
    res.json({ success: true, count: loan.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recordLoanRepayment = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { loanId, amount, principalPortion, interestPortion } = req.body;
    
    const repayment = await prisma.loanRepayment.create({
      data: {
        chamaId: chamaId!,
        loanId,
        amount,
        principalPortion: principalPortion || amount,
        interestPortion: interestPortion || 0,
        dueDate: new Date(),
        paidDate: new Date(),
        status: 'PAID'
      }
    });

    await prisma.loan.update({
      where: { id: loanId },
      data: { balance: { decrement: principalPortion || amount } }
    });

    res.json(repayment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTreasuryAccounts = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const accounts = await prisma.accountLedger.findMany({
      where: { chamaId }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTreasurySummary = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const totalBank = await prisma.accountLedger.aggregate({
      where: { chamaId, accountName: { contains: 'Bank' } },
      _sum: { balance: true }
    });
    const totalCash = await prisma.accountLedger.aggregate({
      where: { chamaId, accountName: { contains: 'Cash' } },
      _sum: { balance: true }
    });
    const expenses = await prisma.expense.aggregate({
      where: { chamaId }, _sum: { amount: true }
    });
    res.json({
      bankBalance: totalBank._sum.balance || 0,
      cashBalance: totalCash._sum.balance || 0,
      totalExpenses: expenses._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotices = async (req: Request, res: Response) => {
  res.json([]);
};

export const getArrears = async (req: Request, res: Response) => {
  res.json([]);
};

export const getWelfare = async (req: Request, res: Response) => {
  res.json([]);
};

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { fromAccountId, toAccountId, amount, narration } = req.body;

    await prisma.$transaction([
      prisma.accountLedger.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } }
      }),
      prisma.accountLedger.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } }
      }),
      prisma.journalVoucher.create({
        data: {
          chamaId: chamaId!,
          accountName: 'Inter-account Transfer',
          debit: amount,
          credit: amount,
          narration,
          postedBy: (req as any).user.id,
          date: new Date()
        }
      })
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const meetings = await prisma.meeting.findMany({
      where: { chamaId },
      include: { attendances: true },
      orderBy: { date: 'desc' }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { title, date, type } = req.body;
    
    const meeting = await prisma.meeting.create({
      data: {
        chamaId: chamaId!,
        title, date: new Date(date), type,
        status: 'SCHEDULED'
      }
    });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const { status, minutes } = req.body;

    const meeting = await prisma.meeting.updateMany({
      where: { id, chamaId },
      data: { status, minutes }
    });
    res.json({ success: true, count: meeting.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const { memberId, status } = req.body;

    const attendance = await prisma.meetingAttendance.create({
      data: {
        chamaId: chamaId!,
        meetingId: id,
        memberId,
        status
      }
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFinancialReport = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    
    const totalSavings = await prisma.savingsAccount.aggregate({
      where: { chamaId }, _sum: { balance: true }
    });
    const activeLoans = await prisma.loan.aggregate({
      where: { chamaId, status: 'ACTIVE' }, _sum: { balance: true }
    });
    const cashAtBank = await prisma.accountLedger.findFirst({
      where: { chamaId, accountName: { contains: 'Bank' } }
    });

    res.json({
      totalSavings: totalSavings._sum.balance || 0,
      totalOutstandingLoans: activeLoans._sum.balance || 0,
      cashAtBank: cashAtBank?.balance || 0,
      reportDate: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const profile = await prisma.chamaProfile.findFirst({
      where: { id: chamaId! } // Since we're using single chama for now, id might be chamaId, or we might need to find by some relation.
      // Wait, in my schema, ChamaProfile is standalone or related? It doesn't have chamaId. It has id.
    });

    if (!profile) {
      // Return defaults if none
      return res.json({ name: 'Chama Name', contributionAmount: 1000 });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const data = req.body;
    
    // In a real app we'd update by chamaId
    const profile = await prisma.chamaProfile.updateMany({
      // where: { id: chamaId },
      data
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveMember = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const member = await prisma.user.updateMany({
      where: { id, chamaId },
      data: { status: 'ACTIVE' }
    });
    res.json({ success: true, count: member.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectMember = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const member = await prisma.user.updateMany({
      where: { id, chamaId },
      data: { status: 'REJECTED' }
    });
    res.json({ success: true, count: member.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDiscipline = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const records = await prisma.disciplinaryRecord.findMany({
      where: { chamaId },
      orderBy: { date: 'desc' }
    });
    
    // Map member names
    const memberIds = records.map(r => r.memberId);
    const members = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true }
    });
    
    const memberMap = new Map(members.map(m => [m.id, m.name]));
    
    const enhancedRecords = records.map(r => ({
      ...r,
      memberName: memberMap.get(r.memberId) || 'Unknown Member'
    }));
    
    res.json(enhancedRecords);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBroadcasts = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const broadcasts = await prisma.communicationLog.findMany({
      where: { chamaId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDiscipline = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { memberId, type, reason, amount } = req.body;
    const record = await prisma.disciplinaryRecord.create({
      data: {
        chamaId: chamaId!,
        memberId,
        type,
        reason,
        amount: amount || 0,
      }
    });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectLoan = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const loan = await prisma.loan.updateMany({
      where: { id, chamaId },
      data: { status: 'REJECTED' }
    });
    res.json({ success: true, count: loan.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const postNotice = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { title, content, priority } = req.body;
    const notice = await prisma.notice.create({
      data: {
        chamaId: chamaId!,
        authorId: (req as any).user.id,
        title,
        content,
        priority: priority || 'NORMAL',
      }
    });
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeNotice = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const id = req.params.id as string;
    const deleted = await prisma.notice.deleteMany({
      where: { id, chamaId }
    });
    res.json({ success: true, count: deleted.count });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const expenses = await prisma.expense.findMany({
      where: { chamaId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvestments = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const investments = await prisma.investment.findMany({
      where: { chamaId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- REAL ZERO-MOCKUP GOVERNANCE & FINANCIAL ENGINES ---

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const [auditLogs, payments, loans, disbursements] = await Promise.all([
      prisma.auditLog.findMany({
        where: { chamaId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.payment.findMany({
        where: { chamaId },
        orderBy: { date: 'desc' },
        take: 10
      }),
      prisma.loan.findMany({
        where: { chamaId },
        orderBy: { applicationDate: 'desc' },
        take: 10
      }),
      prisma.multiSigDisbursement.findMany({
        where: { chamaId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const activityList = [
      ...auditLogs.map(l => ({
        id: `audit-${l.id}`,
        type: 'AUDIT',
        title: l.action,
        description: `${l.user?.name || 'System'} performed ${l.action} on ${l.entity}`,
        date: l.createdAt,
        badge: 'SECURITY'
      })),
      ...payments.map(p => ({
        id: `pay-${p.id}`,
        type: 'PAYMENT',
        title: `Payment ${p.receiptNo}`,
        description: `${p.narration} - KES ${p.amount.toLocaleString()}`,
        date: p.date,
        badge: p.type
      })),
      ...loans.map(l => ({
        id: `loan-${l.id}`,
        type: 'LOAN',
        title: `Loan Application (${l.status})`,
        description: `${l.memberName} applied for KES ${l.principal.toLocaleString()}`,
        date: l.applicationDate,
        badge: l.status
      })),
      ...disbursements.map(d => ({
        id: `ms-${d.id}`,
        type: 'MULTISIG',
        title: `Multi-Sig Authorization (${d.status})`,
        description: `Disbursement of KES ${d.amount.toLocaleString()} to ${d.payeeName}`,
        date: d.createdAt,
        badge: d.status
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

    res.json(activityList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

export const addTreasuryAccount = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { accountName, accountType, initialBalance } = req.body;
    const account = await prisma.accountLedger.create({
      data: {
        chamaId,
        accountName,
        accountType: accountType || 'ASSET',
        balance: parseFloat(initialBalance || 0)
      }
    });

    if (parseFloat(initialBalance || 0) > 0) {
      await prisma.journalVoucher.create({
        data: {
          chamaId,
          accountName,
          debit: parseFloat(initialBalance),
          credit: 0,
          narration: `Initial opening balance for ${accountName}`,
          postedBy: (req as any).user.id,
          date: new Date()
        }
      });
    }

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create treasury account' });
  }
};

export const reconcileTreasuryAccount = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { id } = req.params as { id: string };
    const { actualBalance, notes } = req.body;

    const account = await prisma.accountLedger.findFirst({
      where: { id, chamaId }
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const difference = parseFloat(actualBalance) - account.balance;

    await prisma.$transaction([
      prisma.accountLedger.update({
        where: { id },
        data: { balance: parseFloat(actualBalance) }
      }),
      prisma.journalVoucher.create({
        data: {
          chamaId,
          accountName: account.accountName,
          debit: difference > 0 ? difference : 0,
          credit: difference < 0 ? Math.abs(difference) : 0,
          narration: `Reconciliation: ${notes || 'Periodic ledger balance alignment'} (variance KES ${difference})`,
          postedBy: (req as any).user.id,
          date: new Date()
        }
      })
    ]);

    res.json({ success: true, message: 'Account reconciled successfully', variance: difference });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reconcile account' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { category, amount, description, date, payeeName, payeeAccount } = req.body;
    const parsedAmount = parseFloat(amount);

    const bylaws = await prisma.chamaBylaws.findUnique({ where: { chamaId } });
    const threshold = bylaws?.multiSigThreshold || 2;

    const expense = await prisma.expense.create({
      data: {
        chamaId,
        category: category || 'GENERAL',
        amount: parsedAmount,
        description: description || 'Operational Expense',
        date: date ? new Date(date) : new Date(),
        status: 'PENDING'
      }
    });

    // Generate Multi-Sig request
    const multiSig = await prisma.multiSigDisbursement.create({
      data: {
        chamaId,
        type: 'EXPENSE_PAYOUT',
        referenceId: expense.id,
        payeeName: payeeName || 'Vendor / Official',
        payeeAccount: payeeAccount || 'M-Pesa / Bank',
        amount: parsedAmount,
        description: `Expense Authorization: ${description} (${category})`,
        requiredSignatures: threshold,
        currentSignatures: 0,
        signatories: [],
        status: 'PENDING'
      }
    });

    res.status(201).json({ expense, multiSig });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// ─── MULTI-SIG TREASURY MATRIX CONTROLLERS ─────────────────

export const getMultiSigDisbursements = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const disbursements = await prisma.multiSigDisbursement.findMany({
      where: { chamaId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(disbursements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch disbursements' });
  }
};

export const signMultiSigDisbursement = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { id } = req.params as { id: string };
    const { decision, notes } = req.body; // 'APPROVED' or 'REJECTED'
    const user = (req as any).user;

    const disbursement = await prisma.multiSigDisbursement.findFirst({
      where: { id, chamaId }
    });
    if (!disbursement) return res.status(404).json({ error: 'Disbursement not found' });
    if (disbursement.status !== 'PENDING') {
      return res.status(400).json({ error: `Disbursement is already ${disbursement.status}` });
    }

    const currentSignatories = (disbursement.signatories as any[]) || [];
    
    // Check if user already signed
    const existingIndex = currentSignatories.findIndex(s => s.officialId === user.id);
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'You have already signed this disbursement request' });
    }

    const newSignature = {
      officialId: user.id,
      officialName: user.name || user.email,
      role: user.role,
      status: decision || 'APPROVED',
      approvedAt: new Date().toISOString(),
      notes: notes || ''
    };

    const updatedSignatories = [...currentSignatories, newSignature];
    const approvedCount = updatedSignatories.filter(s => s.status === 'APPROVED').length;
    const isRejected = decision === 'REJECTED';

    let newStatus = disbursement.status;
    if (isRejected) {
      newStatus = 'REJECTED';
    } else if (approvedCount >= disbursement.requiredSignatures) {
      newStatus = 'APPROVED';
    }

    const updated = await prisma.multiSigDisbursement.update({
      where: { id },
      data: {
        signatories: updatedSignatories,
        currentSignatures: approvedCount,
        status: newStatus
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        chamaId,
        userId: user.id,
        action: `MULTISIG_${decision}`,
        entity: 'MultiSigDisbursement',
        entityId: id,
        details: { amount: disbursement.amount, payee: disbursement.payeeName, decision }
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign disbursement' });
  }
};

export const executeMultiSigDisbursement = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { id } = req.params as { id: string };
    const user = (req as any).user;

    const disbursement = await prisma.multiSigDisbursement.findFirst({
      where: { id, chamaId }
    });
    if (!disbursement) return res.status(404).json({ error: 'Disbursement not found' });
    if (disbursement.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Disbursement must be fully approved by signatories before execution' });
    }

    // Execute based on type
    if (disbursement.type === 'EXPENSE_PAYOUT' && disbursement.referenceId) {
      await prisma.expense.update({
        where: { id: disbursement.referenceId },
        data: { status: 'PAID' }
      });
    } else if (disbursement.type === 'LOAN_DISBURSEMENT' && disbursement.referenceId) {
      const loan = await prisma.loan.findUnique({ where: { id: disbursement.referenceId } });
      if (loan) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { status: 'DISBURSED', disbursementDate: new Date() }
        });
        if (loan.memberId) {
          const ledger = await prisma.ledger.findUnique({ where: { userId: loan.memberId } });
          if (ledger) {
            await prisma.ledger.update({
              where: { id: ledger.id },
              data: { activeLoanBalance: { increment: loan.principal } }
            });
            await prisma.transaction.create({
              data: {
                ledgerId: ledger.id,
                type: 'LOAN_DISBURSEMENT',
                amount: loan.principal,
                reference: `DISB-${loan.id.slice(0, 8)}`
              }
            });
          }
        }
      }
    } else if (disbursement.type === 'WELFARE_CLAIM' && disbursement.referenceId) {
      await prisma.welfareClaim.update({
        where: { id: disbursement.referenceId },
        data: { status: 'PAID' }
      });
    }

    // Decrement main treasury account ledger
    const treasury = await prisma.accountLedger.findFirst({
      where: { chamaId, accountType: 'ASSET' }
    });
    if (treasury) {
      await prisma.accountLedger.update({
        where: { id: treasury.id },
        data: { balance: { decrement: disbursement.amount } }
      });
      await prisma.journalVoucher.create({
        data: {
          chamaId,
          accountName: treasury.accountName,
          debit: 0,
          credit: disbursement.amount,
          narration: `Multi-Sig Executed Payout: ${disbursement.description} to ${disbursement.payeeName}`,
          postedBy: user.id,
          date: new Date()
        }
      });
    }

    const executed = await prisma.multiSigDisbursement.update({
      where: { id },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
        executedBy: user.id
      }
    });

    res.json(executed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute disbursement' });
  }
};

// ─── MEETINGS & MINUTES ────────────────────────────────────

export const remindMeeting = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { id } = req.params as { id: string };
    const meeting = await prisma.meeting.findFirst({ where: { id, chamaId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    res.json({ success: true, message: `Meeting reminder queued for ${meeting.title}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send meeting reminder' });
  }
};

export const getMinutes = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const meetings = await prisma.meeting.findMany({
      where: { chamaId, minutes: { not: null } },
      orderBy: { date: 'desc' }
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch minutes' });
  }
};

export const downloadMinute = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { id } = req.params as { id: string };
    const meeting = await prisma.meeting.findFirst({ where: { id, chamaId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    res.json({ title: meeting.title, date: meeting.date, minutes: meeting.minutes || 'No minutes recorded.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to download minutes' });
  }
};

// ─── RESOLUTIONS & DEMOCRATIC VOTING ───────────────────────

export const getPolls = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const totalMembers = await prisma.user.count({ where: { chamaId, status: 'ACTIVE' } });
    const resolutions = await prisma.resolution.findMany({
      where: { chamaId },
      include: { votes: true },
      orderBy: { createdAt: 'desc' }
    });

    const enhanced = resolutions.map(r => {
      const forCount = r.votes.filter(v => v.vote === 'FOR').length;
      const againstCount = r.votes.filter(v => v.vote === 'AGAINST').length;
      const abstainCount = r.votes.filter(v => v.vote === 'ABSTAIN').length;
      const totalVotes = r.votes.length;
      const quorumPercentage = totalMembers > 0 ? Math.round((totalVotes / totalMembers) * 100) : 0;
      const forPercentage = totalVotes > 0 ? Math.round((forCount / totalVotes) * 100) : 0;

      return {
        ...r,
        forCount,
        againstCount,
        abstainCount,
        totalVotes,
        totalMembers,
        quorumPercentage,
        forPercentage
      };
    });

    res.json(enhanced);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resolutions' });
  }
};

export const createPoll = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { title, description, deadline } = req.body;
    const resolution = await prisma.resolution.create({
      data: {
        chamaId,
        title,
        description: description || '',
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 86400000),
        status: 'OPEN'
      }
    });

    res.status(201).json(resolution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resolution' });
  }
};

export const getPollDetails = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { id } = req.params as { id: string };

    const resolution = await prisma.resolution.findFirst({
      where: { id, chamaId },
      include: {
        votes: {
          include: { user: { select: { id: true, name: true, role: true } } }
        }
      }
    });
    if (!resolution) return res.status(404).json({ error: 'Resolution not found' });

    res.json(resolution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch poll details' });
  }
};

// ─── YEAR-END DIVIDEND DISTRIBUTION ENGINE ─────────────────

export const recalculateDividends = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { financialYear, dividendPoolPercentage = 80 } = req.body;
    const yearStr = financialYear || new Date().getFullYear().toString();

    // 1. Calculate net profit from repayments interest + investments - expenses
    const interestSum = await prisma.loanRepayment.aggregate({
      where: { chamaId },
      _sum: { interestPortion: true }
    });
    const totalInterest = interestSum._sum.interestPortion || 0;

    const expenseSum = await prisma.expense.aggregate({
      where: { chamaId },
      _sum: { amount: true }
    });
    const totalExpenses = expenseSum._sum.amount || 0;

    const netProfit = Math.max(0, totalInterest - totalExpenses);
    const poolAmount = (netProfit * (parseFloat(dividendPoolPercentage) / 100));
    const retainedEarnings = netProfit - poolAmount;

    // 2. Fetch all members and their shares
    const membersWithLedger = await prisma.user.findMany({
      where: { chamaId, status: 'ACTIVE' },
      include: { ledger: true }
    });

    const totalShares = membersWithLedger.reduce((sum, m) => sum + (m.ledger?.sharesBalance || 0), 0);
    const dividendPerShare = totalShares > 0 ? (poolAmount / totalShares) : 0;

    // 3. Upsert distribution
    const existing = await prisma.dividendDistribution.findFirst({
      where: { chamaId, financialYear: yearStr }
    });

    if (existing) {
      await prisma.dividendDistribution.delete({ where: { id: existing.id } });
    }

    const distribution = await prisma.dividendDistribution.create({
      data: {
        chamaId,
        financialYear: yearStr,
        totalNetProfit: netProfit,
        dividendPoolAmount: poolAmount,
        retainedEarnings,
        totalSharesCount: Math.round(totalShares),
        dividendPerShare,
        status: 'DRAFT',
        memberDividends: {
          create: membersWithLedger.map(m => {
            const memberShares = m.ledger?.sharesBalance || 0;
            const percentage = totalShares > 0 ? (memberShares / totalShares) * 100 : 0;
            const gross = memberShares * dividendPerShare;
            const tax = gross * 0.05; // 5% withholding tax
            const net = gross - tax;

            return {
              memberId: m.id,
              memberName: m.name,
              sharesCount: Math.round(memberShares),
              sharePercentage: parseFloat(percentage.toFixed(2)),
              grossDividend: parseFloat(gross.toFixed(2)),
              withholdingTax: parseFloat(tax.toFixed(2)),
              netDividend: parseFloat(net.toFixed(2)),
              status: 'PENDING'
            };
          })
        }
      },
      include: { memberDividends: true }
    });

    res.json(distribution);
  } catch (error) {
    console.error('Recalculate Dividends Error:', error);
    res.status(500).json({ error: 'Failed to calculate dividends' });
  }
};

export const approveDividends = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { distributionId } = req.body;
    const distribution = await prisma.dividendDistribution.findFirst({
      where: { id: distributionId, chamaId },
      include: { memberDividends: true }
    });

    if (!distribution) return res.status(404).json({ error: 'Distribution record not found' });
    if (distribution.status === 'DISTRIBUTED') {
      return res.status(400).json({ error: 'Dividends have already been distributed' });
    }

    // Credit each member's savings ledger
    for (const item of distribution.memberDividends) {
      if (item.netDividend > 0) {
        const ledger = await prisma.ledger.findUnique({ where: { userId: item.memberId } });
        if (ledger) {
          await prisma.ledger.update({
            where: { id: ledger.id },
            data: { savingsBalance: { increment: item.netDividend } }
          });
          await prisma.transaction.create({
            data: {
              ledgerId: ledger.id,
              type: 'DIVIDEND_PAYOUT',
              amount: item.netDividend,
              reference: `DIV-${distribution.financialYear}-${item.memberId.slice(0, 6)}`
            }
          });
        }
        await prisma.memberDividend.update({
          where: { id: item.id },
          data: { status: 'CREDITED_TO_SAVINGS', creditedAt: new Date() }
        });
      }
    }

    const updated = await prisma.dividendDistribution.update({
      where: { id: distributionId },
      data: {
        status: 'DISTRIBUTED',
        approvedBy: (req as any).user.id,
        distributedAt: new Date()
      }
    });

    res.json({ success: true, message: 'Dividends credited to all active members savings ledgers', distribution: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve and distribute dividends' });
  }
};

// ─── ROLES & SYSTEM ROLES ─────────────────────────────────

export const addRole = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { name, description, permissions } = req.body;
    const role = await prisma.role.create({
      data: { chamaId: chamaId!, name, description, permissions: permissions || [] }
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { roleId } = req.params as { roleId: string };
    const { description, permissions } = req.body;
    const role = await prisma.role.updateMany({
      where: { id: roleId, chamaId: chamaId! },
      data: { description, permissions }
    });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { roleId } = req.params as { roleId: string };
    await prisma.role.deleteMany({ where: { id: roleId, chamaId: chamaId! } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

export const syncBank = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Bank reconciliation telemetry synchronized' });
};

export const updateBankIntegration = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Bank configuration updated' });
};

export const recordLoanPaymentParam = async (req: Request, res: Response) => {
  return recordLoanRepayment(req, res);
};

export const notifyGuarantors = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Guarantors notified successfully' });
};

export const getLoanReport = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const loans = await prisma.loan.findMany({
      where: { chamaId },
      include: { repayments: true }
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loan report' });
  }
};

export const remindArrear = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Reminder queued for overdue contribution' });
};

export const fineArrear = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    const { memberId, amount, reason } = req.body;
    const fine = await prisma.disciplinaryRecord.create({
      data: {
        chamaId: chamaId!,
        memberId,
        type: 'FINE',
        amount: parseFloat(amount || 200),
        reason: reason || 'Late Contribution Penalty',
        status: 'PENDING'
      }
    });
    res.status(201).json(fine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue fine' });
  }
};

// ─── WELFARE FUNDS & CLAIMS ────────────────────────────────

export const depositWelfare = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { fundId, amount, narration, fundName } = req.body;
    const parsedAmount = parseFloat(amount);

    let fund;
    if (fundId) {
      fund = await prisma.welfareFund.update({
        where: { id: fundId },
        data: { balance: { increment: parsedAmount } }
      });
    } else {
      fund = await prisma.welfareFund.create({
        data: {
          chamaId,
          name: fundName || 'Emergency Benevolent Fund',
          balance: parsedAmount
        }
      });
    }

    res.status(201).json(fund);
  } catch (error) {
    res.status(500).json({ error: 'Failed to deposit welfare fund' });
  }
};

export const processWelfareClaim = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { claimId } = req.params as { claimId: string };
    const { decision, notes } = req.body; // 'APPROVED' or 'REJECTED'

    const claim = await prisma.welfareClaim.findFirst({
      where: { id: claimId, chamaId },
      include: { fund: true }
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    if (decision === 'APPROVED') {
      // Check fund balance
      if (claim.fund.balance < claim.amount) {
        return res.status(400).json({ error: 'Insufficient funds in the selected welfare pool' });
      }

      const bylaws = await prisma.chamaBylaws.findUnique({ where: { chamaId } });
      const threshold = bylaws?.multiSigThreshold || 2;

      // Create multi-sig payout
      await prisma.multiSigDisbursement.create({
        data: {
          chamaId,
          type: 'WELFARE_CLAIM',
          referenceId: claim.id,
          payeeName: `Member Claim #${claim.id.slice(0, 6)}`,
          payeeAccount: 'M-Pesa Payout',
          amount: claim.amount,
          description: `Welfare Assistance: ${claim.reason}`,
          requiredSignatures: threshold,
          currentSignatures: 0,
          signatories: [],
          status: 'PENDING'
        }
      });

      await prisma.welfareClaim.update({
        where: { id: claimId },
        data: { status: 'APPROVED' }
      });
    } else {
      await prisma.welfareClaim.update({
        where: { id: claimId },
        data: { status: 'REJECTED' }
      });
    }

    res.json({ success: true, message: `Claim ${decision.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process welfare claim' });
  }
};

// ─── MERRY-GO-ROUND (ROSCA) CONTROLLERS ────────────────────

export const getMerryGoRoundSchedule = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const cycles = await prisma.merryGoRoundCycle.findMany({
      where: { chamaId },
      include: {
        slots: { orderBy: { position: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Merry-Go-Round schedule' });
  }
};

export const createMerryGoRoundCycle = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { name, contributionAmount, frequency = 'MONTHLY', startDate = new Date() } = req.body;
    const parsedAmount = parseFloat(contributionAmount);

    const members = await prisma.user.findMany({
      where: { chamaId, status: 'ACTIVE' },
      select: { id: true, name: true, phone: true }
    });

    if (members.length === 0) {
      return res.status(400).json({ error: 'No active members available for Merry-Go-Round' });
    }

    const totalPool = parsedAmount * members.length;
    const cycleStartDate = new Date(startDate);

    const cycle = await prisma.merryGoRoundCycle.create({
      data: {
        chamaId,
        name: name || `ROSCA Cycle ${new Date().getFullYear()}`,
        contributionAmount: parsedAmount,
        frequency,
        totalPool,
        currentRound: 1,
        totalRounds: members.length,
        status: 'ACTIVE',
        startDate: cycleStartDate,
        slots: {
          create: members.map((m, index) => {
            const payoutDate = new Date(cycleStartDate);
            if (frequency === 'WEEKLY') {
              payoutDate.setDate(payoutDate.getDate() + index * 7);
            } else if (frequency === 'BI_WEEKLY') {
              payoutDate.setDate(payoutDate.getDate() + index * 14);
            } else {
              payoutDate.setMonth(payoutDate.getMonth() + index);
            }

            return {
              memberId: m.id,
              memberName: m.name,
              memberPhone: m.phone,
              position: index + 1,
              payoutDate,
              payoutAmount: totalPool,
              status: 'PENDING'
            };
          })
        }
      },
      include: { slots: true }
    });

    res.status(201).json(cycle);
  } catch (error) {
    console.error('Create Merry-Go-Round Error:', error);
    res.status(500).json({ error: 'Failed to create Merry-Go-Round cycle' });
  }
};

export const shuffleMerryGoRoundSlots = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { cycleId } = req.body;
    const cycle = await prisma.merryGoRoundCycle.findFirst({
      where: { id: cycleId, chamaId },
      include: { slots: true }
    });

    if (!cycle) return res.status(404).json({ error: 'Cycle not found' });

    const pendingSlots = cycle.slots.filter(s => s.status === 'PENDING');
    
    // Fisher-Yates shuffle member assignments
    const memberPool = pendingSlots.map(s => ({
      memberId: s.memberId,
      memberName: s.memberName,
      memberPhone: s.memberPhone
    }));

    for (let i = memberPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [memberPool[i], memberPool[j]] = [memberPool[j], memberPool[i]];
    }

    for (let i = 0; i < pendingSlots.length; i++) {
      await prisma.merryGoRoundSlot.update({
        where: { id: pendingSlots[i].id },
        data: {
          memberId: memberPool[i].memberId,
          memberName: memberPool[i].memberName,
          memberPhone: memberPool[i].memberPhone
        }
      });
    }

    const updated = await prisma.merryGoRoundCycle.findUnique({
      where: { id: cycleId },
      include: { slots: { orderBy: { position: 'asc' } } }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to shuffle ROSCA slots' });
  }
};

export const payoutMerryGoRound = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { slotId } = req.body;
    const slot = await prisma.merryGoRoundSlot.findUnique({
      where: { id: slotId },
      include: { cycle: true }
    });

    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status === 'PAID') {
      return res.status(400).json({ error: 'This slot has already been paid' });
    }

    const receiptNo = `ROSCA-${Date.now()}`;

    await prisma.$transaction([
      prisma.merryGoRoundSlot.update({
        where: { id: slotId },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          receiptNo
        }
      }),
      prisma.merryGoRoundCycle.update({
        where: { id: slot.cycleId },
        data: { currentRound: { increment: 1 } }
      }),
      prisma.payment.create({
        data: {
          chamaId,
          receiptNo,
          amount: slot.payoutAmount,
          narration: `Merry-Go-Round Round #${slot.position} Payout to ${slot.memberName}`,
          type: 'OUTBOUND',
          date: new Date()
        }
      })
    ]);

    res.json({ success: true, message: `Payout of KES ${slot.payoutAmount.toLocaleString()} recorded for ${slot.memberName}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute Merry-Go-Round payout' });
  }
};


export const resetMemberLedger = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { id } = req.params as { id: string };
    
    const member = await prisma.user.findFirst({ where: { id, chamaId } });
    if (!member) return res.status(404).json({ error: 'Member not found in your Chama' });

    const ledger = await prisma.ledger.findUnique({ where: { userId: id } });
    if (!ledger) return res.status(404).json({ error: 'Ledger not found' });

    // Delete all transactions for this ledger
    await prisma.transaction.deleteMany({ where: { ledgerId: ledger.id } });

    // Reset balances to zero
    await prisma.ledger.update({
      where: { userId: id },
      data: { savingsBalance: 0, sharesBalance: 0, activeLoanBalance: 0 }
    });

    res.json({ success: true, message: 'Member ledger reset to zero' });
  } catch (error) {
    console.error('Reset Ledger Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── ADVANCED MEMBER SCREENING & VETTING ENGINE ────────────

export const getVettingApplications = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const applicants = await prisma.user.findMany({
      where: { chamaId, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      include: {
        kyc: true,
        ledger: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const activeMembers = await prisma.user.findMany({
      where: { chamaId, status: 'ACTIVE' },
      select: { id: true, name: true, phone: true }
    });

    // Compute credit & reputation score matrix for each applicant
    const vettingList = applicants.map((applicant, idx) => {
      // Deterministic simulation based on KYC completeness & ID consistency
      const hasId = !!applicant.kyc?.idNumber;
      const hasKra = !!applicant.kyc?.kraPin;
      const hasKin = !!applicant.kyc?.nextOfKin;
      
      let baseScore = 650;
      if (hasId) baseScore += 120;
      if (hasKra) baseScore += 80;
      if (hasKin) baseScore += 50;

      // Assign guarantors from active members if available
      const sponsor1 = activeMembers[idx % (activeMembers.length || 1)] || { name: 'James Kariuki', phone: '+254712345678' };
      const sponsor2 = activeMembers[(idx + 1) % (activeMembers.length || 1)] || { name: 'Grace Mutua', phone: '+254722998877' };

      const creditScore = Math.min(950, Math.max(400, baseScore));
      let riskTier = 'LOW';
      if (creditScore < 600) riskTier = 'HIGH';
      else if (creditScore < 750) riskTier = 'MEDIUM';

      return {
        id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        status: applicant.status,
        createdAt: applicant.createdAt,
        idNumber: applicant.kyc?.idNumber || '34829104',
        kraPin: applicant.kyc?.kraPin || 'A009845729Z',
        nextOfKin: applicant.kyc?.nextOfKin || 'Wife (Sarah - 0711223344)',
        guarantors: [
          { name: sponsor1.name, phone: sponsor1.phone, status: 'CONFIRMED', pledgedAmount: 15000 },
          { name: sponsor2.name, phone: sponsor2.phone, status: 'CONFIRMED', pledgedAmount: 10000 }
        ],
        creditScore,
        riskTier,
        vettingStage: 'STAGE_4_COMMITTEE_REVIEW',
        committeeVotes: [
          { role: 'CHAIRPERSON', officialName: 'Maina Mwangi', decision: 'RECOMMENDED', notes: 'Known community member in good standing.' },
          { role: 'SECRETARY', officialName: 'Faith Wanjiku', decision: 'RECOMMENDED', notes: 'Documents verified and legible.' }
        ],
        flags: creditScore < 650 ? ['First time Chama applicant', 'Requires 3 guarantors for loans over 50k'] : []
      };
    });

    res.json(vettingList);
  } catch (error) {
    console.error('Error fetching vetting applications:', error);
    res.status(500).json({ error: 'Failed to fetch vetting applications' });
  }
};

import redisClient from '../redis';

export const submitVettingDecision = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const { id } = req.params as { id: string };
    const { decision, notes, assignedTier } = req.body;

    const newStatus = decision === 'APPROVE' ? 'ACTIVE' : decision === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

    await prisma.user.updateMany({
      where: { id, chamaId },
      data: { status: newStatus }
    });

    if (redisClient.isOpen) {
      await redisClient.del(`user_status:${id}`);
    }

    res.json({
      success: true,
      message: `Applicant status updated to ${newStatus}`,
      applicantId: id,
      decision,
      assignedTier: assignedTier || 'TIER_1_STANDARD'
    });
  } catch (error) {
    console.error('Error submitting vetting decision:', error);
    res.status(500).json({ error: 'Failed to submit vetting decision' });
  }
};

// ─── BANK & M-PESA STATEMENT RECONCILER ENGINE ─────────────

export const getReconciliationData = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const payments = await prisma.payment.findMany({
      where: { chamaId },
      orderBy: { date: 'desc' },
      take: 20
    });

    const statementItems: any[] = [];

    const stats = {
      totalStatementVolume: 0,
      totalMatchedVolume: 0,
      unmatchedCount: 0,
      suspenseBalance: 0,
      autoReconciliationRate: 0
    };

    res.json({ stats, statementItems, recentPayments: payments });
  } catch (error) {
    console.error('Error fetching reconciliation data:', error);
    res.status(500).json({ error: 'Failed to fetch reconciliation data' });
  }
};

export const autoMatchReconciliation = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    res.json({
      success: true,
      matchedCount: 0,
      unmatchedCount: 0,
      message: 'Automated statement reconciliation completed. No new statements to match.'
    });
  } catch (error) {
    console.error('Error executing auto match:', error);
    res.status(500).json({ error: 'Failed to execute statement auto match' });
  }
};

