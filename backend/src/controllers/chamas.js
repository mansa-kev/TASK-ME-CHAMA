"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateMerryGoRound = exports.updateChama = exports.createChama = exports.getChamas = void 0;
const prisma_1 = require("../prisma");
const getChamas = async (req, res) => {
    try {
        const user = req.user;
        // Super admin sees all chamas, others only see their own
        const whereClause = user.role === 'TCM_SUPER_ADMIN'
            ? {}
            : { members: { some: { id: user.id } } };
        const chamas = await prisma_1.prisma.chama.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { members: true }
                },
                ledgers: true
            }
        });
        // Map to frontend expected format
        const formattedChamas = chamas.map(chama => {
            const totalPool = chama.ledgers.reduce((sum, l) => sum + l.savingsBalance + l.sharesBalance, 0);
            const activeLoans = chama.ledgers.reduce((sum, l) => sum + l.activeLoanBalance, 0);
            return {
                id: chama.id,
                name: chama.name,
                registration: chama.registration,
                memberCount: chama._count.members,
                meetingFrequency: chama.meetingFrequency || 'Monthly',
                totalPool,
                activeLoans,
                nextPayoutDate: chama.nextPayoutDate ? chama.nextPayoutDate.toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                nextPayoutMember: chama.nextPayoutMember || 'Pending Rotation'
            };
        });
        res.json(formattedChamas);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChamas = getChamas;
const createChama = async (req, res) => {
    try {
        const { name, registration, phone, county, formationDate, meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled } = req.body;
        const newChama = await prisma_1.prisma.chama.create({
            data: {
                name,
                registration,
                phone,
                county,
                formationDate: formationDate ? new Date(formationDate) : null,
                meetingFrequency,
                standardContribution: standardContribution ? parseFloat(standardContribution) : null,
                lateFine: lateFine ? parseFloat(lateFine) : null,
                missedFine: missedFine ? parseFloat(missedFine) : null,
                roscaEnabled: roscaEnabled || false
            }
        });
        res.status(201).json(newChama);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create Chama' });
    }
};
exports.createChama = createChama;
const updateChama = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, county } = req.body;
        const updatedChama = await prisma_1.prisma.chama.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(county && { county }),
            }
        });
        res.json(updatedChama);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update Chama' });
    }
};
exports.updateChama = updateChama;
const rotateMerryGoRound = async (req, res) => {
    try {
        const { id } = req.params;
        const chama = await prisma_1.prisma.chama.findUnique({
            where: { id: id },
            include: { members: true }
        });
        if (!chama) {
            return res.status(404).json({ error: 'Chama not found' });
        }
        if (!chama.roscaEnabled || !chama.members || chama.members.length === 0) {
            return res.status(400).json({ error: 'Merry-Go-Round is not enabled or no members available' });
        }
        // Logic to rotate cycle
        // Pick next member. For simplicity, we just pick a random member or the next one in the array
        // Since we don't have an order saved, let's pick a random member to simulate rotation
        const nextMember = chama.members[Math.floor(Math.random() * chama.members.length)];
        // Deduct shares logic can be added here if needed (e.g. creating Journal Vouchers or updating ledgers)
        // Set next payout date (+1 month)
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        const updatedChama = await prisma_1.prisma.chama.update({
            where: { id: id },
            data: {
                nextPayoutDate: nextDate,
                nextPayoutMember: nextMember.name
            }
        });
        res.json(updatedChama);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to rotate Merry-Go-Round cycle' });
    }
};
exports.rotateMerryGoRound = rotateMerryGoRound;
//# sourceMappingURL=chamas.js.map