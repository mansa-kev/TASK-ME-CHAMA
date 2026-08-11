"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayments = exports.getPayments = exports.exportJournalVoucherPdf = exports.exportLedgerPdf = exports.createJournalvouchers = exports.getJournalvouchers = exports.createAccountledgers = exports.getAccountledgers = exports.createArrearsrecords = exports.getArrearsrecords = exports.createCommissions = exports.getCommissions = exports.createAppraisals = exports.getAppraisals = exports.createOperationstasks = exports.getOperationstasks = exports.createAuditlogs = exports.getAuditlogs = exports.createCommunicationlogs = exports.getCommunicationlogs = exports.updateSupporttickets = exports.createSupporttickets = exports.getSupporttickets = exports.updateKycStatus = exports.createKycdocuments = exports.getKycdocuments = exports.assignInventoryitem = exports.createInventoryitems = exports.getInventoryitems = exports.createProducts = exports.getProducts = exports.createBranches = exports.getBranches = void 0;
const prisma_1 = require("../prisma");
const getBranches = async (req, res) => {
    try {
        const data = await prisma_1.prisma.branch.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch branches" });
    }
};
exports.getBranches = getBranches;
const createBranches = async (req, res) => {
    try {
        const data = await prisma_1.prisma.branch.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Branch" });
    }
};
exports.createBranches = createBranches;
const getProducts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.product.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};
exports.getProducts = getProducts;
const createProducts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.product.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Product" });
    }
};
exports.createProducts = createProducts;
const getInventoryitems = async (req, res) => {
    try {
        const data = await prisma_1.prisma.inventoryItem.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch inventoryItems" });
    }
};
exports.getInventoryitems = getInventoryitems;
const createInventoryitems = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            serialNumber: req.body.serialNumber || `SN-${Date.now()}`,
            condition: req.body.condition || 'NEW'
        };
        const data = await prisma_1.prisma.inventoryItem.create({ data: payload });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create InventoryItem" });
    }
};
exports.createInventoryitems = createInventoryitems;
const assignInventoryitem = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;
        const data = await prisma_1.prisma.inventoryItem.update({
            where: { id },
            data: {
                assignedTo: memberId,
                status: "ASSIGNED"
            }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to assign InventoryItem" });
    }
};
exports.assignInventoryitem = assignInventoryitem;
const getKycdocuments = async (req, res) => {
    try {
        const data = await prisma_1.prisma.kycDocument.findMany({ include: { user: true } });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch kycDocuments" });
    }
};
exports.getKycdocuments = getKycdocuments;
const createKycdocuments = async (req, res) => {
    try {
        const data = await prisma_1.prisma.kycDocument.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create kycDocument" });
    }
};
exports.createKycdocuments = createKycdocuments;
const updateKycStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = await prisma_1.prisma.kycDocument.update({
            where: { id },
            data: { status }
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update KYC status" });
    }
};
exports.updateKycStatus = updateKycStatus;
const getSupporttickets = async (req, res) => {
    try {
        const data = await prisma_1.prisma.supportTicket.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch supportTickets" });
    }
};
exports.getSupporttickets = getSupporttickets;
const createSupporttickets = async (req, res) => {
    try {
        const data = await prisma_1.prisma.supportTicket.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create SupportTicket" });
    }
};
exports.createSupporttickets = createSupporttickets;
const updateSupporttickets = async (req, res) => {
    try {
        const data = await prisma_1.prisma.supportTicket.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update SupportTicket" });
    }
};
exports.updateSupporttickets = updateSupporttickets;
const getCommunicationlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.communicationLog.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch communicationLogs" });
    }
};
exports.getCommunicationlogs = getCommunicationlogs;
const createCommunicationlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.communicationLog.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create CommunicationLog" });
    }
};
exports.createCommunicationlogs = createCommunicationlogs;
const getAuditlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.auditLog.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch auditLogs" });
    }
};
exports.getAuditlogs = getAuditlogs;
const createAuditlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.auditLog.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create AuditLog" });
    }
};
exports.createAuditlogs = createAuditlogs;
const getOperationstasks = async (req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch operationsTasks" });
    }
};
exports.getOperationstasks = getOperationstasks;
const createOperationstasks = async (req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create OperationsTask" });
    }
};
exports.createOperationstasks = createOperationstasks;
const getAppraisals = async (req, res) => {
    try {
        const data = await prisma_1.prisma.appraisal.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appraisals" });
    }
};
exports.getAppraisals = getAppraisals;
const createAppraisals = async (req, res) => {
    try {
        const data = await prisma_1.prisma.appraisal.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Appraisal" });
    }
};
exports.createAppraisals = createAppraisals;
const getCommissions = async (req, res) => {
    try {
        const data = await prisma_1.prisma.commission.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch commissions" });
    }
};
exports.getCommissions = getCommissions;
const createCommissions = async (req, res) => {
    try {
        const data = await prisma_1.prisma.commission.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Commission" });
    }
};
exports.createCommissions = createCommissions;
const getArrearsrecords = async (req, res) => {
    try {
        const arrears = await prisma_1.prisma.arrearsRecord.findMany();
        const loanIds = arrears.map((a) => a.loanId);
        const loans = await prisma_1.prisma.loan.findMany({
            where: { id: { in: loanIds } },
            select: { id: true, memberName: true, memberId: true }
        });
        const data = arrears.map((a) => {
            const loan = loans.find((l) => l.id === a.loanId);
            return {
                ...a,
                memberName: loan?.memberName || 'Unknown',
                memberId: loan?.memberId || null
            };
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch arrearsRecords" });
    }
};
exports.getArrearsrecords = getArrearsrecords;
const createArrearsrecords = async (req, res) => {
    try {
        const data = await prisma_1.prisma.arrearsRecord.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create ArrearsRecord" });
    }
};
exports.createArrearsrecords = createArrearsrecords;
const getAccountledgers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.accountLedger.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch accountLedgers" });
    }
};
exports.getAccountledgers = getAccountledgers;
const createAccountledgers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.accountLedger.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create AccountLedger" });
    }
};
exports.createAccountledgers = createAccountledgers;
const getJournalvouchers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.journalVoucher.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch journalVouchers" });
    }
};
exports.getJournalvouchers = getJournalvouchers;
const createJournalvouchers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.journalVoucher.create({ data: req.body });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create JournalVoucher" });
    }
};
exports.createJournalvouchers = createJournalvouchers;
const pdfkit_1 = __importDefault(require("pdfkit"));
const exportLedgerPdf = async (req, res) => {
    try {
        const vouchers = await prisma_1.prisma.journalVoucher.findMany({
            orderBy: { createdAt: 'desc' }
        });
        if (vouchers.length === 0) {
            return res.status(404).json({ error: "No records to display for this export" });
        }
        // Initialize PDFKit
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ledger_Export_${Date.now()}.pdf`);
        doc.pipe(res);
        // Title
        doc.fontSize(20).text('Ledger Export', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown(2);
        // Draw Table Header
        const tableTop = doc.y;
        const colWidths = [100, 150, 70, 70, 100];
        const headers = ['Date', 'Account', 'Debit', 'Credit', 'Narration'];
        let currentX = 50;
        doc.font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, currentX, tableTop);
            currentX += colWidths[i];
        });
        doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();
        doc.font('Helvetica');
        let currentY = tableTop + 20;
        for (const v of vouchers) {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
            currentX = 50;
            const row = [
                v.date ? new Date(v.date).toLocaleDateString() : new Date().toLocaleDateString(),
                v.accountName || '-',
                v.debit ? v.debit.toString() : '0',
                v.credit ? v.credit.toString() : '0',
                v.narration || '-'
            ];
            row.forEach((text, i) => {
                doc.text(text, currentX, currentY, { width: colWidths[i] - 5, align: i === 2 || i === 3 ? 'right' : 'left' });
                currentX += colWidths[i];
            });
            currentY += 20;
        }
        doc.end();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to export ledger" });
    }
};
exports.exportLedgerPdf = exportLedgerPdf;
const exportJournalVoucherPdf = async (req, res) => {
    try {
        const { id } = req.params; // If ID is provided, export single, else export all
        let vouchers;
        if (id && id !== 'all') {
            const voucher = await prisma_1.prisma.journalVoucher.findUnique({ where: { id } });
            vouchers = voucher ? [voucher] : [];
        }
        else {
            vouchers = await prisma_1.prisma.journalVoucher.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
        if (vouchers.length === 0) {
            return res.status(404).json({ error: "Journal Voucher not found" });
        }
        // Initialize PDFKit
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Journal_Voucher_${Date.now()}.pdf`);
        doc.pipe(res);
        // Title
        doc.fontSize(20).text('Journal Voucher Export', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown(2);
        // Draw Table Header
        const tableTop = doc.y;
        const colWidths = [100, 150, 70, 70, 100];
        const headers = ['Date', 'Account', 'Debit', 'Credit', 'Narration'];
        let currentX = 50;
        doc.font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, currentX, tableTop);
            currentX += colWidths[i];
        });
        doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();
        doc.font('Helvetica');
        let currentY = tableTop + 20;
        for (const v of vouchers) {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
            currentX = 50;
            const row = [
                new Date(v.date).toLocaleDateString(),
                v.accountName,
                v.debit.toString(),
                v.credit.toString(),
                v.narration || '-'
            ];
            row.forEach((text, i) => {
                doc.text(text, currentX, currentY, { width: colWidths[i] - 5, align: i === 2 || i === 3 ? 'right' : 'left' });
                currentX += colWidths[i];
            });
            currentY += 20;
        }
        doc.end();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate PDF" });
    }
};
exports.exportJournalVoucherPdf = exportJournalVoucherPdf;
const getPayments = async (req, res) => {
    try {
        const data = await prisma_1.prisma.payment.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
};
exports.getPayments = getPayments;
const createPayments = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            receiptNo: req.body.receiptNo || `RCT-${Date.now()}`
        };
        const data = await prisma_1.prisma.payment.create({ data: payload });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Payment" });
    }
};
exports.createPayments = createPayments;
//# sourceMappingURL=submodules.js.map