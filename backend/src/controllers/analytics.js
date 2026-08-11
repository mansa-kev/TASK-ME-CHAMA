"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const prisma_1 = require("../prisma");
const getAnalytics = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        // Fetch transactions based on role
        const whereClause = user.role === 'TCM_SUPER_ADMIN'
            ? {}
            : { ledger: { chamaId: dbUser?.chamaId } };
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' }
        });
        // Group by month
        const monthlyData = {};
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthStr] = { savings: 0, disbursements: 0 };
        }
        transactions.forEach(t => {
            const month = new Date(t.createdAt).toLocaleString('default', { month: 'short' });
            if (monthlyData[month]) {
                if (t.type === 'DEPOSIT') {
                    monthlyData[month].savings += t.amount;
                }
                else if (t.type === 'LOAN_DISBURSEMENT') {
                    monthlyData[month].disbursements += t.amount;
                }
            }
        });
        const chartData = Object.keys(monthlyData).map(month => ({
            month,
            savings: monthlyData[month].savings,
            disbursements: monthlyData[month].disbursements
        }));
        res.json(chartData);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=analytics.js.map