import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Job@2026', 10);

  // ─── CHAMAS ──────────────────────────────────────────────
  console.log('Seeding Chamas...');
  const chama = await prisma.chama.upsert({
    where: { registration: 'REG-001' },
    update: {},
    create: { 
      name: 'Taskme Chama', 
      registration: 'REG-001', 
      phone: '0700000000', 
      county: 'Nairobi', 
      meetingFrequency: 'Monthly', 
      standardContribution: 5000, 
      lateFine: 200, 
      missedFine: 500, 
      roscaEnabled: true 
    }
  });

  // ─── USERS ──────────────────────────────────────────
  console.log('Seeding Users...');
  const usersToSeed = [
    {
      name: 'Job Osindi',
      email: 'jobosindi@gmail.com',
      role: 'TCM_SUPER_ADMIN',
      phone: '0712345678',
      gender: 'Male',
      savings: 50000,
      shares: 20000,
      loans: 0
    },
    {
      name: 'James Bundi',
      email: '1kevinsjames@gmail.com',
      role: 'CHAMA_ADMIN',
      phone: '0722000001',
      gender: 'Male',
      savings: 75000,
      shares: 30000,
      loans: 0
    },
    {
      name: 'Joseph Gathoni',
      email: 'josephmgathoni@gmail.com',
      role: 'MEMBER',
      phone: '0733000002',
      gender: 'Male',
      savings: 45000,
      shares: 15000,
      loans: 10000
    },
    {
      name: 'Wilfred Mungai',
      email: 'Winfred@task-me.ke',
      role: 'MEMBER',
      phone: '0744000003',
      gender: 'Male',
      savings: 30000,
      shares: 10000,
      loans: 0
    }
  ];

  for (const u of usersToSeed) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          phone: u.phone,
          gender: u.gender,
          chamaId: chama.id,
          ledger: {
            create: {
              chamaId: chama.id,
              savingsBalance: u.savings,
              sharesBalance: u.shares,
              activeLoanBalance: u.loans
            }
          }
        }
      });
    }
  }

  // ─── CHAMA PROFILE ────────────────────────────────────────
  console.log('Seeding Chama Profile...');
  const existingProfile = await prisma.chamaProfile.findFirst();
  if (!existingProfile) {
    await prisma.chamaProfile.create({
      data: {
        name: "Task-Me Chama",
        registrationNumber: "REG-2026-001",
        formationDate: new Date(),
        meetingFrequency: "MONTHLY",
        contributionAmount: 2500,
        lateFineAmount: 500
      }
    });
  }

  // ─── SAAS SUBSCRIPTION PLANS ─────────────────────────────
  console.log('Seeding SaaS Subscription Plans...');
  const plans = [
    {
      code: 'FREE_TRIAL',
      name: 'Starter Trial',
      description: '30-day all-access trial for newly formed Chamas',
      priceMonthly: 0,
      priceAnnual: 0,
      maxMembers: 15,
      maxTransactionsPerMonth: 200,
      features: ['Dashboard', 'Member Directory', 'Contributions Ledger', 'Basic Reports']
    },
    {
      code: 'GROWTH',
      name: 'Growth Chama',
      description: 'Standard plan for growing investment groups & welfare clubs',
      priceMonthly: 1500,
      priceAnnual: 15000,
      maxMembers: 50,
      maxTransactionsPerMonth: 2000,
      features: ['All Starter Features', 'Loans & Guarantors', 'M-Pesa STK Push', 'Automated Fines', 'Digital Roll Call']
    },
    {
      code: 'SACCO_ENTERPRISE',
      name: 'Commercial SACCO',
      description: 'Full-featured enterprise plan for large Chamas, SACCOs & BOSAs',
      priceMonthly: 4500,
      priceAnnual: 45000,
      maxMembers: 500,
      maxTransactionsPerMonth: 50000,
      features: ['All Growth Features', 'Multi-Bank Treasury', 'Asset Financing Marketplace', 'Auditor Export', 'Custom Bylaws Engine', 'Priority SLA']
    }
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: {},
      create: p
    });
  }

  console.log('✅ Fresh isolated database (taskme_chama_prod) seeded successfully with complete role hierarchy!');
}

main()
  .catch((e) => { console.error(e); })
  .finally(async () => { await prisma.$disconnect(); });
