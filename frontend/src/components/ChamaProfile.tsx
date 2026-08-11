import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Building, MapPin, Phone, ArrowLeft, 
  Users, Activity, Calendar, Shield, CreditCard,
  CheckCircle2, Clock, Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from './data';
import { updateChama, createPayment, getChamaDetails, getChamaMembers, getChamaTableBankingLoans, postChamaDeposit, applyChamaPenalty } from '../api';

export function ChamaProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'loans' | 'rosca' | 'tablebanking' | 'actions'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const { chamas, setChamas, payments, setPayments } = useData();

  const foundChama = chamas.find(c => c.id === id) || chamas[0];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: foundChama?.name || '', phone: foundChama?.phone || '', county: foundChama?.county || '' });

  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [loanFormData, setLoanFormData] = useState({ loanId: 'Group Agri-Project' });
  const [chamaDetails, setChamaDetails] = useState<any>(null);
  const [chamaMembers, setChamaMembers] = useState<any[]>([]);
  const [tableBanking, setTableBanking] = useState<any[]>([]);

  useEffect(() => {
    if (foundChama) {
      setFormData({ name: foundChama.name || '', phone: foundChama.phone || '', county: foundChama.county || '' });
    }
  }, [foundChama]);

  useEffect(() => {
    if (id) {
      getChamaDetails(id).then(data => data && setChamaDetails(data)).catch(console.error);
      getChamaMembers(id).then(data => data && setChamaMembers(data)).catch(console.error);
      getChamaTableBankingLoans(id).then(data => data && setTableBanking(data)).catch(console.error);
    }
  }, [id]);

  const handleEditProfile = async () => {
    if (!foundChama) return;
    setIsSubmitting(true);
    try {
      const updated = await updateChama(foundChama.id, formData);
      setChamas(prev => prev.map(c => c.id === foundChama.id ? { ...c, ...updated } : c));
      toast.success('Profile updated');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisburseLoan = async () => {
    setIsSubmittingLoan(true);
    try {
      const amount = loanFormData.loanId === 'Group Agri-Project' ? 250000 : 100000;
      const res = await createPayment({
        receiptNo: `DIS-${Math.floor(Math.random() * 100000)}`,
        amount: amount,
        type: 'OUTBOUND',
        status: 'COMPLETED',
        narration: `Group Loan: ${loanFormData.loanId}`
      });
      setPayments(prev => [...prev, res]);
      toast.success('Loan disbursed successfully');
    } catch (err) {
      toast.error('Failed to disburse loan');
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const chama = chamaDetails || foundChama || {
    id: 'GRP-000',
    name: 'Loading...',
    regNo: 'N/A',
    formationDate: 'N/A',
    phone: 'N/A',
    county: 'N/A',
    status: 'Active',
    meetingFreq: 'Monthly',
    contribution: 0,
    lateFine: 0,
    missedFine: 0,
    roscaEnabled: false,
    stats: {
      totalMembers: 0,
      totalSavings: 0,
      activeLoans: 0,
      finesFund: 0,
      cycleNumber: 1
    },
    leadership: {}
  };

  const members = chamaMembers || [];
  const tableBankingLoans = tableBanking || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Back Navigation */}
      <button 
        onClick={() => navigate('/dashboard/chamas')}
        className="flex items-center text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Group Directory
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-accent/20 overflow-hidden">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-brand-accent to-brand-amber relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="px-4 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-start">
              <div className="w-16 h-16 sm:w-24 sm:h-24 -mt-8 sm:-mt-12 bg-white rounded-2xl shadow-lg border-4 border-white flex-shrink-0 flex items-center justify-center text-brand-accent relative z-10">
                <Building className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <div className="ml-3 sm:ml-6 mt-1 sm:mt-3 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-gray-800 tracking-tight truncate">{chama.name}</h1>
                  {chama.status === 'Active' && (
                    <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center">
                      <CheckCircle2 size={12} className="mr-1" /> Active
                    </span>
                  )}
                </div>
                <div className="flex items-center flex-wrap text-xs sm:text-sm font-medium text-gray-500 mt-1 sm:mt-2 gap-3 sm:gap-4">
                  <span className="flex items-center"><MapPin size={14} className="mr-1 shrink-0" /> {chama.county || 'N/A'}</span>
                  <span className="flex items-center"><Phone size={14} className="mr-1 shrink-0" /> {chama.phone || 'N/A'}</span>
                  <span className="flex items-center font-bold text-brand-accent">{chama.id}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto mt-2 sm:mt-4">
               <button onClick={() => setActiveTab('actions')} className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 bg-brand-accent text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-colors text-center">
                 Disburse Loan
               </button>
               <button onClick={() => setShowEditModal(true)} className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 bg-white text-brand-accent border border-brand-accent/30 text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:bg-brand-accent/5 transition-colors text-center">
                 Edit Profile
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Group Savings', value: formatCurrency(chama?.stats?.totalSavings || 0), icon: CreditCard, color: 'text-brand-green', bg: 'bg-brand-green/10' },
          { label: 'Group Loan Balance', value: formatCurrency(chama?.stats?.activeLoans || 0), icon: Activity, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Cycle Number', value: chama?.stats?.cycleNumber || 1, icon: Calendar, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
          { label: 'Fine/Penalty Fund', value: formatCurrency(chama?.stats?.finesFund || 0), icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3.5 sm:p-5 flex items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mr-3 sm:mr-4 shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{stat.label}</p>
                <p className="text-base sm:text-xl font-extrabold text-gray-800 truncate">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {[
            { id: 'overview', name: 'Overview & Bylaws', icon: Shield },
            { id: 'members', name: 'Member Roster', icon: Users },
            { id: 'loans', name: 'Active Group Loans', icon: Activity },
            { id: 'rosca', name: 'Merry-Go-Round', icon: Calendar },
            { id: 'tablebanking', name: 'Table Banking', icon: Landmark },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-3 sm:py-4 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-brand-blue text-brand-blue' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.name}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center py-3 sm:py-4 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'actions' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard size={16} className="mr-2" />
            Transact
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[400px]">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animation-fade-in">
            {/* Leadership & Identity */}
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-2">Group Identity</h3>
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Registration No.</span>
                  <span className="font-bold text-gray-800">{chama.regNo}</span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Formation Date</span>
                  <span className="font-bold text-gray-800">{chama.formationDate}</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-2 mt-6 sm:mt-8">Leadership Roster</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Chairperson</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-blue">{chama.leadership.chairperson}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Treasurer</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-blue">{chama.leadership.treasurer}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Secretary</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-blue">{chama.leadership.secretary}</span>
                </div>
              </div>
            </div>

            {/* Bylaws & Settings */}
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-2">Group Bylaws</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-brand-green/5 rounded-xl border border-brand-green/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Meeting Frequency</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-green">{chama.meetingFreq}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Standard Contribution</span>
                  <span className="text-xs sm:text-sm font-extrabold text-gray-800">{formatCurrency(chama.contribution)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Late Fine</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-primary">{formatCurrency(chama.lateFine)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Missed Meeting Fine</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-primary">{formatCurrency(chama.missedFine)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="animation-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Member Roster ({chama.stats.totalMembers})</h3>
              <button onClick={() => toast('Use the Registration module to onboard new members.')} className="text-xs sm:text-sm font-bold text-brand-blue hover:underline">
                + Add Member
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                    <th className="pb-3 px-4 sm:px-0">Member Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Date Joined</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center pr-4 sm:pr-0">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 sm:py-4 px-4 sm:px-0">
                        <span className="font-bold text-gray-800 block text-xs sm:text-sm">{m.name}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500">{m.id}</span>
                      </td>
                      <td className="py-3 sm:py-4">
                        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-md ${['Chairperson', 'Treasurer', 'Secretary'].includes(m.role) ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-600'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-600">{m.joined}</td>
                      <td className="py-3 sm:py-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.status === 'Active' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 text-center pr-4 sm:pr-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          m.contributionStatus === 'Paid' ? 'bg-brand-green/10 text-brand-green' : 
                          m.contributionStatus === 'Pending' ? 'bg-brand-amber/10 text-brand-amber' : 
                          'bg-red-100 text-red-600'
                        }`}>
                          {m.contributionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
           <div className="animation-fade-in flex flex-col items-center justify-center h-64 text-center p-4">
              <Activity size={48} className="text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Active Group Loans</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-2">
                This group currently has KES 120,000 in active loans. Detailed repayment schedules and loan tracking will appear here.
              </p>
           </div>
        )}

        {activeTab === 'rosca' && (
          <div className="animation-fade-in space-y-6">
            {chama.roscaEnabled ? (
              <>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Merry-Go-Round Tracker</h3>
                  <div className="text-xs sm:text-sm font-bold text-brand-primary">Cycle {chama.stats.cycleNumber}</div>
                </div>

                <div className="bg-brand-accent/5 p-4 sm:p-6 rounded-2xl border border-brand-accent/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Recipient</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-brand-accent">{members[1]?.name || members[0]?.name || 'N/A'}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Amount</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-gray-800">{formatCurrency(chama.stats?.totalMembers ? (chama.stats?.totalMembers * chama.contribution) : 0)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                    <span>Cycle Progress</span>
                    <span>2 / 4 Members</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5 sm:h-3 border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-brand-accent h-full rounded-full" style={{ width: '50%' }}></div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 mb-3 sm:mb-4">Rotation Sequence</h4>
                  <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-none">
                    {members.map((m, idx) => (
                      <div key={idx} className={`min-w-[120px] p-3 rounded-xl border shrink-0 ${idx === 1 ? 'border-brand-accent bg-white shadow-sm ring-2 ring-brand-accent/20' : idx < 1 ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${idx === 1 ? 'bg-brand-accent text-white' : idx < 1 ? 'bg-gray-300 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                          {idx + 1}
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{m.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                          {idx === 1 ? 'Receiving' : idx < 1 ? 'Completed' : 'Upcoming'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <Calendar size={48} className="text-gray-300 mb-4" />
                <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Merry-Go-Round Disabled</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-2">
                  Merry-Go-Round is not enabled for this group.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tablebanking' && (
          <div className="animation-fade-in space-y-6">
            <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Table Banking Session</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Pool Amount</p>
                <p className="text-lg sm:text-xl font-extrabold text-brand-primary">{formatCurrency(50000)}</p>
              </div>
              <div className="bg-brand-green/5 p-4 rounded-xl border border-brand-green/20 text-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Interest Earned</p>
                <p className="text-lg sm:text-xl font-extrabold text-brand-green">{formatCurrency(1500)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Members Present</p>
                <p className="text-lg sm:text-xl font-extrabold text-gray-800">4 / 4</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200 font-extrabold text-gray-800 text-xs sm:text-sm">
                Internal Loans
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold bg-gray-50/50">
                      <th className="p-3">Member</th>
                      <th className="p-3">Amount Borrowed</th>
                      <th className="p-3">Interest (10%)</th>
                      <th className="p-3">Date Borrowed</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tableBankingLoans.map((l, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-xs sm:text-sm">{l.member}</td>
                        <td className="p-3 font-extrabold text-brand-primary text-xs sm:text-sm">{formatCurrency(l.borrowed)}</td>
                        <td className="p-3 font-bold text-brand-green text-xs sm:text-sm">{formatCurrency(l.interest)}</td>
                        <td className="p-3 text-xs sm:text-sm text-gray-600">{l.date}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${l.status === 'Active' ? 'bg-brand-amber/10 text-brand-amber' : 'bg-brand-green/10 text-brand-green'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <h4 className="font-bold text-gray-800 mb-3 text-xs sm:text-sm">Meeting Attendance</h4>
              <div className="flex flex-wrap gap-4">
                {members.map(m => (
                  <label key={m.id} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
           <div className="space-y-6 animation-fade-in">
            <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Group Transactions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
               {/* Deposit */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                 <h4 className="font-extrabold text-brand-blue text-sm sm:text-base mb-1">Deposit to Group Savings</h4>
                 <p className="text-xs text-gray-500 mb-4">Post a manual deposit into this group's aggregated savings account.</p>
                 <div className="space-y-3">
                   <input type="number" placeholder="Amount (KES)" className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-brand-blue" />
                   <button onClick={() => postChamaDeposit(chama.id, { amount: 1000 }).then(() => toast.success('Deposit posted')).catch(() => toast.error('Failed to post deposit'))} className="w-full bg-brand-blue hover:bg-blue-900 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">Post Group Deposit</button>
                 </div>
               </div>

               {/* Disburse Loan */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                 <h4 className="font-extrabold text-brand-green text-sm sm:text-base mb-1">Disburse Group Loan</h4>
                 <p className="text-xs text-gray-500 mb-4">Disburse a group-guaranteed loan to the Chama's main wallet.</p>
                 <div className="space-y-3">
                   <select className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-brand-green" value={loanFormData.loanId} onChange={e => setLoanFormData({...loanFormData, loanId: e.target.value})}>
                      <option value="Group Agri-Project">Group Agri-Project - KES 250,000</option>
                      <option value="Business Expansion">Business Expansion - KES 100,000</option>
                   </select>
                   <button disabled={isSubmittingLoan} onClick={handleDisburseLoan} className="w-full bg-brand-green hover:bg-green-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                     {isSubmittingLoan ? 'Disbursing...' : 'Disburse Funds'}
                   </button>
                 </div>
               </div>

               {/* Apply Penalty */}
               <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 sm:p-5 md:col-span-2">
                 <h4 className="font-extrabold text-red-600 text-sm sm:text-base mb-1">Apply Group Penalty</h4>
                 <p className="text-xs text-gray-500 mb-4">Post a penalty fee (e.g. late submission of group returns) to the group arrears ledger.</p>
                 <div className="flex flex-col sm:flex-row gap-3">
                   <input type="number" placeholder="Penalty Amount" className="w-full sm:w-1/3 bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-red-500" />
                   <input type="text" placeholder="Reason (e.g. Late Returns)" className="w-full sm:w-2/3 bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-red-500" />
                   <button onClick={() => applyChamaPenalty(chama.id, { amount: 500, reason: 'Late' }).then(() => toast.success('Fee applied')).catch(() => toast.error('Failed to apply fee'))} className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap">Apply Fee</button>
                 </div>
               </div>
            </div>
           </div>
        )}

      </div>
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-extrabold text-brand-accent text-lg">Edit Chama Profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Group Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">County</label>
                  <input type="text" value={formData.county} onChange={(e) => setFormData({...formData, county: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting} onClick={handleEditProfile} className="flex-1 bg-brand-blue hover:bg-blue-800 text-white py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
