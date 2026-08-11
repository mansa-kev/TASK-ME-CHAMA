import { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp, History, Download } from 'lucide-react';
import { apiFetch } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export function MySavings() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const ledger = profile?.ledger || {};
  const transactions = ledger.transactions || [];
  
  // Filter for deposits
  const deposits = transactions.filter((t: any) => t.type === 'CREDIT' || t.type === 'DEPOSIT');

  // Calculate chart data based on real deposits
  const chartData = (() => {
    if (!transactions || transactions.length === 0) {
      return [{ name: 'Current', amount: ledger.savingsBalance || 0 }];
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals: Record<string, number> = {};
    
    // Sort chronologically
    const sortedDeposits = [...deposits].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sortedDeposits.forEach((t: any) => {
       const d = new Date(t.createdAt);
       const key = `${monthNames[d.getMonth()]}`;
       if (!monthlyTotals[key]) monthlyTotals[key] = 0;
       monthlyTotals[key] += t.amount;
    });

    const result = [];
    let runningTotal = 0;
    
    // If no deposits found (e.g. they are all debits), return at least the current balance
    if (Object.keys(monthlyTotals).length === 0) {
      return [{ name: 'Current', amount: ledger.savingsBalance || 0 }];
    }

    for (const [name, amount] of Object.entries(monthlyTotals)) {
       runningTotal += amount;
       result.push({ name, amount: runningTotal });
    }
    
    // Ensure the last point reflects the actual ledger balance in case of other manual adjustments
    if (result.length > 0) {
      result[result.length - 1].amount = ledger.savingsBalance || runningTotal;
    }

    return result;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">My Savings & Shares</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track your accumulated contributions and dividend-earning share capital.</p>
        </div>
        <button 
          onClick={() => {
            const header = "Date,Description,Amount\n";
            const rows = deposits.map((t: any) => `${new Date(t.createdAt).toLocaleDateString()},${t.description || 'Deposit'},${t.amount}`).join('\n');
            const csv = header + rows;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Savings_Statement_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Statement downloaded');
          }}
          className="bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Total Savings Card */}
        <div className="bg-gradient-to-br from-brand-accent to-brand-amber text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
            <div className="bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              Voluntary
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Total Savings</p>
            <h3 className="text-2xl sm:text-3xl font-black mb-1">KES {(ledger.savingsBalance || 0).toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-white/80 text-xs sm:text-sm font-medium">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
              <span className="text-emerald-300 font-bold">
                {deposits.length > 0 ? `${deposits.length} deposits` : 'No deposits yet'}
              </span> this cycle
            </div>
          </div>
        </div>

        {/* Share Capital Card */}
        <div className="bg-gray-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden border border-gray-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
            <div className="bg-white/10 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-brand-amber" />
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm border border-white/10">
              Equity
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Share Capital</p>
            <h3 className="text-2xl sm:text-3xl font-black mb-1">KES {(ledger.sharesBalance || 0).toLocaleString()}</h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Eligible for end-of-year dividend distributions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Savings Growth History</h2>
          <div className="h-[220px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff5000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} dx={-10} tickFormatter={(val) => `KES ${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="amount" stroke="#ff5000" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[360px] sm:h-[400px]">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-accent" />
              Deposit History
            </h2>
          </div>
          <div className="p-3 sm:p-4 flex-1 overflow-auto custom-scrollbar">
            {deposits.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-xs sm:text-sm">
                No recent deposits found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {deposits.map((t: any) => (
                  <div key={t.id} className="p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm truncate pr-2">{t.description || 'Deposit'}</p>
                      <p className="font-black text-emerald-600 text-xs sm:text-sm shrink-0">+KES {t.amount.toLocaleString()}</p>
                    </div>
                    <p className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
