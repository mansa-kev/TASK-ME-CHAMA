import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet, CreditCard, Clock, ArrowUpRight, ArrowDownRight, ShieldCheck, Banknote, ArrowRight } from 'lucide-react';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export function MembersDashboard() {
  const navigate = useNavigate();
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

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load member profile. Please try again later.
      </div>
    );
  }

  const ledger = profile.ledger || {};
  const transactions = ledger.transactions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Welcome, {profile.name}</h1>
          <p className="text-xs sm:text-sm text-gray-500">Here's your financial summary with Task-Me Chama.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-emerald-100 flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          Active Member
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-brand-accent/10 w-11 h-11 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-accent" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Liquid</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Savings</p>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">KES {(ledger.savingsBalance || 0).toLocaleString()}</h3>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Equity</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Shares</p>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">KES {(ledger.sharesBalance || 0).toLocaleString()}</h3>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-50 w-11 h-11 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Liability</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Loan Balance</p>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">KES {(ledger.activeLoanBalance || 0).toLocaleString()}</h3>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-red-50 w-11 h-11 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Due</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Fines/Arrears</p>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">KES {(profile.finesBalance || 0).toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Transactions</h2>
            <button onClick={() => navigate('/dashboard/statements')} className="text-xs sm:text-sm font-bold text-brand-primary hover:underline flex items-center">
              View All <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6 flex-1 overflow-auto">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No recent transactions found.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{t.description}</p>
                        <p className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-xs sm:text-sm ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}KES {t.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <button 
              onClick={() => navigate('/dashboard/wallet')}
              className="w-full bg-brand-accent hover:bg-brand-amber text-white font-extrabold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,80,0,0.25)] hover:shadow-[0_0_20px_rgba(255,153,0,0.4)] flex items-center justify-center gap-2 text-sm">
              <Wallet className="w-4 h-4" />
              Make a Deposit
            </button>
            <button 
              onClick={() => navigate('/dashboard/loans')}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" />
              Apply for Loan
            </button>
            <button 
              onClick={() => navigate('/dashboard/savings')}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-xl transition-all border border-gray-200 flex items-center justify-center gap-2 text-sm">
              <Banknote className="w-4 h-4 text-gray-600" />
              View Savings & Shares
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
