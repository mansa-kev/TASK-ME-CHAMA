import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { useData } from './data';
import { Users, Wallet, CalendarDays, RefreshCw, Search, Plus, Filter, Download, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { rotateMerryGoRound } from '../api';

export function ChamasLedger() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chamas, members } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Determine active view based on URL path
  const path = location.pathname;
  let view = 'directory';
  if (path.includes('table-banking')) view = 'table-banking';
  if (path.includes('merry-go-round')) view = 'merry-go-round';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const filteredChamas = chamas.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || c.groupType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className={`bg-white rounded-xl shadow-sm border ${view === 'merry-go-round' ? 'border-brand-accent/20' : 'border-brand-blue/20'} p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden gap-4`}>
        <div className={`absolute right-0 top-0 w-64 h-full bg-gradient-to-l ${view === 'merry-go-round' ? 'from-brand-accent/10' : 'from-brand-blue/10'} to-transparent pointer-events-none`}></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight capitalize">
            {view === 'directory' ? 'Chama Directory' : view.replace('-', ' ')}
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            {view === 'directory' && 'Manage registered groups and aggregate portfolios.'}
            {view === 'table-banking' && 'Track group contributions, pool loans, and dividend sharing.'}
            {view === 'merry-go-round' && 'Monitor rotating savings and credit associations (ROSCAs).'}
          </p>
        </div>
        <div className="relative z-10">
          <button 
            onClick={() => {
              if (view === 'directory') navigate('/dashboard/registration/chama');
              else if (chamas.length > 0) navigate(`/dashboard/chamas/${chamas[0].id}`);
              else toast.error('No chamas available');
            }}
            className={`flex items-center text-sm font-bold text-white ${view === 'merry-go-round' ? 'bg-brand-accent hover:bg-brand-accent-light text-gray-800' : 'bg-brand-blue hover:bg-blue-800'} px-5 py-2.5 rounded-lg shadow-md transition-colors`}
          >
            <Plus size={16} className="mr-2" /> 
            {view === 'directory' ? 'Register New Chama' : 'Post Group Transaction'}
          </button>
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Active Groups</p>
            <p className="text-xl font-extrabold text-gray-800">{chamas.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-brand-accent/20 p-4 flex items-center border-l-4 border-l-brand-accent">
          <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent-light mr-4">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Aggregated Pool</p>
            <p className="text-xl font-extrabold text-gray-800">
              {formatCurrency(chamas.reduce((acc, c) => acc + c.totalPool, 0))}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 p-4 flex items-center border-l-4 border-l-brand-primary">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mr-4">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Group Loans</p>
            <p className="text-xl font-extrabold text-gray-800">
              {formatCurrency(chamas.reduce((acc, c) => acc + c.activeLoans, 0))}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-green/20 p-4 flex items-center border-l-4 border-l-brand-green">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mr-4">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upcoming Payouts</p>
            <p className="text-xl font-extrabold text-gray-800">
              {chamas.filter(c => c.nextPayoutDate && new Date(c.nextPayoutDate) <= new Date(Date.now() + 7 * 86400000)).length} This Week
            </p>
          </div>
        </div>
      </div>

      {/* Dense Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Main Table Data (Takes up ~66% of space) */}
        <div className="flex-[2] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-4">
            <div className="w-full sm:max-w-sm relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search groups..." 
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 border rounded-lg transition-colors ${showFilters ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                >
                  <Filter size={16} />
                </button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Group Type</div>
                    {['ALL', 'INVESTMENT_CLUB', 'TABLE_BANKING', 'WELFARE'].map(t => (
                      <button 
                        key={t}
                        onClick={() => { setFilterType(t); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 text-sm ${filterType === t ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  const headers = ['Chama ID', 'Name', 'Type', 'Registration Date', 'Members Count'];
                  const csvData = chamas.map((c: any) => [
                    c.id, c.name, c.groupType, new Date(c.registrationDate).toLocaleDateString(), c.totalMembers
                  ].join(','));
                  const csvString = [headers.join(','), ...csvData].join('\n');
                  const blob = new Blob([csvString], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Chama_Directory_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Chama directory exported');
                }}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="Export CSV"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Responsive Card Grid for Groups */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredChamas.map((chama) => (
                <div 
                  key={chama.id} 
                  className="bg-white/90 backdrop-blur-sm border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link to={`/dashboard/chamas/${chama.id}`} className="font-extrabold text-brand-blue group-hover:text-blue-700 transition-colors text-lg block">
                          {chama.name}
                        </Link>
                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">{chama.id}</span>
                      </div>
                      {view === 'directory' && (
                        <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center justify-center shadow-sm">
                          <ShieldCheck size={12} className="mr-1" /> Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100/50">
                        <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider block mb-1">Members</span>
                        <div className="flex items-center text-gray-800">
                          <Users size={14} className="mr-1.5 text-gray-400" />
                          <span className="text-base font-extrabold">{chama.memberCount}</span>
                        </div>
                      </div>
                      <div className="bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/10">
                        <span className="text-[10px] text-brand-blue/70 uppercase font-extrabold tracking-wider block mb-1">Pool Balance</span>
                        <div className="flex items-center text-brand-blue">
                          <Wallet size={14} className="mr-1.5 opacity-70" />
                          <span className="text-base font-extrabold">{formatCurrency(chama.totalPool)}</span>
                        </div>
                      </div>
                    </div>

                    {view === 'table-banking' && (
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100/80 mt-2">
                        <span className="text-xs text-gray-500 uppercase font-extrabold tracking-wider flex items-center">
                          <Banknote size={14} className="mr-1.5 text-brand-primary/70" /> Active Loans
                        </span>
                        <span className="text-base font-extrabold text-brand-primary">
                          {formatCurrency(chama.activeLoans)}
                        </span>
                      </div>
                    )}
                    
                    {view === 'merry-go-round' && (
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100/80 mt-2">
                        <span className="text-xs text-gray-500 uppercase font-extrabold tracking-wider flex items-center">
                          <CalendarDays size={14} className="mr-1.5 text-brand-accent/70" /> Next Payout
                        </span>
                        <div className="text-right">
                          <span className="block text-sm font-extrabold text-gray-800">{new Date(chama.nextPayoutDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                          <span className="block text-[10px] text-brand-green font-extrabold uppercase">{chama.nextPayoutMember}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50/80 border-t border-gray-100 px-5 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">{chama.meetingFrequency}</span>
                    <button 
                      onClick={() => navigate(`/dashboard/chamas/${chama.id}`)}
                      className="text-xs font-extrabold text-brand-blue hover:text-white bg-transparent hover:bg-brand-blue px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center shadow-sm"
                    >
                      Manage Group <ArrowRight size={14} className="ml-1.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredChamas.length === 0 && (
                <div className="col-span-1 lg:col-span-2 p-12 text-center flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm">
                    <Search size={24} />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-1">No groups found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dense Information Panels (Takes up ~33% of space) */}
        <div className="flex-1 space-y-6">
          
          {/* Actionable Merry-Go-Round Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <h3 className="font-extrabold text-brand-accent text-sm flex items-center">
                <RefreshCw size={16} className="mr-2 text-brand-accent" /> Upcoming Merry-Go-Round Payouts
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {chamas.map((c, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center">
                    <div className="w-11 h-11 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex flex-col items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-[10px] font-bold text-brand-accent uppercase leading-none mb-1">{new Date(c.nextPayoutDate).toLocaleDateString('en-KE', { month: 'short' })}</span>
                      <span className="text-sm font-extrabold text-gray-800 leading-none">{new Date(c.nextPayoutDate).toLocaleDateString('en-KE', { day: '2-digit' })}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{c.nextPayoutMember}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider truncate max-w-[120px]">{c.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-xs font-extrabold text-brand-green mb-1">{formatCurrency(c.totalPool / c.memberCount)}</p>
                    <button 
                      onClick={async () => {
                        const toastId = toast.loading('Processing payout...');
                        try {
                          await rotateMerryGoRound(c.id);
                          toast.success(`Payout disbursed to ${c.nextPayoutMember}`, { id: toastId });
                          // Ideally refresh data here
                        } catch (e: any) {
                          toast.error(e.message || 'Failed to disburse payout', { id: toastId });
                        }
                      }}
                      className="text-[10px] text-white bg-brand-accent px-3 py-1 rounded shadow-sm hover:opacity-90 font-bold transition-colors"
                    >
                      Disburse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Attendance / Fines Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 overflow-hidden">
            <div className="bg-brand-primary/5 border-b border-brand-primary/10 p-4">
              <h3 className="font-extrabold text-brand-primary text-sm flex items-center">
                <CalendarDays size={16} className="mr-2" /> Overdue Meeting Fines
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {members.filter(m => m.financials.fines > 0).slice(0, 3).map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-500">Missed Session</p>
                  </div>
                  <div className="flex items-center text-red-600 font-extrabold text-sm">
                    {formatCurrency(m.financials.fines)}
                    <button className="ml-2 text-gray-400 hover:text-brand-primary"><ArrowRight size={14} /></button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/dashboard/operations')}
                className="w-full text-center text-xs font-bold text-brand-primary hover:underline pt-2"
              >
                View All Fines
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
