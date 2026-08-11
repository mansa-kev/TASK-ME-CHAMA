"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryMarketplace = exports.getAuditLogStats = exports.deletePayments = exports.createPayments = exports.getPayments = exports.exportJournalVoucherPdf = exports.exportLedgerPdf = exports.createJournalvouchers = exports.getJournalvouchers = exports.createAccountledgers = exports.getAccountledgers = exports.createArrearsrecords = exports.getArrearsrecords = exports.createCommissions = exports.getCommissions = exports.createAppraisals = exports.getAppraisals = exports.createOperationstasks = exports.getOperationstasks = exports.createAuditlogs = exports.getAuditlogs = exports.createCommunicationlogs = exports.getCommunicationlogs = exports.updateSupporttickets = exports.createSupporttickets = exports.getSupporttickets = exports.updateKycStatus = exports.createKycdocuments = exports.getKycdocuments = exports.createInventoryAllocation = exports.getInventoryAllocations = exports.assignInventoryitem = exports.updateInventoryitems = exports.createInventoryitems = exports.getInventoryitems = exports.deleteProducts = exports.updateProducts = exports.createProducts = exports.getProducts = exports.createBranches = exports.getBranches = void 0;
const prisma_1 = require("../prisma");
const sms_1 = require("../services/sms");
const email_1 = require("../services/email");
const getQueryWhere = (req) => {
    if (!req?.user) {
        if (req?.headers && req.headers["x-chama-id"]) {
            return { chamaId: req.headers["x-chama-id"] };
        }
        return {};
    }
    if (req.user?.role === "TCM_SUPER_ADMIN")
        return {};
    if (req.user?.chamaId)
        return { chamaId: req.user.chamaId };
    return {};
};
const getPostChamaId = (req) => {
    if (req?.user?.role === "TCM_SUPER_ADMIN" && req?.body?.chamaId) {
        return req.body.chamaId;
    }
    if (req?.headers && req.headers["x-chama-id"]) {
        return req.headers["x-chama-id"];
    }
    return req?.user?.chamaId;
};
const getBranches = async (req, res) => {
    try {
        const data = await prisma_1.prisma.branch.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch branches" });
    }
};
exports.getBranches = getBranches;
const createBranches = async (req, res) => {
    try {
        const data = await prisma_1.prisma.branch.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Branch" });
    }
};
exports.createBranches = createBranches;
const getProducts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.product.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
};
exports.getProducts = getProducts;
const createProducts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.product.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Product" });
    }
};
exports.createProducts = createProducts;
const updateProducts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.product.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update Product" });
    }
};
exports.updateProducts = updateProducts;
const deleteProducts = async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "Product deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Product" });
    }
};
exports.deleteProducts = deleteProducts;
const getInventoryitems = async (req, res) => {
    try {
        const data = await prisma_1.prisma.inventoryItem.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch inventoryItems" });
    }
};
exports.getInventoryitems = getInventoryitems;
const createInventoryitems = async (req, res) => {
    try {
        let chamaId = getPostChamaId(req);
        if (!chamaId) {
            const defaultChama = await prisma_1.prisma.chama.findFirst();
            chamaId = defaultChama?.id;
        }
        const payload = {
            ...req.body,
            chamaId,
            serialNumber: req.body.serialNumber || `SN-${Date.now()}`,
            condition: req.body.condition || "NEW",
            value: Number(req.body.value || 0),
            dateAcquired: req.body.dateAcquired ? new Date(req.body.dateAcquired) : new Date(),
        };
        const data = await prisma_1.prisma.inventoryItem.create({ data: payload });
        res.status(201).json(data);
    }
    catch (error) {
        console.error("Failed to create InventoryItem:", error);
        res.status(500).json({ error: "Failed to create InventoryItem" });
    }
};
exports.createInventoryitems = createInventoryitems;
const updateInventoryitems = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await prisma_1.prisma.inventoryItem.update({
            where: { id },
            data: req.body,
        });
        res.json(data);
    }
    catch (error) {
        console.error("Failed to update InventoryItem:", error);
        res.status(500).json({ error: "Failed to update InventoryItem" });
    }
};
exports.updateInventoryitems = updateInventoryitems;
const assignInventoryitem = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;
        const data = await prisma_1.prisma.inventoryItem.update({
            where: { id },
            data: {
                assignedTo: memberId,
                status: "ASSIGNED",
            },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to assign InventoryItem" });
    }
};
exports.assignInventoryitem = assignInventoryitem;
const getInventoryAllocations = async (req, res) => {
    try {
        const where = getQueryWhere(req);
        const items = await prisma_1.prisma.inventoryItem.findMany({
            where: { ...where, assignedTo: { not: null } },
            orderBy: { updatedAt: "desc" },
        });
        const userIds = items.map((i) => i.assignedTo).filter(Boolean);
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, phone: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u.name]));
        const allocations = items.map((item) => ({
            id: item.id,
            itemId: item.id,
            item: item.name,
            memberName: userMap.get(item.assignedTo) || item.assignedTo || "Assigned Member",
            assignedTo: item.assignedTo,
            quantity: 1,
            totalCost: item.value,
            date: item.dateAcquired ? new Date(item.dateAcquired).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            status: item.status === "ASSIGNED" ? "Active" : item.status === "MAINTENANCE" ? "Maintenance" : "Completed",
        }));
        res.json(allocations);
    }
    catch (error) {
        console.error("Error fetching inventory allocations:", error);
        res.status(500).json({ error: "Failed to fetch inventory allocations" });
    }
};
exports.getInventoryAllocations = getInventoryAllocations;
const createInventoryAllocation = async (req, res) => {
    try {
        const { itemId, memberId, memberName, item, totalCost } = req.body;
        let targetItem;
        if (itemId) {
            targetItem = await prisma_1.prisma.inventoryItem.update({
                where: { id: itemId },
                data: {
                    assignedTo: memberId || memberName,
                    status: "ASSIGNED",
                },
            });
        }
        else {
            let chamaId = getPostChamaId(req);
            if (!chamaId) {
                const defaultChama = await prisma_1.prisma.chama.findFirst();
                chamaId = defaultChama?.id;
            }
            targetItem = await prisma_1.prisma.inventoryItem.create({
                data: {
                    chamaId,
                    name: item || "Assigned Asset",
                    serialNumber: `SN-${Date.now()}`,
                    condition: "NEW",
                    assignedTo: memberId || memberName,
                    status: "ASSIGNED",
                    value: Number(totalCost || 0),
                    dateAcquired: new Date(),
                },
            });
        }
        res.status(201).json(targetItem);
    }
    catch (error) {
        console.error("Error creating inventory allocation:", error);
        res.status(500).json({ error: "Failed to create inventory allocation" });
    }
};
exports.createInventoryAllocation = createInventoryAllocation;
const getKycdocuments = async (req, res) => {
    try {
        const data = await prisma_1.prisma.kycDocument.findMany({
            where: getQueryWhere(req),
            include: { user: true },
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch kycDocuments" });
    }
};
exports.getKycdocuments = getKycdocuments;
const createKycdocuments = async (req, res) => {
    try {
        const data = await prisma_1.prisma.kycDocument.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
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
            data: { status },
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
        const data = await prisma_1.prisma.supportTicket.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch supportTickets" });
    }
};
exports.getSupporttickets = getSupporttickets;
const createSupporttickets = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || 'system';
        const chamaId = getPostChamaId(req) || req.user?.chamaId;
        const data = await prisma_1.prisma.supportTicket.create({
            data: { ...req.body, userId, chamaId },
        });
        res.status(201).json(data);
    }
    catch (error) {
        console.error("Failed to create SupportTicket:", error);
        res.status(500).json({ error: "Failed to create SupportTicket" });
    }
};
exports.createSupporttickets = createSupporttickets;
const updateSupporttickets = async (req, res) => {
    try {
        const data = await prisma_1.prisma.supportTicket.update({
            where: { id: req.params.id },
            data: req.body,
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
        const user = req.user;
        let where = getQueryWhere(req);
        if (user && user.role !== "TCM_SUPER_ADMIN" && user.role !== "CHAMA_ADMIN") {
            where = {
                ...where,
                recipientId: user.id,
            };
        }
        const data = await prisma_1.prisma.communicationLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        res.json(data);
    }
    catch (error) {
        console.error("Failed to fetch communicationLogs:", error);
        res.status(500).json({ error: "Failed to fetch communicationLogs" });
    }
};
exports.getCommunicationlogs = getCommunicationlogs;
const createCommunicationlogs = async (req, res) => {
    try {
        const { type, recipient, recipientId, content, message, body, subject } = req.body;
        let status = "SENT";
        try {
            if (type === "SMS") {
                await (0, sms_1.sendSms)(recipient || recipientId, content || message || body || "");
            }
            else if (type === "EMAIL") {
                await (0, email_1.sendEmail)(recipient || recipientId, subject || "Task-Me Chama Notification", content || message || body || "");
            }
        }
        catch (sendError) {
            status = "FAILED";
            console.error("Failed to send message:", sendError);
        }
        let chamaId = getPostChamaId(req);
        if (!chamaId) {
            const defaultChama = await prisma_1.prisma.chama.findFirst();
            chamaId = defaultChama?.id;
        }
        const data = await prisma_1.prisma.communicationLog.create({
            data: {
                chamaId,
                type: type || "SMS",
                recipientId: recipientId || recipient || req.user?.id || "ALL_MEMBERS",
                subject: subject || "Chama Notification",
                body: body || content || message || "",
                status,
                sentAt: new Date(),
            },
        });
        res.status(201).json(data);
    }
    catch (error) {
        console.error("Failed to create CommunicationLog:", error);
        res.status(500).json({ error: "Failed to create CommunicationLog" });
    }
};
exports.createCommunicationlogs = createCommunicationlogs;
const getAuditlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.auditLog.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch auditLogs" });
    }
};
exports.getAuditlogs = getAuditlogs;
const createAuditlogs = async (req, res) => {
    try {
        const data = await prisma_1.prisma.auditLog.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create AuditLog" });
    }
};
exports.createAuditlogs = createAuditlogs;
const getOperationstasks = async (req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch operationsTasks" });
    }
};
exports.getOperationstasks = getOperationstasks;
const createOperationstasks = async (req, res) => {
    try {
        const data = await prisma_1.prisma.operationsTask.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create OperationsTask" });
    }
};
exports.createOperationstasks = createOperationstasks;
const getAppraisals = async (req, res) => {
    try {
        const data = await prisma_1.prisma.appraisal.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch appraisals" });
    }
};
exports.getAppraisals = getAppraisals;
const createAppraisals = async (req, res) => {
    try {
        const data = await prisma_1.prisma.appraisal.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Appraisal" });
    }
};
exports.createAppraisals = createAppraisals;
const getCommissions = async (req, res) => {
    try {
        const data = await prisma_1.prisma.commission.findMany({
            where: getQueryWhere(req),
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch commissions" });
    }
};
exports.getCommissions = getCommissions;
const createCommissions = async (req, res) => {
    try {
        const data = await prisma_1.prisma.commission.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Commission" });
    }
};
exports.createCommissions = createCommissions;
const getArrearsrecords = async (req, res) => {
    try {
        const arrears = await prisma_1.prisma.arrearsRecord.findMany({
            where: getQueryWhere(req),
        });
        const loanIds = arrears.map((a) => a.loanId);
        const loans = await prisma_1.prisma.loan.findMany({
            where: { ...getQueryWhere(req), id: { in: loanIds } },
            select: { id: true, memberName: true, memberId: true },
        });
        const data = arrears.map((a) => {
            const loan = loans.find((l) => l.id === a.loanId);
            return {
                ...a,
                memberName: loan?.memberName || "Unknown",
                memberId: loan?.memberId || null,
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
        const data = await prisma_1.prisma.arrearsRecord.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create ArrearsRecord" });
    }
};
exports.createArrearsrecords = createArrearsrecords;
const getAccountledgers = async (req, res) => {
    try {
        let data = await prisma_1.prisma.accountLedger.findMany({
            where: getQueryWhere(req),
        });
        if (data.length === 0) {
            // Dummy records generation removed for production.
            data = [];
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch accountLedgers" });
    }
};
exports.getAccountledgers = getAccountledgers;
const createAccountledgers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.accountLedger.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create AccountLedger" });
    }
};
exports.createAccountledgers = createAccountledgers;
const getJournalvouchers = async (req, res) => {
    try {
        let data = await prisma_1.prisma.journalVoucher.findMany({
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        if (data.length === 0) {
            let chamaId = getPostChamaId(req);
            if (!chamaId) {
                const defaultChama = await prisma_1.prisma.chama.findFirst();
                chamaId = defaultChama?.id;
            }
            if (chamaId) {
                const initialEntries = [
                    { accountName: "Bank Current Account", debit: 50000, credit: 0, narration: "Monthly member contributions deposit", postedBy: "TREASURER" },
                    { accountName: "Members Regular Savings", debit: 0, credit: 50000, narration: "Monthly member savings credit", postedBy: "TREASURER" },
                    { accountName: "Main Treasury & Cash", debit: 15000, credit: 0, narration: "Welfare pool collections", postedBy: "SECRETARY" },
                    { accountName: "Welfare & Emergency Fund", debit: 0, credit: 15000, narration: "Welfare pool allocation", postedBy: "SECRETARY" },
                ];
                for (const entry of initialEntries) {
                    await prisma_1.prisma.journalVoucher.create({
                        data: {
                            ...entry,
                            chamaId,
                        }
                    });
                }
                data = await prisma_1.prisma.journalVoucher.findMany({
                    where: getQueryWhere(req),
                    orderBy: { createdAt: "desc" },
                });
            }
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch journalVouchers" });
    }
};
exports.getJournalvouchers = getJournalvouchers;
const createJournalvouchers = async (req, res) => {
    try {
        const data = await prisma_1.prisma.journalVoucher.create({
            data: { ...req.body, chamaId: getPostChamaId(req) },
        });
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
            where: getQueryWhere(req),
            orderBy: { createdAt: "desc" },
        });
        if (vouchers.length === 0) {
            return res
                .status(404)
                .json({ error: "No records to display for this export" });
        }
        // Initialize PDFKit
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Ledger_Export_${Date.now()}.pdf`);
        doc.pipe(res);
        // Title
        doc.fontSize(20).text("Ledger Export", { align: "center" });
        doc.moveDown();
        doc
            .fontSize(10)
            .text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
        doc.moveDown(2);
        // Draw Table Header
        const tableTop = doc.y;
        const colWidths = [100, 150, 70, 70, 100];
        const headers = ["Date", "Account", "Debit", "Credit", "Narration"];
        let currentX = 50;
        doc.font("Helvetica-Bold");
        headers.forEach((header, i) => {
            doc.text(header, currentX, tableTop);
            currentX += colWidths[i];
        });
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(540, tableTop + 15)
            .stroke();
        doc.font("Helvetica");
        let currentY = tableTop + 20;
        for (const v of vouchers) {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
            currentX = 50;
            const row = [
                v.date
                    ? new Date(v.date).toLocaleDateString()
                    : new Date().toLocaleDateString(),
                v.accountName || "-",
                v.debit ? v.debit.toString() : "0",
                v.credit ? v.credit.toString() : "0",
                v.narration || "-",
            ];
            row.forEach((text, i) => {
                doc.text(text, currentX, currentY, {
                    width: colWidths[i] - 5,
                    align: i === 2 || i === 3 ? "right" : "left",
                });
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
        if (id && id !== "all") {
            const voucher = await prisma_1.prisma.journalVoucher.findUnique({
                where: { id },
            });
            vouchers = voucher ? [voucher] : [];
        }
        else {
            vouchers = await prisma_1.prisma.journalVoucher.findMany({
                where: getQueryWhere(req),
                orderBy: { createdAt: "desc" },
            });
        }
        if (vouchers.length === 0) {
            return res.status(404).json({ error: "Journal Voucher not found" });
        }
        // Initialize PDFKit
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Journal_Voucher_${Date.now()}.pdf`);
        doc.pipe(res);
        // Title
        doc.fontSize(20).text("Journal Voucher Export", { align: "center" });
        doc.moveDown();
        doc
            .fontSize(10)
            .text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
        doc.moveDown(2);
        // Draw Table Header
        const tableTop = doc.y;
        const colWidths = [100, 150, 70, 70, 100];
        const headers = ["Date", "Account", "Debit", "Credit", "Narration"];
        let currentX = 50;
        doc.font("Helvetica-Bold");
        headers.forEach((header, i) => {
            doc.text(header, currentX, tableTop);
            currentX += colWidths[i];
        });
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(540, tableTop + 15)
            .stroke();
        doc.font("Helvetica");
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
                v.narration || "-",
            ];
            row.forEach((text, i) => {
                doc.text(text, currentX, currentY, {
                    width: colWidths[i] - 5,
                    align: i === 2 || i === 3 ? "right" : "left",
                });
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
        const data = await prisma_1.prisma.payment.findMany({
            where: getQueryWhere(req),
        });
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
            receiptNo: req.body.receiptNo || `RCT-${Date.now()}`,
        };
        const payment = await prisma_1.prisma.payment.create({ data: payload });
        // Also update system ledger (Main Treasury)
        const ledgerName = "Main Treasury";
        let accountLedger = await prisma_1.prisma.accountLedger.findFirst({
            where: { accountName: ledgerName },
        });
        if (!accountLedger) {
            accountLedger = await prisma_1.prisma.accountLedger.create({
                data: {
                    chamaId: getPostChamaId(req),
                    accountName: ledgerName,
                    accountType: "ASSET",
                    balance: 0.0,
                },
            });
        }
        const amount = parseFloat(payload.amount);
        if (payload.type === "INBOUND") {
            await prisma_1.prisma.accountLedger.update({
                where: { id: accountLedger.id },
                data: { balance: { increment: amount } },
            });
            await prisma_1.prisma.journalVoucher.create({
                data: {
                    chamaId: getPostChamaId(req),
                    accountName: ledgerName,
                    debit: amount,
                    credit: 0,
                    narration: payload.narration || "Manual Receipt Capture",
                    postedBy: "SYSTEM",
                },
            });
        }
        else if (payload.type === "OUTBOUND") {
            await prisma_1.prisma.accountLedger.update({
                where: { id: accountLedger.id },
                data: { balance: { decrement: amount } },
            });
            await prisma_1.prisma.journalVoucher.create({
                data: {
                    chamaId: getPostChamaId(req),
                    accountName: ledgerName,
                    debit: 0,
                    credit: amount,
                    narration: payload.narration || "Manual Disbursement Capture",
                    postedBy: "SYSTEM",
                },
            });
        }
        res.status(201).json(payment);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Payment" });
    }
};
exports.createPayments = createPayments;
const deletePayments = async (req, res) => {
    try {
        await prisma_1.prisma.payment.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Payment" });
    }
};
exports.deletePayments = deletePayments;
const getAuditLogStats = async (req, res) => {
    try {
        const totalLogs = await prisma_1.prisma.auditLog.count();
        const actionCounts = await prisma_1.prisma.auditLog.groupBy({
            by: ['action'],
            _count: { action: true }
        });
        res.json({ total: totalLogs, breakdown: actionCounts });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAuditLogStats = getAuditLogStats;
const getInventoryMarketplace = async (req, res) => {
    try {
        const items = await prisma_1.prisma.inventoryItem.findMany({
            where: { status: 'AVAILABLE' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInventoryMarketplace = getInventoryMarketplace;
//# sourceMappingURL=submodules.js.map