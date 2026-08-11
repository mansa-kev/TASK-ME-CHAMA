"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChamaBylaws = exports.getChamaBylaws = void 0;
const prisma_1 = require("../prisma");
const auditLogger_1 = require("../middlewares/auditLogger");
/**
 * Get the current Chama group's bylaws configuration
 */
const getChamaBylaws = async (req, res) => {
    try {
        let chamaId = req.chamaId || req.user?.chamaId || req.query.chamaId || req.headers['x-chama-id'];
        if (!chamaId) {
            const defaultChama = await prisma_1.prisma.chama.findFirst();
            chamaId = defaultChama?.id;
        }
        if (!chamaId) {
            return res.status(404).json({ error: 'Chama group not found' });
        }
        let bylaws = await prisma_1.prisma.chamaBylaws.findUnique({
            where: { chamaId }
        });
        if (!bylaws) {
            // Auto-create default baseline if not yet present
            bylaws = await prisma_1.prisma.chamaBylaws.create({
                data: {
                    chamaId,
                    minMonthlyContribution: 2500,
                    contributionDeadlineDay: 5,
                    loanMultiplierCap: 3.0,
                    interestRateMethod: 'REDUCING_BALANCE',
                    defaultInterestRate: 12.0,
                    gracePeriodDays: 14,
                    lateMeetingFine: 200,
                    absentMeetingFine: 500,
                    lateContributionPenaltyRate: 10.0,
                    multiSigThreshold: 2,
                    requiredSignatories: ['CHAIRPERSON', 'TREASURER'],
                    shareValuation: 100.0
                }
            });
        }
        res.json(bylaws);
    }
    catch (error) {
        console.error('Error fetching bylaws:', error);
        res.status(500).json({ error: 'Failed to retrieve group bylaws' });
    }
};
exports.getChamaBylaws = getChamaBylaws;
/**
 * Update the current Chama group's bylaws configuration (Authorized Group Officials only)
 */
const updateChamaBylaws = async (req, res) => {
    try {
        let chamaId = req.chamaId || req.user?.chamaId || req.query.chamaId || req.headers['x-chama-id'] || req.body.chamaId;
        if (!chamaId) {
            const defaultChama = await prisma_1.prisma.chama.findFirst();
            chamaId = defaultChama?.id;
        }
        if (!chamaId) {
            return res.status(404).json({ error: 'Chama group not found' });
        }
        const { minMonthlyContribution, contributionDeadlineDay, loanMultiplierCap, interestRateMethod, defaultInterestRate, gracePeriodDays, lateMeetingFine, absentMeetingFine, lateContributionPenaltyRate, multiSigThreshold, requiredSignatories, shareValuation } = req.body;
        const previousBylaws = await prisma_1.prisma.chamaBylaws.findUnique({ where: { chamaId } });
        const updated = await prisma_1.prisma.chamaBylaws.upsert({
            where: { chamaId },
            update: {
                minMonthlyContribution: Number(minMonthlyContribution || 2500),
                contributionDeadlineDay: Number(contributionDeadlineDay || 5),
                loanMultiplierCap: Number(loanMultiplierCap || 3.0),
                interestRateMethod: interestRateMethod || 'REDUCING_BALANCE',
                defaultInterestRate: Number(defaultInterestRate || 12.0),
                gracePeriodDays: Number(gracePeriodDays || 14),
                lateMeetingFine: Number(lateMeetingFine || 200),
                absentMeetingFine: Number(absentMeetingFine || 500),
                lateContributionPenaltyRate: Number(lateContributionPenaltyRate || 10.0),
                multiSigThreshold: Number(multiSigThreshold || 2),
                requiredSignatories: requiredSignatories || ['CHAIRPERSON', 'TREASURER'],
                shareValuation: Number(shareValuation || 100.0)
            },
            create: {
                chamaId,
                minMonthlyContribution: Number(minMonthlyContribution || 2500),
                contributionDeadlineDay: Number(contributionDeadlineDay || 5),
                loanMultiplierCap: Number(loanMultiplierCap || 3.0),
                interestRateMethod: interestRateMethod || 'REDUCING_BALANCE',
                defaultInterestRate: Number(defaultInterestRate || 12.0),
                gracePeriodDays: Number(gracePeriodDays || 14),
                lateMeetingFine: Number(lateMeetingFine || 200),
                absentMeetingFine: Number(absentMeetingFine || 500),
                lateContributionPenaltyRate: Number(lateContributionPenaltyRate || 10.0),
                multiSigThreshold: Number(multiSigThreshold || 2),
                requiredSignatories: requiredSignatories || ['CHAIRPERSON', 'TREASURER'],
                shareValuation: Number(shareValuation || 100.0)
            }
        });
        await (0, auditLogger_1.logAuditEvent)({
            req,
            action: 'BYLAWS_UPDATED',
            entity: 'ChamaBylaws',
            entityId: updated.id,
            previousState: previousBylaws,
            newState: updated
        });
        res.json({ message: 'Group bylaws updated successfully', bylaws: updated });
    }
    catch (error) {
        console.error('Error updating bylaws:', error);
        res.status(500).json({ error: 'Failed to update group bylaws' });
    }
};
exports.updateChamaBylaws = updateChamaBylaws;
//# sourceMappingURL=bylaws.js.map