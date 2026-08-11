import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSaaSPlans() {
  console.log('🌱 Seeding SaaS Subscription Plans...');

  const plans = [
    {
      code: 'STARTER',
      name: 'Starter Chama',
      description: 'Ideal for small table banking groups, family savings, and startup chamas.',
      priceMonthly: 1500,
      priceAnnual: 15000,
      maxMembers: 25,
      maxTransactionsPerMonth: 500,
      features: [
        'Up to 25 Members',
        'Basic Loan Calculator & Repayments',
        'Ordinary Savings & Welfare Ledgers',
        'Meeting Attendance Roll-Call',
        'Automated Fines & Arrears Calculation',
        'Member M-Pesa STK Push Checkout'
      ]
    },
    {
      code: 'GROWTH',
      name: 'Growth Investment Club',
      description: 'Designed for active investment clubs and medium-sized revolving funds.',
      priceMonthly: 3500,
      priceAnnual: 35000,
      maxMembers: 60,
      maxTransactionsPerMonth: 2000,
      features: [
        'Up to 60 Members',
        'Multi-Sig Committee Approvals (2-of-3)',
        'Reducing Balance & Flat Rate Loan Formulas',
        'Automated Balance Sheet & P&L Statements',
        'Digital Peer Guarantor Requests',
        'In-App Resolution Voting',
        'Bulk SMS & Email Broadcasts'
      ]
    },
    {
      code: 'PRO',
      name: 'Pro Sacco / Large Chama',
      description: 'For mature Saccos and structured investment groups managing substantial capital.',
      priceMonthly: 7500,
      priceAnnual: 75000,
      maxMembers: 150,
      maxTransactionsPerMonth: 10000,
      features: [
        'Up to 150 Members',
        'Custom Dedicated M-Pesa Till / Paybill Integration',
        'Full Double-Entry Accounting & Trial Balance',
        'Share Capital & Fixed Deposits Module',
        'Asset Financing & Group Investments',
        'Advanced Risk Scoring & Credit Limits',
        'Automated PDF Statement Dispatch'
      ]
    },
    {
      code: 'ENTERPRISE',
      name: 'Enterprise Federation',
      description: 'For multi-branch umbrella cooperatives, commercial Saccos, and large syndicates.',
      priceMonthly: 15000,
      priceAnnual: 150000,
      maxMembers: 1000,
      maxTransactionsPerMonth: 100000,
      features: [
        'Unlimited Members & Branches',
        'Dedicated Cloud Sandbox & Custom Domain',
        'Multi-Currency & Dedicated Account Manager',
        'Direct Bank API Reconciliation (KCB, Equity, Co-op)',
        '99.9% Uptime SLA & 24/7 Priority Emergency Support',
        'Custom Bylaw Algorithms & Regulatory Filing'
      ]
    }
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { code: plan.code }
    });

    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceAnnual: plan.priceAnnual,
          maxMembers: plan.maxMembers,
          maxTransactionsPerMonth: plan.maxTransactionsPerMonth,
          features: plan.features,
          status: 'ACTIVE'
        }
      });
      console.log(`✅ Created plan: ${plan.name} (${plan.code})`);
    } else {
      await prisma.subscriptionPlan.update({
        where: { code: plan.code },
        data: {
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceAnnual: plan.priceAnnual,
          maxMembers: plan.maxMembers,
          maxTransactionsPerMonth: plan.maxTransactionsPerMonth,
          features: plan.features,
          status: 'ACTIVE'
        }
      });
      console.log(`🔄 Updated plan: ${plan.name} (${plan.code})`);
    }
  }

  // Ensure all existing Chamas have active subscriptions and default bylaws
  const chamas = await prisma.chama.findMany({
    include: {
      subscription: true,
      bylaws: true
    }
  });

  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'PRO' } });

  for (const chama of chamas) {
    // Attach default bylaws if missing
    if (!chama.bylaws) {
      await prisma.chamaBylaws.create({
        data: {
          chamaId: chama.id,
          minMonthlyContribution: chama.standardContribution || 2500,
          contributionDeadlineDay: 5,
          loanMultiplierCap: 3.0,
          interestRateMethod: 'REDUCING_BALANCE',
          defaultInterestRate: 12.0,
          gracePeriodDays: 14,
          lateMeetingFine: chama.lateFine || 200,
          absentMeetingFine: chama.missedFine || 500,
          lateContributionPenaltyRate: 10.0,
          multiSigThreshold: 2,
          requiredSignatories: ['CHAIRPERSON', 'TREASURER'],
          shareValuation: 100.0
        }
      });
      console.log(`✅ Seeded bylaws for Chama: ${chama.name}`);
    }

    // Attach active subscription if missing
    if (!chama.subscription && proPlan) {
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 365); // 1 year period

      await prisma.chamaSubscription.create({
        data: {
          chamaId: chama.id,
          planId: proPlan.id,
          billingCycle: 'ANNUAL',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: true
        }
      });
      console.log(`✅ Seeded Pro subscription for Chama: ${chama.name}`);
    }
  }

  console.log('✨ SaaS plans & tenant baselines successfully initialized!');
}

seedSaaSPlans()
  .catch((e) => {
    console.error('Error seeding SaaS plans:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
