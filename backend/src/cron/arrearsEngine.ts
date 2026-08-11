import cron from 'node-cron';
import { prisma } from '../prisma';

export const startArrearsEngine = () => {
  // Run daily at midnight: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('[Arrears Engine] Starting daily scan for overdue loans...');
    try {
      const today = new Date();
      // Find all pending/partial repayments that are overdue
      const overdueRepayments = await (prisma as any).loanRepayment.findMany({
        where: {
          dueDate: { lt: today },
          status: { in: ['PENDING', 'PARTIAL'] },
        },
      });

      console.log(`[Arrears Engine] Found ${overdueRepayments.length} overdue repayments.`);

      for (const repayment of overdueRepayments) {
        // Mark repayment as OVERDUE if it's PENDING
        if (repayment.status === 'PENDING') {
          await (prisma as any).loanRepayment.update({
            where: { id: repayment.id },
            data: { status: 'OVERDUE' }
          });
        }

        // Calculate days overdue
        const dueDate = new Date(repayment.dueDate);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

        // Create an Arrears Record if it doesn't exist, or update it
        // Check if there is already an arrears record for this loan
        const existingArrears = await (prisma as any).arrearsRecord.findFirst({
          where: { loanId: repayment.loanId }
        });

        const penaltyAmount = repayment.amount * 0.05; // 5% penalty

        if (existingArrears) {
          await (prisma as any).arrearsRecord.update({
            where: { id: existingArrears.id },
            data: {
              daysOverdue,
              amount: existingArrears.amount + penaltyAmount
            }
          });
        } else {
          const loan = await (prisma as any).loan.findUnique({ where: { id: repayment.loanId } });
          if (loan) {
            await (prisma as any).arrearsRecord.create({
              data: {
                memberId: loan.memberId,
                loanId: loan.id,
                daysOverdue,
                amount: repayment.amount + penaltyAmount,
                status: 'WARNING'
              }
            });
            // Update loan status to IN_ARREARS
            await (prisma as any).loan.update({
              where: { id: loan.id },
              data: { status: 'IN_ARREARS' }
            });
          }
        }
      }
      console.log('[Arrears Engine] Daily scan complete.');
    } catch (error) {
      console.error('[Arrears Engine] Error during scan:', error);
    }
  });
};
