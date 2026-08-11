import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendSms } from "../services/sms";
import { sendEmail } from "../services/email";

const getQueryWhere = (req: any) => {
  if (!req?.user) {
    if (req?.headers && req.headers["x-chama-id"]) {
      return { chamaId: req.headers["x-chama-id"] };
    }
    return {};
  }
  if (req.user?.role === "TCM_SUPER_ADMIN") return {};
  if (req.user?.chamaId) return { chamaId: req.user.chamaId };
  return {};
};

const getPostChamaId = (req: any) => {
  if (req?.user?.role === "TCM_SUPER_ADMIN" && req?.body?.chamaId) {
    return req.body.chamaId;
  }
  if (req?.headers && req.headers["x-chama-id"]) {
    return req.headers["x-chama-id"];
  }
  return req?.user?.chamaId;
};
export const getBranches = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).branch.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};
export const createBranches = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).branch.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Branch" });
  }
};
export const getProducts = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).product.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
export const createProducts = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).product.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Product" });
  }
};

export const updateProducts = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Product" });
  }
};

export const deleteProducts = async (req: Request, res: Response) => {
  try {
    await (prisma as any).product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Product" });
  }
};

export const getInventoryitems = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).inventoryItem.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventoryItems" });
  }
};
export const createInventoryitems = async (req: Request, res: Response) => {
  try {
    let chamaId = getPostChamaId(req as any);
    if (!chamaId) {
      const defaultChama = await prisma.chama.findFirst();
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
    const data = await (prisma as any).inventoryItem.create({ data: payload });
    res.status(201).json(data);
  } catch (error) {
    console.error("Failed to create InventoryItem:", error);
    res.status(500).json({ error: "Failed to create InventoryItem" });
  }
};

export const updateInventoryitems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await (prisma as any).inventoryItem.update({
      where: { id },
      data: req.body,
    });
    res.json(data);
  } catch (error) {
    console.error("Failed to update InventoryItem:", error);
    res.status(500).json({ error: "Failed to update InventoryItem" });
  }
};

export const assignInventoryitem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const data = await (prisma as any).inventoryItem.update({
      where: { id },
      data: {
        assignedTo: memberId,
        status: "ASSIGNED",
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign InventoryItem" });
  }
};

export const getInventoryAllocations = async (req: Request, res: Response) => {
  try {
    const where = getQueryWhere(req as any);
    const items = await (prisma as any).inventoryItem.findMany({
      where: { ...where, assignedTo: { not: null } },
      orderBy: { updatedAt: "desc" },
    });

    const userIds = items.map((i: any) => i.assignedTo).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, phone: true },
    });
    const userMap = new Map(users.map((u: any) => [u.id, u.name]));

    const allocations = items.map((item: any) => ({
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
  } catch (error) {
    console.error("Error fetching inventory allocations:", error);
    res.status(500).json({ error: "Failed to fetch inventory allocations" });
  }
};

export const createInventoryAllocation = async (req: Request, res: Response) => {
  try {
    const { itemId, memberId, memberName, item, totalCost } = req.body;
    let targetItem;
    if (itemId) {
      targetItem = await (prisma as any).inventoryItem.update({
        where: { id: itemId },
        data: {
          assignedTo: memberId || memberName,
          status: "ASSIGNED",
        },
      });
    } else {
      let chamaId = getPostChamaId(req as any);
      if (!chamaId) {
        const defaultChama = await prisma.chama.findFirst();
        chamaId = defaultChama?.id;
      }
      targetItem = await (prisma as any).inventoryItem.create({
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
  } catch (error) {
    console.error("Error creating inventory allocation:", error);
    res.status(500).json({ error: "Failed to create inventory allocation" });
  }
};

export const getKycdocuments = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).kycDocument.findMany({
      where: getQueryWhere(req as any),
      include: { user: true },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch kycDocuments" });
  }
};
export const createKycdocuments = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).kycDocument.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create kycDocument" });
  }
};

export const updateKycStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const data = await (prisma as any).kycDocument.update({
      where: { id },
      data: { status },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update KYC status" });
  }
};

export const getSupporttickets = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).supportTicket.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supportTickets" });
  }
};
export const createSupporttickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId || 'system';
    const chamaId = getPostChamaId(req as any) || (req as any).user?.chamaId;
    const data = await (prisma as any).supportTicket.create({
      data: { ...req.body, userId, chamaId },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Failed to create SupportTicket:", error);
    res.status(500).json({ error: "Failed to create SupportTicket" });
  }
};

export const updateSupporttickets = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).supportTicket.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update SupportTicket" });
  }
};
export const getCommunicationlogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let where: any = getQueryWhere(req as any);
    if (user && user.role !== "TCM_SUPER_ADMIN" && user.role !== "CHAMA_ADMIN") {
      where = {
        ...where,
        recipientId: user.id,
      };
    }
    const data = await (prisma as any).communicationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch communicationLogs:", error);
    res.status(500).json({ error: "Failed to fetch communicationLogs" });
  }
};
export const createCommunicationlogs = async (req: Request, res: Response) => {
  try {
    const { type, recipient, recipientId, content, message, body, subject } = req.body;
    let status = "SENT";

    try {
      if (type === "SMS") {
        await sendSms(recipient || recipientId, content || message || body || "");
      } else if (type === "EMAIL") {
        await sendEmail(recipient || recipientId, subject || "Task-Me Chama Notification", content || message || body || "");
      }
    } catch (sendError) {
      status = "FAILED";
      console.error("Failed to send message:", sendError);
    }

    let chamaId = getPostChamaId(req as any);
    if (!chamaId) {
      const defaultChama = await prisma.chama.findFirst();
      chamaId = defaultChama?.id;
    }

    const data = await (prisma as any).communicationLog.create({
      data: {
        chamaId,
        type: type || "SMS",
        recipientId: recipientId || recipient || (req as any).user?.id || "ALL_MEMBERS",
        subject: subject || "Chama Notification",
        body: body || content || message || "",
        status,
        sentAt: new Date(),
      },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Failed to create CommunicationLog:", error);
    res.status(500).json({ error: "Failed to create CommunicationLog" });
  }
};
export const getAuditlogs = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).auditLog.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auditLogs" });
  }
};
export const createAuditlogs = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).auditLog.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create AuditLog" });
  }
};
export const getOperationstasks = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).operationsTask.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch operationsTasks" });
  }
};
export const createOperationstasks = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).operationsTask.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create OperationsTask" });
  }
};
export const getAppraisals = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).appraisal.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appraisals" });
  }
};
export const createAppraisals = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).appraisal.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Appraisal" });
  }
};
export const getCommissions = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).commission.findMany({
      where: getQueryWhere(req as any),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commissions" });
  }
};
export const createCommissions = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).commission.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Commission" });
  }
};
export const getArrearsrecords = async (req: Request, res: Response) => {
  try {
    const arrears = await (prisma as any).arrearsRecord.findMany({
      where: getQueryWhere(req as any),
    });
    const loanIds = arrears.map((a: any) => a.loanId);

    const loans = await (prisma as any).loan.findMany({
      where: { ...getQueryWhere(req as any), id: { in: loanIds } },
      select: { id: true, memberName: true, memberId: true },
    });

    const data = arrears.map((a: any) => {
      const loan = loans.find((l: any) => l.id === a.loanId);
      return {
        ...a,
        memberName: loan?.memberName || "Unknown",
        memberId: loan?.memberId || null,
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch arrearsRecords" });
  }
};
export const createArrearsrecords = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).arrearsRecord.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create ArrearsRecord" });
  }
};
export const getAccountledgers = async (req: Request, res: Response) => {
  try {
    let chamaId = getPostChamaId(req as any);
    if (!chamaId) {
      const defaultChama = await prisma.chama.findFirst();
      chamaId = defaultChama?.id;
    }
    const where = getQueryWhere(req as any);
    let data = await (prisma as any).accountLedger.findMany({
      where: where,
      orderBy: { accountCode: 'asc' }
    });

    if (data.length === 0 && chamaId) {
      const standardAccounts = [
        { accountName: "1110 - Bank Current Account", accountType: "ASSET", balance: 0.0 },
        { accountName: "1120 - M-Pesa Paybill Account", accountType: "ASSET", balance: 0.0 },
        { accountName: "1130 - Petty Cash", accountType: "ASSET", balance: 0.0 },
        { accountName: "1210 - Member Loans Receivable", accountType: "ASSET", balance: 0.0 },
        { accountName: "1220 - Arrears & Fines Receivable", accountType: "ASSET", balance: 0.0 },
        { accountName: "2110 - Member Regular Savings", accountType: "LIABILITY", balance: 0.0 },
        { accountName: "2120 - Member Welfare Fund", accountType: "LIABILITY", balance: 0.0 },
        { accountName: "3110 - Share Capital", accountType: "EQUITY", balance: 0.0 },
        { accountName: "3120 - Retained Earnings", accountType: "EQUITY", balance: 0.0 },
        { accountName: "4110 - Interest Income from Loans", accountType: "REVENUE", balance: 0.0 },
        { accountName: "4210 - Late Fees & Fines Income", accountType: "REVENUE", balance: 0.0 },
        { accountName: "4310 - Registration Fees", accountType: "REVENUE", balance: 0.0 },
        { accountName: "5110 - Bank & Transaction Charges", accountType: "EXPENSE", balance: 0.0 },
        { accountName: "5210 - Operational Expenses", accountType: "EXPENSE", balance: 0.0 },
        { accountName: "5310 - Welfare Payouts", accountType: "EXPENSE", balance: 0.0 }
      ];

      for (const acc of standardAccounts) {
        await (prisma as any).accountLedger.create({
          data: { ...acc, chamaId }
        });
      }

      data = await (prisma as any).accountLedger.findMany({
        where: where,
        orderBy: { accountCode: 'asc' }
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accountLedgers" });
  }
};
export const createAccountledgers = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).accountLedger.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create AccountLedger" });
  }
};
export const getJournalvouchers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = getQueryWhere(req as any);

    let [data, total] = await Promise.all([
      (prisma as any).journalVoucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      (prisma as any).journalVoucher.count({ where })
    ]);

    // No longer generating mock data
    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch journalVouchers" });
  }
};
export const createJournalvouchers = async (req: Request, res: Response) => {
  try {
    const data = await (prisma as any).journalVoucher.create({
      data: { ...req.body, chamaId: getPostChamaId(req as any) },
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create JournalVoucher" });
  }
};

import PDFDocument from "pdfkit";

export const exportLedgerPdf = async (req: Request, res: Response) => {
  try {
    const vouchers = await (prisma as any).journalVoucher.findMany({
      where: getQueryWhere(req as any),
      orderBy: { createdAt: "desc" },
    });

    if (vouchers.length === 0) {
      return res
        .status(404)
        .json({ error: "No records to display for this export" });
    }

    // Initialize PDFKit
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Ledger_Export_${Date.now()}.pdf`,
    );

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
  } catch (error) {
    res.status(500).json({ error: "Failed to export ledger" });
  }
};

export const exportJournalVoucherPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // If ID is provided, export single, else export all

    let vouchers;
    if (id && id !== "all") {
      const voucher = await (prisma as any).journalVoucher.findUnique({
        where: { id },
      });
      vouchers = voucher ? [voucher] : [];
    } else {
      vouchers = await (prisma as any).journalVoucher.findMany({
        where: getQueryWhere(req as any),
        orderBy: { createdAt: "desc" },
      });
    }

    if (vouchers.length === 0) {
      return res.status(404).json({ error: "Journal Voucher not found" });
    }

    // Initialize PDFKit
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Journal_Voucher_${Date.now()}.pdf`,
    );

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
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where = getQueryWhere(req as any);
    const [data, total] = await Promise.all([
      (prisma as any).payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      (prisma as any).payment.count({ where })
    ]);

    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};
export const createPayments = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      receiptNo: req.body.receiptNo || `RCT-${Date.now()}`,
    };
    const payment = await (prisma as any).payment.create({ data: payload });

    // Also update system ledger (Main Treasury)
    const ledgerName = "Main Treasury";
    let accountLedger = await (prisma as any).accountLedger.findFirst({
      where: { accountName: ledgerName },
    });
    if (!accountLedger) {
      accountLedger = await (prisma as any).accountLedger.create({
        data: {
          chamaId: getPostChamaId(req as any),
          accountName: ledgerName,
          accountType: "ASSET",
          balance: 0.0,
        },
      });
    }

    const amount = parseFloat(payload.amount);
    if (payload.type === "INBOUND") {
      await (prisma as any).accountLedger.update({
        where: { id: accountLedger.id },
        data: { balance: { increment: amount } },
      });
      await (prisma as any).journalVoucher.create({
        data: {
          chamaId: getPostChamaId(req as any),
          accountName: ledgerName,
          debit: amount,
          credit: 0,
          narration: payload.narration || "Manual Receipt Capture",
          postedBy: "SYSTEM",
        },
      });
    } else if (payload.type === "OUTBOUND") {
      await (prisma as any).accountLedger.update({
        where: { id: accountLedger.id },
        data: { balance: { decrement: amount } },
      });
      await (prisma as any).journalVoucher.create({
        data: {
          chamaId: getPostChamaId(req as any),
          accountName: ledgerName,
          debit: 0,
          credit: amount,
          narration: payload.narration || "Manual Disbursement Capture",
          postedBy: "SYSTEM",
        },
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Payment" });
  }
};

export const deletePayments = async (req: Request, res: Response) => {
  try {
    await (prisma as any).payment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Payment" });
  }
};

export const getAuditLogStats = async (req: Request, res: Response) => {
  try {
    const totalLogs = await prisma.auditLog.count();
    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: { action: true }
    });
    res.json({ total: totalLogs, breakdown: actionCounts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventoryMarketplace = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { status: 'AVAILABLE' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
