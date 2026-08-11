import { usePrompt } from '../common/PromptProvider';
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Heart, Plus, Download, 
  FileSpreadsheet, TrendingUp, Save
} from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { 
  fetchOfficialsMembers, addOfficialsContribution, fetchOfficialsArrears, fetchOfficialsWelfare,
  sendOfficialsArrearsReminder, applyOfficialsArrearsFine, recordOfficialsWelfareDeposit,
  processOfficialsWelfareClaim, fetchOfficialsMerryGoRoundSchedule, recordOfficialsMerryGoRoundPayout
} from '../../api';

export function OfficialsContributions() {
  const showPrompt = usePrompt();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collection' | 'arrears' | 'welfare'>('collection');
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [arrearsData, setArrearsData] = useState<any[]>([]);
  const [welfareData, setWelfareData] = useState<any[]>([]);

  const loadData = async () => {
    fetchOfficialsArrears().then(data => {
      if (Array.isArray(data)) setArrearsData(data);
    }).catch(console.error);

    fetchOfficialsWelfare().then(data => {
      if (Array.isArray(data)) setWelfareData(data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchOfficialsMembers()
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(m => ({
            id: m.id,
            name: m.name,
            expected: 5000, // Placeholder
            paid: 0,
            status: 'Unpaid'
          }));
          setCollectionData(mapped);
        }
      }).catch(console.error);
    loadData();
  }, []);

  const handlePaidChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCollectionData(prev => prev.map(m => {
      if (m.id === id) {
        let status = 'Unpaid';
        if (numValue >= m.expected) status = 'Cleared';
        else if (numValue > 0) status = 'Partial';
        return { ...m, paid: numValue, status };
      }
      return m;
    }));
  };

  const handleSaveSheet = async () => {
    const toSave = collectionData.filter(m => m.paid > 0);
    if (toSave.length === 0) {
      toast.error('No payments recorded');
      return;
    }
    
    try {
      let savedCount = 0;
      for (const m of toSave) {
        await addOfficialsContribution({
          memberId: m.id,
          amount: m.paid,
          type: 'MONTHLY'
        });
        savedCount++;
      }
      toast.success(`Successfully recorded ${savedCount} contributions`);
      // Reset payments
      setCollectionData(prev => prev.map(m => ({ ...m, paid: 0, status: 'Unpaid' })));
    } catch (err) {
      toast.error('Failed to save some contributions');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contributions & Finances</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage collections, arrears, and welfare funds.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={async () => {
              const csvContent = "data:text/csv;charset=utf-8," + "Member,Expected,Paid,Status\n" + collectionData.map(c => `${c.name},${c.expected},${c.paid},${c.status}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "contributions_report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm text-xs sm:text-sm"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
          <button 
            onClick={async () => {
              if (window.confirm('Start a new contribution cycle? This will reset all current unsaved entries.')) {
                setCollectionData(prev => prev.map(m => ({ ...m, paid: 0, status: 'Unpaid' })));
                toast.success('New cycle started');
              }
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>New Cycle</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'collection'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            Collection Sheet
          </button>
          <button
            onClick={() => setActiveTab('arrears')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'arrears'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle size={18} />
            Arrears & Penalties
            {arrearsData.length > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {arrearsData.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('welfare')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'welfare'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart size={18} />
            Welfare Funds
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'collection' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h3 className="font-bold text-gray-900">June 2024 Collection</h3>
                  <p className="text-sm text-gray-500">Record contributions for the current cycle.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Collected</div>
                    <div className="font-bold text-lg text-brand-primary">
                      KES {collectionData.reduce((acc, curr) => acc + curr.paid, 0).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveSheet}
                    className="bg-brand-green text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
                  >
                    <Save size={18} />
                    Save Sheet
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected (KES)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Paid (KES)</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {collectionData.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{member.name}</div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right text-gray-500">
                          {member.expected.toLocaleString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <input 
                            type="number" 
                            className="w-32 text-right border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                            value={member.paid}
                            onChange={(e) => handlePaidChange(member.id, e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'Cleared' ? 'bg-brand-green/10 text-brand-green' : 
                            member.status === 'Partial' ? 'bg-brand-amber/10 text-brand-amber' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'arrears' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Members in Default</h3>
                <button onClick={() => toast('Arrears Policy: 10% penalty after 30 days. Default reported to CRB after 90 days.', { icon: '📜' })} className="text-sm text-brand-primary font-bold hover:underline">View Policy</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arrearsData.map(arrear => (
                  <div key={arrear.id} className="border border-red-200 bg-red-50/30 rounded-xl p-5 hover:border-red-300 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">Loan {arrear.loanId.split('-')[0]}</h4>
                        <p className="text-sm text-red-600 font-medium">{Math.floor(arrear.daysOverdue / 30) || 1} month(s) behind</p>
                      </div>
                      <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Principal Arrears:</span>
                        <span className="font-semibold text-gray-900">KES {(arrear.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Accumulated Penalties:</span>
                        <span className="font-semibold text-red-600">KES {(arrear.amount * 0.1).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-red-100 flex justify-between">
                        <span className="font-bold text-gray-900">Total Owed:</span>
                        <span className="font-bold text-gray-900">KES {(arrear.amount * 1.1).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={async () => {
                          sendOfficialsArrearsReminder(arrear.id).then(() => {
                            toast.success('Reminder sent via SMS and Email');
                          }).catch(() => toast.error('Failed to send reminder'));
                        }}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                      >
                        Send Reminder
                      </button>
                      <button 
                        onClick={async () => {
                          applyOfficialsArrearsFine(arrear.id).then(() => {
                            toast.success('10% Penalty Applied');
                            loadData();
                          }).catch(() => toast.error('Failed to apply fine'));
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                      >
                        Apply Fine
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'welfare' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-primary rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart size={64} />
                  </div>
                  <h3 className="text-brand-primary/80 text-white/80 font-medium mb-1">Emergency Fund Pool</h3>
                  <div className="text-3xl font-bold mb-4">KES {(welfareData.find(w => w.name.includes('Emergency'))?.balance || 0).toLocaleString()}</div>
                  <div className="flex gap-3 relative z-10">
                    <button 
                      onClick={async () => {
                        const amountStr = await showPrompt('Enter deposit amount (KES):');
                        if (amountStr) {
                          const amount = Number(amountStr);
                          if (!isNaN(amount) && amount > 0) {
                            recordOfficialsWelfareDeposit({ type: 'Emergency Fund', amount })
                              .then(() => {
                                toast.success(`Recorded deposit of KES ${amount} to Emergency Fund`);
                                loadData();
                              })
                              .catch(() => toast.error('Failed to record deposit'));
                          } else {
                            toast.error('Invalid amount');
                          }
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                    >
                      Record Deposit
                    </button>
                    <button 
                      onClick={async () => {
                        const claimId = await showPrompt('Enter Claim ID to process:');
                        if (claimId) {
                          processOfficialsWelfareClaim(claimId)
                            .then(() => {
                              toast.success(`Claim ${claimId} has been marked as processing`);
                              loadData();
                            })
                            .catch(() => toast.error('Failed to process claim'));
                        }
                      }}
                      className="bg-white text-brand-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                      Process Claim
                    </button>
                  </div>
                </div>

                <div className="bg-brand-accent rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={64} />
                  </div>
                  <h3 className="text-white/80 font-medium mb-1">Merry-Go-Round Pool</h3>
                  <div className="text-3xl font-bold mb-4">KES {(welfareData.find(w => w.name.includes('Merry'))?.balance || 0).toLocaleString()}</div>
                  <div className="flex gap-3 relative z-10">
                    <button 
                      onClick={async () => {
                        fetchOfficialsMerryGoRoundSchedule().then(data => {
                           toast.success('Payout Schedule: ' + (data.schedule || 'No schedule found'), { duration: 5000 });
                        }).catch(() => toast.error('Failed to fetch schedule'));
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                    >
                      View Schedule
                    </button>
                    <button 
                      onClick={async () => {
                        const amountStr = await showPrompt('Enter payout amount (KES):');
                        if (amountStr) {
                          const amount = Number(amountStr);
                          if (!isNaN(amount) && amount > 0) {
                            recordOfficialsMerryGoRoundPayout({ amount })
                              .then(() => {
                                toast.success(`Recorded payout of KES ${amount}`);
                                loadData();
                              })
                              .catch(() => toast.error('Failed to record payout'));
                          } else {
                            toast.error('Invalid amount');
                          }
                        }
                      }}
                      className="bg-white text-brand-accent px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                      Record Payout
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Recent Welfare Claims</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (KES)</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {welfareData.flatMap(w => w.claims || []).map((claim: any) => (
                        <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {claim.memberId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {claim.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(claim.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              claim.status === 'APPROVED' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-amber/10 text-brand-amber'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
