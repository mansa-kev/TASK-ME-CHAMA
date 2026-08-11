"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberStatement = exports.getStaffPerformance = void 0;
const prisma_1 = require("../prisma");
const getStaffPerformance = async (req, res) => {
    try {
        const staff = await prisma_1.prisma.user.findMany({
            where: { role: { in: ['TCM_ADMIN', 'CHAMA_ADMIN'] } },
            select: { id: true, name: true, createdAt: true }
        });
        const performance = await Promise.all(staff.map(async (s) => {
            const tasksCompleted = await prisma_1.prisma.operationsTask.count({
                where: { assignedTo: s.id, status: 'COMPLETED' }
            });
            const membersRegistered = await prisma_1.prisma.user.count({
                where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } }
            });
            const loansProcessed = await prisma_1.prisma.loan.count({
                where: { status: 'APPROVED' }
            });
            return {
                id: s.id,
                name: s.name,
                membersRegistered: membersRegistered,
                loansProcessed: loansProcessed,
                tasksCompleted,
                lastActivity: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'
            };
        }));
        res.json(performance);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff performance' });
    }
};
exports.getStaffPerformance = getStaffPerformance;
const getMemberStatement = async (req, res) => {
    try {
        const id = req.params.id;
        // Get the member's name to find their ledger entries
        const member = await prisma_1.prisma.user.findUnique({ where: { id }, select: { name: true } });
        const ledgers = await prisma_1.prisma.accountLedger.findMany({
            where: { accountName: { contains: member?.name || id } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(ledgers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch member statement' });
    }
};
exports.getMemberStatement = getMemberStatement;
//# sourceMappingURL=reports.js.map