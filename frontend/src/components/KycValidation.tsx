import { ShieldCheck, Search, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updateKycStatus } from '../api';
import toast from 'react-hot-toast';

export function KycValidation() {
  const [kycQueue, setKycApprovals] = useState<any[]>([]);

  useEffect(() => {
    import('../api').then(({ fetchKycDocuments }) => {
      fetchKycDocuments().then(setKycApprovals).catch(console.error);
    });
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateKycStatus(id, newStatus);
      toast.success(`KYC status updated to ${newStatus}`);
      
      // Update local state
      setKycApprovals((prev: any) => 
        prev.map((k: any) => k.id === id ? { ...k, status: newStatus === 'APPROVED' ? 'Approved' : 'Rejected' } : k)
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update KYC status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-green/20 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <ShieldCheck className="mr-3 text-brand-green" size={28} />
            KYC Validation Inbox
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            Review and approve member identity documents to activate their accounts.
          </p>
        </div>
        <div className="relative z-10 bg-brand-green/10 text-brand-green border border-brand-green/20 px-4 py-2 rounded-lg font-bold text-sm">
          {kycQueue.filter((k: any) => k.status === 'Pending').length} Pending Reviews
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-2 rounded bg-gray-100 border border-gray-200">
            <Filter size={16} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                <th className="p-4">Applicant</th>
                <th className="p-4">Account Type</th>
                <th className="p-4">Documents Provided</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {kycQueue.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <span className="font-extrabold text-gray-800 text-sm block">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.id}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.type === 'Chama' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-blue/10 text-brand-blue'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-600">{item.docs}</td>
                  <td className="p-4 text-xs text-gray-500">{item.submitted}</td>
                  <td className="p-4 text-center">
                    {item.status === 'Pending' && <span className="bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending</span>}
                    {item.status === 'Approved' && <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-1 rounded text-[10px] font-bold uppercase">Approved</span>}
                    {item.status === 'Rejected' && <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Rejected</span>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => toast('Opening secure document viewer...')} className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded transition-colors" title="Review Documents">
                      <Eye size={18} />
                    </button>
                    {item.status === 'Pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(item.id, 'APPROVED')} className="p-1.5 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded transition-colors" title="Approve">
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => handleUpdateStatus(item.id, 'REJECTED')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
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
