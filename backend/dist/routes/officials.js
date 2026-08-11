"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const officialsController = __importStar(require("../controllers/officials"));
const router = (0, express_1.Router)();
// Officials routes require CHAMA_ADMIN or TCM_SUPER_ADMIN role
router.use(authMiddleware_1.authMiddleware);
router.use((0, authMiddleware_1.requireRole)(['CHAMA_ADMIN', 'TCM_SUPER_ADMIN']));
// Dashboard
router.get('/dashboard/stats', officialsController.getDashboardStats);
// Members
router.get('/members', officialsController.getMembers);
router.post('/members', officialsController.addMember);
router.put('/members/:id', officialsController.updateMember);
router.delete('/members/:id', officialsController.removeMember);
router.put('/members/approve/:id', officialsController.approveMember);
router.put('/members/reject/:id', officialsController.rejectMember);
router.post('/members/:id/reset-ledger', officialsController.resetMemberLedger);
router.get('/discipline', officialsController.getDiscipline);
router.post('/discipline', officialsController.createDiscipline);
// Contributions (Savings & Shares)
router.get('/contributions', officialsController.getContributions);
router.post('/contributions', officialsController.addContribution);
// Loans
router.get('/loans', officialsController.getLoans);
router.post('/loans/approve/:id', officialsController.approveLoan);
router.put('/loans/reject/:id', officialsController.rejectLoan);
router.post('/loans/disburse/:id', officialsController.disburseLoan);
router.post('/loans/repayment', officialsController.recordLoanRepayment);
// Treasury
router.get('/treasury/accounts', officialsController.getTreasuryAccounts);
router.post('/treasury/transfer', officialsController.transferFunds);
// Treasury & Financials
router.get('/treasury/summary', officialsController.getTreasurySummary);
router.get('/treasury/expenses', officialsController.getExpenses);
router.get('/treasury/investments', officialsController.getInvestments);
router.post('/treasury/contribution', officialsController.addContribution);
router.get('/contributions/arrears', officialsController.getArrears);
router.get('/welfare', officialsController.getWelfare);
// Meetings
router.get('/meetings', officialsController.getMeetings);
router.post('/meetings', officialsController.createMeeting);
router.put('/meetings/:id', officialsController.updateMeeting);
router.post('/meetings/:id/attendance', officialsController.recordAttendance);
// Reports
router.get('/reports/financial', officialsController.getFinancialReport);
router.get('/reports/financials', officialsController.getFinancialReport);
// Settings
router.get('/settings', officialsController.getSettings);
router.put('/settings', officialsController.updateSettings);
// Communication
router.post('/communication/notice', officialsController.postNotice);
router.delete('/communication/notice/:id', officialsController.removeNotice);
router.get('/communication/notices', officialsController.getNotices);
router.get('/communication/broadcasts', officialsController.getBroadcasts);
// --- NEW OFFICIALS ROUTES ---
router.get('/dashboard/recent-activity', officialsController.getRecentActivity);
router.post('/treasury/accounts', officialsController.addTreasuryAccount);
router.put('/treasury/accounts/:id/reconcile', officialsController.reconcileTreasuryAccount);
router.post('/treasury/expenses', officialsController.createExpense);
router.post('/meetings/:id/remind', officialsController.remindMeeting);
router.get('/meetings/minutes', officialsController.getMinutes);
router.get('/meetings/minutes/:id/download', officialsController.downloadMinute);
router.get('/meetings/polls', officialsController.getPolls);
router.post('/meetings/polls', officialsController.createPoll);
router.get('/meetings/polls/:id', officialsController.getPollDetails);
router.post('/reports/dividends/recalculate', officialsController.recalculateDividends);
router.post('/reports/dividends/approve', officialsController.approveDividends);
router.post('/settings/roles', officialsController.addRole);
router.put('/settings/roles/:roleId', officialsController.updateRole);
router.delete('/settings/roles/:roleId', officialsController.deleteRole);
router.post('/settings/bank/sync/:type', officialsController.syncBank);
router.put('/settings/bank/:type', officialsController.updateBankIntegration);
router.post('/loans/:loanId/payment', officialsController.recordLoanPaymentParam);
router.post('/loans/guarantors/notice', officialsController.notifyGuarantors);
router.get('/loans/report', officialsController.getLoanReport);
router.post('/arrears/:arrearId/remind', officialsController.remindArrear);
router.post('/arrears/:arrearId/fine', officialsController.fineArrear);
router.post('/welfare/deposit', officialsController.depositWelfare);
router.post('/welfare/claims/:claimId/process', officialsController.processWelfareClaim);
router.get('/treasury/multisig', officialsController.getMultiSigDisbursements);
router.post('/treasury/multisig/:id/sign', officialsController.signMultiSigDisbursement);
router.post('/treasury/multisig/:id/execute', officialsController.executeMultiSigDisbursement);
router.get('/welfare/merry-go-round/schedule', officialsController.getMerryGoRoundSchedule);
router.post('/welfare/merry-go-round/cycles', officialsController.createMerryGoRoundCycle);
router.post('/welfare/merry-go-round/shuffle', officialsController.shuffleMerryGoRoundSlots);
router.post('/welfare/merry-go-round/payout', officialsController.payoutMerryGoRound);
// Vetting & Screening
router.get('/vetting/applications', officialsController.getVettingApplications);
router.post('/vetting/applications/:id/decision', officialsController.submitVettingDecision);
// Statement Reconciliation
router.get('/reconciliation/overview', officialsController.getReconciliationData);
router.post('/reconciliation/auto-match', officialsController.autoMatchReconciliation);
exports.default = router;
//# sourceMappingURL=officials.js.map