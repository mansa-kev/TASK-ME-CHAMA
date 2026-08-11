import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { logAuditEvent } from '../middlewares/auditLogger';

/**
 * Get the current Chama group's bylaws configuration
 */
export const getChamaBylaws = async (req: Request, res: Response) => {
  try {
    let chamaId = (req as any).chamaId || (req as any).user?.chamaId || (req.query.chamaId as string) || (req.headers['x-chama-id'] as string);
    if (!chamaId) {
      const defaultChama = await prisma.chama.findFirst();
      chamaId = defaultChama?.id;
    }
    if (!chamaId) {
      return res.status(404).json({ error: 'Chama group not found' });
    }

    let bylaws = await prisma.chamaBylaws.findUnique({
      where: { chamaId }
    });

    if (!bylaws) {
      // Auto-create default baseline if not yet present
      bylaws = await prisma.chamaBylaws.create({
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
  } catch (error) {
    console.error('Error fetching bylaws:', error);
    res.status(500).json({ error: 'Failed to retrieve group bylaws' });
  }
};

/**
 * Update the current Chama group's bylaws configuration (Authorized Group Officials only)
 */
export const updateChamaBylaws = async (req: Request, res: Response) => {
  try {
    let chamaId = (req as any).chamaId || (req as any).user?.chamaId || (req.query.chamaId as string) || (req.headers['x-chama-id'] as string) || req.body.chamaId;
    if (!chamaId) {
      const defaultChama = await prisma.chama.findFirst();
      chamaId = defaultChama?.id;
    }
    if (!chamaId) {
      return res.status(404).json({ error: 'Chama group not found' });
    }

    const {
      minMonthlyContribution,
      contributionDeadlineDay,
      loanMultiplierCap,
      interestRateMethod,
      defaultInterestRate,
      gracePeriodDays,
      lateMeetingFine,
      absentMeetingFine,
      lateContributionPenaltyRate,
      multiSigThreshold,
      requiredSignatories,
      shareValuation
    } = req.body;

    const previousBylaws = await prisma.chamaBylaws.findUnique({ where: { chamaId } });

    const updated = await prisma.chamaBylaws.upsert({
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

    await logAuditEvent({
      req,
      action: 'BYLAWS_UPDATED',
      entity: 'ChamaBylaws',
      entityId: updated.id,
      previousState: previousBylaws,
      newState: updated
    });

    res.json({ message: 'Group bylaws updated successfully', bylaws: updated });
  } catch (error) {
    console.error('Error updating bylaws:', error);
    res.status(500).json({ error: 'Failed to update group bylaws' });
  }
};
