"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const getQueryWhere = (req) => {
    if (req.user?.role === "TCM_SUPER_ADMIN")
        return {};
    return { chamaId: req.user?.chamaId };
};
const getPostChamaId = (req) => {
    if (req.user?.role === "TCM_SUPER_ADMIN" && req.body.chamaId) {
        return req.body.chamaId;
    }
    return req.user?.chamaId;
};
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
// ─── INVESTMENTS ─────────────────────────────────────────────
router.get("/investments", async (req, res) => {
    try {
        const data = await prisma_1.prisma.investment.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        // BosaLedgers expects rate, but Prisma model has interestRate. Let's map it.
        const mapped = data.map((item) => ({
            ...item,
            rate: item.interestRate,
        }));
        res.json(mapped);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch investments" });
    }
});
router.post("/investments", async (req, res) => {
    try {
        const { name, type, principal, rate, maturityDate } = req.body;
        const investment = await prisma_1.prisma.investment.create({
            data: {
                chamaId: getPostChamaId(req),
                name,
                type,
                principal: parseFloat(principal),
                interestRate: parseFloat(rate),
                maturityDate: new Date(maturityDate),
                status: "ACTIVE",
            },
        });
        res.status(201).json(investment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create investment" });
    }
});
// ─── FIXED DEPOSITS ────────────────────────────────────────
router.get("/fixed-deposits", async (req, res) => {
    try {
        const data = await prisma_1.prisma.fixedDeposit.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch fixed deposits" });
    }
});
router.post("/fixed-deposits", async (req, res) => {
    try {
        const { memberId, memberName, amount, rate, duration, startDate } = req.body;
        let maturityDate = new Date();
        if (startDate) {
            maturityDate = new Date(startDate);
        }
        maturityDate.setMonth(maturityDate.getMonth() + parseInt(duration));
        const fixedDeposit = await prisma_1.prisma.fixedDeposit.create({
            data: {
                chamaId: getPostChamaId(req),
                memberId,
                memberName,
                amount: parseFloat(amount),
                rate: parseFloat(rate),
                duration: parseInt(duration),
                startDate: startDate ? new Date(startDate) : new Date(),
                maturityDate,
                status: "ACTIVE",
            },
        });
        res.status(201).json(fixedDeposit);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create fixed deposit" });
    }
});
// ─── SAVINGS ACCOUNTS ──────────────────────────────────────
router.get("/savings-accounts", async (req, res) => {
    try {
        const data = await prisma_1.prisma.savingsAccount.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch savings accounts" });
    }
});
router.post("/savings-accounts", async (req, res) => {
    try {
        const acctNum = `SAV-${Date.now().toString(36).toUpperCase()}`;
        const data = await prisma_1.prisma.savingsAccount.create({
            data: {
                chamaId: getPostChamaId(req),
                ...req.body,
                accountNumber: req.body.accountNumber || acctNum,
            },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create savings account" });
    }
});
router.delete("/savings-accounts/:id", async (req, res) => {
    try {
        await prisma_1.prisma.savingsAccount.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete savings account" });
    }
});
// ─── SHARE HOLDINGS ────────────────────────────────────────
router.get("/share-holdings", async (req, res) => {
    try {
        const data = await prisma_1.prisma.shareHolding.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch share holdings" });
    }
});
router.post("/share-holdings", async (req, res) => {
    try {
        const data = await prisma_1.prisma.shareHolding.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create share holding" });
    }
});
router.delete("/share-holdings/:id", async (req, res) => {
    try {
        await prisma_1.prisma.shareHolding.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete share holding" });
    }
});
// ─── WITHDRAWAL REQUESTS ───────────────────────────────────
router.get("/withdrawal-requests", async (req, res) => {
    try {
        const data = await prisma_1.prisma.withdrawalRequest.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch withdrawal requests" });
    }
});
router.post("/withdrawal-requests", async (req, res) => {
    try {
        const data = await prisma_1.prisma.withdrawalRequest.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create withdrawal request" });
    }
});
router.put("/withdrawal-requests/:id/approve", async (req, res) => {
    try {
        const data = await prisma_1.prisma.withdrawalRequest.update({
            where: { id: req.params.id },
            data: { status: "APPROVED" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to approve withdrawal" });
    }
});
// ─── LOANS CRUD ────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const loans = await prisma_1.prisma.loan.findMany({
            where: getQueryWhere(req),
            include: { guarantors: true, repayments: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(loans);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch loans" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { memberId, memberName, productName, principal, interestRate, duration, interestMethod, } = req.body;
        const loan = await prisma_1.prisma.loan.create({
            data: {
                chamaId: getPostChamaId(req),
                memberId,
                memberName,
                productName,
                principal,
                balance: principal,
                interestRate: interestRate || 12.0,
                duration: duration || 12,
                interestMethod: interestMethod || "REDUCING_BALANCE",
                status: "PENDING_GUARANTORS",
            },
        });
        res.status(201).json(loan);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create loan" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        // Also delete associated repayments and guarantors since prisma might not cascade depending on schema config
        await prisma_1.prisma.loanRepayment.deleteMany({
            where: { loanId: req.params.id },
        });
        await prisma_1.prisma.loanGuarantor.deleteMany({
            where: { loanId: req.params.id },
        });
        await prisma_1.prisma.loan.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete loan" });
    }
});
// ─── GUARANTOR MANAGEMENT ──────────────────────────────────
router.get("/guarantors/all", async (req, res) => {
    try {
        const data = await prisma_1.prisma.loanGuarantor.findMany({
            where: getQueryWhere(req),
            include: { loan: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch all guarantors" });
    }
});
router.get("/guarantors/me", async (req, res) => {
    try {
        const data = await prisma_1.prisma.loanGuarantor.findMany({
            where: { ...getQueryWhere(req), guarantorId: req.user.id },
            include: { loan: true },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch guarantorship requests" });
    }
});
router.post("/:id/guarantors", async (req, res) => {
    try {
        const { guarantorId, guarantorName, amountGuaranteed } = req.body;
        if (guarantorId === req.user.id) {
            return res
                .status(400)
                .json({ error: "Self-guaranteeing is not allowed" });
        }
        const guarantorUser = await prisma_1.prisma.user.findUnique({
            where: { id: guarantorId },
        });
        if (!guarantorUser ||
            (guarantorUser.role !== "MEMBER" &&
                guarantorUser.role !== "CHAMA_ADMIN")) {
            return res.status(400).json({ error: "Invalid guarantor" });
        }
        const guarantorLedger = await prisma_1.prisma.ledger.findUnique({
            where: { userId: guarantorId },
        });
        if (!guarantorLedger ||
            guarantorLedger.savingsBalance < amountGuaranteed) {
            return res
                .status(400)
                .json({
                error: "Guarantor does not have sufficient savings to cover this amount.",
            });
        }
        const guarantor = await prisma_1.prisma.loanGuarantor.create({
            data: {
                chamaId: getPostChamaId(req),
                loanId: req.params.id,
                guarantorId,
                guarantorName,
                amountGuaranteed,
            },
        });
        // Check if enough guarantors to advance status
        const allGuarantors = await prisma_1.prisma.loanGuarantor.findMany({
            where: {
                ...getQueryWhere(req),
                loanId: req.params.id,
                status: { in: ["PENDING", "ACCEPTED"] },
            },
        });
        if (allGuarantors.length >= 3) {
            const loan = await prisma_1.prisma.loan.findUnique({
                where: { id: req.params.id },
            });
            const totalGuaranteed = allGuarantors.reduce((s, g) => s + g.amountGuaranteed, 0);
            if (totalGuaranteed >= loan.principal) {
                await prisma_1.prisma.loan.update({
                    where: { id: req.params.id },
                    data: { status: "PENDING_APPROVAL" },
                });
            }
        }
        return res.status(201).json(guarantor);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to add guarantor" });
    }
});
router.put("/guarantors/:gid/accept", async (req, res) => {
    try {
        const guarantor = await prisma_1.prisma.loanGuarantor.update({
            where: { id: req.params.gid },
            data: { status: "ACCEPTED" },
        });
        res.json(guarantor);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to accept guarantor" });
    }
});
router.put("/guarantors/:gid/reject", async (req, res) => {
    try {
        const guarantor = await prisma_1.prisma.loanGuarantor.update({
            where: { id: req.params.gid },
            data: { status: "REJECTED" },
        });
        res.json(guarantor);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reject guarantor" });
    }
});
// ─── LOAN LIFECYCLE ────────────────────────────────────────
router.put("/:id/approve", async (req, res) => {
    try {
        const loan = await prisma_1.prisma.loan.update({
            where: { id: req.params.id },
            data: { status: "APPROVED" },
        });
        res.json(loan);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to approve loan" });
    }
});
router.put("/:id/reject", async (req, res) => {
    try {
        const loan = await prisma_1.prisma.loan.update({
            where: { id: req.params.id },
            data: { status: "REJECTED" },
        });
        res.json(loan);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reject loan" });
    }
});
router.put("/:id/disburse", async (req, res) => {
    try {
        const loan = await prisma_1.prisma.loan.findUnique({
            where: { id: req.params.id },
        });
        if (!loan || loan.status !== "APPROVED") {
            return res
                .status(400)
                .json({ error: "Loan must be APPROVED to disburse" });
        }
        // Generate repayment schedule
        const monthlyRate = loan.interestRate / 100 / 12;
        const n = loan.duration;
        let repayments = [];
        if (loan.interestMethod === "AMORTIZED") {
            // PMT formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            const pmt = (loan.principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
                (Math.pow(1 + monthlyRate, n) - 1);
            let balance = loan.principal;
            for (let i = 1; i <= n; i++) {
                const interest = balance * monthlyRate;
                const principalPortion = pmt - interest;
                balance -= principalPortion;
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                repayments.push({
                    loanId: loan.id,
                    amount: Math.round(pmt),
                    principalPortion: Math.round(principalPortion),
                    interestPortion: Math.round(interest),
                    dueDate,
                });
            }
        }
        else if (loan.interestMethod === "REDUCING_BALANCE") {
            const principalPortion = loan.principal / n;
            let balance = loan.principal;
            for (let i = 1; i <= n; i++) {
                const interest = balance * monthlyRate;
                balance -= principalPortion;
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                repayments.push({
                    loanId: loan.id,
                    amount: Math.round(principalPortion + interest),
                    principalPortion: Math.round(principalPortion),
                    interestPortion: Math.round(interest),
                    dueDate,
                });
            }
        }
        else {
            // STRAIGHT_LINE
            const totalInterest = loan.principal * (loan.interestRate / 100) * (n / 12);
            const monthlyInstalment = (loan.principal + totalInterest) / n;
            const monthlyInterest = totalInterest / n;
            const principalPortion = loan.principal / n;
            for (let i = 1; i <= n; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                repayments.push({
                    loanId: loan.id,
                    amount: Math.round(monthlyInstalment),
                    principalPortion: Math.round(principalPortion),
                    interestPortion: Math.round(monthlyInterest),
                    dueDate,
                });
            }
        }
        await prisma_1.prisma.loanRepayment.createMany({ data: repayments });
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + n);
        const updated = await prisma_1.prisma.loan.update({
            where: { id: req.params.id },
            data: { status: "ACTIVE", disbursementDate: new Date(), dueDate },
            include: { repayments: true, guarantors: true },
        });
        // Auto-generate Journal Vouchers on Loan Disbursement (Double-Entry)
        await prisma_1.prisma.journalVoucher.createMany({
            data: [
                {
                    accountName: `Loan Receivable - ${loan.memberName}`,
                    date: new Date(),
                    narration: `Loan Disbursement to ${loan.memberName} for ${loan.productName}`,
                    debit: loan.principal,
                    credit: 0,
                },
                {
                    accountName: `Bank/Cash Account`,
                    date: new Date(),
                    narration: `Loan Disbursement to ${loan.memberName} for ${loan.productName}`,
                    debit: 0,
                    credit: loan.principal,
                },
            ],
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to disburse loan" });
    }
});
// ─── REPAYMENT ─────────────────────────────────────────────
router.put("/repayments/:rid/pay", async (req, res) => {
    try {
        const repayment = await prisma_1.prisma.loanRepayment.update({
            where: { id: req.params.rid },
            data: { status: "PAID", paidDate: new Date() },
        });
        // Update loan balance
        const loan = await prisma_1.prisma.loan.findUnique({
            where: { id: repayment.loanId },
        });
        const newBalance = loan.balance - repayment.principalPortion;
        const updateData = { balance: Math.max(0, newBalance) };
        // Check if fully paid
        const pendingRepayments = await prisma_1.prisma.loanRepayment.findMany({
            where: {
                ...getQueryWhere(req),
                loanId: repayment.loanId,
                status: { in: ["PENDING", "OVERDUE", "PARTIAL"] },
            },
        });
        if (pendingRepayments.length === 0) {
            updateData.status = "PAID_OFF";
            updateData.balance = 0;
        }
        await prisma_1.prisma.loan.update({
            where: { id: repayment.loanId },
            data: updateData,
        });
        res.json(repayment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to record repayment" });
    }
});
// ─── DYNAMIC ID ROUTES (MUST BE LAST) ──────────────────────
router.get("/:id", async (req, res) => {
    try {
        const loan = await prisma_1.prisma.loan.findUnique({
            where: { id: req.params.id },
            include: {
                guarantors: true,
                repayments: { orderBy: { dueDate: "asc" } },
            },
        });
        if (!loan)
            return res.status(404).json({ error: "Loan not found" });
        res.json(loan);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch loan" });
    }
});
exports.default = router;
//# sourceMappingURL=loans.js.map