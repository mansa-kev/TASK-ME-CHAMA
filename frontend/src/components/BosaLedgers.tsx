import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Wallet, Search, Filter, Download, Plus, Clock, 
  CheckCircle, XCircle, Eye, UserPlus, PlayCircle, BarChart3, Users, PiggyBank, Trash2, MoreVertical, X
} from 'lucide-react';

// Assume these are available in '../api'
import { 
  fetchSavingsAccounts, createSavingsAccount, deleteSavingsAccount,
  fetchShareHoldings, createShareHolding, deleteShareHolding,
  fetchLoans, createLoan, approveLoan, rejectLoan, disburseLoan, addGuarantor, payRepayment, deleteLoan,
  fetchInvestments, createInvestment, deleteInvestment,
  fetchFixedDeposits, createFixedDeposit, deleteFixedDeposit
} from '../api';

const formatCurrency = (n: number) => 'KES ' + (n || 0).toLocaleString();

export function BosaLedgers() {
  const [activeTab, setActiveTab] = useState<'savings' | 'shares' | 'loans' | 'investments' | 'fixed'>('savings');
  
  // Data states
  const [savings, setSavings] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showSharesModal, setShowSharesModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showGuarantorModal, setShowGuarantorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showFixedModal, setShowFixedModal] = useState(false);
  const [showViewGuarantorsModal, setShowViewGuarantorsModal] = useState(false);

  // Selected item for context in modals
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'savings') setSavings(await fetchSavingsAccounts());
      if (activeTab === 'shares') setShares(await fetchShareHoldings());
      if (activeTab === 'loans') setLoans(await fetchLoans());
      if (activeTab === 'investments') setInvestments(await fetchInvestments());
      if (activeTab === 'fixed') setFixedDeposits(await fetchFixedDeposits());
    } catch (err: any) {
      toast.error('Failed to fetch data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Handlers ---
  const handleCreateSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSavingsAccount(formData);
      toast.success('Savings account created');
      setShowSavingsModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShareHolding(formData);
      toast.success('Share holding created');
      setShowSharesModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLoan(formData);
      toast.success('Loan application submitted');
      setShowLoanModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddGuarantor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGuarantor(selectedLoan.id, formData);
      toast.success('Guarantor added');
      setShowGuarantorModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAction = async (action: Function, id: string, successMsg: string) => {
    try {
      await action(id);
      toast.success(successMsg);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRepayment = async (repaymentId: string) => {
    try {
      await payRepayment(repaymentId);
      toast.success('Repayment recorded');
      // Update selected loan schedule locally for quick UI feedback
      setSelectedLoan({
        ...selectedLoan,
        schedule: selectedLoan.schedule.map((s: any) => s.id === repaymentId ? { ...s, status: 'PAID', paidDate: new Date().toISOString() } : s)
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvestment(formData);
      toast.success('Investment created');
      setShowInvestmentModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateFixedDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFixedDeposit(formData);
      toast.success('Fixed Deposit created');
      setShowFixedModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (deleteFn: Function, id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteFn(id);
        toast.success(`${name} deleted successfully`);
        loadData();
      } catch (e: any) {
        toast.error(`Failed to delete ${name}: ` + e.message);
      }
    }
  };

  // --- Render Helpers ---
  const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toUpperCase() || 'UNKNOWN';
    let color = 'bg-gray-100 text-gray-800';
    if (s === 'ACTIVE' || s === 'APPROVED' || s === 'PAID_OFF') color = 'bg-brand-green/10 text-brand-green';
    if (s === 'DORMANT' || s === 'PENDING_APPROVAL') color = 'bg-brand-amber/10 text-brand-amber';
    if (s === 'CLOSED' || s === 'IN_ARREARS' || s === 'REJECTED' || s === 'OVERDUE') color = 'bg-red-100 text-red-700';
    if (s === 'PENDING_GUARANTORS') color = 'bg-gray-100 text-gray-600';

    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${color}`}>{s}</span>;
  };

  const tabs = [
    { id: 'savings', label: 'Savings' },
    { id: 'shares', label: 'Shares' },
    { id: 'loans', label: 'Loans' },
    { id: 'investments', label: 'Investments' },
    { id: 'fixed', label: 'Fixed Deposits' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 pb-0 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-brand-primary tracking-tight">BOSA Core Banking</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Manage back-office savings, shares, and loan portfolios.</p>
          
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-brand-accent text-brand-primary' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: SAVINGS */}
          {activeTab === 'savings' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setShowSavingsModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-xl transition">
                  <Plus size={16} className="mr-2" /> Add Savings Account
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-4">Account Number</th>
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Balance</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {savings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No savings accounts found.</td></tr>}
                    {savings.map(acc => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-xs">{acc.accountNumber}</td>
                        <td className="p-4 font-bold text-gray-800 text-sm">{acc.memberName}</td>
                        <td className="p-4 text-sm text-gray-600">{acc.product}</td>
                        <td className="p-4 text-right font-extrabold text-brand-primary">{formatCurrency(acc.balance)}</td>
                        <td className="p-4 text-center"><StatusBadge status={acc.status} /></td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <button className="hover:text-brand-primary" title="View"><Eye size={16} /></button>
                            <button onClick={() => handleDelete(deleteSavingsAccount, acc.id, 'Savings Account')} className="hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SHARES */}
          {activeTab === 'shares' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mr-4"><PiggyBank size={24} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Share Capital</p>
                    <p className="text-xl font-extrabold text-gray-800">
                      {formatCurrency(shares.reduce((acc, s) => acc + (s.units * s.valuePerUnit), 0))}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mr-4"><Users size={24} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Holders</p>
                    <p className="text-xl font-extrabold text-gray-800">{new Set(shares.map(s => s.memberId)).size}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mr-4"><BarChart3 size={24} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Average Holding</p>
                    <p className="text-xl font-extrabold text-gray-800">
                      {shares.length ? formatCurrency(shares.reduce((acc, s) => acc + (s.units * s.valuePerUnit), 0) / shares.length) : 'KES 0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setShowSharesModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-xl transition">
                  <Plus size={16} className="mr-2" /> Buy Shares
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-4">Member Name</th>
                      <th className="p-4">Share Type</th>
                      <th className="p-4 text-right">Units</th>
                      <th className="p-4 text-right">Value Per Unit</th>
                      <th className="p-4 text-right">Total Value</th>
                      <th className="p-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {shares.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No shares found.</td></tr>}
                    {shares.map(share => (
                      <tr key={share.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 text-sm">{share.memberName}</td>
                        <td className="p-4 text-sm text-gray-600">{share.shareType}</td>
                        <td className="p-4 text-right text-sm">{share.units}</td>
                        <td className="p-4 text-right text-sm">{formatCurrency(share.valuePerUnit)}</td>
                        <td className="p-4 text-right font-extrabold text-brand-primary">{formatCurrency(share.units * share.valuePerUnit)}</td>
                        <td className="p-4 text-right text-sm text-gray-500">{share.date ? format(new Date(share.date), 'dd MMM yyyy') : '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <button onClick={() => handleDelete(deleteShareHolding, share.id, 'Share Holding')} className="hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOANS */}
          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {['PENDING_GUARANTORS', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'PAID_OFF', 'IN_ARREARS'].map(status => (
                  <div key={status} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">{status.replace('_', ' ')}</p>
                    <p className="text-2xl font-extrabold text-brand-primary mt-1">
                      {loans.filter(l => l.status === status).length}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Loan Portfolio</h3>
                <button onClick={() => setShowLoanModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-xl transition">
                  <Plus size={16} className="mr-2" /> New Loan Application
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-4">Member</th>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Principal</th>
                      <th className="p-4 text-right">Balance</th>
                      <th className="p-4">Terms</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loans.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No loans found.</td></tr>}
                    {loans.map(loan => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 text-sm">{loan.memberName}</td>
                        <td className="p-4 text-sm text-gray-600">{loan.product}</td>
                        <td className="p-4 text-right text-sm">{formatCurrency(loan.principal)}</td>
                        <td className="p-4 text-right font-extrabold text-brand-primary">{formatCurrency(loan.balance)}</td>
                        <td className="p-4 text-xs text-gray-500">{loan.rate}% • {loan.duration} mos</td>
                        <td className="p-4 text-center"><StatusBadge status={loan.status} /></td>
                        <td className="p-4 text-right space-x-2">
                          {loan.status === 'PENDING_GUARANTORS' && (
                            <>
                              <button onClick={() => { setSelectedLoan(loan); setShowViewGuarantorsModal(true); }} className="text-brand-accent hover:underline text-xs font-bold flex items-center justify-end w-full mb-1"><Users size={14} className="mr-1"/> Track Guarantors</button>
                              <button onClick={() => { setSelectedLoan(loan); setShowGuarantorModal(true); }} className="text-brand-primary hover:underline text-xs font-bold flex items-center justify-end w-full"><UserPlus size={14} className="mr-1"/> Force Add Guarantor</button>
                            </>
                          )}
                          {loan.status === 'PENDING_APPROVAL' && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleAction(approveLoan, loan.id, 'Loan approved')} className="text-brand-green hover:underline text-xs font-bold flex items-center"><CheckCircle size={14} className="mr-1"/> Approve</button>
                              <button onClick={() => handleAction(rejectLoan, loan.id, 'Loan rejected')} className="text-red-500 hover:underline text-xs font-bold flex items-center"><XCircle size={14} className="mr-1"/> Reject</button>
                            </div>
                          )}
                          {loan.status === 'APPROVED' && (
                            <button onClick={() => handleAction(disburseLoan, loan.id, 'Loan disbursed successfully')} className="text-brand-accent hover:underline text-xs font-bold flex items-center justify-end w-full"><PlayCircle size={14} className="mr-1"/> Disburse</button>
                          )}
                          {(loan.status === 'ACTIVE' || loan.status === 'IN_ARREARS' || loan.status === 'PAID_OFF') && (
                            <button onClick={() => { setSelectedLoan(loan); setShowScheduleModal(true); }} className="text-brand-primary hover:underline text-xs font-bold flex items-center justify-end w-full"><Eye size={14} className="mr-1"/> View Schedule</button>
                          )}
                          <div className="w-full flex justify-end mt-2">
                            <button onClick={() => handleDelete(deleteLoan, loan.id, 'Loan')} className="text-red-400 hover:text-red-600" title="Delete Loan"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVESTMENTS */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Portfolio</p>
                  <p className="text-xl font-extrabold text-gray-800">{formatCurrency(investments.reduce((acc, i) => acc + i.principal, 0))}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Average Yield</p>
                  <p className="text-xl font-extrabold text-gray-800">
                    {investments.length ? (investments.reduce((acc, i) => acc + i.rate, 0) / investments.length).toFixed(2) : 0}%
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Active Investments</p>
                  <p className="text-xl font-extrabold text-gray-800">{investments.filter(i => i.status === 'ACTIVE').length}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setShowInvestmentModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-xl transition">
                  <Plus size={16} className="mr-2" /> Add Investment
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-4">Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 text-right">Principal</th>
                      <th className="p-4 text-right">Rate</th>
                      <th className="p-4 text-right">Maturity Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {investments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No investments found.</td></tr>}
                    {investments.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 text-sm">{inv.name}</td>
                        <td className="p-4 text-sm text-gray-600">{inv.type}</td>
                        <td className="p-4 text-right font-extrabold text-brand-primary">{formatCurrency(inv.principal)}</td>
                        <td className="p-4 text-right text-sm">{inv.rate}%</td>
                        <td className="p-4 text-right text-sm text-gray-500">{inv.maturityDate ? format(new Date(inv.maturityDate), 'dd MMM yyyy') : '-'}</td>
                        <td className="p-4 text-center"><StatusBadge status={inv.status} /></td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <button onClick={() => handleDelete(deleteInvestment, inv.id, 'Investment')} className="hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FIXED DEPOSITS */}
          {activeTab === 'fixed' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setShowFixedModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-xl transition">
                  <Plus size={16} className="mr-2" /> Add Fixed Deposit
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-4">Member Name</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-right">Rate</th>
                      <th className="p-4 text-right">Duration</th>
                      <th className="p-4 text-right">Start Date</th>
                      <th className="p-4 text-right">Maturity Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fixedDeposits.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">No fixed deposits found.</td></tr>}
                    {fixedDeposits.map(fd => (
                      <tr key={fd.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 text-sm">{fd.memberName}</td>
                        <td className="p-4 text-right font-extrabold text-brand-primary">{formatCurrency(fd.amount)}</td>
                        <td className="p-4 text-right text-sm">{fd.rate}%</td>
                        <td className="p-4 text-right text-sm">{fd.duration} mos</td>
                        <td className="p-4 text-right text-sm text-gray-500">{fd.startDate ? format(new Date(fd.startDate), 'dd MMM yyyy') : '-'}</td>
                        <td className="p-4 text-right text-sm text-gray-500">{fd.maturityDate ? format(new Date(fd.maturityDate), 'dd MMM yyyy') : '-'}</td>
                        <td className="p-4 text-center"><StatusBadge status={fd.status} /></td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 text-gray-400">
                            <button onClick={() => handleDelete(deleteFixedDeposit, fd.id, 'Fixed Deposit')} className="hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- MODALS --- */}
      
      {/* Savings Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-extrabold text-lg mb-4">Add Savings Account</h3>
            <form onSubmit={handleCreateSavings} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Member ID</label><input required name="memberId" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Member Name</label><input required name="memberName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Product</label>
                <select required name="product" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1">
                  <option value="">Select Product...</option>
                  <option value="BOSA Savings">BOSA Savings</option>
                  <option value="Junior Saver">Junior Saver</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Initial Deposit (KES)</label><input type="number" required name="initialDeposit" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowSavingsModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shares Modal */}
      {showSharesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-extrabold text-lg mb-4">Buy Shares</h3>
            <form onSubmit={handleCreateShare} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Member ID</label><input required name="memberId" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Member Name</label><input required name="memberName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Share Type</label>
                <select required name="shareType" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1">
                  <option value="">Select Type...</option>
                  <option value="ORDINARY">Ordinary</option>
                  <option value="PREFERENCE">Preference</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Units</label><input type="number" required name="units" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div className="flex-1"><label className="text-xs font-bold text-gray-500">Value Per Unit</label><input type="number" required name="valuePerUnit" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowSharesModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Application Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="font-extrabold text-lg mb-4">New Loan Application</h3>
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Member ID</label><input required name="memberId" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div><label className="text-xs font-bold text-gray-500">Member Name</label><input required name="memberName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Product</label>
                <select required name="productName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1">
                  <option value="">Select Product...</option>
                  <option value="Development Loan">Development Loan</option>
                  <option value="Emergency Loan">Emergency Loan</option>
                  <option value="Asset Finance">Asset Finance</option>
                  <option value="School Fees">School Fees</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Principal Amount</label><input type="number" required name="principal" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div><label className="text-xs font-bold text-gray-500">Interest Rate (%)</label><input type="number" step="0.1" required name="interestRate" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div><label className="text-xs font-bold text-gray-500">Duration (months)</label><input type="number" required name="duration" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Interest Method</label>
                <select required name="interestMethod" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1">
                  <option value="">Select Method...</option>
                  <option value="REDUCING_BALANCE">Reducing Balance</option>
                  <option value="STRAIGHT_LINE">Straight Line</option>
                  <option value="AMORTIZED">Amortized</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowLoanModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guarantor Modal */}
      {showGuarantorModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-extrabold text-lg mb-1">Add Guarantor</h3>
            <p className="text-xs text-gray-500 mb-4">For loan: {selectedLoan.memberName} ({formatCurrency(selectedLoan.principal)})</p>
            <form onSubmit={handleAddGuarantor} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Guarantor ID</label><input required name="guarantorId" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Guarantor Name</label><input required name="guarantorName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Amount Guaranteed (KES)</label><input type="number" required name="amountGuaranteed" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowGuarantorModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Schedule Modal */}
      {showScheduleModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-lg">Repayment Schedule</h3>
                <p className="text-xs text-gray-500">{selectedLoan.memberName} - {selectedLoan.product}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 text-gray-400 hover:text-gray-800"><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Principal</th>
                    <th className="p-3 text-right">Interest</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Paid Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!selectedLoan.schedule || selectedLoan.schedule.length === 0) && (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-400">Schedule not generated yet.</td></tr>
                  )}
                  {selectedLoan.schedule?.map((row: any) => (
                    <tr key={row.id} className={`${row.status === 'OVERDUE' ? 'bg-red-50' : row.status === 'PAID' ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                      <td className="p-3 text-gray-600">{row.dueDate ? format(new Date(row.dueDate), 'dd MMM yyyy') : '-'}</td>
                      <td className="p-3 text-right font-bold text-gray-800">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.principal)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.interest)}</td>
                      <td className="p-3 text-center"><StatusBadge status={row.status} /></td>
                      <td className="p-3 text-right text-gray-500 text-xs">{row.paidDate ? format(new Date(row.paidDate), 'dd MMM yyyy') : '-'}</td>
                      <td className="p-3 text-right">
                        {(row.status === 'PENDING' || row.status === 'OVERDUE') && (
                          <button onClick={() => handleRepayment(row.id)} className="text-[10px] font-bold bg-brand-primary text-white px-3 py-1 rounded hover:bg-brand-primary-dark">
                            Record Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View Guarantors Modal (Admin Tracking) */}
      {showViewGuarantorsModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-lg">Guarantor Requests Tracking</h3>
                <p className="text-xs text-gray-500">Loan Applicant: {selectedLoan.memberName} | Request: {formatCurrency(selectedLoan.principal)}</p>
              </div>
              <button onClick={() => setShowViewGuarantorsModal(false)} className="p-2 text-gray-400 hover:text-gray-800"><X size={20} /></button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-3">Guarantor Name</th>
                    <th className="p-3 text-right">Amount Pledged</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!selectedLoan.guarantors || selectedLoan.guarantors.length === 0) && (
                    <tr><td colSpan={3} className="p-6 text-center text-gray-400">No guarantors added yet.</td></tr>
                  )}
                  {selectedLoan.guarantors?.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-800">{g.guarantorName}</td>
                      <td className="p-3 text-right">{formatCurrency(g.amountGuaranteed)}</td>
                      <td className="p-3 text-center"><StatusBadge status={g.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-extrabold text-lg mb-4">Add Investment</h3>
            <form onSubmit={handleCreateInvestment} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Name / Description</label><input required name="name" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Type</label>
                <select required name="type" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1">
                  <option value="">Select Type...</option>
                  <option value="TBILL">Treasury Bill</option>
                  <option value="BOND">Government Bond</option>
                  <option value="FIXED_INCOME">Fixed Income</option>
                  <option value="PROPERTY">Property</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Principal (KES)</label><input type="number" required name="principal" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div><label className="text-xs font-bold text-gray-500">Rate (%)</label><input type="number" step="0.1" required name="rate" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Maturity Date</label><input type="date" required name="maturityDate" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowInvestmentModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Deposit Modal */}
      {showFixedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-extrabold text-lg mb-4">Add Fixed Deposit</h3>
            <form onSubmit={handleCreateFixedDeposit} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500">Member ID</label><input required name="memberId" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Member Name</label><input required name="memberName" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500">Amount (KES)</label><input type="number" required name="amount" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
                <div><label className="text-xs font-bold text-gray-500">Rate (%)</label><input type="number" step="0.1" required name="rate" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-500">Duration (months)</label><input type="number" required name="duration" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500">Start Date</label><input type="date" required name="startDate" onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm mt-1" /></div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowFixedModal(false)} className="flex-1 border rounded-xl py-2 font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white rounded-xl py-2 font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
