import { Router } from "express";
import { 
  exportLedgerPdf, 
  exportJournalVoucherPdf, 
  getBranches, 
  createBranches, 
  getProducts, 
  createProducts, 
  updateProducts, 
  deleteProducts, 
  getInventoryitems, 
  createInventoryitems, 
  updateInventoryitems,
  assignInventoryitem, 
  getInventoryAllocations,
  createInventoryAllocation,
  getKycdocuments, 
  createKycdocuments, 
  updateKycStatus, 
  getSupporttickets, 
  createSupporttickets, 
  updateSupporttickets, 
  getCommunicationlogs, 
  createCommunicationlogs, 
  getAuditlogs, 
  getAuditLogStats, 
  getInventoryMarketplace, 
  createAuditlogs, 
  getOperationstasks, 
  createOperationstasks, 
  getAppraisals, 
  createAppraisals, 
  getCommissions, 
  createCommissions, 
  getArrearsrecords, 
  createArrearsrecords, 
  getAccountledgers, 
  createAccountledgers, 
  getJournalvouchers, 
  createJournalvouchers, 
  getPayments, 
  createPayments, 
  deletePayments 
} from "../controllers/submodules";

const router = Router();

router.get("/accountLedgers/export/pdf", exportLedgerPdf);
router.get("/branches", getBranches);
router.post("/branches", createBranches);
router.get("/products", getProducts);
router.post("/products", createProducts);
router.put("/products/:id", updateProducts);
router.delete("/products/:id", deleteProducts);
router.get("/inventoryItems/allocations", getInventoryAllocations);
router.post("/inventoryItems/allocations", createInventoryAllocation);
router.get("/inventoryItems", getInventoryitems);
router.post("/inventoryItems", createInventoryitems);
router.put("/inventoryItems/:id", updateInventoryitems);
router.put("/inventoryItems/:id/assign", assignInventoryitem);
router.get("/inventory/marketplace", getInventoryMarketplace);
router.get("/payments", getPayments);
router.post("/payments", createPayments);
router.delete("/payments/:id", deletePayments);
router.get("/kycDocuments", getKycdocuments);
router.post("/kycDocuments", createKycdocuments);
router.put("/kycDocuments/:id/status", updateKycStatus);
router.get("/supportTickets", getSupporttickets);
router.post("/supportTickets", createSupporttickets);
router.put("/supportTickets/:id", updateSupporttickets);
router.get("/communicationLogs", getCommunicationlogs);
router.post("/communicationLogs", createCommunicationlogs);
router.get("/auditLogs/stats", getAuditLogStats);
router.get("/auditLogs", getAuditlogs);
router.post("/auditLogs", createAuditlogs);
router.get("/operationsTasks", getOperationstasks);
router.post("/operationsTasks", createOperationstasks);
router.get("/appraisals", getAppraisals);
router.post("/appraisals", createAppraisals);
router.get("/commissions", getCommissions);
router.post("/commissions", createCommissions);
router.get("/arrearsRecords", getArrearsrecords);
router.post("/arrearsRecords", createArrearsrecords);
router.get("/accountLedgers", getAccountledgers);
router.post("/accountLedgers", createAccountledgers);
router.get("/journalVouchers", getJournalvouchers);
router.post("/journalVouchers", createJournalvouchers);
router.get("/journalVouchers/export/pdf", exportJournalVoucherPdf);
router.get("/journalVouchers/:id/export/pdf", exportJournalVoucherPdf);

export default router;
