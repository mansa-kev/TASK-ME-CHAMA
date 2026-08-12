"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chamaPenalty = exports.chamaDeposit = exports.getChamaTableBanking = exports.getChamaMembers = exports.getChamaById = exports.getMyChama = exports.rotateMerryGoRound = exports.addMemberToChama = exports.assignChamaOfficial = exports.updateChama = exports.createChama = exports.getChamas = void 0;
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
                regNo: chama.registration,
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
        const { name, registration, phone, county, formationDate, meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled, officials } = req.body;
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
        if (officials && Array.isArray(officials) && officials.length > 0) {
            for (const official of officials) {
                if (official.memberId) {
                    await prisma_1.prisma.user.update({
                        where: { id: official.memberId },
                        data: {
                            chamaId: newChama.id,
                            officialPosition: official.position,
                            role: 'CHAMA_ADMIN'
                        }
                    });
                }
            }
        }
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
        const { name, phone, county, registration, formationDate, meetingFrequency, standardContribution, lateFine, missedFine, roscaEnabled } = req.body;
        const updatedChama = await prisma_1.prisma.chama.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(county !== undefined && { county }),
                ...(registration && { registration }),
                ...(formationDate && { formationDate: new Date(formationDate) }),
                ...(meetingFrequency && { meetingFrequency }),
                ...(standardContribution !== undefined && standardContribution !== '' && { standardContribution: parseFloat(standardContribution) }),
                ...(lateFine !== undefined && lateFine !== '' && { lateFine: parseFloat(lateFine) }),
                ...(missedFine !== undefined && missedFine !== '' && { missedFine: parseFloat(missedFine) }),
                ...(roscaEnabled !== undefined && { roscaEnabled: Boolean(roscaEnabled) }),
            }
        });
        res.json(updatedChama);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update Chama' });
    }
};
exports.updateChama = updateChama;
const assignChamaOfficial = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId, position } = req.body;
        if (!memberId || !position) {
            return res.status(400).json({ error: 'memberId and position are required' });
        }
        // Clear anyone currently holding this exact position in this chama
        await prisma_1.prisma.user.updateMany({
            where: { chamaId: id, officialPosition: position },
            data: { officialPosition: null, role: 'MEMBER' }
        });
        // Assign the new official
        const updated = await prisma_1.prisma.user.update({
            where: { id: memberId },
            data: {
                chamaId: id,
                officialPosition: position,
                role: 'CHAMA_ADMIN'
            }
        });
        res.json({ success: true, member: { id: updated.id, name: updated.name, officialPosition: updated.officialPosition } });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to assign official' });
    }
};
exports.assignChamaOfficial = assignChamaOfficial;
const addMemberToChama = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;
        if (!memberId)
            return res.status(400).json({ error: 'memberId is required' });
        const user = await prisma_1.prisma.user.update({
            where: { id: memberId },
            data: { chamaId: id }
        });
        res.json({ success: true, member: { id: user.id, name: user.name, chamaId: user.chamaId } });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to add member to chama' });
    }
};
exports.addMemberToChama = addMemberToChama;
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
        const nextMember = chama.members[Math.floor(Math.random() * chama.members.length)];
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
const getMyChama = async (req, res) => {
    try {
        const user = req.user;
        const dbUser = await prisma_1.prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser || !dbUser.chamaId) {
            return res.status(404).json({ error: 'Chama not found for this user' });
        }
        const chama = await prisma_1.prisma.chama.findUnique({ where: { id: dbUser.chamaId } });
        const profile = await prisma_1.prisma.chamaProfile.findFirst();
        // Get officials
        const officials = await prisma_1.prisma.user.findMany({
            where: {
                chamaId: dbUser.chamaId,
                role: 'CHAMA_ADMIN'
            }
        });
        return res.json({ chama, officials, profile });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyChama = getMyChama;
const getChamaById = async (req, res) => {
    try {
        const { id } = req.params;
        const chama = await prisma_1.prisma.chama.findUnique({
            where: { id },
            include: {
                members: {
                    select: { id: true, name: true, phone: true, officialPosition: true, role: true }
                },
                ledgers: true,
                _count: { select: { members: true } }
            }
        });
        if (!chama)
            return res.status(404).json({ error: 'Chama not found' });
        // Build leadership object from officials
        const chairperson = chama.members.find(m => m.officialPosition === 'Chairperson');
        const treasurer = chama.members.find(m => m.officialPosition === 'Treasurer');
        const secretary = chama.members.find(m => m.officialPosition === 'Secretary');
        const totalSavings = chama.ledgers.reduce((s, l) => s + l.savingsBalance + l.sharesBalance, 0);
        const activeLoans = chama.ledgers.reduce((s, l) => s + l.activeLoanBalance, 0);
        res.json({
            id: chama.id,
            name: chama.name,
            registration: chama.registration,
            regNo: chama.registration,
            phone: chama.phone,
            county: chama.county,
            formationDate: chama.formationDate,
            meetingFreq: chama.meetingFrequency,
            meetingFrequency: chama.meetingFrequency,
            contribution: chama.standardContribution ?? 0,
            standardContribution: chama.standardContribution ?? 0,
            lateFine: chama.lateFine ?? 0,
            missedFine: chama.missedFine ?? 0,
            roscaEnabled: chama.roscaEnabled,
            status: chama.status,
            stats: {
                totalMembers: chama._count.members,
                totalSavings,
                activeLoans,
                finesFund: 0,
                cycleNumber: 1
            },
            leadership: {
                chairperson: chairperson?.name ?? null,
                chairpersonId: chairperson?.id ?? null,
                treasurer: treasurer?.name ?? null,
                treasurerId: treasurer?.id ?? null,
                secretary: secretary?.name ?? null,
                secretaryId: secretary?.id ?? null,
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChamaById = getChamaById;
const getChamaMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await prisma_1.prisma.user.findMany({
            where: { chamaId: id },
            select: { id: true, name: true, phone: true, email: true, officialPosition: true, role: true, status: true, createdAt: true }
        });
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChamaMembers = getChamaMembers;
const getChamaTableBanking = async (req, res) => {
    try {
        const { id } = req.params;
        const collections = await prisma_1.prisma.meetingCollection.findMany({
            where: { chamaId: id },
            orderBy: { date: 'desc' }
        });
        res.json(collections);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChamaTableBanking = getChamaTableBanking;
const chamaDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reference, memberId } = req.body;
        const payment = await prisma_1.prisma.payment.create({
            data: {
                chamaId: id,
                amount: parseFloat(amount),
                receiptNo: reference || `REC-${Date.now()}`,
                type: 'INBOUND'
            }
        });
        res.json(payment);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.chamaDeposit = chamaDeposit;
const chamaPenalty = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason, memberId } = req.body;
        const penalty = await prisma_1.prisma.disciplinaryRecord.create({
            data: {
                chamaId: id,
                memberId: memberId || 'UNKNOWN',
                type: 'FINE',
                reason: reason || 'Penalty',
                amount: parseFloat(amount)
            }
        });
        res.json(penalty);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.chamaPenalty = chamaPenalty;
//# sourceMappingURL=chamas.js.map