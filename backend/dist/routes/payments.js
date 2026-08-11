"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post('/deposit', async (req, res) => {
    try {
        const { amount, type, phone } = req.body;
        if (!amount || !['SAVINGS', 'SHARES', 'LOAN_REPAYMENT', 'PENALTY'].includes(type)) {
            return res.status(400).json({ error: 'Invalid amount or type' });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const ledger = await prisma_1.prisma.ledger.findUnique({
            where: { userId }
        });
        if (!ledger) {
            return res.status(404).json({ error: 'Ledger not found' });
        }
        // Record the transaction
        await prisma_1.prisma.transaction.create({
            data: {
                ledgerId: ledger.id,
                type: type === 'LOAN_REPAYMENT' ? 'LOAN_REPAYMENT' : 'DEPOSIT', // general deposit for tracking money in
                amount,
                reference: `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Mocking a reference
            }
        });
        let newBalance = 0;
        if (type === 'SAVINGS') {
            const updatedLedger = await prisma_1.prisma.ledger.update({
                where: { id: ledger.id },
                data: {
                    savingsBalance: { increment: amount }
                }
            });
            newBalance = updatedLedger.savingsBalance;
        }
        else if (type === 'SHARES') {
            const updatedLedger = await prisma_1.prisma.ledger.update({
                where: { id: ledger.id },
                data: {
                    sharesBalance: { increment: amount }
                }
            });
            newBalance = updatedLedger.sharesBalance;
        }
        else if (type === 'LOAN_REPAYMENT') {
            const updatedLedger = await prisma_1.prisma.ledger.update({
                where: { id: ledger.id },
                data: {
                    activeLoanBalance: { decrement: amount }
                }
            });
            newBalance = updatedLedger.activeLoanBalance;
        }
        else if (type === 'PENALTY') {
            const oldestFine = await prisma_1.prisma.disciplinaryRecord.findFirst({
                where: { memberId: userId, status: 'PENDING', type: 'FINE' },
                orderBy: { createdAt: 'asc' }
            });
            if (oldestFine) {
                await prisma_1.prisma.disciplinaryRecord.update({
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
    }
    catch (error) {
        console.error('Deposit Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map