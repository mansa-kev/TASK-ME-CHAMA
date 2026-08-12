import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Building, MapPin, Phone, ArrowLeft, 
  Users, Activity, Calendar, Shield, CreditCard,
  CheckCircle2, Clock, Landmark, Pencil, X, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useData } from './data';
import { updateChama, createPayment, getChamaDetails, getChamaMembers, getChamaTableBankingLoans, postChamaDeposit, applyChamaPenalty, assignChamaOfficial, addMemberToChama, createMember, fetchMembers } from '../api';

const MEETING_FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Annually'];

const formatDate = (d: any) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return 'N/A'; }
};

export function ChamaProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'loans' | 'rosca' | 'tablebanking' | 'actions'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const { chamas, setChamas, members: allMembers, setMembers, payments, setPayments } = useData();

  const foundChama = chamas.find(c => c.id === id) || chamas[0];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    county: '',
    registration: '',
    formationDate: '',
    meetingFrequency: 'Monthly',
    standardContribution: '',
    lateFine: '',
    missedFine: '',
    roscaEnabled: false,
  });

  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [loanFormData, setLoanFormData] = useState({ loanId: 'Group Agri-Project' });
  const [chamaDetails, setChamaDetails] = useState<any>(null);
  const [chamaMembers, setChamaMembers] = useState<any[]>([]);
  const [tableBanking, setTableBanking] = useState<any[]>([]);

  // Officials editing
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Transact state
  const [depositAmount, setDepositAmount] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');

  // Add member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberTab, setAddMemberTab] = useState<'assign' | 'create'>('assign');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    if (foundChama) {
      setFormData({
        name: foundChama.name || '',
        phone: foundChama.phone || '',
        county: foundChama.county || '',
        registration: foundChama.registration || '',
        formationDate: foundChama.formationDate
          ? new Date(foundChama.formationDate).toISOString().split('T')[0]
          : '',
        meetingFrequency: foundChama.meetingFrequency || foundChama.meetingFreq || 'Monthly',
        standardContribution: String(foundChama.standardContribution || foundChama.contribution || ''),
        lateFine: String(foundChama.lateFine || ''),
        missedFine: String(foundChama.missedFine || ''),
        roscaEnabled: foundChama.roscaEnabled || false,
      });
    }
  }, [foundChama]);

  const refreshChamaDetails = async () => {
    if (id) {
      const data = await getChamaDetails(id).catch(console.error);
      if (data) setChamaDetails(data);
    }
  };

  useEffect(() => {
    if (id) {
      refreshChamaDetails();
      getChamaMembers(id).then(data => data && setChamaMembers(data)).catch(console.error);
      getChamaTableBankingLoans(id).then(data => data && setTableBanking(data)).catch(console.error);
    }
  }, [id]);

  const handleEditProfile = async () => {
    if (!foundChama) return;
    setIsSubmitting(true);
    try {
      const updated = await updateChama(foundChama.id, formData);
      setChamas(prev => prev.map(c => c.id === foundChama.id ? { ...c, ...updated, registration: updated.registration, regNo: updated.registration } : c));
      await refreshChamaDetails();
      toast.success('Profile updated');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignOfficial = async (position: string) => {
    if (!assignTarget) { toast.error('Select a member'); return; }
    setIsAssigning(true);
    try {
      await assignChamaOfficial(chama.id, { memberId: assignTarget, position });
      toast.success(`${position} assigned`);
      setEditingPosition(null);
      setAssignTarget('');
      await refreshChamaDetails();
      getChamaMembers(chama.id).then(d => d && setChamaMembers(d)).catch(console.error);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign official');
    } finally {
      setIsAssigning(false);
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

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) { toast.error('Enter a valid deposit amount'); return; }
    try {
      await postChamaDeposit(chama.id, { amount: parseFloat(depositAmount) });
      toast.success('Deposit posted successfully');
      setDepositAmount('');
    } catch { toast.error('Failed to post deposit'); }
  };

  const handlePenalty = async () => {
    if (!penaltyAmount || !penaltyReason) { toast.error('Enter penalty amount and reason'); return; }
    try {
      await applyChamaPenalty(chama.id, { amount: parseFloat(penaltyAmount), reason: penaltyReason });
      toast.success('Penalty applied');
      setPenaltyAmount(''); setPenaltyReason('');
    } catch { toast.error('Failed to apply penalty'); }
  };

  const handleAssignExistingMember = async () => {
    if (!selectedMemberId) { toast.error('Select a member'); return; }
    setIsAddingMember(true);
    try {
      await addMemberToChama(chama.id, selectedMemberId);
      toast.success('Member added to group');
      setShowAddMemberModal(false);
      setSelectedMemberId('');
      const refreshed = await getChamaMembers(chama.id).catch(() => null);
      if (refreshed) setChamaMembers(refreshed);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleCreateNewMember = async () => {
    if (!newMemberForm.name || !newMemberForm.phone) { toast.error('Name and phone are required'); return; }
    setIsAddingMember(true);
    try {
      await createMember({ ...newMemberForm, chamaId: chama.id, role: 'MEMBER', email: newMemberForm.email || `${Date.now()}@taskme.local` });
      toast.success('Member created and added to group');
      setShowAddMemberModal(false);
      setNewMemberForm({ name: '', phone: '', email: '' });
      const [refreshedMembers, refreshedChamaMembers] = await Promise.all([
        fetchMembers().catch(() => null),
        getChamaMembers(chama.id).catch(() => null),
      ]);
      if (refreshedMembers) setMembers(refreshedMembers);
      if (refreshedChamaMembers) setChamaMembers(refreshedChamaMembers);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const chama = chamaDetails || foundChama || {
    id: 'GRP-000',
    name: 'Loading...',
    registration: 'N/A',
    regNo: 'N/A',
    formationDate: null,
    phone: 'N/A',
    county: 'N/A',
    status: 'Active',
    meetingFreq: 'Monthly',
    meetingFrequency: 'Monthly',
    contribution: 0,
    standardContribution: 0,
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
    leadership: {
      chairperson: null,
      chairpersonId: null,
      treasurer: null,
      treasurerId: null,
      secretary: null,
      secretaryId: null,
    }
  };

  const members = chamaMembers || [];
  const tableBankingLoans = tableBanking || [];

  // Computed table banking stats from real data
  const tbPoolAmount = tableBankingLoans.reduce((s: number, l: any) => s + (l.total || 0), 0);
  const tbInterest = tableBankingLoans.reduce((s: number, l: any) => s + (l.interest || 0), 0);

  // Members not yet in any chama (for assignment)
  const unattachedMembers = (allMembers || []).filter((m: any) => !m.chamaId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value || 0);
  };

  const OfficialRow = ({ label, position, nameKey, idKey }: { label: string; position: string; nameKey: string; idKey: string }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-xs sm:text-sm font-bold text-gray-600">{label}</span>
      {editingPosition === position ? (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <select
            value={assignTarget}
            onChange={e => setAssignTarget(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-blue bg-white"
          >
            <option value="">Select member...</option>
            {members.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name} {m.officialPosition ? `(${m.officialPosition})` : ''}</option>
            ))}
          </select>
          <button
            disabled={isAssigning}
            onClick={() => handleAssignOfficial(position)}
            className="text-xs font-bold text-white bg-brand-blue px-2.5 py-1.5 rounded-lg disabled:opacity-50"
          >
            {isAssigning ? '...' : 'Save'}
          </button>
          <button onClick={() => { setEditingPosition(null); setAssignTarget(''); }} className="text-xs text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-xs sm:text-sm font-extrabold ${chama.leadership?.[nameKey] ? 'text-brand-blue' : 'text-gray-400'}`}>
            {chama.leadership?.[nameKey] || 'Not Assigned'}
          </span>
          <button
            onClick={() => { setEditingPosition(position); setAssignTarget(chama.leadership?.[idKey] || ''); }}
            className="text-gray-300 hover:text-brand-blue transition-colors"
            title={`Assign ${label}`}
          >
            <Pencil size={13} />
          </button>
        </div>
      )}
    </div>
  );

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
                  {chama.status === 'ACTIVE' || chama.status === 'Active' ? (
                    <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center">
                      <CheckCircle2 size={12} className="mr-1" /> Active
                    </span>
                  ) : null}
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
                  <span className="font-bold text-gray-800">{chama.registration || chama.regNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Formation Date</span>
                  <span className="font-bold text-gray-800">{formatDate(chama.formationDate)}</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-2 mt-6 sm:mt-8">Leadership Roster</h3>
              <p className="text-xs text-gray-400 -mt-4">Click the pencil icon to assign or change an official.</p>
              <div className="space-y-3 sm:space-y-4">
                <OfficialRow label="Chairperson" position="Chairperson" nameKey="chairperson" idKey="chairpersonId" />
                <OfficialRow label="Treasurer" position="Treasurer" nameKey="treasurer" idKey="treasurerId" />
                <OfficialRow label="Secretary" position="Secretary" nameKey="secretary" idKey="secretaryId" />
              </div>
            </div>

            {/* Bylaws & Settings */}
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-2">Group Bylaws</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-brand-green/5 rounded-xl border border-brand-green/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Meeting Frequency</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-green">{chama.meetingFreq || chama.meetingFrequency || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Standard Contribution</span>
                  <span className="text-xs sm:text-sm font-extrabold text-gray-800">{formatCurrency(chama.contribution ?? chama.standardContribution ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Late Fine</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-primary">{formatCurrency(chama.lateFine ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Missed Meeting Fine</span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-primary">{formatCurrency(chama.missedFine ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Merry-Go-Round</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${chama.roscaEnabled ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500'}`}>
                    {chama.roscaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="animation-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Member Roster ({chama.stats?.totalMembers || members.length || 0})</h3>
              <button onClick={() => setShowAddMemberModal(true)} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-blue hover:underline">
                <UserPlus size={15} /> Add Member
              </button>
            </div>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Users size={40} className="text-gray-200 mb-3" />
                <p className="text-sm font-bold text-gray-400">No members assigned to this group yet.</p>
                <button onClick={() => setShowAddMemberModal(true)} className="mt-3 text-xs font-bold text-brand-blue hover:underline">Add the first member →</button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                      <th className="pb-3 px-4 sm:px-0">Member Name</th>
                      <th className="pb-3">Position / Role</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((m: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-3 sm:py-4 px-4 sm:px-0">
                          <span className="font-bold text-gray-800 block text-xs sm:text-sm">{m.name}</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">{m.id?.slice(0, 8)}...</span>
                        </td>
                        <td className="py-3 sm:py-4">
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-md ${m.officialPosition ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-600'}`}>
                            {m.officialPosition || m.role || 'Member'}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-600">{m.phone || 'N/A'}</td>
                        <td className="py-3 sm:py-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.status === 'ACTIVE' || m.status === 'Active' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500'}`}>
                            {m.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'loans' && (
           <div className="animation-fade-in flex flex-col items-center justify-center h-64 text-center p-4">
              <Activity size={48} className="text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Active Group Loans</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-2">
                Group loan tracking will appear here as loans are created for this Chama.
              </p>
           </div>
        )}

        {activeTab === 'rosca' && (
          <div className="animation-fade-in space-y-6">
            {chama.roscaEnabled ? (
              <>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-brand-accent">Merry-Go-Round Tracker</h3>
                  <div className="text-xs sm:text-sm font-bold text-brand-primary">Cycle {chama.stats?.cycleNumber || 1}</div>
                </div>

                <div className="bg-brand-accent/5 p-4 sm:p-6 rounded-2xl border border-brand-accent/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Recipient</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-brand-accent">{members[1]?.name || members[0]?.name || 'N/A'}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Amount</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-gray-800">{formatCurrency((chama.stats?.totalMembers || 0) * (chama.contribution || chama.standardContribution || 0))}</p>
                    </div>
                  </div>
                  
                  <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                    <span>Cycle Progress</span>
                    <span>{Math.min(2, members.length)} / {members.length} Members</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5 sm:h-3 border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-brand-accent h-full rounded-full" style={{ width: members.length ? `${(Math.min(2, members.length) / members.length) * 100}%` : '0%' }}></div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 mb-3 sm:mb-4">Rotation Sequence</h4>
                  <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-none">
                    {members.map((m: any, idx: number) => (
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
                  Enable ROSCA in Edit Profile to activate the Merry-Go-Round for this group.
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
                <p className="text-lg sm:text-xl font-extrabold text-brand-primary">{formatCurrency(tbPoolAmount)}</p>
              </div>
              <div className="bg-brand-green/5 p-4 rounded-xl border border-brand-green/20 text-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Interest Earned</p>
                <p className="text-lg sm:text-xl font-extrabold text-brand-green">{formatCurrency(tbInterest)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Members Present</p>
                <p className="text-lg sm:text-xl font-extrabold text-gray-800">{members.length} / {members.length}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200 font-extrabold text-gray-800 text-xs sm:text-sm">
                Meeting Collections
              </div>
              {tableBankingLoans.length === 0 ? (
                <div className="p-8 text-center">
                  <Landmark size={36} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-bold">No meeting collections recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold bg-gray-50/50">
                        <th className="p-3">Date</th>
                        <th className="p-3">Total Collected</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableBankingLoans.map((l: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 text-xs sm:text-sm text-gray-600">{formatDate(l.date)}</td>
                          <td className="p-3 font-extrabold text-brand-primary text-xs sm:text-sm">{formatCurrency(l.total)}</td>
                          <td className="p-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${l.status === 'POSTED' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-amber/10 text-brand-amber'}`}>
                              {l.status || 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                   <input
                     type="number"
                     placeholder="Amount (KES)"
                     value={depositAmount}
                     onChange={e => setDepositAmount(e.target.value)}
                     className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-brand-blue"
                   />
                   <button
                     onClick={handleDeposit}
                     disabled={!depositAmount}
                     className="w-full bg-brand-blue hover:bg-blue-900 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                   >
                     Post Group Deposit
                   </button>
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
                 <p className="text-xs text-gray-500 mb-4">Post a penalty fee to the group arrears ledger.</p>
                 <div className="flex flex-col sm:flex-row gap-3">
                   <input
                     type="number"
                     placeholder="Penalty Amount (KES)"
                     value={penaltyAmount}
                     onChange={e => setPenaltyAmount(e.target.value)}
                     className="w-full sm:w-1/3 bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-red-500"
                   />
                   <input
                     type="text"
                     placeholder="Reason (e.g. Late Returns)"
                     value={penaltyReason}
                     onChange={e => setPenaltyReason(e.target.value)}
                     className="w-full sm:w-2/3 bg-white border border-gray-200 rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:border-red-500"
                   />
                   <button
                     onClick={handlePenalty}
                     disabled={!penaltyAmount || !penaltyReason}
                     className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                   >
                     Apply Fee
                   </button>
                 </div>
               </div>
            </div>
           </div>
        )}

      </div>

      {/* ─── Edit Profile Modal ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-accent text-lg">Edit Chama Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Group Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Group Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" />
              </div>

              {/* Registration + Formation Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Registration Number</label>
                  <input type="text" value={formData.registration} onChange={e => setFormData({...formData, registration: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Formation Date</label>
                  <input type="date" value={formData.formationDate} onChange={e => setFormData({...formData, formationDate: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" />
                </div>
              </div>

              {/* Phone + County */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">County</label>
                  <input type="text" value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" />
                </div>
              </div>

              {/* Meeting Frequency + Standard Contribution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Meeting Frequency</label>
                  <select value={formData.meetingFrequency} onChange={e => setFormData({...formData, meetingFrequency: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none bg-white">
                    {MEETING_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Standard Contribution (KES)</label>
                  <input type="number" value={formData.standardContribution} onChange={e => setFormData({...formData, standardContribution: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" placeholder="0" />
                </div>
              </div>

              {/* Late Fine + Missed Fine */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Late Fine (KES)</label>
                  <input type="number" value={formData.lateFine} onChange={e => setFormData({...formData, lateFine: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Missed Meeting Fine (KES)</label>
                  <input type="number" value={formData.missedFine} onChange={e => setFormData({...formData, missedFine: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue outline-none" placeholder="0" />
                </div>
              </div>

              {/* ROSCA Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-gray-700">Merry-Go-Round (ROSCA)</p>
                  <p className="text-xs text-gray-400">Enable rotation-based payouts for this group</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, roscaEnabled: !formData.roscaEnabled})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.roscaEnabled ? 'bg-brand-green' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.roscaEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-4">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button disabled={isSubmitting} onClick={handleEditProfile} className="flex-1 bg-brand-blue hover:bg-blue-800 text-white py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Member Modal ─── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-accent text-base">Add Member to Group</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setAddMemberTab('assign')}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${addMemberTab === 'assign' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-400'}`}
              >
                Assign Existing Member
              </button>
              <button
                onClick={() => setAddMemberTab('create')}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${addMemberTab === 'create' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-400'}`}
              >
                Create New Member
              </button>
            </div>

            <div className="p-6">
              {addMemberTab === 'assign' ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Select a member who is not yet assigned to any Chama group.</p>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Member</label>
                    <select
                      value={selectedMemberId}
                      onChange={e => setSelectedMemberId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-blue bg-white"
                    >
                      <option value="">Select a member...</option>
                      {unattachedMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} — {m.phone || m.email}</option>
                      ))}
                    </select>
                    {unattachedMembers.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">All registered members are already assigned to groups.</p>
                    )}
                  </div>
                  <button
                    disabled={isAddingMember || !selectedMemberId}
                    onClick={handleAssignExistingMember}
                    className="w-full bg-brand-blue hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {isAddingMember ? 'Adding...' : 'Add to Group'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Create a new member and automatically add them to this group.</p>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Full Name *</label>
                    <input type="text" value={newMemberForm.name} onChange={e => setNewMemberForm({...newMemberForm, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-blue" placeholder="Jane Wanjiku" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Phone *</label>
                    <input type="tel" value={newMemberForm.phone} onChange={e => setNewMemberForm({...newMemberForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-blue" placeholder="0712345678" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Email</label>
                    <input type="email" value={newMemberForm.email} onChange={e => setNewMemberForm({...newMemberForm, email: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-blue" placeholder="jane@example.com" />
                  </div>
                  <button
                    disabled={isAddingMember || !newMemberForm.name || !newMemberForm.phone}
                    onClick={handleCreateNewMember}
                    className="w-full bg-brand-green hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {isAddingMember ? 'Creating...' : 'Create & Add to Group'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
