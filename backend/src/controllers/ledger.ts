import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getLedgers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser?.chamaId && user.role !== 'TCM_SUPER_ADMIN') {
       return res.status(403).json({ error: 'User is not assigned to a Chama' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause = user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId };

    const [ledgers, total] = await Promise.all([
      prisma.ledger.findMany({
        where: whereClause,
        include: { user: { select: { name: true, email: true } }, transactions: true },
        skip,
        take: limit
      }),
      prisma.ledger.count({ where: whereClause })
    ]);

    res.json({
      data: ledgers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const postTransaction = async (req: Request, res: Response) => {
  try {
    const { ledgerId, type, amount, reference } = req.body;
    
    // In a real system, you would use Prisma Transactions to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const ledger = await tx.ledger.findUnique({ where: { id: ledgerId } });
      if (!ledger) throw new Error('Ledger not found');

      const transaction = await tx.transaction.create({
        data: {
          ledgerId,
          type,
          amount,
          reference
        }
      });

      let updatedLedger;
      if (type === 'DEPOSIT') {
        updatedLedger = await tx.ledger.update({
          where: { id: ledgerId },
          data: { savingsBalance: { increment: amount } }
        });
      } else if (type === 'WITHDRAWAL') {
        updatedLedger = await tx.ledger.update({
          where: { id: ledgerId },
          data: { savingsBalance: { decrement: amount } }
        });
      } else if (type === 'LOAN_DISBURSEMENT') {
        updatedLedger = await tx.ledger.update({
          where: { id: ledgerId },
          data: { activeLoanBalance: { increment: amount } }
        });
      } else if (type === 'LOAN_REPAYMENT') {
        updatedLedger = await tx.ledger.update({
          where: { id: ledgerId },
          data: { activeLoanBalance: { decrement: amount } }
        });
      } else if (type === 'DIVIDEND') {
        updatedLedger = await tx.ledger.update({
          where: { id: ledgerId },
          data: { savingsBalance: { increment: amount } }
        });
      } else {
         throw new Error('Unknown transaction type');
      }

      return { transaction, updatedLedger };
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Transaction failed' });
  }
};

export const postBatchTransaction = async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body; 
    // transactions: [{ ledgerId, type, amount, reference }]

    const results = await prisma.$transaction(async (tx) => {
      const successful = [];
      for (const t of transactions) {
        const ledger = await tx.ledger.findUnique({ where: { id: t.ledgerId } });
        if (!ledger) continue;

        const transaction = await tx.transaction.create({
          data: {
            ledgerId: t.ledgerId,
            type: t.type,
            amount: t.amount,
            reference: t.reference || `BATCH-${Date.now()}`
          }
        });

        let updatedLedger;
        if (t.type === 'DEPOSIT') {
          updatedLedger = await tx.ledger.update({
            where: { id: t.ledgerId },
            data: { savingsBalance: { increment: t.amount } }
          });
        } else if (t.type === 'LOAN_DISBURSEMENT') {
          updatedLedger = await tx.ledger.update({
            where: { id: t.ledgerId },
            data: { activeLoanBalance: { increment: t.amount } }
          });
        }

        successful.push({ transaction, updatedLedger });
      }
      return successful;
    });

    res.status(201).json({ message: 'Batch processed', count: results.length, results });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Batch transaction failed' });
  }
};

export const exportChamasLedgerCsv = async (req: Request, res: Response) => {
  try {
    const chamas = await prisma.chama.findMany({
      include: {
        ledgers: true,
        _count: {
          select: { members: true, loans: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['Chama ID', 'Registration No', 'Chama Name', 'County', 'Members Count', 'Total Savings', 'Total Shares', 'Active Loan Balance', 'Status', 'Created At'];
    const rows = chamas.map(c => {
      const totalSavings = c.ledgers.reduce((sum, l) => sum + (l.savingsBalance || 0), 0);
      const totalShares = c.ledgers.reduce((sum, l) => sum + (l.sharesBalance || 0), 0);
      const activeLoan = c.ledgers.reduce((sum, l) => sum + (l.activeLoanBalance || 0), 0);
      return [
        `"${c.id}"`,
        `"${c.registration || ''}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.county || ''}"`,
        c._count.members,
        totalSavings,
        totalShares,
        activeLoan,
        `"${c.status}"`,
        `"${new Date(c.createdAt).toISOString().split('T')[0]}"`
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=chama_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvString);
  } catch (error) {
    console.error('Failed to export chama ledger CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

