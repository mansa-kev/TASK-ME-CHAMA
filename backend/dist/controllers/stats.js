"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = void 0;
const prisma_1 = require("../prisma");
const getStats = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        const { branchId, period } = req.query;
        const now = new Date();
        // Default to 'All Time', handled by setting start of period very early if needed, or by not applying a date filter
        let startDate;
        if (period === 'Today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (period === 'This Week') {
            const day = now.getDay() || 7;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        }
        else if (period === 'This Month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        else if (period === 'This Year' || period === 'YTD') {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        // Branch filter applies to Chamas
        const chamaFilter = {};
        if (user.role === 'TCM_SUPER_ADMIN') {
            if (branchId && branchId !== 'All Branches') {
                chamaFilter.branchId = branchId;
            }
        }
        else {
            chamaFilter.id = dbUser?.chamaId;
        }
        const chamaIdsRaw = await prisma_1.prisma.chama.findMany({ where: chamaFilter, select: { id: true } });
        const chamaIds = chamaIdsRaw.map(c => c.id);
        // Filter helpers
        const baseChamaFilter = { chamaId: { in: chamaIds } };
        const dateFilter = startDate ? { gte: startDate } : undefined;
        // 1. Members
        const membersCount = await prisma_1.prisma.user.count({
            where: baseChamaFilter
        });
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthMembersCount = await prisma_1.prisma.user.count({
            where: {
                ...baseChamaFilter,
                createdAt: { lt: startOfCurrentMonth }
            }
        });
        const membersGrowth = lastMonthMembersCount === 0 ? 100 :
            ((membersCount - lastMonthMembersCount) / lastMonthMembersCount) * 100;
        // 2. Ledgers (Total Savings & Active Loans)
        const ledgers = await prisma_1.prisma.ledger.findMany({
            where: baseChamaFilter,
            include: { user: true }
        });
        const totalSavings = ledgers.reduce((acc, curr) => acc + curr.savingsBalance, 0);
        const activeLoansAmount = ledgers.reduce((acc, curr) => acc + curr.activeLoanBalance, 0);
        const activeLoansCount = ledgers.filter(l => l.activeLoanBalance > 0).length;
        const averageSize = activeLoansCount > 0 ? activeLoansAmount / activeLoansCount : 0;
        const lastMonthDeposits = await prisma_1.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'DEPOSIT',
                createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
                ledger: baseChamaFilter
            }
        });
        const lastMonthSavings = (totalSavings - (lastMonthDeposits._sum.amount || 0));
        const savingsGrowth = lastMonthSavings <= 0 ? 100 :
            (((lastMonthDeposits._sum.amount || 0)) / lastMonthSavings) * 100;
        // 3. New KPIs
        // Pending KYC
        const pendingKycCount = await prisma_1.prisma.kycDocument.count({
            where: {
                user: baseChamaFilter,
                status: 'PENDING'
            }
        });
        const totalKycCount = await prisma_1.prisma.kycDocument.count({ where: { user: baseChamaFilter } });
        const pendingKycPercentage = totalKycCount > 0 ? (pendingKycCount / totalKycCount) * 100 : 0;
        // Upcoming Loan Repayments
        const upcomingRepaymentsCount = await prisma_1.prisma.loanRepayment.count({
            where: {
                chamaId: { in: chamaIds },
                status: 'PENDING',
                dueDate: dateFilter ? { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } : { gte: now } // Within 7 days if date filter applied, else all
            }
        });
        const totalPendingRepayments = await prisma_1.prisma.loanRepayment.count({
            where: { chamaId: { in: chamaIds }, status: 'PENDING' }
        });
        const upcomingRepaymentsPercentage = totalPendingRepayments > 0 ? (upcomingRepaymentsCount / totalPendingRepayments) * 100 : 0;
        // Active Chama Groups
        const activeChamasCount = await prisma_1.prisma.chama.count({
            where: { ...chamaFilter, status: 'ACTIVE' }
        });
        const totalChamasCount = await prisma_1.prisma.chama.count({
            where: chamaFilter
        });
        const activeChamasPercentage = totalChamasCount > 0 ? (activeChamasCount / totalChamasCount) * 100 : 0;
        // Pending Contributions (from ArrearsRecord)
        const arrearsSum = await prisma_1.prisma.arrearsRecord.aggregate({
            _sum: { amount: true },
            where: {
                chamaId: { in: chamaIds },
                status: 'ACTIVE'
            }
        });
        const pendingContributionsAmount = arrearsSum._sum.amount || 0;
        const allArrearsSum = await prisma_1.prisma.arrearsRecord.aggregate({
            _sum: { amount: true },
            where: { chamaId: { in: chamaIds } }
        });
        const pendingContributionsPercentage = allArrearsSum._sum.amount ? (pendingContributionsAmount / allArrearsSum._sum.amount) * 100 : 0;
        // 4. Top Members by Savings
        const topMembers = ledgers
            .sort((a, b) => b.savingsBalance - a.savingsBalance)
            .slice(0, 5)
            .map((l, index) => ({
            rank: index + 1,
            id: l.user.id,
            name: l.user.name,
            balance: l.savingsBalance,
            percentage: totalSavings > 0 ? (l.savingsBalance / totalSavings) * 100 : 0
        }));
        // 5. Chart Data (Savings vs Loans - Monthly)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const mSavings = await prisma_1.prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'DEPOSIT', createdAt: { gte: mStart, lte: mEnd }, ledger: baseChamaFilter }
            });
            const mLoans = await prisma_1.prisma.loan.aggregate({
                _sum: { principal: true },
                where: { status: 'ACTIVE', disbursementDate: { gte: mStart, lte: mEnd }, chamaId: { in: chamaIds } }
            });
            chartData.push({
                name: d.toLocaleString('default', { month: 'short' }),
                savings: mSavings._sum.amount || 0,
                loans: mLoans._sum.principal || 0
            });
        }
        // 6. Recent Transactions
        const recentTransactions = await prisma_1.prisma.payment.findMany({
            where: { chamaId: { in: chamaIds }, date: dateFilter },
            orderBy: { date: 'desc' },
            take: 10
        });
        // 7. Recent Support Tickets
        const recentTickets = await prisma_1.prisma.supportTicket.findMany({
            where: { chamaId: { in: chamaIds }, createdAt: dateFilter },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { chama: { select: { name: true } } }
        });
        const stats = {
            totalMembers: { count: membersCount, growth: Math.round(membersGrowth * 10) / 10 },
            totalSavings: { amount: totalSavings, growth: Math.round(savingsGrowth * 10) / 10 },
            activeLoans: { amount: activeLoansAmount, count: activeLoansCount, averageSize },
            repaymentRate: { percentage: 96.5, target: 95 },
            pendingKyc: { count: pendingKycCount, percentage: Math.round(pendingKycPercentage) },
            upcomingRepayments: { count: upcomingRepaymentsCount, percentage: Math.round(upcomingRepaymentsPercentage) },
            activeChamas: { count: activeChamasCount, percentage: Math.round(activeChamasPercentage) },
            pendingContributions: { amount: pendingContributionsAmount, percentage: Math.round(pendingContributionsPercentage) },
            topMembers,
            chartData,
            recentTransactions,
            recentTickets
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=stats.js.map