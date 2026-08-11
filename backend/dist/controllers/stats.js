"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const prisma_1 = require("../prisma");
const getStats = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const membersCount = await prisma_1.prisma.user.count({
            where: user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId }
        });
        const lastMonthMembersCount = await prisma_1.prisma.user.count({
            where: {
                ...(user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId }),
                createdAt: { lt: startOfCurrentMonth }
            }
        });
        const membersGrowth = lastMonthMembersCount === 0 ? 100 :
            ((membersCount - lastMonthMembersCount) / lastMonthMembersCount) * 100;
        // Aggregate ledger balances
        const ledgers = await prisma_1.prisma.ledger.findMany({
            where: user.role === 'TCM_SUPER_ADMIN' ? {} : { chamaId: dbUser?.chamaId }
        });
        const totalSavings = ledgers.reduce((acc, curr) => acc + curr.savingsBalance, 0);
        // Calculate last month savings based on transactions
        // Assuming transactions affect balances. For simplicity in this structure:
        const lastMonthDeposits = await prisma_1.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'DEPOSIT',
                createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
                ...(user.role !== 'TCM_SUPER_ADMIN' && { ledger: { chamaId: dbUser?.chamaId } })
            }
        });
        const lastMonthSavings = (totalSavings - (lastMonthDeposits._sum.amount || 0));
        const savingsGrowth = lastMonthSavings <= 0 ? 100 :
            (((lastMonthDeposits._sum.amount || 0)) / lastMonthSavings) * 100;
        const activeLoansAmount = ledgers.reduce((acc, curr) => acc + curr.activeLoanBalance, 0);
        const activeLoansCount = ledgers.filter(l => l.activeLoanBalance > 0).length;
        const averageSize = activeLoansCount > 0 ? activeLoansAmount / activeLoansCount : 0;
        const stats = {
            totalMembers: { count: membersCount, growth: Math.round(membersGrowth * 10) / 10 },
            totalSavings: { amount: totalSavings, growth: Math.round(savingsGrowth * 10) / 10 },
            activeLoans: { amount: activeLoansAmount, count: activeLoansCount, averageSize },
            repaymentRate: { percentage: 96.5, target: 95 }
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=stats.js.map