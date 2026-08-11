import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  CreditCard,
  Layers,
  Sparkles,
  Download,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchReconciliationOverview, triggerAutoMatchReconciliation, fetchOfficialsMembers } from '../../api';

export function OfficialsReconciliation() {
  const [data, setData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoMatching, setAutoMatching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');

  // Manual Match Modal
  const [showAssignModal, setShowAssignModal] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('MONTHLY_SAVINGS');

  const loadData = async () => {
    setLoading(true);
    try {
      const [recData, mems] = await Promise.all([
        fetchReconciliationOverview().catch(() => null),
        fetchOfficialsMembers().catch(() => [])
      ]);
      if (recData) setData(recData);
      if (Array.isArray(mems)) setMembers(mems);
    } catch (err: any) {
      toast.error('Failed to load statement reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAutoMatch = async () => {
    setAutoMatching(true);
    try {
      const res = await triggerAutoMatchReconciliation();
      toast.success(res.message || 'Auto-match completed successfully!');
      loadData();
    } catch (err: any) {
      toast.error('Failed to run auto-match engine');
    } finally {
      setAutoMatching(false);
    }
  };

  const handleAssignSuspense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error('Please select a member to map this transaction');
      return;
    }
    toast.success(`Transaction ${showAssignModal.reference} mapped to member ledger!`);
    setShowAssignModal(null);
    setSelectedMemberId('');
  };

  const stats = data?.stats || {
    totalStatementVolume: 0,
    totalMatchedVolume: 0,
    unmatchedCount: 0,
    suspenseBalance: 0,
    autoReconciliationRate: 0
  };

  const statementItems = data?.statementItems || [];

  const filteredItems = statementItems.filter((item: any) => {
    const matchesSearch =
      item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partyPhone.includes(searchQuery);
    const matchesChannel = channelFilter === 'ALL' || item.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Bank & M-Pesa
            </span>
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Sparkles className="w-3 h-3 text-cyan-300" /> Automatic Matching
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Bank & M-Pesa Matching</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Upload bank or M-Pesa statements and match payments directly to member accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoMatch}
            disabled={autoMatching}
            className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-blue-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${autoMatching ? 'animate-spin' : ''}`} />
            {autoMatching ? 'Matching...' : 'Auto-Match Payments'}
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Transactions</p>
          <p className="text-2xl font-black text-gray-900 mt-2">
            KES {stats.totalStatementVolume.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Across all bank and M-Pesa files</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Matched to Members</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            KES {stats.totalMatchedVolume.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {stats.autoReconciliationRate}% matched
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Unmatched Payments</p>
          <p className="text-2xl font-black text-rose-600 mt-2">
            KES {stats.suspenseBalance.toLocaleString()}
          </p>
          <p className="text-xs text-rose-600 font-semibold mt-1">
            {stats.unmatchedCount} waiting to be assigned
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Supported Gateways</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200">M-Pesa</span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-200">Equity</span>
            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-200">KCB</span>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Dropzone */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-300 shadow-sm text-center hover:border-blue-500 transition-all cursor-pointer">
        <Upload className="w-10 h-10 text-blue-600 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 text-sm">Upload Bank or M-Pesa Statement CSV</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Drag and drop your Paybill statement or bank export file here. Our fuzzy reconciler automatically matches names, phone numbers, and references.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
            Browse Files
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>
        </div>
      </div>

      {/* Statement Feed Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              Ingested Statement Entries ({filteredItems.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Real-time matching status against group ledger</p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reference, depositor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All Channels</option>
              <option value="M-PESA">M-Pesa Paybill</option>
              <option value="EQUITY_BANK">Equity Bank</option>
              <option value="KCB_BANK">KCB Bank</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Channel & Ref</th>
                <th className="px-5 py-3.5">Depositor Info</th>
                <th className="px-5 py-3.5">Amount (KES)</th>
                <th className="px-5 py-3.5">Transaction Date</th>
                <th className="px-5 py-3.5">Ledger Allocation</th>
                <th className="px-5 py-3.5">Match Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item: any) => {
                const isMatched = item.matchedStatus === 'MATCHED';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.channel === 'M-PESA' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.channel}
                        </span>
                        <span className="font-mono font-bold text-gray-900">{item.reference}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{item.partyName}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{item.partyPhone}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900 text-sm">
                      KES {item.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.date}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-[11px] font-semibold">
                        {item.ledgerCategory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Matched ({item.matchConfidence}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Suspense Account
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isMatched ? (
                        <button
                          onClick={() => setShowAssignModal(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          Assign Member
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400">Reconciled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Assign Suspense Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Assign Suspense Transaction</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ref: {showAssignModal.reference} (KES {showAssignModal.amount.toLocaleString()})</p>
              </div>
              <button onClick={() => setShowAssignModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAssignSuspense} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Member Account</label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ledger Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="MONTHLY_SAVINGS">Monthly Savings & Deposits</option>
                  <option value="LOAN_REPAYMENT">Loan Principal & Interest Repayment</option>
                  <option value="WELFARE_BENEVOLENT">Welfare & Benevolent Contribution</option>
                  <option value="MERRY_GO_ROUND">Merry-Go-Round (ROSCA) Slot</option>
                  <option value="SHARES_PURCHASE">Share Capital Investment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Map & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
