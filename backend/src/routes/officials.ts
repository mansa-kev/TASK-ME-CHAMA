import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import * as officialsController from '../controllers/officials';

const router = Router();

// Officials routes require CHAMA_ADMIN or TCM_SUPER_ADMIN role
router.use(authMiddleware);
router.use(requireRole(['CHAMA_ADMIN', 'TCM_SUPER_ADMIN']));

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

export default router;
