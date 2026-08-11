const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('token');

export const setAuthData = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || (response.status === 404 && endpoint.includes('/members/me'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API Request Failed');
  }

  const data = await response.json();
  
  // Safely unwrap paginated responses to prevent "e.map is not a function" in frontend components
  if (data && typeof data === 'object' && 'data' in data && 'pagination' in data && Array.isArray(data.data)) {
    return data.data;
  }
  
  return data;
};

export const fetchMembers = () => apiFetch('/members');
export const createMember = (data: any) => apiFetch('/members', { method: 'POST', body: JSON.stringify(data) });
export const updateMemberKycAdmin = (id: string, data: any) => apiFetch(`/members/${id}/kyc`, { method: 'PUT', body: JSON.stringify(data) });
export const resetMemberPassword = (id: string) => apiFetch(`/members/${id}/reset-password`, { method: 'POST' });
export const fetchLedgers = () => apiFetch('/ledgers');
export const fetchStats = () => apiFetch('/stats');
export const fetchChamas = () => apiFetch('/chamas');
export const createChama = (data: any) => apiFetch('/chamas', { method: 'POST', body: JSON.stringify(data) });
export const updateChama = (id: string, data: any) => apiFetch(`/chamas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const rotateMerryGoRound = (id: string) => apiFetch(`/chamas/${id}/merry-go-round`, { method: 'POST' });
export const fetchAnalytics = () => apiFetch('/analytics');
export const login = (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const changePassword = (data: any) => apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });

export const fetchBranches = () => apiFetch('/branches');
export const createBranch = (data: any) => apiFetch('/branches', { method: 'POST', body: JSON.stringify(data) });

export const fetchProducts = () => apiFetch('/products');
export const createProduct = (data: any) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string, data: any) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' });

export const fetchInventoryItems = () => apiFetch('/inventoryItems');
export const createInventoryItem = (data: any) => apiFetch('/inventoryItems', { method: 'POST', body: JSON.stringify(data) });
export const updateInventoryItem = (id: string, data: any) => apiFetch(`/inventoryItems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const assignInventoryItem = (id: string, memberId: string) => apiFetch(`/inventoryItems/${id}/assign`, { method: 'PUT', body: JSON.stringify({ memberId }) });
export const fetchInventoryAllocations = () => apiFetch('/inventoryItems/allocations');
export const createInventoryAllocation = (data: any) => apiFetch('/inventoryItems/allocations', { method: 'POST', body: JSON.stringify(data) });

export const fetchPayments = () => apiFetch('/payments');
export const createPayment = (data: any) => apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) });
export const deletePayment = (id: string) => apiFetch(`/payments/${id}`, { method: 'DELETE' });

export const fetchKycDocuments = () => apiFetch('/kycDocuments');
export const createKycDocument = (data: any) => apiFetch('/kycDocuments', { method: 'POST', body: JSON.stringify(data) });
export const updateKycStatus = (id: string, status: string) => apiFetch(`/kycDocuments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const postTransaction = (data: any) => apiFetch('/ledgers/transaction', { method: 'POST', body: JSON.stringify(data) });
export const postBatchTransaction = (data: { transactions: any[] }) => apiFetch('/ledgers/transaction/batch', { method: 'POST', body: JSON.stringify(data) });

export const fetchSupportTickets = () => apiFetch('/supportTickets');
export const createSupportTicket = (data: any) => apiFetch('/supportTickets', { method: 'POST', body: JSON.stringify(data) });
export const updateSupportTicket = (id: string, data: any) => apiFetch(`/supportTickets/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchCommunicationLogs = () => apiFetch('/communicationLogs');
export const createCommunicationLog = (data: any) => apiFetch('/communicationLogs', { method: 'POST', body: JSON.stringify(data) });

export const fetchAuditLogs = () => apiFetch('/auditLogs');
export const createAuditLog = (data: any) => apiFetch('/auditLogs', { method: 'POST', body: JSON.stringify(data) });


export const updateOperationsTask = (id: string, data: any) => apiFetch(`/operationsTasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchAppraisals = () => apiFetch('/appraisals');
export const createAppraisal = (data: any) => apiFetch('/appraisals', { method: 'POST', body: JSON.stringify(data) });

export const fetchCommissions = () => apiFetch('/commissions');
export const createCommission = (data: any) => apiFetch('/commissions', { method: 'POST', body: JSON.stringify(data) });

export const fetchArrearsRecords = () => apiFetch('/arrearsRecords');
export const createArrearsRecord = (data: any) => apiFetch('/arrearsRecords', { method: 'POST', body: JSON.stringify(data) });

export const fetchAccountLedgers = () => apiFetch('/accountLedgers');
export const createAccountLedger = (data: any) => apiFetch('/accountLedgers', { method: 'POST', body: JSON.stringify(data) });

export const fetchJournalVouchers = () => apiFetch('/journalVouchers');
export const createJournalVoucher = (data: any) => apiFetch('/journalVouchers', { method: 'POST', body: JSON.stringify(data) });

export const exportLedgerPdf = () => apiFetch('/accountLedgers/export/pdf');

// ─── LOANS ─────────────────────────────────────────────────
export const fetchLoans = () => apiFetch('/loans');
export const fetchLoan = (id: string) => apiFetch(`/loans/${id}`);
export const createLoan = (data: any) => apiFetch('/loans', { method: 'POST', body: JSON.stringify(data) });
export const deleteLoan = (id: string) => apiFetch(`/loans/${id}`, { method: 'DELETE' });
export const approveLoan = (id: string) => apiFetch(`/loans/${id}/approve`, { method: 'PUT' });
export const rejectLoan = (id: string) => apiFetch(`/loans/${id}/reject`, { method: 'PUT' });
export const disburseLoan = (id: string) => apiFetch(`/loans/${id}/disburse`, { method: 'PUT' });
export const addGuarantor = (loanId: string, data: any) => apiFetch(`/loans/${loanId}/guarantors`, { method: 'POST', body: JSON.stringify(data) });
export const acceptGuarantor = (gid: string) => apiFetch(`/loans/guarantors/${gid}/accept`, { method: 'PUT' });
export const rejectGuarantor = (gid: string) => apiFetch(`/loans/guarantors/${gid}/reject`, { method: 'PUT' });
export const payRepayment = (rid: string) => apiFetch(`/loans/repayments/${rid}/pay`, { method: 'PUT' });

// ─── BOSA SUB-MODULES ──────────────────────────────────────
export const fetchSavingsAccounts = () => apiFetch('/loans/savings-accounts');
export const createSavingsAccount = (data: any) => apiFetch('/loans/savings-accounts', { method: 'POST', body: JSON.stringify(data) });
export const deleteSavingsAccount = (id: string) => apiFetch(`/loans/savings-accounts/${id}`, { method: 'DELETE' });
export const fetchShareHoldings = () => apiFetch('/loans/share-holdings');
export const createShareHolding = (data: any) => apiFetch('/loans/share-holdings', { method: 'POST', body: JSON.stringify(data) });
export const deleteShareHolding = (id: string) => apiFetch(`/loans/share-holdings/${id}`, { method: 'DELETE' });
export const fetchInvestments = () => apiFetch('/loans/investments');
export const createInvestment = (data: any) => apiFetch('/loans/investments', { method: 'POST', body: JSON.stringify(data) });
export const deleteInvestment = (id: string) => apiFetch(`/loans/investments/${id}`, { method: 'DELETE' });
export const fetchFixedDeposits = () => apiFetch('/loans/fixed-deposits');
export const createFixedDeposit = (data: any) => apiFetch('/loans/fixed-deposits', { method: 'POST', body: JSON.stringify(data) });
export const deleteFixedDeposit = (id: string) => apiFetch(`/loans/fixed-deposits/${id}`, { method: 'DELETE' });
export const fetchWithdrawalRequests = () => apiFetch('/loans/withdrawal-requests');
export const createWithdrawalRequest = (data: any) => apiFetch('/loans/withdrawal-requests', { method: 'POST', body: JSON.stringify(data) });
export const approveWithdrawal = (id: string) => apiFetch(`/loans/withdrawal-requests/${id}/approve`, { method: 'PUT' });
export const rejectWithdrawal = (id: string) => apiFetch(`/loans/withdrawal-requests/${id}/reject`, { method: 'PUT' });

// ─── SETTINGS DATA ─────────────────────────────────────────
export const fetchPayrollRecords = () => apiFetch('/settings-data/payroll');

export const fetchMessageTemplates = () => apiFetch('/settings-data/message-templates');
export const createMessageTemplate = (data: any) => apiFetch('/settings-data/message-templates', { method: 'POST', body: JSON.stringify(data) });
export const updateMessageTemplate = (id: string, data: any) => apiFetch(`/settings-data/message-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMessageTemplate = (id: string) => apiFetch(`/settings-data/message-templates/${id}`, { method: 'DELETE' });
export const fetchRoles = () => apiFetch('/settings-data/roles');
export const createRole = (data: any) => apiFetch('/settings-data/roles', { method: 'POST', body: JSON.stringify(data) });
export const updateRole = (id: string, data: any) => apiFetch(`/settings-data/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRole = (id: string) => apiFetch(`/settings-data/roles/${id}`, { method: 'DELETE' });
export const fetchMemberTypes = () => apiFetch('/settings-data/member-types');
export const createMemberType = (data: any) => apiFetch('/settings-data/member-types', { method: 'POST', body: JSON.stringify(data) });
export const updateMemberType = (id: string, data: any) => apiFetch(`/settings-data/member-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMemberType = (id: string) => apiFetch(`/settings-data/member-types/${id}`, { method: 'DELETE' });
export const fetchSystemConstants = () => apiFetch('/settings-data/system-constants');
export const createSystemConstant = (data: any) => apiFetch('/settings-data/system-constants', { method: 'POST', body: JSON.stringify(data) });
export const updateSystemConstant = (id: string, data: any) => apiFetch(`/settings-data/system-constants/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSystemConstant = (id: string) => apiFetch(`/settings-data/system-constants/${id}`, { method: 'DELETE' });

// ─── OPERATIONS & PAYROLL ──────────────────────────────────
export const fetchOperationsTasks = () => apiFetch('/operations/tasks');
export const createOperationsTask = (data: any) => apiFetch('/operations/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateOperationsTaskStatus = (id: string, status: string) => apiFetch(`/operations/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteOperationsTask = (id: string) => apiFetch(`/operations/tasks/${id}`, { method: 'DELETE' });

export const fetchPayroll = () => apiFetch('/operations/payroll');
export const createPayrollRecord = (data: any) => apiFetch('/operations/payroll', { method: 'POST', body: JSON.stringify(data) });
export const deletePayrollRecord = (id: string) => apiFetch(`/operations/payroll/${id}`, { method: 'DELETE' });

export const fetchStaffPerformance = () => apiFetch('/reports/staff-performance');
export const fetchMemberStatement = (id: string) => apiFetch(`/reports/member-statement/${id}`);
export const fetchUsers = () => apiFetch('/settings-data/users');
export const updateUserRole = (id: string, role: string) => apiFetch(`/settings-data/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
export const toggleUserLock = (id: string) => apiFetch(`/settings-data/users/${id}/lock`, { method: 'PUT' });
export const resetUserPassword = (id: string) => apiFetch(`/settings-data/users/${id}/reset-password`, { method: 'POST' });
export const updateUserProfile = (id: string, data: any) => apiFetch(`/settings-data/users/${id}/profile`, { method: 'PUT', body: JSON.stringify(data) });
export const quickSearch = (q: string) => apiFetch(`/settings-data/search?q=${encodeURIComponent(q)}`);

export const uploadFile = async (file: File) => { 
  const formData = new FormData(); 
  formData.append('file', file); 
  const token = localStorage.getItem('token');
  return fetch('/api/upload', { 
    method: 'POST', 
    body: formData,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  }).then(res => res.json()); 
};

// ─── OFFICIALS PORTAL ──────────────────────────────────────
export const fetchOfficialsStats = (period?: string) => apiFetch(`/officials/dashboard/stats${period ? `?period=${period}` : ''}`);
export const fetchOfficialsRecentActivity = () => apiFetch('/officials/dashboard/recent-activity');

export const fetchOfficialsMembers = () => apiFetch('/officials/members');
export const addOfficialsMember = (data: any) => apiFetch('/officials/members', { method: 'POST', body: JSON.stringify(data) });
export const updateOfficialsMember = (id: string, data: any) => apiFetch(`/officials/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchOfficialsContributions = () => apiFetch('/officials/contributions');
export const addOfficialsContribution = (data: any) => apiFetch('/officials/contributions', { method: 'POST', body: JSON.stringify(data) });
export const fetchOfficialsArrears = () => apiFetch('/officials/contributions/arrears');
export const fetchOfficialsWelfare = () => apiFetch('/officials/welfare');
export const recordOfficialsContribution = (data: any) => apiFetch('/officials/contributions', { method: 'POST', body: JSON.stringify(data) });

export const fetchOfficialsLoans = () => apiFetch('/officials/loans');
export const approveOfficialsLoan = (id: string) => apiFetch(`/officials/loans/approve/${id}`, { method: 'POST' });
export const disburseOfficialsLoan = (id: string) => apiFetch(`/officials/loans/disburse/${id}`, { method: 'POST' });

export const fetchOfficialsTreasuryAccounts = () => apiFetch('/officials/treasury/accounts');
export const linkTreasuryAccount = (data: any) => apiFetch('/officials/treasury/accounts', { method: 'POST', body: JSON.stringify(data) });
export const reconcileTreasuryAccount = (id: string) => apiFetch(`/officials/treasury/accounts/${id}/reconcile`, { method: 'PUT' });
export const fetchOfficialsExpenses = () => apiFetch('/officials/treasury/expenses');
export const createOfficialsExpense = (data: any) => apiFetch('/officials/treasury/expenses', { method: 'POST', body: JSON.stringify(data) });
export const fetchOfficialsInvestments = () => apiFetch('/officials/treasury/investments');
export const transferOfficialsTreasury = (data: any) => apiFetch('/officials/treasury/transfer', { method: 'POST', body: JSON.stringify(data) });

export const fetchOfficialsMeetings = () => apiFetch('/officials/meetings');
export const createOfficialsMeeting = (data: any) => apiFetch('/officials/meetings', { method: 'POST', body: JSON.stringify(data) });
export const sendMeetingReminder = (id: string) => apiFetch(`/officials/meetings/${id}/remind`, { method: 'POST' });
export const fetchOfficialsMinutes = () => apiFetch('/officials/meetings/minutes');
export const downloadOfficialsMinute = (id: string) => apiFetch(`/officials/meetings/minutes/${id}/download`);
export const fetchOfficialsPolls = () => apiFetch('/officials/meetings/polls');
export const createOfficialsPoll = (data: any) => apiFetch('/officials/meetings/polls', { method: 'POST', body: JSON.stringify(data) });
export const fetchPollDetails = (id: string) => apiFetch(`/officials/meetings/polls/${id}`);

export const fetchOfficialsFinancialReport = () => apiFetch('/officials/reports/financial');
export const recalculateDividends = () => apiFetch('/officials/reports/dividends/recalculate', { method: 'POST' });
export const approveDividends = () => apiFetch('/officials/reports/dividends/approve', { method: 'POST' });

export const fetchOfficialsSettings = () => apiFetch('/officials/settings');
export const updateOfficialsSettings = (data: any) => apiFetch('/officials/settings', { method: 'PUT', body: JSON.stringify(data) });
export const assignOfficialsRole = (data: any) => apiFetch('/officials/settings/roles', { method: 'POST', body: JSON.stringify(data) });
export const editOfficialsRole = (roleId: string, data: any) => apiFetch(`/officials/settings/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(data) });
export const revokeOfficialsRole = (roleId: string) => apiFetch(`/officials/settings/roles/${roleId}`, { method: 'DELETE' });
export const syncOfficialsBank = (type: string) => apiFetch(`/officials/settings/bank/sync/${type}`, { method: 'POST' });
export const updateOfficialsBankIntegration = (type: string, data: any) => apiFetch(`/officials/settings/bank/${type}`, { method: 'PUT', body: JSON.stringify(data) });

export const approveOfficialsMember = (id: string) => apiFetch(`/officials/members/approve/${id}`, { method: 'PUT' });
export const rejectOfficialsMember = (id: string) => apiFetch(`/officials/members/reject/${id}`, { method: 'PUT' });
export const fetchOfficialsDiscipline = () => apiFetch('/officials/discipline');
export const addOfficialsDiscipline = (data: any) => apiFetch('/officials/discipline', { method: 'POST', body: JSON.stringify(data) });

export const rejectOfficialsLoan = (id: string) => apiFetch(`/officials/loans/reject/${id}`, { method: 'PUT' });
export const recordOfficialsLoanPayment = (loanId: string, amount: number) => apiFetch(`/officials/loans/${loanId}/payment`, { method: 'POST', body: JSON.stringify({ amount }) });
export const sendOfficialsGuarantorNotice = (data: any) => apiFetch('/officials/loans/guarantors/notice', { method: 'POST', body: JSON.stringify(data) });
export const fetchOfficialsLoanReport = () => apiFetch('/officials/loans/report');
export const sendOfficialsArrearsReminder = (arrearId: string) => apiFetch(`/officials/arrears/${arrearId}/remind`, { method: 'POST' });
export const applyOfficialsArrearsFine = (arrearId: string) => apiFetch(`/officials/arrears/${arrearId}/fine`, { method: 'POST' });

export const recordOfficialsWelfareDeposit = (data: any) => apiFetch('/officials/welfare/deposit', { method: 'POST', body: JSON.stringify(data) });
export const processOfficialsWelfareClaim = (claimId: string) => apiFetch(`/officials/welfare/claims/${claimId}/process`, { method: 'POST' });
export const fetchOfficialsMerryGoRoundSchedule = () => apiFetch('/officials/welfare/merry-go-round/schedule');
export const recordOfficialsMerryGoRoundPayout = (data: any) => apiFetch('/officials/welfare/merry-go-round/payout', { method: 'POST', body: JSON.stringify(data) });
export const postOfficialsNotice = (data: any) => apiFetch('/officials/communication/notice', { method: 'POST', body: JSON.stringify(data) });
export const removeOfficialsNotice = (id: string) => apiFetch(`/officials/communication/notice/${id}`, { method: 'DELETE' });
export const fetchOfficialsNotices = () => apiFetch('/officials/communication/notices');
export const fetchOfficialsBroadcasts = () => apiFetch('/officials/communication/broadcasts');

// --- NEW API ENDPOINTS FOR AUDIT AND FIXES ---
export const fetchAuditStats = () => apiFetch('/auditLogs/stats');

export const fetchMarketplaceItems = () => apiFetch('/inventory/marketplace');

export const getMemberShares = (memberId: string) => apiFetch(`/members/${memberId}/shares`);
export const getMemberAuditLogs = (memberId: string) => apiFetch(`/members/${memberId}/audit`);
export const postMemberDeposit = (memberId: string, data: any) => apiFetch(`/members/${memberId}/deposit`, { method: 'POST', body: JSON.stringify(data) });
export const disburseMemberLoan = (memberId: string, data: any) => apiFetch(`/members/${memberId}/disburse`, { method: 'POST', body: JSON.stringify(data) });
export const applyMemberPenalty = (memberId: string, data: any) => apiFetch(`/members/${memberId}/penalty`, { method: 'POST', body: JSON.stringify(data) });

export const getChamaDetails = (chamaId: string) => apiFetch(`/chamas/${chamaId}`);
export const getChamaMembers = (chamaId: string) => apiFetch(`/chamas/${chamaId}/members`);
export const getChamaTableBankingLoans = (chamaId: string) => apiFetch(`/chamas/${chamaId}/table-banking`);
export const postChamaDeposit = (chamaId: string, data: any) => apiFetch(`/chamas/${chamaId}/deposit`, { method: 'POST', body: JSON.stringify(data) });
export const applyChamaPenalty = (chamaId: string, data: any) => apiFetch(`/chamas/${chamaId}/penalty`, { method: 'POST', body: JSON.stringify(data) });

// ─── SAAS & MULTI-TENANT SAAS ENGINE ───────────────────────
export const fetchPublicPlans = () => apiFetch('/saas/plans/public');
export const registerChamaSelfServe = (data: any) => apiFetch('/saas/register-chama', { method: 'POST', body: JSON.stringify(data) });
export const fetchTenantSubscription = () => apiFetch('/saas/subscription/current');
export const fetchSaasPlansAdmin = () => apiFetch('/saas/plans');
export const upsertSaasPlanAdmin = (data: any) => apiFetch('/saas/plans', { method: 'POST', body: JSON.stringify(data) });
export const fetchTenantsAdmin = () => apiFetch('/saas/tenants');
export const updateTenantStatusAdmin = (id: string, data: any) => apiFetch(`/saas/tenants/${id}/status`, { method: 'PUT', body: JSON.stringify(data) });
export const fetchPlatformAnalyticsAdmin = (period?: string) => apiFetch(`/saas/analytics${period ? `?period=${period}` : ''}`);
export const fetchSaaSPlatformAnalytics = fetchPlatformAnalyticsAdmin;
export const fetchSaaSTenants = fetchTenantsAdmin;
export const fetchSystemAuditLogsAdmin = (params?: { chamaId?: string; action?: string; limit?: number }) => {
  const query = new URLSearchParams(params as any).toString();
  return apiFetch(`/saas/audit-logs${query ? `?${query}` : ''}`);
};

// ─── GROUP BYLAWS ENGINE ───────────────────────────────────
export const fetchChamaBylaws = () => apiFetch('/bylaws');
export const updateChamaBylaws = (data: any) => apiFetch('/bylaws', { method: 'PUT', body: JSON.stringify(data) });

// ─── MULTI-SIG & ROSCA ENGINES ────────────────────────────
export const fetchMultiSigDisbursements = () => apiFetch('/officials/treasury/multisig');
export const signMultiSigDisbursement = (id: string, data: { decision: 'APPROVED' | 'REJECTED'; notes?: string }) => apiFetch(`/officials/treasury/multisig/${id}/sign`, { method: 'POST', body: JSON.stringify(data) });
export const executeMultiSigDisbursement = (id: string) => apiFetch(`/officials/treasury/multisig/${id}/execute`, { method: 'POST' });
export const createMerryGoRoundCycle = (data: any) => apiFetch('/officials/welfare/merry-go-round/cycles', { method: 'POST', body: JSON.stringify(data) });
export const shuffleMerryGoRoundSlots = (cycleId: string) => apiFetch('/officials/welfare/merry-go-round/shuffle', { method: 'POST', body: JSON.stringify({ cycleId }) });

// ─── MEMBER SCREENING & VETTING API ────────────────────────
export const fetchVettingApplications = () => apiFetch('/officials/vetting/applications');
export const submitVettingDecision = (id: string, data: { decision: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW'; notes?: string; assignedTier?: string }) => 
  apiFetch(`/officials/vetting/applications/${id}/decision`, { method: 'POST', body: JSON.stringify(data) });

// ─── STATEMENT RECONCILIATION API ──────────────────────────
export const fetchReconciliationOverview = () => apiFetch('/officials/reconciliation/overview');
export const triggerAutoMatchReconciliation = () => apiFetch('/officials/reconciliation/auto-match', { method: 'POST' });

