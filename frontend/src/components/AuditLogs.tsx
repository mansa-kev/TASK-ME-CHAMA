import { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Download, Activity, Lock, UserCog, Database } from 'lucide-react';
import { fetchAuditLogs, fetchAuditStats } from '../api';

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: 'Security Events', icon: Lock, count: 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Financial Actions', icon: Activity, count: 0, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
    { label: 'Config Changes', icon: UserCog, count: 0, color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
    { label: 'System Automated', icon: Database, count: 0, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' }
  ]);

  useEffect(() => {
    fetchAuditLogs().then(data => {
      // Map backend fields to UI fields if needed, or use them directly
      const mapped = data.map((log: any) => ({
        id: log.id.slice(0, 8), // Short ID
        time: new Date(log.createdAt).toLocaleString(),
        actor: log.userId || 'Unknown',
        ip: log.details?.ip || 'N/A',
        action: `${log.action} on ${log.entity}`,
        category: 'System', // Could map based on entity/action
        status: 'Success' // Assuming success if logged
      }));
      setLogs(mapped);
    }).catch(console.error);
    fetchAuditStats().then(data => {
      if(data && data.length) {
         setStats(prev => prev.map((item, i) => ({...item, count: data[i]?.count || 0})));
      }
    }).catch(console.error);

  }, []);

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Dense Info Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-extrabold text-brand-accent tracking-tight flex items-center mb-1">
            <ShieldAlert className="mr-2 text-gray-700" size={24} />
            System Audit Trail
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-2xl">
            Immutable log of all user and system activities. Mandatory for regulatory compliance and audit tracking.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors border border-gray-200">
            <Download size={14} className="mr-1.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm border ${stat.border} p-3.5 sm:p-4 flex items-center cursor-pointer hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mr-3 shrink-0`}>
              <stat.icon size={18} />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
               <p className="text-base sm:text-lg font-extrabold text-gray-800">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs by Event ID, Actor, or IP Address..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              <Filter size={14} className="mr-1.5" /> Filter by Date
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                <th className="p-4 w-40">Timestamp</th>
                <th className="p-4">Actor Details</th>
                <th className="p-4">Action Taken</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.filter(log => log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.actor.toLowerCase().includes(searchTerm.toLowerCase())).map((log, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-gray-700 block mb-0.5">{log.time}</span>
                    <span className="text-[10px] text-gray-400">{log.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-gray-800 block">{log.actor}</span>
                    <span className="text-[10px] text-brand-blue font-mono">IP: {log.ip}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600 max-w-md">
                    {log.action}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase border border-gray-200">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {log.status === 'Success' && <span className="text-brand-green font-extrabold text-xs flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5"></div> Success</span>}
                    {log.status === 'Warning' && <span className="text-brand-accent font-extrabold text-xs flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-brand-accent mr-1.5"></div> Warning</span>}
                    {log.status === 'Failed' && <span className="text-red-600 font-extrabold text-xs flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></div> Failed</span>}
                    {log.status === 'Pending' && <span className="text-gray-500 font-extrabold text-xs flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div> Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
