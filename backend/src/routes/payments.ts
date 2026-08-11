import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/deposit', async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount, type, phone } = req.body;
    
    if (!amount || !['SAVINGS', 'SHARES', 'LOAN_REPAYMENT', 'PENALTY'].includes(type)) {
      return res.status(400).json({ error: 'Invalid amount or type' });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ledger = await prisma.ledger.findUnique({
      where: { userId }
    });

    if (!ledger) {
      return res.status(404).json({ error: 'Ledger not found' });
    }

    // Record the transaction
    await prisma.transaction.create({
      data: {
        ledgerId: ledger.id,
        type: type === 'LOAN_REPAYMENT' ? 'LOAN_REPAYMENT' : 'DEPOSIT', // general deposit for tracking money in
        amount,
        reference: `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Mocking a reference
      }
    });

    let newBalance = 0;
    
    if (type === 'SAVINGS') {
      const updatedLedger = await prisma.ledger.update({
        where: { id: ledger.id },
        data: {
          savingsBalance: { increment: amount }
        }
      });
      newBalance = updatedLedger.savingsBalance;
    } else if (type === 'SHARES') {
      const updatedLedger = await prisma.ledger.update({
        where: { id: ledger.id },
        data: {
          sharesBalance: { increment: amount }
        }
      });
      newBalance = updatedLedger.sharesBalance;
    } else if (type === 'LOAN_REPAYMENT') {
      const updatedLedger = await prisma.ledger.update({
        where: { id: ledger.id },
        data: {
          activeLoanBalance: { decrement: amount }
        }
      });
      newBalance = updatedLedger.activeLoanBalance;
    } else if (type === 'PENALTY') {
      const oldestFine = await prisma.disciplinaryRecord.findFirst({
        where: { memberId: userId, status: 'PENDING', type: 'FINE' },
        orderBy: { createdAt: 'asc' }
      });
      if (oldestFine) {
        await prisma.disciplinaryRecord.update({
          where: { id: oldestFine.id },
          data: { status: 'PAID' }
        });
      }
      newBalance = 0;
    }

    return res.json({
      success: true,
      message: 'Deposit successful',
      newBalance
    });

  } catch (error) {
    console.error('Deposit Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
