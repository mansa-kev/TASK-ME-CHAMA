"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Clearing database...');
    // Clear in dependency order
    await prisma.loanRepayment.deleteMany();
    await prisma.loanGuarantor.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.savingsAccount.deleteMany();
    await prisma.shareHolding.deleteMany();
    await prisma.investment.deleteMany();
    await prisma.fixedDeposit.deleteMany();
    await prisma.withdrawalRequest.deleteMany();
    await prisma.payrollRecord.deleteMany();
    await prisma.messageTemplate.deleteMany();
    await prisma.role.deleteMany();
    await prisma.memberType.deleteMany();
    await prisma.systemConstant.deleteMany();
    await prisma.commission.deleteMany();
    await prisma.appraisal.deleteMany();
    await prisma.operationsTask.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.communicationLog.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.kycDocument.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.accountLedger.deleteMany();
    await prisma.arrearsRecord.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.ledger.deleteMany();
    await prisma.journalVoucher.deleteMany();
    await prisma.user.deleteMany();
    await prisma.chama.deleteMany();
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    // ─── CHAMAS ──────────────────────────────────────────────
    console.log('Seeding Chamas...');
    const chama1 = await prisma.chama.create({
        data: { name: 'Upendo Women Group', registration: 'REG-101', phone: '0712345678', county: 'Nairobi', meetingFrequency: 'Monthly', standardContribution: 5000, lateFine: 200, missedFine: 500, roscaEnabled: true }
    });
    const chama2 = await prisma.chama.create({
        data: { name: 'Vision 2030 Investors', registration: 'REG-102', phone: '0723456789', county: 'Mombasa', meetingFrequency: 'Bi-Weekly', standardContribution: 10000, lateFine: 500, missedFine: 1000, roscaEnabled: false }
    });
    const chama3 = await prisma.chama.create({
        data: { name: 'Kilimani Savings Circle', registration: 'REG-103', phone: '0734567890', county: 'Nairobi', meetingFrequency: 'Weekly', standardContribution: 2000, lateFine: 100, missedFine: 300, roscaEnabled: true }
    });
    // ─── ADMIN USER ──────────────────────────────────────────
    console.log('Seeding Users...');
    const admin = await prisma.user.create({
        data: { name: 'Admin User', email: 'admin@lucidhertz.com', password: hashedPassword, role: 'TCM_SUPER_ADMIN', phone: '0700000001', gender: 'Male' }
    });
    // ─── MEMBERS ─────────────────────────────────────────────
    const memberNames = [
        'Jane Wanjiku', 'Peter Ochieng', 'Grace Muthoni', 'James Kariuki', 'Mary Njeri',
        'John Otieno', 'Sarah Akinyi', 'David Mwangi', 'Faith Wambui', 'Robert Kamau',
        'Alice Wairimu', 'Michael Kiprop', 'Esther Nyambura', 'Samuel Odhiambo', 'Lucy Chebet',
        'Joseph Mutua', 'Rose Atieno', 'Paul Kimani', 'Margaret Wangari', 'Daniel Njuguna',
        'Catherine Moraa', 'George Kiptoo', 'Susan Adhiambo', 'Brian Musyoka', 'Elizabeth Mwende',
        'Patrick Korir', 'Agnes Auma', 'Stephen Ndirangu', 'Diana Jebet', 'Andrew Mugo',
        'Christine Nafula', 'Henry Kipchirchir', 'Beatrice Nyokabi', 'Thomas Omondi', 'Ruth Wanjiru',
        'Nicholas Mutiso', 'Gladys Cherono', 'Francis Gitonga', 'Dorothy Akoth'
    ];
    const members = [];
    for (let i = 0; i < memberNames.length; i++) {
        const chamaId = i < 15 ? chama1.id : i < 29 ? chama2.id : chama3.id;
        const member = await prisma.user.create({
            data: {
                name: memberNames[i],
                email: `member${i + 1}@taskme.com`,
                password: hashedPassword,
                role: 'MEMBER',
                phone: `07${String(10000000 + i).slice(0, 8)}`,
                gender: i % 2 === 0 ? 'Female' : 'Male',
                idNumber: `${30000000 + i}`,
                kraPin: `A${100000000 + i}Z`,
                chamaId,
                ledger: {
                    create: {
                        chamaId,
                        savingsBalance: Math.floor(Math.random() * 80000) + 15000,
                        sharesBalance: Math.floor(Math.random() * 30000) + 5000,
                        activeLoanBalance: Math.random() > 0.5 ? Math.floor(Math.random() * 150000) + 20000 : 0
                    }
                }
            }
        });
        members.push(member);
    }
    // ─── TRANSACTIONS (6 months history) ─────────────────────
    console.log('Seeding Transactions...');
    const ledgers = await prisma.ledger.findMany();
    for (const ledger of ledgers) {
        for (let m = 0; m < 6; m++) {
            const d = new Date();
            d.setMonth(d.getMonth() - m);
            await prisma.transaction.create({
                data: { ledgerId: ledger.id, type: 'DEPOSIT', amount: Math.floor(Math.random() * 15000) + 2000, reference: `DEP-${ledger.id.substring(0, 4)}-${m}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: d }
            });
            if (Math.random() > 0.7) {
                await prisma.transaction.create({
                    data: { ledgerId: ledger.id, type: 'LOAN_DISBURSEMENT', amount: Math.floor(Math.random() * 80000) + 20000, reference: `LD-${ledger.id.substring(0, 4)}-${m}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: d }
                });
            }
            if (Math.random() > 0.6) {
                await prisma.transaction.create({
                    data: { ledgerId: ledger.id, type: 'LOAN_REPAYMENT', amount: Math.floor(Math.random() * 10000) + 3000, reference: `LR-${ledger.id.substring(0, 4)}-${m}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: d }
                });
            }
        }
    }
    // ─── BRANCHES ────────────────────────────────────────────
    console.log('Seeding Branches...');
    await prisma.branch.create({ data: { name: 'Head Office', location: 'Nairobi CBD', vaultBalance: 5000000, status: 'ACTIVE' } });
    await prisma.branch.create({ data: { name: 'Mombasa Branch', location: 'Mombasa, Nyali', vaultBalance: 1500000, status: 'ACTIVE' } });
    await prisma.branch.create({ data: { name: 'Nakuru Branch', location: 'Nakuru Town', vaultBalance: 800000, status: 'ACTIVE' } });
    await prisma.branch.create({ data: { name: 'Kisumu Branch', location: 'Kisumu, Milimani', vaultBalance: 600000, status: 'ACTIVE' } });
    // ─── PRODUCTS ────────────────────────────────────────────
    console.log('Seeding Products...');
    await prisma.product.create({ data: { name: 'BOSA Savings', type: 'SAVINGS', interestRate: 5.5, maxTerm: 0 } });
    await prisma.product.create({ data: { name: 'Junior Saver', type: 'SAVINGS', interestRate: 7.0, maxTerm: 0 } });
    await prisma.product.create({ data: { name: 'Fixed Deposit', type: 'SAVINGS', interestRate: 9.0, maxTerm: 12 } });
    await prisma.product.create({ data: { name: 'Development Loan', type: 'LOAN', interestRate: 12.0, maxTerm: 36 } });
    await prisma.product.create({ data: { name: 'Emergency Loan', type: 'LOAN', interestRate: 8.0, maxTerm: 6 } });
    await prisma.product.create({ data: { name: 'Asset Finance Loan', type: 'LOAN', interestRate: 14.0, maxTerm: 24 } });
    await prisma.product.create({ data: { name: 'School Fees Loan', type: 'LOAN', interestRate: 10.0, maxTerm: 12 } });
    // ─── INVENTORY ───────────────────────────────────────────
    console.log('Seeding Inventory...');
    await prisma.inventoryItem.create({ data: { name: 'Solar Home System 100W', serialNumber: 'SOL-1001', condition: 'NEW', value: 45000, dateAcquired: new Date('2025-01-15'), status: 'AVAILABLE' } });
    await prisma.inventoryItem.create({ data: { name: 'Water Tank 5000L', serialNumber: 'WT-2001', condition: 'NEW', value: 35000, dateAcquired: new Date('2025-03-10'), status: 'AVAILABLE' } });
    await prisma.inventoryItem.create({ data: { name: 'HP EliteBook Laptop', serialNumber: 'HP-3001', condition: 'GOOD', value: 85000, dateAcquired: new Date('2024-06-01'), status: 'ASSIGNED' } });
    await prisma.inventoryItem.create({ data: { name: 'Samsung Galaxy A15', serialNumber: 'SAM-4001', condition: 'NEW', value: 22000, dateAcquired: new Date('2025-05-20'), status: 'AVAILABLE' } });
    await prisma.inventoryItem.create({ data: { name: 'Dairy Cow Feed 50kg', serialNumber: 'FD-5001', condition: 'NEW', value: 3500, dateAcquired: new Date('2025-07-01'), status: 'AVAILABLE' } });
    // ─── KYC DOCUMENTS ───────────────────────────────────────
    console.log('Seeding KYC...');
    for (let i = 0; i < Math.min(20, members.length); i++) {
        const statuses = ['APPROVED', 'APPROVED', 'APPROVED', 'PENDING', 'REJECTED'];
        await prisma.kycDocument.create({
            data: { userId: members[i].id, idNumber: `${30000000 + i}`, kraPin: `A${100000000 + i}Z`, nextOfKin: `NextOfKin ${i + 1}`, status: statuses[i % statuses.length] }
        });
    }
    // ─── SUPPORT TICKETS ─────────────────────────────────────
    console.log('Seeding Support Tickets...');
    await prisma.supportTicket.create({ data: { subject: 'Cannot access loan history', description: 'My loan history page is showing blank', priority: 'HIGH', status: 'OPEN', userId: members[0].id } });
    await prisma.supportTicket.create({ data: { subject: 'Update phone number', description: 'Need to update my registered phone number', priority: 'LOW', status: 'RESOLVED', userId: members[1].id } });
    await prisma.supportTicket.create({ data: { subject: 'Dividend query', description: 'When are dividends for 2025 being distributed?', priority: 'MEDIUM', status: 'IN_PROGRESS', userId: members[2].id } });
    // ─── PAYMENTS ────────────────────────────────────────────
    console.log('Seeding Payments...');
    for (let i = 0; i < 20; i++) {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 90));
        await prisma.payment.create({
            data: {
                receiptNo: `RCT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                amount: Math.floor(Math.random() * 50000) + 5000,
                narration: ['Monthly savings deposit', 'Loan repayment', 'Share purchase', 'Registration fee', 'Loan disbursement'][i % 5],
                type: i % 4 === 0 ? 'OUTBOUND' : 'INBOUND',
                date: d,
            }
        });
    }
    // ─── ACCOUNT LEDGERS (Chart of Accounts) ─────────────────
    console.log('Seeding Account Ledgers...');
    await prisma.accountLedger.create({ data: { accountName: '1100 - Cash in Hand', accountType: 'ASSET', balance: 2500000 } });
    await prisma.accountLedger.create({ data: { accountName: '1200 - Cash at Bank (KCB)', accountType: 'ASSET', balance: 12500000 } });
    await prisma.accountLedger.create({ data: { accountName: '1300 - Loan Receivables', accountType: 'ASSET', balance: 8900000 } });
    await prisma.accountLedger.create({ data: { accountName: '1400 - Investment Securities', accountType: 'ASSET', balance: 3000000 } });
    await prisma.accountLedger.create({ data: { accountName: '1500 - Fixed Assets', accountType: 'ASSET', balance: 1200000 } });
    await prisma.accountLedger.create({ data: { accountName: '2100 - Member Savings', accountType: 'LIABILITY', balance: 8500000 } });
    await prisma.accountLedger.create({ data: { accountName: '2200 - Member Deposits', accountType: 'LIABILITY', balance: 4200000 } });
    await prisma.accountLedger.create({ data: { accountName: '2300 - Accounts Payable', accountType: 'LIABILITY', balance: 350000 } });
    await prisma.accountLedger.create({ data: { accountName: '3100 - Share Capital', accountType: 'EQUITY', balance: 6500000 } });
    await prisma.accountLedger.create({ data: { accountName: '3200 - Retained Earnings', accountType: 'EQUITY', balance: 3200000 } });
    await prisma.accountLedger.create({ data: { accountName: '4100 - Loan Interest Income', accountType: 'REVENUE', balance: 1200000 } });
    await prisma.accountLedger.create({ data: { accountName: '4200 - Fee Income', accountType: 'REVENUE', balance: 450000 } });
    await prisma.accountLedger.create({ data: { accountName: '4300 - Investment Income', accountType: 'REVENUE', balance: 280000 } });
    await prisma.accountLedger.create({ data: { accountName: '5100 - Salaries & Wages', accountType: 'EXPENSE', balance: 680000 } });
    await prisma.accountLedger.create({ data: { accountName: '5200 - Office Rent', accountType: 'EXPENSE', balance: 120000 } });
    await prisma.accountLedger.create({ data: { accountName: '5300 - Utilities', accountType: 'EXPENSE', balance: 45000 } });
    await prisma.accountLedger.create({ data: { accountName: '5400 - Depreciation', accountType: 'EXPENSE', balance: 95000 } });
    // ─── JOURNAL VOUCHERS ────────────────────────────────────
    console.log('Seeding Journal Vouchers...');
    for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        await prisma.journalVoucher.create({
            data: { date: d, accountName: ['1200 - Cash at Bank', '2100 - Member Savings', '4100 - Loan Interest', '1300 - Loan Receivables', '5100 - Salaries'][i % 5], debit: i % 2 === 0 ? Math.floor(Math.random() * 100000) + 10000 : 0, credit: i % 2 !== 0 ? Math.floor(Math.random() * 100000) + 10000 : 0, narration: `Journal entry ${i + 1}`, postedBy: admin.name }
        });
    }
    // ─── OPERATIONS ──────────────────────────────────────────
    console.log('Seeding Operations...');
    const taskTitles = ['End of Month Reconciliation', 'KYC Review Batch', 'Loan Appraisal Queue', 'Branch Audit', 'Dividend Calculation', 'M-Pesa Statement Matching', 'Annual Report Preparation'];
    for (const title of taskTitles) {
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(Math.random() * 14));
        await prisma.operationsTask.create({
            data: { title, description: `${title} - scheduled operational task`, assignedTo: ['Admin User', 'Jane Wanjiku', 'Peter Ochieng'][Math.floor(Math.random() * 3)], dueDate: d, status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)] }
        });
    }
    await prisma.commission.create({ data: { agentId: members[0].id, amount: 5000, description: 'Referral Bonus - 3 new members', status: 'PAID' } });
    await prisma.commission.create({ data: { agentId: members[1].id, amount: 7500, description: 'Collection Commission - July', status: 'PENDING' } });
    await prisma.commission.create({ data: { agentId: members[2].id, amount: 3000, description: 'Registration Commission', status: 'PAID' } });
    // ─── AUDIT LOGS ──────────────────────────────────────────
    console.log('Seeding Audit Logs...');
    const actions = ['USER_LOGIN', 'MEMBER_CREATED', 'LOAN_APPROVED', 'PAYMENT_RECEIVED', 'KYC_APPROVED', 'SETTINGS_UPDATED', 'LOAN_DISBURSED', 'ROLE_CHANGED'];
    for (let i = 0; i < 15; i++) {
        const d = new Date();
        d.setHours(d.getHours() - i * 3);
        await prisma.auditLog.create({
            data: { action: actions[i % actions.length], entity: ['User', 'Loan', 'Payment', 'KYC', 'Settings'][i % 5], entityId: members[i % members.length].id, userId: admin.id, details: { oldValue: null, newValue: `Change ${i + 1}`, ipAddress: '192.168.1.' + (i + 1) }, createdAt: d }
        });
    }
    // ─── COMMUNICATION LOGS ──────────────────────────────────
    console.log('Seeding Communication Logs...');
    for (let i = 0; i < 8; i++) {
        await prisma.communicationLog.create({
            data: { type: i % 2 === 0 ? 'SMS' : 'EMAIL', recipientId: members[i % members.length].id, subject: i % 2 !== 0 ? `Account Update - ${members[i % members.length].name}` : null, body: ['Your loan has been approved.', 'Payment of KES 5,000 received. Thank you.', 'Your KYC documents are under review.', 'Reminder: Monthly contribution due in 3 days.'][i % 4], status: ['SENT', 'SENT', 'PENDING', 'FAILED'][i % 4] }
        });
    }
    // ─── ARREARS RECORDS ─────────────────────────────────────
    console.log('Seeding Arrears...');
    for (let i = 0; i < 5; i++) {
        await prisma.arrearsRecord.create({
            data: { loanId: `LOAN-LEGACY-${i}`, amount: Math.floor(Math.random() * 30000) + 5000, daysOverdue: [15, 35, 62, 95, 120][i], status: i > 3 ? 'RESOLVED' : 'ACTIVE' }
        });
    }
    // ═══ NEW MODELS ══════════════════════════════════════════
    // ─── LOANS (Full Lifecycle) ──────────────────────────────
    console.log('Seeding Loans...');
    const loanData = [
        { memberIdx: 0, product: 'Development Loan', principal: 200000, rate: 12, dur: 24, status: 'ACTIVE' },
        { memberIdx: 1, product: 'Emergency Loan', principal: 50000, rate: 8, dur: 6, status: 'ACTIVE' },
        { memberIdx: 2, product: 'School Fees Loan', principal: 80000, rate: 10, dur: 12, status: 'PENDING_APPROVAL' },
        { memberIdx: 3, product: 'Development Loan', principal: 150000, rate: 12, dur: 18, status: 'DISBURSED' },
        { memberIdx: 4, product: 'Asset Finance Loan', principal: 300000, rate: 14, dur: 24, status: 'PAID_OFF' },
        { memberIdx: 5, product: 'Emergency Loan', principal: 30000, rate: 8, dur: 3, status: 'IN_ARREARS' },
        { memberIdx: 6, product: 'Development Loan', principal: 100000, rate: 12, dur: 12, status: 'PENDING_GUARANTORS' },
    ];
    for (const ld of loanData) {
        const member = members[ld.memberIdx];
        const appDate = new Date();
        appDate.setMonth(appDate.getMonth() - Math.floor(Math.random() * 6));
        const loan = await prisma.loan.create({
            data: {
                memberId: member.id, memberName: member.name, productName: ld.product,
                principal: ld.principal, balance: ld.status === 'PAID_OFF' ? 0 : ld.principal * (0.3 + Math.random() * 0.7),
                interestRate: ld.rate, duration: ld.dur, status: ld.status,
                applicationDate: appDate,
                disbursementDate: ['ACTIVE', 'PAID_OFF', 'IN_ARREARS', 'DISBURSED'].includes(ld.status) ? appDate : null,
            }
        });
        // Add guarantors for non-pending loans
        if (ld.status !== 'PENDING_GUARANTORS') {
            for (let g = 1; g <= 3; g++) {
                const gIdx = (ld.memberIdx + g) % members.length;
                await prisma.loanGuarantor.create({
                    data: { loanId: loan.id, guarantorId: members[gIdx].id, guarantorName: members[gIdx].name, amountGuaranteed: ld.principal / 3, status: 'ACCEPTED' }
                });
            }
        }
        // Add repayment schedule for active/paid loans
        if (['ACTIVE', 'PAID_OFF', 'IN_ARREARS'].includes(ld.status)) {
            const monthlyPrincipal = ld.principal / ld.dur;
            let balance = ld.principal;
            for (let r = 1; r <= ld.dur; r++) {
                const interest = balance * (ld.rate / 100 / 12);
                const dueDate = new Date(appDate);
                dueDate.setMonth(dueDate.getMonth() + r);
                const isPaid = ld.status === 'PAID_OFF' || (r <= Math.floor(ld.dur * 0.4));
                await prisma.loanRepayment.create({
                    data: {
                        loanId: loan.id, amount: Math.round(monthlyPrincipal + interest),
                        principalPortion: Math.round(monthlyPrincipal), interestPortion: Math.round(interest),
                        dueDate, paidDate: isPaid ? dueDate : null,
                        status: isPaid ? 'PAID' : (dueDate < new Date() ? 'OVERDUE' : 'PENDING')
                    }
                });
                balance -= monthlyPrincipal;
            }
        }
    }
    // ─── SAVINGS ACCOUNTS ────────────────────────────────────
    console.log('Seeding Savings Accounts...');
    for (let i = 0; i < 15; i++) {
        await prisma.savingsAccount.create({
            data: { memberId: members[i].id, memberName: members[i].name, productName: i % 3 === 0 ? 'Junior Saver' : 'BOSA Savings', accountNumber: `SAV-${1000 + i}`, balance: Math.floor(Math.random() * 60000) + 10000 }
        });
    }
    // ─── SHARE HOLDINGS ──────────────────────────────────────
    console.log('Seeding Share Holdings...');
    for (let i = 0; i < 20; i++) {
        await prisma.shareHolding.create({
            data: { memberId: members[i].id, memberName: members[i].name, shareType: i % 5 === 0 ? 'PREFERENCE' : 'ORDINARY', units: Math.floor(Math.random() * 200) + 50, valuePerUnit: 100 }
        });
    }
    // ─── INVESTMENTS ─────────────────────────────────────────
    console.log('Seeding Investments...');
    const matDate1 = new Date();
    matDate1.setFullYear(matDate1.getFullYear() + 1);
    const matDate2 = new Date();
    matDate2.setMonth(matDate2.getMonth() + 6);
    await prisma.investment.create({ data: { name: 'Treasury Bill 91-Day', type: 'TBILL', principal: 5000000, interestRate: 16.5, maturityDate: matDate2, status: 'ACTIVE' } });
    await prisma.investment.create({ data: { name: 'Corporate Bond - Safaricom', type: 'BOND', principal: 2000000, interestRate: 12.0, maturityDate: matDate1, status: 'ACTIVE' } });
    await prisma.investment.create({ data: { name: 'Fixed Income Fund - CIC', type: 'FIXED_INCOME', principal: 3000000, interestRate: 10.0, maturityDate: matDate1, status: 'ACTIVE' } });
    const matDatePast = new Date();
    matDatePast.setMonth(matDatePast.getMonth() - 2);
    await prisma.investment.create({ data: { name: 'Treasury Bill 182-Day (Matured)', type: 'TBILL', principal: 1000000, interestRate: 15.0, maturityDate: matDatePast, status: 'MATURED' } });
    // ─── FIXED DEPOSITS ──────────────────────────────────────
    console.log('Seeding Fixed Deposits...');
    for (let i = 0; i < 5; i++) {
        const start = new Date();
        start.setMonth(start.getMonth() - (i + 1));
        const mat = new Date(start);
        mat.setMonth(mat.getMonth() + 6 + i * 3);
        await prisma.fixedDeposit.create({
            data: { memberId: members[i].id, memberName: members[i].name, amount: (i + 1) * 50000, rate: 8 + i, duration: 6 + i * 3, startDate: start, maturityDate: mat, status: i === 4 ? 'MATURED' : 'ACTIVE' }
        });
    }
    // ─── PAYROLL RECORDS ─────────────────────────────────────
    console.log('Seeding Payroll...');
    const staffRoles = [
        { name: 'Admin User', role: 'Super Admin', salary: 120000, allowances: 15000 },
        { name: 'Jane Wanjiku', role: 'Credit Officer', salary: 85000, allowances: 10000 },
        { name: 'Peter Ochieng', role: 'Field Agent', salary: 55000, allowances: 8000 },
        { name: 'Grace Muthoni', role: 'Accountant', salary: 95000, allowances: 12000 },
    ];
    for (const staff of staffRoles) {
        const gross = staff.salary + staff.allowances;
        const paye = gross > 100000 ? gross * 0.3 : gross * 0.25;
        const nssf = Math.min(gross * 0.06, 2160);
        const nhif = gross > 100000 ? 1700 : 1200;
        await prisma.payrollRecord.create({
            data: { userId: admin.id, employeeName: staff.name, role: staff.role, period: '2026-07', basicSalary: staff.salary, allowances: staff.allowances, paye: Math.round(paye), nssf, nhif, netPay: Math.round(gross - paye - nssf - nhif), status: 'PROCESSED' }
        });
    }
    // ─── MESSAGE TEMPLATES ───────────────────────────────────
    console.log('Seeding Message Templates...');
    await prisma.messageTemplate.create({ data: { name: 'Loan Approval', type: 'SMS', content: 'Dear {member_name}, your loan of KES {loan_amount} has been approved. Disbursement will be processed within 24 hours.' } });
    await prisma.messageTemplate.create({ data: { name: 'Deposit Confirmation', type: 'SMS', content: 'Hi {member_name}, we have received your deposit of KES {amount}. Receipt No: {receipt_no}. Thank you!' } });
    await prisma.messageTemplate.create({ data: { name: 'Repayment Reminder', type: 'SMS', content: 'Dear {member_name}, your loan repayment of KES {due_amount} is due on {due_date}. Please make payment to avoid penalties.' } });
    await prisma.messageTemplate.create({ data: { name: 'Monthly Statement', type: 'EMAIL', content: 'Dear {member_name},\n\nPlease find attached your monthly SACCO statement for the period ending {period}.\n\nOpening Balance: KES {opening_balance}\nDeposits: KES {deposits}\nWithdrawals: KES {withdrawals}\nClosing Balance: KES {closing_balance}\n\nThank you for banking with us.' } });
    await prisma.messageTemplate.create({ data: { name: 'Overdue Notice', type: 'EMAIL', content: 'Dear {member_name},\n\nThis is to notify you that your loan repayment of KES {due_amount} is now {days_overdue} days overdue.\n\nPlease make immediate payment to avoid further penalties.\n\nRegards,\nTask-Me Chama Management' } });
    // ─── ROLES ───────────────────────────────────────────────
    console.log('Seeding Roles...');
    await prisma.role.create({ data: { name: 'Super Admin', description: 'Full system access', permissions: ['all'] } });
    await prisma.role.create({ data: { name: 'Credit Officer', description: 'Loan processing and member management', permissions: ['members.read', 'members.write', 'loans.read', 'loans.write', 'loans.approve', 'kyc.read', 'kyc.write'] } });
    await prisma.role.create({ data: { name: 'Accountant', description: 'Financial records and reporting', permissions: ['accounts.read', 'accounts.write', 'reports.read', 'payments.read', 'payments.write', 'ledger.read', 'ledger.write'] } });
    await prisma.role.create({ data: { name: 'Field Agent', description: 'Member registration and collections', permissions: ['members.read', 'members.write', 'payments.read', 'payments.write', 'communication.read'] } });
    await prisma.role.create({ data: { name: 'Customer Care', description: 'Support and communication', permissions: ['members.read', 'support.read', 'support.write', 'communication.read', 'communication.write'] } });
    // ─── MEMBER TYPES ────────────────────────────────────────
    console.log('Seeding Member Types...');
    await prisma.memberType.create({ data: { name: 'Individual', minShares: 5000, maxLoanMultiplier: 3.0, benefits: 'Standard BOSA savings, loans up to 3x shares, dividend eligibility' } });
    await prisma.memberType.create({ data: { name: 'Group/Chama', minShares: 20000, maxLoanMultiplier: 2.5, benefits: 'Group savings, Table Banking access, Merry-Go-Round participation' } });
    await prisma.memberType.create({ data: { name: 'Corporate', minShares: 50000, maxLoanMultiplier: 4.0, benefits: 'Corporate savings, higher loan limits, dedicated relationship manager' } });
    await prisma.memberType.create({ data: { name: 'Employee', minShares: 10000, maxLoanMultiplier: 5.0, benefits: 'Check-off loan facility, salary advance, payroll deduction' } });
    // ─── SYSTEM CONSTANTS ────────────────────────────────────
    console.log('Seeding System Constants...');
    await prisma.systemConstant.create({ data: { key: 'MAX_LOAN_MULTIPLIER', value: '3', description: 'Maximum loan amount as a multiplier of total unencumbered savings' } });
    await prisma.systemConstant.create({ data: { key: 'MIN_GUARANTORS', value: '3', description: 'Minimum number of guarantors required per loan application' } });
    await prisma.systemConstant.create({ data: { key: 'MIN_GUARANTEE_RATIO', value: '1.0', description: 'Combined guarantor savings must be at least this ratio of loan principal' } });
    await prisma.systemConstant.create({ data: { key: 'LATE_PAYMENT_PENALTY_RATE', value: '2.0', description: 'Percentage penalty charged per month on overdue loan balances' } });
    await prisma.systemConstant.create({ data: { key: 'PROCESSING_FEE_RATE', value: '1.5', description: 'Percentage processing fee charged on new loan disbursements' } });
    await prisma.systemConstant.create({ data: { key: 'WITHDRAWAL_FEE_RATE', value: '0.5', description: 'Percentage fee charged on savings withdrawals' } });
    await prisma.systemConstant.create({ data: { key: 'CURRENCY', value: 'KES', description: 'Default currency symbol' } });
    await prisma.systemConstant.create({ data: { key: 'SACCO_NAME', value: 'Task-Me Chama SACCO', description: 'Official SACCO organization name' } });
    await prisma.systemConstant.create({ data: { key: 'SACCO_TAX_PIN', value: 'P051234567X', description: 'KRA Tax PIN for the SACCO' } });
    console.log('✅ Database seeded successfully with full dataset!');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map