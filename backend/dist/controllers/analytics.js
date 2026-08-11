"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prisma_1 = require("../prisma");
const getAnalytics = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        // PAR Data from ArrearsRecords
        const arrears = await prisma_1.prisma.arrearsRecord.findMany();
        const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        arrears.forEach((a) => {
            const days = a.daysOverdue || 0;
            const amt = a.amount || 0;
            if (days <= 30)
                buckets['0-30'] += amt;
            else if (days <= 60)
                buckets['31-60'] += amt;
            else if (days <= 90)
                buckets['61-90'] += amt;
            else
                buckets['90+'] += amt;
        });
        const parData = [
            { name: 'Portfolio at Risk', '0-30': buckets['0-30'], '31-60': buckets['31-60'], '61-90': buckets['61-90'], '90+': buckets['90+'] }
        ];
        // Yield on Advances (Mocked to dynamic logic based on transactions)
        const yieldData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const interestPayments = await prisma_1.prisma.loanRepayment.aggregate({
                _sum: { interestPortion: true },
                where: { paidDate: { gte: startOfMonth, lte: endOfMonth } }
            });
            const activeLoans = await prisma_1.prisma.loan.aggregate({
                _sum: { principal: true },
                where: { status: 'ACTIVE', disbursementDate: { lte: endOfMonth } }
            });
            const yieldPct = activeLoans._sum.principal
                ? ((interestPayments._sum.interestPortion || 0) / activeLoans._sum.principal) * 100
                : 0; // Fallback if no loans yet
            yieldData.push({ month: d.toLocaleString('default', { month: 'short' }), yield: parseFloat(yieldPct.toFixed(2)) });
        }
        // Ratios from AccountLedgers and JournalVouchers
        const ledgers = await prisma_1.prisma.accountLedger.findMany();
        let totalAssets = 0, totalLiabs = 0, totalEquity = 0, totalLoans = 0, totalDeposits = 0;
        ledgers.forEach(l => {
            if (l.accountType === 'ASSET')
                totalAssets += l.balance || 0;
            if (l.accountType === 'LIABILITY')
                totalLiabs += l.balance || 0;
            if (l.accountType === 'EQUITY')
                totalEquity += l.balance || 0;
            if (l.accountName.toLowerCase().includes('loan'))
                totalLoans += l.balance || 0;
            if (l.accountName.toLowerCase().includes('deposit') || l.accountName.toLowerCase().includes('saving'))
                totalDeposits += l.balance || 0;
        });
        // Calculate Net Income from Revenue and Expense accounts
        let revenue = 0, expense = 0;
        ledgers.forEach(l => {
            if (l.accountType === 'REVENUE')
                revenue += l.balance || 0;
            if (l.accountType === 'EXPENSE')
                expense += l.balance || 0;
        });
        const netIncome = revenue - expense;
        const totalAssetsFixed = totalAssets || 1;
        const totalLiabsFixed = totalLiabs || 1;
        const totalEquityFixed = totalEquity || 1;
        const totalDepositsFixed = totalDeposits || 1;
        const currentRatio = totalLiabs > 0 ? totalAssets / totalLiabs : 0;
        const debtToEquity = totalEquity > 0 ? totalLiabs / totalEquity : 0;
        const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
        const loanToDeposit = totalDeposits > 0 ? (totalLoans / totalDeposits) * 100 : 0;
        const ratios = { currentRatio, debtToEquity, roa, loanToDeposit };
        const radarData = [
            { metric: 'Current Ratio', value: Math.min(currentRatio * 50, 100) },
            { metric: 'Quick Ratio', value: Math.min(currentRatio * 40, 100) },
            { metric: 'Debt-to-Equity', value: Math.min(debtToEquity * 50, 100) },
            { metric: 'Loan-to-Deposit', value: Math.min(loanToDeposit, 100) },
            { metric: 'Cap Adequacy', value: 85 },
        ];
        res.json({ parData, yieldData, ratios, radarData });
    }
    catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=analytics.js.map