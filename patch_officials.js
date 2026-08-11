const fs = require('fs');

const path = 'backend/src/controllers/officials.ts';
let code = fs.readFileSync(path, 'utf8');

const vettingReplacement = `export const getVettingApplications = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const applicants = await prisma.user.findMany({
      where: { chamaId, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      include: {
        kyc: true,
        ledger: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const vettingList = applicants.map((applicant, idx) => {
      const hasId = !!applicant.kyc?.idNumber;
      const hasKra = !!applicant.kyc?.kraPin;
      const hasKin = !!applicant.kyc?.nextOfKin;

      let baseScore = 650;
      if (hasId) baseScore += 120;
      if (hasKra) baseScore += 80;
      if (hasKin) baseScore += 50;

      const creditScore = Math.min(950, Math.max(400, baseScore));
      let riskTier = 'LOW';
      if (creditScore < 600) riskTier = 'HIGH';
      else if (creditScore < 750) riskTier = 'MEDIUM';

      return {
        id: applicant.id,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.phone,
        status: applicant.status,
        createdAt: applicant.createdAt,
        idNumber: applicant.kyc?.idNumber || 'Not Provided',
        kraPin: applicant.kyc?.kraPin || 'Not Provided',
        nextOfKin: applicant.kyc?.nextOfKin || 'Not Provided',
        guarantors: [],
        creditScore,
        riskTier,
        vettingStage: applicant.status === 'UNDER_REVIEW' ? 'STAGE_4_COMMITTEE_REVIEW' : 'STAGE_1_PRE_SCREENING',
        committeeVotes: [],
        flags: creditScore < 650 ? ['Requires review due to low credit score'] : []
      };
    });

    res.json(vettingList);
  } catch (error) {
    console.error('Error fetching vetting applications:', error);
    res.status(500).json({ error: 'Failed to fetch vetting applications' });
  }
};`;

const reconReplacement = `export const getReconciliationData = async (req: Request, res: Response) => {
  try {
    const chamaId = await getChamaId((req as any).user.id);
    if (!chamaId) return res.status(403).json({ error: 'No Chama associated' });

    const payments = await prisma.payment.findMany({
      where: { chamaId },
      orderBy: { date: 'desc' },
      take: 50
    });

    const statementItems = payments.map(p => ({
      id: p.id,
      date: p.date,
      reference: p.receiptNo,
      partyName: p.type === 'INBOUND' ? 'MEMBER_PAYMENT' : 'VENDOR_PAYOUT',
      partyPhone: '',
      amount: p.amount,
      type: p.type === 'INBOUND' ? 'CREDIT' : 'DEBIT',
      channel: 'M_PESA',
      matchStatus: p.type === 'INBOUND' ? 'MATCHED' : 'UNMATCHED',
      mappedMember: null,
      mappedCategory: p.narration
    }));

    const stats = {
      totalStatementVolume: payments.reduce((acc, p) => acc + p.amount, 0),
      totalMatchedVolume: payments.filter(p => p.type === 'INBOUND').reduce((acc, p) => acc + p.amount, 0),
      unmatchedCount: payments.filter(p => p.type !== 'INBOUND').length,
      suspenseBalance: payments.filter(p => p.type !== 'INBOUND').reduce((acc, p) => acc + p.amount, 0),
      autoReconciliationRate: payments.length > 0 ? Math.round((payments.filter(p => p.type === 'INBOUND').length / payments.length) * 100) : 0
    };

    res.json({ stats, statementItems, recentPayments: payments });
  } catch (error) {
    console.error('Error fetching reconciliation data:', error);
    res.status(500).json({ error: 'Failed to fetch reconciliation data' });
  }
};`;

code = code.replace(/export const getVettingApplications = async [\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to fetch vetting applications' \};\n  \}\n\};/, vettingReplacement);
code = code.replace(/export const getReconciliationData = async [\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to fetch reconciliation data' \};\n  \}\n\};/, reconReplacement);

fs.writeFileSync(path, code);
