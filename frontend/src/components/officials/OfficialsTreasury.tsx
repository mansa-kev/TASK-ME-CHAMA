import { usePrompt } from '../common/PromptProvider';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  RefreshCcw, 
  Search, 
  MoreVertical, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Clock,
  XCircle,
  FileCheck,
  Lock,
  UserCheck,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  fetchOfficialsTreasuryAccounts, 
  fetchOfficialsExpenses, 
  fetchOfficialsInvestments, 
  linkTreasuryAccount, 
  reconcileTreasuryAccount, 
  createOfficialsExpense,
  fetchMultiSigDisbursements,
  signMultiSigDisbursement,
  executeMultiSigDisbursement
} from '../../api';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';

const INVESTMENT_COLORS = ['#0f3d3e', '#ff5000', '#10b981', '#f59e0b', '#3b82f6'];

export function OfficialsTreasury() {
  const showPrompt = usePrompt();

  const [activeTab, setActiveTab] = useState<'balances' | 'multisig' | 'expenses' | 'investments'>('balances');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'OPERATIONAL',
    amount: '',
    description: '',
    payeeName: '',
    payeeAccount: ''
  });

  const [showSignModal, setShowSignModal] = useState<string | null>(null);
  const [signForm, setSignForm] = useState({ decision: 'APPROVED' as 'APPROVED' | 'REJECTED', notes: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, exps, invs, multi] = await Promise.all([
        fetchOfficialsTreasuryAccounts().catch(() => []),
        fetchOfficialsExpenses().catch(() => []),
        fetchOfficialsInvestments().catch(() => []),
        fetchMultiSigDisbursements().catch(() => [])
      ]);
      if (Array.isArray(accs)) setAccounts(accs);
      if (Array.isArray(exps)) setExpenses(exps);
      if (Array.isArray(invs)) setInvestments(invs);
      if (Array.isArray(multi)) setDisbursements(multi);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount))) {
      toast.error('Please provide a valid expense amount');
      return;
    }
    try {
      await createOfficialsExpense({
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        payeeName: expenseForm.payeeName,
        payeeAccount: expenseForm.payeeAccount
      });
      toast.success('Expense recorded and routed to Multi-Sig authorization');
      setShowExpenseModal(false);
      setExpenseForm({ category: 'OPERATIONAL', amount: '', description: '', payeeName: '', payeeAccount: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record expense');
    }
  };

  const handleSignDisbursement = async (id: string) => {
    try {
      await signMultiSigDisbursement(id, signForm);
      toast.success(`Disbursement signature recorded (${signForm.decision})`);
      setShowSignModal(null);
      setSignForm({ decision: 'APPROVED', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign disbursement');
    }
  };

  const handleExecuteDisbursement = async (id: string) => {
    if (!confirm('Are you sure you want to execute this approved payout? Group funds will be debited immediately.')) return;
    try {
      await executeMultiSigDisbursement(id);
      toast.success('Payout executed successfully! Treasury ledger updated.');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute disbursement');
    }
  };

  const tabs = [
    { id: 'balances', label: 'Accounts & Balances', icon: Building2 },
    { 
      id: 'multisig', 
      label: `Payout Approvals (${disbursements.filter(d => d.status === 'PENDING').length})`, 
      icon: ShieldCheck 
    },
    { id: 'expenses', label: 'Expenses & Records', icon: CreditCard },
    { id: 'investments', label: 'Group Investments', icon: Briefcase },
  ] as const;

  const renderBalancesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Treasury Accounts & Cash Vaults</h3>
            <button 
              onClick={async () => {
                const bank = await showPrompt('Enter Bank / Account Name (e.g. KCB Chama Vault):');
                const initial = await showPrompt('Enter Initial Balance (KES):', '0');
                if (bank) {
                  linkTreasuryAccount({ accountName: bank, initialBalance: initial || 0 })
                    .then(() => {
                      toast.success(`Account ${bank} added successfully`);
                      loadData();
                    })
                    .catch(() => toast.error('Failed to add account'));
                }
              }} 
              className="text-sm font-semibold text-brand-primary flex items-center gap-1 hover:underline"
            >
              <Plus className="h-4 w-4" /> Add Account
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm relative group hover:border-brand-primary/40 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-base">{account.accountName}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{account.accountType || 'Asset Account'}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Reconciled Balance</p>
                    <p className="text-xl font-black text-gray-900">KES {(account.balance || 0).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      const actual = await showPrompt(`Reconcile ${account.accountName}.\nEnter actual verified bank statement balance:`, account.balance);
                      if (actual && !isNaN(Number(actual))) {
                        reconcileTreasuryAccount(account.id)
                          .then(() => {
                            toast.success('Account reconciled with verified statement balance');
                            loadData();
                          })
                          .catch(() => toast.error('Failed to reconcile account'));
                      }
                    }} 
                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-teal-50 rounded-xl transition-colors" 
                    title="Reconcile with Statement"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-teal-800/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-teal-400 uppercase bg-teal-950/60 border border-teal-700/50 px-3 py-1 rounded-full">
                Consolidated Treasury
              </span>
              <ShieldCheck className="h-5 w-5 text-teal-400" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Available Chama Reserves</p>
            <div className="text-3xl font-black text-white tracking-tight">
              KES {accounts.reduce((sum, a) => sum + (a.balance || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-teal-800/40 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-teal-300">Pending Approvals</p>
              <p className="font-bold text-amber-400">KES {disbursements.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-teal-300">Total Investments</p>
              <p className="font-bold text-emerald-400">KES {investments.reduce((sum, i) => sum + (i.currentValue || i.principalAmount || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMultiSigTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-primary" />
            <h3 className="text-lg font-black text-gray-900">Multi-Sig Authorization Matrix</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Zero-Trust dual-custody governance. All disbursements require authenticated digital sign-offs before treasury execution.
          </p>
        </div>
        <button 
          onClick={() => setShowExpenseModal(true)}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> New Authorization Request
        </button>
      </div>

      {disbursements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
          <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-700">No Pending Disbursements</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            All group loans, vendor payments, and welfare claims have been reconciled or authorized.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {disbursements.map((d) => {
            const isFullyApproved = d.status === 'APPROVED';
            const isExecuted = d.status === 'EXECUTED';
            const isPending = d.status === 'PENDING';
            const signatories = (d.signatories as any[]) || [];

            return (
              <div 
                key={d.id} 
                className={`bg-white p-6 rounded-2xl border transition-all ${
                  isPending ? 'border-amber-200 shadow-sm' : isFullyApproved ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isPending ? 'bg-amber-100 text-amber-800' :
                        isFullyApproved ? 'bg-emerald-100 text-emerald-800' :
                        isExecuted ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {d.status}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {d.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mt-1">{d.description}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Payee: <strong className="text-gray-800">{d.payeeName}</strong> ({d.payeeAccount}) • Ref: #{d.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Disbursement Amount</p>
                      <p className="text-2xl font-black text-gray-900">KES {d.amount.toLocaleString()}</p>
                    </div>
                    {isPending && (
                      <button 
                        onClick={() => setShowSignModal(d.id)}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Lock className="h-4 w-4" /> Sign / Authorize
                      </button>
                    )}
                    {isFullyApproved && (
                      <button 
                        onClick={() => handleExecuteDisbursement(d.id)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all animate-pulse"
                      >
                        <Send className="h-4 w-4" /> Execute Direct Payout
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 w-full sm:max-w-md">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                      <span>Signatures Gathered</span>
                      <span>{d.currentSignatures} of {d.requiredSignatures} Required</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          d.currentSignatures >= d.requiredSignatures ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (d.currentSignatures / d.requiredSignatures) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {signatories.map((sig, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl text-xs">
                        <UserCheck className="h-3.5 w-3.5 text-brand-primary" />
                        <span className="font-bold text-gray-800">{sig.officialName}</span>
                        <span className="text-emerald-700 font-bold text-[10px]">({sig.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Signature Authorization Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-primary" /> Multi-Sig Authorization Sign-Off
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Your official role cryptographic signature will be affixed to this treasury transaction.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSignForm({ ...signForm, decision: 'APPROVED' })}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      signForm.decision === 'APPROVED' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve Payout
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSignForm({ ...signForm, decision: 'REJECTED' })}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                      signForm.decision === 'REJECTED' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Reject Request
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Official Notes / Verification Remarks</label>
                <textarea 
                  value={signForm.notes} 
                  onChange={e => setSignForm({ ...signForm, notes: e.target.value })}
                  placeholder="e.g. Verified quotation and invoice against Chama bylaws."
                  rows={3}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowSignModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSignDisbursement(showSignModal)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/95 shadow-sm"
                >
                  Confirm & Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-primary" /> Record Expense & Request Authorization
            </h3>
            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                <select 
                  value={expenseForm.category} 
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                >
                  <option value="OPERATIONAL">Operational / Admin</option>
                  <option value="AGM_MEETING">AGM & Meeting Catering</option>
                  <option value="LEGAL_AUDIT">Legal & Professional Audit</option>
                  <option value="BANK_CHARGES">Bank Charges & Taxes</option>
                  <option value="COMMUNITY_PROJECT">Community / CSR Project</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Amount (KES)</label>
                <input 
                  type="number" 
                  required
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Payee Name</label>
                <input 
                  type="text" 
                  required
                  value={expenseForm.payeeName} 
                  onChange={e => setExpenseForm({ ...expenseForm, payeeName: e.target.value })}
                  placeholder="Vendor Name / Official"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Payee Account (M-Pesa / Bank)</label>
                <input 
                  type="text" 
                  required
                  value={expenseForm.payeeAccount} 
                  onChange={e => setExpenseForm({ ...expenseForm, payeeAccount: e.target.value })}
                  placeholder="0712345678 or Bank Acc"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description / Purpose</label>
                <textarea 
                  required
                  value={expenseForm.description} 
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Detailed purpose of expenditure..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/95 shadow-sm"
                >
                  Submit for Multi-Sig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200/80 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">This Month's Settled Expenses</p>
            <p className="text-lg font-black text-gray-900">
              KES {expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200/80 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Pending Multi-Sig Authorization</p>
            <p className="text-lg font-black text-amber-600">
              {expenses.filter(e => e.status === 'PENDING').length} requests
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowExpenseModal(true)}
          className="bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-sm flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Record New Expense
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">Audited Expense Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category & Purpose</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {new Date(expense.createdAt || expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-sm">{expense.category}</p>
                    <p className="text-xs text-gray-500">{expense.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-black text-gray-900 text-sm">
                    KES {(expense.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      expense.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvestmentsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm">Active Capital Deployments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Principal</th>
                  <th className="px-6 py-4 text-right">Current Valuation</th>
                  <th className="px-6 py-4 text-center">Expected ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{inv.name}</p>
                      <p className="text-xs text-gray-500">{inv.type}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      KES {(inv.principalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-gray-900 text-sm">
                      KES {(inv.currentValue || inv.principalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-emerald-700 font-black text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                        +{inv.expectedReturnRate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-4">Investment Allocation</h3>
            <div className="space-y-3">
              {investments.map((inv, idx) => (
                <div key={inv.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: INVESTMENT_COLORS[idx % INVESTMENT_COLORS.length] }}></div>
                    <span className="text-gray-700 font-medium">{inv.name}</span>
                  </div>
                  <span className="font-black text-gray-900">
                    KES {(inv.currentValue || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Bank & M-Pesa Accounts</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage group bank accounts, track balances, and approve official money payouts.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-white border border-gray-200/80 p-1.5 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all duration-150 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'balances' && renderBalancesTab()}
        {activeTab === 'multisig' && renderMultiSigTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'investments' && renderInvestmentsTab()}
      </div>
    </div>
  );
}
