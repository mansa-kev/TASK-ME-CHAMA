import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';

export function GuarantorshipModule() {
  const [activeTab, setActiveTab] = useState<'requests' | 'my-guarantors'>('requests');
  const [requestsToMe, setRequestsToMe] = useState<any[]>([]);
  const [myGuarantors, setMyGuarantors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/loans/guarantors/me');
      setRequestsToMe(data);
      
      const profile = await apiFetch('/members/me');
      const loans = await apiFetch('/loans');
      const myLoans = loans.filter((l: any) => l.memberId === profile.id);
      
      let guarantors: any[] = [];
      myLoans.forEach((l: any) => {
        if (l.guarantors) {
          guarantors = [...guarantors, ...l.guarantors];
        }
      });
      setMyGuarantors(guarantors);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await apiFetch(`/loans/guarantors/${id}/accept`, { method: 'PUT' });
      toast.success('Request accepted');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/loans/guarantors/${id}/reject`, { method: 'PUT' });
      toast.success('Request rejected');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject request');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Guarantorship Hub</h1>
        <p className="text-xs sm:text-sm text-gray-500">Manage security endorsements, approve requests, and monitor your loan guarantors.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[450px]">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'requests' ? 'border-brand-accent text-brand-accent bg-white rounded-t-xl shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Incoming Endorsement Requests ({requestsToMe.length})
          </button>
          <button 
            onClick={() => setActiveTab('my-guarantors')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${activeTab === 'my-guarantors' ? 'border-brand-accent text-brand-accent bg-white rounded-t-xl shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            My Loan Guarantors ({myGuarantors.length})
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'requests' ? (
            <div className="space-y-3">
              {requestsToMe.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">No Pending Guarantor Requests</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">When fellow chama members request you to guarantee their loan applications, they will appear here for your digital sign-off.</p>
                </div>
              ) : (
                requestsToMe.map((req) => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 gap-4 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-black text-sm">
                        {req.loan?.memberName ? req.loan.memberName.charAt(0) : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{req.loan?.memberName || 'Chama Member'}</p>
                        <p className="text-xs text-gray-500">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="text-xs text-gray-500 font-medium">Guaranteed Amount:</span>
                        <p className="font-black text-gray-900 text-sm sm:text-base">KES {req.amountGuaranteed?.toLocaleString()}</p>
                      </div>
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm transition-all">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(req.id)} className="flex-1 sm:flex-initial px-3.5 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-1.5 transition-all">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1 self-start sm:self-auto">
                          <ShieldCheck className="w-3 h-3" /> Guaranteed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myGuarantors.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-orange-50 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">No Active Guarantors</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">You do not currently have any members backing your loans. When you apply for a loan with guarantors, they will be listed here.</p>
                </div>
              ) : (
                myGuarantors.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-black text-sm">
                        {g.guarantorName ? g.guarantorName.charAt(0) : 'G'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{g.guarantorName}</p>
                        <p className="text-xs font-medium text-gray-500">Coverage: KES {g.amountGuaranteed?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      {g.status === 'ACCEPTED' ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : g.status === 'REJECTED' ? (
                        <span className="text-red-500 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Declined
                        </span>
                      ) : (
                        <span className="text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
