"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postBatchTransaction = exports.postTransaction = exports.getLedgers = void 0;
const prisma_1 = require("../prisma");
const getLedgers = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser?.chamaId && user.role !== 'TCM_SUPER_ADMIN') {
            return res.status(403).json({ error: 'User is not assigned to a Chama' });
        }
        const ledgers = await prisma_1.prisma.ledger.findMany({
            where: user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId },
            include: { user: { select: { name: true, email: true } }, transactions: true }
        });
        res.json(ledgers);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLedgers = getLedgers;
const postTransaction = async (req, res) => {
    try {
        const { ledgerId, type, amount, reference } = req.body;
        // In a real system, you would use Prisma Transactions to ensure atomicity
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const ledger = await tx.ledger.findUnique({ where: { id: ledgerId } });
            if (!ledger)
                throw new Error('Ledger not found');
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
            }
            else if (type === 'WITHDRAWAL') {
                updatedLedger = await tx.ledger.update({
                    where: { id: ledgerId },
                    data: { savingsBalance: { decrement: amount } }
                });
            }
            else if (type === 'LOAN_DISBURSEMENT') {
                updatedLedger = await tx.ledger.update({
                    where: { id: ledgerId },
                    data: { activeLoanBalance: { increment: amount } }
                });
            }
            else if (type === 'LOAN_REPAYMENT') {
                updatedLedger = await tx.ledger.update({
                    where: { id: ledgerId },
                    data: { activeLoanBalance: { decrement: amount } }
                });
            }
            else if (type === 'DIVIDEND') {
                updatedLedger = await tx.ledger.update({
                    where: { id: ledgerId },
                    data: { savingsBalance: { increment: amount } }
                });
            }
            else {
                throw new Error('Unknown transaction type');
            }
            return { transaction, updatedLedger };
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};
exports.postTransaction = postTransaction;
const postBatchTransaction = async (req, res) => {
    try {
        const { transactions } = req.body;
        // transactions: [{ ledgerId, type, amount, reference }]
        const results = await prisma_1.prisma.$transaction(async (tx) => {
            const successful = [];
            for (const t of transactions) {
                const ledger = await tx.ledger.findUnique({ where: { id: t.ledgerId } });
                if (!ledger)
                    continue;
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
                }
                else if (t.type === 'LOAN_DISBURSEMENT') {
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
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Batch transaction failed' });
    }
};
exports.postBatchTransaction = postBatchTransaction;
//# sourceMappingURL=ledger.js.map