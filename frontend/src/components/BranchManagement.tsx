import { useState } from 'react';
import { Building2, Search, Filter, ShieldCheck, Wallet, ArrowRightLeft, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from './data';

export function BranchManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { branchManagement } = useData();

  const branches = branchManagement.map((b: any) => ({
    name: b.name,
    location: b.location,
    manager: b.managerId || 'Unassigned',
    status: b.vaultBalance > (b.vaultLimit || 5000000) * 0.8 ? 'Critical' : b.vaultBalance > (b.vaultLimit || 5000000) * 0.6 ? 'Warning' : 'Normal',
    currentVault: b.vaultBalance || 0,
    vaultLimit: b.vaultLimit || 5000000,
    b2cFloat: b.b2cFloat || 0,
    cit: b.cit || 0
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-green/20 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <Building2 className="mr-2 sm:mr-3 text-brand-green shrink-0" size={24} />
            Branch & Vault Liquidity
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            Monitor physical vault cash, digital M-Pesa floats, and Cash-In-Transit.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => toast.success('CIT Transfer request initiated')}
            className="flex-1 sm:flex-none flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowRightLeft size={16} className="mr-1.5 shrink-0" /> CIT Transfer
          </button>
          <button 
            onClick={() => toast.success('Adjust Vault Limit form opened')}
            className="flex-1 sm:flex-none flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-brand-green hover:bg-green-700 px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <ShieldCheck size={16} className="mr-1.5 shrink-0" /> Adjust Limit
          </button>
        </div>
      </div>

      {/* Global Liquidity Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-3 sm:mb-4">
             <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
               <Building2 size={20} />
             </div>
             <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Vault Cash</span>
           </div>
           <div>
             <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-accent">{formatCurrency(branches.reduce((acc, b) => acc + b.currentVault, 0))}</h3>
             <p className="text-xs font-bold text-brand-blue mt-1.5">Across {branches.length} Branches</p>
           </div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/30 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-blue/5 rounded-full pointer-events-none"></div>
           <div className="flex justify-between items-start mb-3 sm:mb-4">
             <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
               <Wallet size={20} />
             </div>
             <span className="text-[10px] sm:text-xs font-bold text-brand-blue uppercase tracking-wider">Consolidated M-Pesa</span>
           </div>
           <div>
             <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-accent">{formatCurrency(0)}</h3>
             <p className="text-xs font-bold text-brand-green mt-1.5 flex items-center">
               <TrendingUp size={12} className="mr-1 shrink-0" /> Stable float
             </p>
           </div>
         </div>

         <div className="bg-brand-primary text-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute right-0 top-0 w-32 h-full bg-white/5 skew-x-12 translate-x-10 pointer-events-none"></div>
           <div className="flex justify-between items-start mb-3 sm:mb-4">
             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
               <ArrowRightLeft size={20} />
             </div>
             <span className="text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-wider">Cash In Transit</span>
           </div>
           <div>
             <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{formatCurrency(0)}</h3>
             <p className="text-xs font-bold text-white/80 mt-1.5 flex items-center">
               All transfers cleared
             </p>
           </div>
         </div>
      </div>

      {/* Branch Grid View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search branches..." 
                  className="bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm focus:border-brand-green outline-none w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => toast('Filters opened')}
                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 shrink-0"
              >
                <Filter size={16} />
              </button>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 self-start sm:self-auto">
              Auto-syncs every 5 mins
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50/30">
            {branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map((branch, i) => {
               const vaultUtilization = (branch.currentVault / branch.vaultLimit) * 100;
               return (
                 <div key={i} className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 transition-shadow hover:shadow-md ${branch.status === 'Critical' ? 'border-red-300' : branch.status === 'Warning' ? 'border-orange-300' : 'border-gray-200'}`}>
                   
                   <div className="flex justify-between items-start mb-3 sm:mb-4 border-b border-gray-100 pb-3 sm:pb-4">
                     <div className="min-w-0">
                       <h3 className="text-base sm:text-lg font-extrabold text-brand-accent flex items-center truncate">
                         {branch.name}
                         {branch.status === 'Critical' && <AlertTriangle size={14} className="ml-2 text-red-500 shrink-0" />}
                       </h3>
                       <p className="text-xs font-medium text-gray-500 mt-0.5 truncate">{branch.location} • By <span className="font-bold text-brand-blue">{branch.manager}</span></p>
                     </div>
                     <div>
                        <span className={`px-2 py-0.5 sm:py-1 rounded text-[10px] font-bold uppercase tracking-wider ${branch.status === 'Critical' ? 'bg-red-50 text-red-600' : branch.status === 'Warning' ? 'bg-orange-50 text-orange-600' : 'bg-brand-green/10 text-brand-green'}`}>
                          {branch.status}
                        </span>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">M-Pesa Float</p>
                        <p className="text-base sm:text-lg font-extrabold text-brand-blue truncate">{formatCurrency(branch.b2cFloat)}</p>
                        {branch.b2cFloat < 200000 && <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center"><TrendingDown size={10} className="mr-1 shrink-0"/> Low Float</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cash In Transit</p>
                        <p className="text-base sm:text-lg font-extrabold text-gray-800 truncate">{formatCurrency(branch.cit)}</p>
                      </div>
                   </div>

                   <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                     <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Physical Vault Cash</p>
                          <p className="text-xs sm:text-sm font-extrabold text-gray-800">{formatCurrency(branch.currentVault)} <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1">/ {formatCurrency(branch.vaultLimit)}</span></p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500">{vaultUtilization.toFixed(0)}% Full</p>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${vaultUtilization > 90 ? 'bg-red-500' : vaultUtilization > 75 ? 'bg-orange-500' : 'bg-brand-green'}`} 
                          style={{ width: `${vaultUtilization}%` }}
                        ></div>
                     </div>
                     {vaultUtilization > 90 && (
                       <p className="text-[10px] text-red-600 font-bold mt-2 text-center bg-red-50 py-1 rounded">
                         Vault limit nearly breached. Evacuate cash to HQ immediately.
                       </p>
                     )}
                   </div>

                 </div>
               );
            })}
          </div>

      </div>

    </div>
  );
}
