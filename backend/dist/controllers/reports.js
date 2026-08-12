"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedReports = exports.saveReport = exports.generateReport = exports.getMemberStatement = exports.getStaffPerformance = void 0;
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
const generative_ai_1 = require("@google/generative-ai");
const generateReport = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please add it to your .env file.' });
        }
        const totalMembers = await prisma_1.prisma.user.count();
        const ledgers = await prisma_1.prisma.ledger.findMany();
        const totalSavings = ledgers.reduce((acc, curr) => acc + (curr.savingsBalance || 0), 0);
        const activeLoansAmount = ledgers.reduce((acc, curr) => acc + (curr.activeLoanBalance || 0), 0);
        const activeChamas = await prisma_1.prisma.chama.count({ where: { status: 'ACTIVE' } });
        const pendingKyc = await prisma_1.prisma.kycDocument.count({ where: { status: 'PENDING' } });
        // Additional metrics for comprehensive report
        const openTickets = await prisma_1.prisma.supportTicket.count({ where: { status: 'OPEN' } });
        const completedPayments = await prisma_1.prisma.payment.count({ where: { status: 'COMPLETED' } });
        const recentTransactions = await prisma_1.prisma.payment.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { date: 'desc' },
            take: 5
        });
        const transactionDetails = recentTransactions.map(tx => `- KES ${tx.amount} (${tx.type}) on ${tx.date.toISOString().split('T')[0]}`).join('\\n');
        const prompt = `You are a Senior Financial Analyst for a cooperative platform called Task-Me Chama. 
Write a highly comprehensive, structurally designed executive operational report based on the following real-time data:

## Core Metrics
- Total Members: ${totalMembers}
- Total Savings Portfolio: KES ${totalSavings.toLocaleString()}
- Active Loans Portfolio: KES ${activeLoansAmount.toLocaleString()}
- Active Chama Groups: ${activeChamas}

## Operations & Compliance
- Pending KYC Validations: ${pendingKyc}
- Open Support Tickets: ${openTickets}
- Completed Payments to date: ${completedPayments}

## Recent Transaction Highlights
${transactionDetails}

Format the report using beautiful Markdown. Structure it with:
1. An Executive Summary (High-level overview).
2. Financial Health Analysis (Savings vs Loans, liquidity).
3. Operational Status (Compliance, Support).
4. Strategic Insights & Next Steps (Actionable recommendations).
Make sure it sounds extremely professional, visually scannable (use bolding, bullet points, and tables if applicable), and addresses every aspect of our operations.`;
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const result = await model.generateContent(prompt);
        res.json({ report: result.response.text() });
    }
    catch (error) {
        console.error('AI Report Error:', error);
        res.status(500).json({ error: 'Failed to generate AI report: ' + (error.message || 'Unknown error') });
    }
};
exports.generateReport = generateReport;
const saveReport = async (req, res) => {
    try {
        const { title, content, summary, generatedBy } = req.body;
        const report = await prisma_1.prisma.generatedReport.create({
            data: {
                title,
                content,
                summary,
                generatedBy: generatedBy || 'System'
            }
        });
        res.json(report);
    }
    catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Failed to save report' });
    }
};
exports.saveReport = saveReport;
const getSavedReports = async (req, res) => {
    try {
        const reports = await prisma_1.prisma.generatedReport.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    }
    catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};
exports.getSavedReports = getSavedReports;
//# sourceMappingURL=reports.js.map