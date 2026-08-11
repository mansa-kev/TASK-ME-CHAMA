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

          {/* Desktop Table */}
          <div className="hidden md:block flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                  <th className="p-4">Group Name</th>
                  <th className="p-4 text-center">Members</th>
                  <th className="p-4">Meeting Freq.</th>
                  <th className="p-4 text-right">Total Pool Balance</th>
                  {view === 'table-banking' ? (
                     <th className="p-4 text-right">Active Loans</th>
                  ) : view === 'merry-go-round' ? (
                     <th className="p-4 text-right">Next Payout</th>
                  ) : (
                     <th className="p-4 text-center">Status</th>
                  )}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredChamas.map((chama) => (
                  <tr key={chama.id} className="hover:bg-brand-blue/5 transition-colors">
                    <td className="p-4">
                      <Link to={`/dashboard/chamas/${chama.id}`} className="font-extrabold text-brand-blue hover:underline text-sm block">
                        {chama.name}
                      </Link>
                      <span className="text-xs text-gray-500">{chama.id}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-full text-xs border border-gray-200">
                        {chama.memberCount}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {chama.meetingFrequency}
                    </td>
                    <td className="p-4 text-right font-extrabold text-gray-800 text-sm">
                      {formatCurrency(chama.totalPool)}
                    </td>
                    
                    {view === 'table-banking' ? (
                       <td className="p-4 text-right font-extrabold text-brand-primary text-sm">
                         {formatCurrency(chama.activeLoans)}
                       </td>
                    ) : view === 'merry-go-round' ? (
                       <td className="p-4 text-right">
                         <span className="block text-sm font-bold text-gray-800">{new Date(chama.nextPayoutDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                         <span className="block text-[10px] text-brand-green font-bold uppercase">{chama.nextPayoutMember}</span>
                       </td>
                    ) : (
                       <td className="p-4 text-center">
                         <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center w-fit mx-auto">
                           <ShieldCheck size={12} className="mr-1" /> Active
                         </span>
                       </td>
                    )}
                    
                    <td className="p-4 text-right">
                       <button 
                         onClick={() => navigate(`/dashboard/chamas/${chama.id}`)}
                         className="text-xs font-bold text-brand-blue hover:text-blue-800 hover:underline"
                       >
                         Manage Group
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredChamas.map((chama) => (
              <div key={chama.id} className="p-4 space-y-3 hover:bg-brand-blue/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/dashboard/chamas/${chama.id}`} className="font-extrabold text-brand-blue hover:underline text-sm block">
                      {chama.name}
                    </Link>
                    <span className="text-xs text-gray-500">{chama.id}</span>
                  </div>
                  {view === 'directory' && (
                    <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center">
                      <ShieldCheck size={12} className="mr-1" /> Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Members</span>
                    <span className="text-sm font-extrabold text-gray-800">{chama.memberCount}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Pool Balance</span>
                    <span className="text-sm font-extrabold text-gray-800">{formatCurrency(chama.totalPool)}</span>
                  </div>
                </div>

                {view === 'table-banking' && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Active Loans</span>
                    <span className="text-sm font-extrabold text-brand-primary">
                      {formatCurrency(chama.activeLoans)}
                    </span>
                  </div>
                )}
                
                {view === 'merry-go-round' && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Next Payout</span>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-gray-800">{new Date(chama.nextPayoutDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                      <span className="block text-[10px] text-brand-green font-bold uppercase">{chama.nextPayoutMember}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => navigate(`/dashboard/chamas/${chama.id}`)}
                    className="text-xs font-bold text-brand-blue hover:text-blue-800 hover:underline"
                  >
                    Manage Group →
                  </button>
                </div>
              </div>
            ))}
            {filteredChamas.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No groups found.
              </div>
            )}
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
