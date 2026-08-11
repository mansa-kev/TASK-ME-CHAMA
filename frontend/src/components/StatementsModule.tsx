import { useState, useEffect } from 'react';
import { Filter, Download, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export function StatementsModule() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/members/me');
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const transactions = profile?.ledger?.transactions || [];

  const filteredTransactions = transactions.filter((t: any) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Statements & Ledger</h1>
          <p className="text-xs sm:text-sm text-gray-500">Real-time breakdown of your deposits, loan disbursements, and repayments.</p>
        </div>
        <button 
          onClick={() => {
            const header = "Date,Description,Reference,Amount,Type\n";
            const sanitizeCsv = (val: any) => {
              if (val == null) return '';
              const str = String(val);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            };
            const rows = filteredTransactions.map((t: any) => 
              `${new Date(t.createdAt).toLocaleDateString()},${sanitizeCsv(t.description)},${sanitizeCsv(t.reference)},${t.amount},${t.type}`
            ).join('\n');
            const csv = header + rows;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Statement_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Statement downloaded');
          }}
          className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Download Statement (CSV)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Filters */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-gray-400 mr-1 shrink-0 hidden sm:inline-block" />
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${filterType === 'ALL' ? 'bg-brand-accent text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('CREDIT')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${filterType === 'CREDIT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Money In (Credits)
            </button>
            <button 
              onClick={() => setFilterType('DEBIT')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${filterType === 'DEBIT' ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Money Out (Debits)
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reference or note..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none"
            />
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100 p-2">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No transactions found.
            </div>
          ) : (
            filteredTransactions.map((t: any) => (
              <div key={t.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">{t.description || t.type}</p>
                    <p className="text-[11px] text-gray-400 truncate">{t.reference ? `Ref: ${t.reference}` : ''} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-black text-xs sm:text-sm ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}KES {t.amount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="font-semibold text-gray-700">{new Date(t.createdAt).toLocaleDateString()}</div>
                      <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{t.description || t.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 font-mono">
                        {t.reference || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-black ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}KES {t.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
