import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { useData } from './data';
import { ArrowLeft, User, Wallet, CreditCard, ShieldCheck, FileText, CheckCircle2, TrendingUp, History, Key, DollarSign, MoreVertical, Edit2, AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { fetchLoans, fetchMembers, fetchArrearsRecords, resetMemberPassword, getMemberShares, getMemberAuditLogs, postMemberDeposit, disburseMemberLoan, applyMemberPenalty, apiFetch, deleteMember, updateMember, updateMemberStatus } from '../api';
import toast from 'react-hot-toast';

export function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { members, setMembers } = useData();
  const [activeTab, setActiveTab] = useState<'personal' | 'savings' | 'loans' | 'guarantors' | 'shares' | 'audit' | 'actions'>('personal');
  const [guaranteedLoans, setGuaranteedLoans] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string, temporaryPassword: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [shareHoldings, setShareHoldings] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [shareCapitalAmount, setShareCapitalAmount] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [memberLoans, setMemberLoans] = useState<any[]>([]);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMemberData, setEditMemberData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const themeIndex = location.state?.themeIndex ?? 0;
  
  const memberColors = [
    { bg: 'bg-gradient-to-br from-[#F97316] to-[#FB923C]' },
    { bg: 'bg-gradient-to-br from-[#16A34A] to-[#22C55E]' },
    { bg: 'bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6]' },
    { bg: 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6]' },
    { bg: 'bg-gradient-to-br from-[#EAB308] to-[#FACC15]' },
    { bg: 'bg-gradient-to-br from-[#EC4899] to-[#F472B6]' }
  ];
  const headerBgClass = memberColors[themeIndex]?.bg || memberColors[0].bg;

  const member = members.find(m => m.id === id);

  useEffect(() => {
    if (!id) return;
    fetchLoans().then(data => {
      const gl = data.filter((loan: any) => 
        loan.guarantors && loan.guarantors.some((g: any) => 
          (typeof g === 'string' && g === id) || (g.memberId && g.memberId === id)
        )
      );
      setGuaranteedLoans(gl);

      const ml = data.filter((loan: any) => loan.memberId === id);
      setMemberLoans(ml);
    }).catch(err => console.error(err));

    getMemberShares(id).then(data => data && setShareHoldings(data)).catch(console.error);
    getMemberAuditLogs(id).then(data => data && setAuditLogs(data)).catch(console.error);

  }, [id]);

  const refreshMembers = async () => {
    try {
      const membersDataRaw = await fetchMembers().catch(() => []);
      const membersData = Array.isArray(membersDataRaw) ? membersDataRaw : (membersDataRaw.data || []);
      
      const resArrears = await fetchArrearsRecords().catch(() => []);
      const arrearsData = Array.isArray(resArrears) ? resArrears : (resArrears.data || []);
      
      let finesData: any[] = [];
      try {
        const resFines = await apiFetch('/officials/discipline');
        finesData = Array.isArray(resFines) ? resFines : (resFines.data || []);
      } catch (e) {
        console.warn('Discipline endpoint failed', e);
      }

      const mappedUsers = membersData.map((u: any) => {
        const memberArrears = arrearsData.filter((a: any) => a.memberId === u.id);
        const memberFines = finesData.filter((f: any) => f.memberId === u.id);
        const totalArrears = memberArrears.reduce((sum: number, a: any) => sum + (a.amount || 0), 0) + 
                             memberFines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
        return {
          id: u.id, ledgerId: u.ledger?.id || '', name: u.name, role: u.role,
          phone: u.phone || '', joinDate: u.createdAt ? u.createdAt.split('T')[0] : '',
          status: 'Active', transactions: u.ledger?.transactions || [],
          finesList: memberFines,
          kyc: { 
            idNumber: u.idNumber || '', 
            kraPin: u.kraPin || '', 
            nextOfKin: u.nextOfKinName || '',
            nextOfKinRelation: u.nextOfKinRelation || '',
            nextOfKinPhone: u.nextOfKinPhone || '',
            address: u.address || ''
          },
          gender: u.gender || '',
          dateOfBirth: u.dateOfBirth || '',
          profilePicture: u.profilePicture, passportPhoto: u.passportPhoto,
          idDocument: u.idDocument, idFront: u.idFront, idBack: u.idBack,
          financials: {
            shares: u.ledger?.sharesBalance || 0, savings: u.ledger?.savingsBalance || 0,
            welfare: 0, fines: totalArrears, activeLoanBalance: u.ledger?.activeLoanBalance || 0,
          }
        };
      });
      setMembers(mappedUsers);
    } catch (err) { console.error('Failed to refresh members', err); }
  };

  const handleResetCredentials = async () => {
    if (!id || !window.confirm('Are you sure you want to reset this member\'s password? They will be forced to change it on their next login.')) return;
    setIsResetting(true);
    setNewCredentials(null);
    try {
      const res = await resetMemberPassword(id);
      setNewCredentials(res);
      toast.success('Credentials reset successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset credentials');
    } finally {
      setIsResetting(false);
    }
  };

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-700">Member Not Found</h2>
        <Link to="/dashboard/members" className="mt-4 text-brand-blue hover:underline">Return to Directory</Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberData) return;
    try {
      await updateMember(editMemberData.id, {
        name: editMemberData.name,
        phone: editMemberData.phone,
        role: editMemberData.role,
        officialPosition: editMemberData.officialPosition,
        category: editMemberData.category
      });
      await refreshMembers();
      toast.success('Member details updated successfully');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update member details');
    }
  };

  const handleSuspendMember = async () => {
    if (!member) return;
    const newStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
    const action = member.status === 'Suspended' ? 'activate' : 'suspend';
    
    if(window.confirm(`Are you sure you want to ${action} ${member.name}?`)) {
      try {
        await updateMemberStatus(member.id, newStatus);
        await refreshMembers();
        toast.success(`${member.name} has been ${newStatus.toLowerCase()}.`);
      } catch (error: any) {
        toast.error(`Failed to ${action} member`);
      } finally {
        setIsActionsDropdownOpen(false);
      }
    }
  };

  const handleDeleteMember = async () => {
    if (!member) return;
    if (window.confirm(`Are you absolutely sure you want to delete ${member.name}? This action cannot be undone.`)) {
      try {
        await deleteMember(member.id);
        toast.success('Member deleted successfully');
        navigate('/dashboard/members');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete member. Make sure they have no active balances.');
      } finally {
        setIsActionsDropdownOpen(false);
      }
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className={`${headerBgClass} h-28 relative`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end space-x-5">
              <div className="w-28 h-28 bg-white rounded-full shadow-lg border-4 border-white flex-shrink-0 flex items-center justify-center overflow-hidden z-10">
                 <img src={member.passportPhoto || member.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=FF5000&color=fff&size=128&bold=true`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="mb-2">
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{member.name}</h1>
                  <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center">
                    <CheckCircle2 size={14} className="mr-1" /> {member.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-accent uppercase tracking-wider">{member.role}</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mb-2 relative">
              <Link to="/dashboard/members" className="flex items-center px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors border border-gray-200 shadow-sm">
                <ArrowLeft size={16} className="mr-2" /> Back
              </Link>
              <button 
                onClick={() => setShowStatement(true)}
                className="flex items-center px-5 py-2.5 bg-brand-accent hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                <FileText size={16} className="mr-2" /> Statement
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  className="flex items-center px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
                >
                  Actions <MoreVertical size={16} className="ml-2" />
                </button>
                {isActionsDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden animation-fade-in text-left">
                    <button onClick={() => { setEditMemberData(member); setShowEditModal(true); setIsActionsDropdownOpen(false); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                      <Edit2 size={16} className="mr-3 text-gray-400" /> Edit Profile
                    </button>
                    <button onClick={handleSuspendMember} className={`flex items-center px-4 py-2.5 text-sm font-medium w-full text-left ${member.status === 'Suspended' ? 'text-brand-green hover:bg-brand-green/5' : 'text-gray-700 hover:bg-brand-amber/5 hover:text-brand-amber'}`}>
                      {member.status === 'Suspended' ? (
                        <><CheckCircle2 size={16} className="mr-3 text-brand-green" /> Activate Member</>
                      ) : (
                        <><AlertTriangle size={16} className="mr-3 text-gray-400" /> Suspend Member</>
                      )}
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleDeleteMember} className="flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 w-full text-left">
                      <Trash2 size={16} className="mr-3" /> Delete Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Savings</p>
              <p className="text-2xl font-extrabold text-gray-800">{formatCurrency(member.financials.savings)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Loan</p>
              <p className={`text-2xl font-extrabold ${member.financials.activeLoanBalance > 0 ? 'text-brand-accent' : 'text-gray-800'}`}>
                {formatCurrency(member.financials.activeLoanBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shares Capital</p>
              <p className="text-2xl font-extrabold text-gray-800">{formatCurrency(member.financials.shares)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fines & Arrears</p>
              <p className="text-2xl font-extrabold text-red-600">{formatCurrency(member.financials.fines)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 flex overflow-hidden min-h-[500px]">
        
        {/* Sidebar Nav */}
        <div className="w-56 bg-gray-50 border-r border-gray-100 p-3 space-y-1">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-white text-brand-blue shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <User size={18} className="mr-3" /> Personal & KYC
          </button>
          <button 
            onClick={() => setActiveTab('savings')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'savings' ? 'bg-white text-brand-accent shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Wallet size={18} className="mr-3" /> Savings Ledger
          </button>
          <button 
            onClick={() => setActiveTab('loans')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'loans' ? 'bg-white text-brand-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <CreditCard size={18} className="mr-3" /> Loan Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('guarantors')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'guarantors' ? 'bg-white text-brand-green shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShieldCheck size={18} className="mr-3" /> Guarantorship
          </button>
          <button 
            onClick={() => setActiveTab('shares')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'shares' ? 'bg-white text-brand-amber shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <TrendingUp size={18} className="mr-3" /> Share Capital
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-white text-gray-800 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <History size={18} className="mr-3" /> Audit Trail
          </button>
          <div className="pt-2 mt-2 border-t border-gray-200">
            <button 
              onClick={() => setActiveTab('actions')}
              className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${activeTab === 'actions' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-900 shadow-sm'}`}
            >
              <CreditCard size={18} className="mr-3" /> Transact
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          
          {activeTab === 'personal' && (
            <div className="space-y-6 animation-fade-in">
              <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Personal & KYC Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-medium text-gray-800">{member.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800">{member.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">National ID</p>
                  <p className="font-medium text-gray-800">{member.kyc.idNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">KRA PIN</p>
                  <p className="font-medium text-gray-800">{member.kyc.kraPin || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                  <p className="font-medium text-gray-800">{member.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="font-medium text-gray-800">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-KE') : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Residential Address</p>
                  <p className="font-medium text-gray-800">{member.kyc.address || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next of Kin</p>
                  <p className="font-medium text-gray-800">{member.kyc.nextOfKin || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Relationship</p>
                  <p className="font-medium text-gray-800">{member.kyc.nextOfKinRelation || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</p>
                  <p className="font-medium text-gray-800">{member.kyc.nextOfKinPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Joined</p>
                  <p className="font-medium text-gray-800">{new Date(member.joinDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              {(member.idDocument || member.idFront || member.idBack || member.passportPhoto) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">KYC Documents</h4>
                  <div className="flex gap-4 flex-wrap">
                    {[
                      { url: member.passportPhoto, label: 'Passport Photo' },
                      { url: member.idFront, label: 'ID Front' },
                      { url: member.idBack, label: 'ID Back' },
                      { url: member.idDocument, label: 'Other Document' }
                    ].filter(doc => doc.url).map((doc, idx) => (
                      <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="block w-48 h-32 rounded-lg border border-gray-200 overflow-hidden hover:border-brand-primary transition-colors relative group">
                        {doc.url.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-brand-primary">
                            <FileText size={32} className="mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">{doc.label}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] uppercase font-bold p-1 text-center backdrop-blur-sm">
                              {doc.label}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-brand-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Open Document</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-6 animation-fade-in">
              <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Savings & Contributions Ledger</h3>
              <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-5 mb-4">
                <p className="text-gray-600 text-sm">Monthly Target: <strong className="text-gray-800">KES 5,000</strong></p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-brand-accent h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-bold rounded-tl-lg">Date</th>
                      <th className="px-4 py-3 font-bold">Transaction Details</th>
                      <th className="px-4 py-3 font-bold">Reference</th>
                      <th className="px-4 py-3 font-bold text-right text-red-600">Debit (Out)</th>
                      <th className="px-4 py-3 font-bold text-right text-green-600 rounded-tr-lg">Credit (In)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...member.transactions, ...(member.finesList || [])].length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                    ) : [...member.transactions, ...(member.finesList || [])].map((t: any, idx: number) => {
                      const isDebit = t.type === 'LOAN_DISBURSEMENT' || String(t.type).includes('WITHDRAWAL') || t.type === 'FINE';
                      return (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-600">{new Date(t.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">{t.type === 'FINE' ? (t.reason || 'Penalty Fee') : t.type}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.reference || t.id?.substring(0, 8) || '-'}</td>
                          <td className="px-4 py-3 font-bold text-right text-red-600">{isDebit ? t.amount?.toLocaleString() : '-'}</td>
                          <td className="px-4 py-3 font-bold text-right text-green-600">{!isDebit ? t.amount?.toLocaleString() : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
             <div className="space-y-6 animation-fade-in">
             <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Active & Cleared Loans</h3>
             {memberLoans.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {memberLoans.map((loan, idx) => {
                   const progress = loan.amount > 0 ? ((loan.amount - (loan.balance || loan.amount)) / loan.amount) * 100 : 0;
                   return (
                     <div key={idx} className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-5">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <h4 className="font-bold text-brand-primary">{loan.type || 'Personal Loan'}</h4>
                           <p className="text-xs font-medium text-gray-500">Applied: {new Date(loan.createdAt || Date.now()).toLocaleDateString()}</p>
                           <p className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1 rounded bg-brand-primary/10 text-brand-primary inline-block">{loan.status || 'Active'}</p>
                         </div>
                         <div className="text-right">
                           <p className="font-extrabold text-lg text-gray-800">{formatCurrency(loan.balance || loan.amount)}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Balance</p>
                         </div>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                         <div className="bg-brand-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
                       </div>
                       <p className="text-xs font-bold text-gray-500 mt-2 text-right">{progress.toFixed(0)}% Repaid</p>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                 <p className="text-gray-500 font-medium">No active loans found.</p>
                 <button onClick={() => toast('Members must initiate loan applications from their portal.', { icon: 'ℹ️' })} className="mt-4 bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-dark transition-colors">Apply for Loan</button>
               </div>
             )}
           </div>
          )}

          {activeTab === 'guarantors' && (
             <div className="space-y-6 animation-fade-in">
              <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Guaranteed Loans</h3>
              {guaranteedLoans.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                      <th className="p-3">Loan ID</th>
                      <th className="p-3">Borrower</th>
                      <th className="p-3 text-right">Amount Guaranteed</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {guaranteedLoans.map((loan, idx) => {
                      const guarantorDetail = loan.guarantors?.find((g: any) => 
                        (typeof g === 'string' && g === id) || (g.memberId && g.memberId === id)
                      );
                      const amountGuaranteed = typeof guarantorDetail === 'object' && guarantorDetail.amount ? guarantorDetail.amount : loan.amount / (loan.guarantors?.length || 1);
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 text-sm font-bold text-gray-800">{loan.id}</td>
                          <td className="p-3 text-sm font-medium text-brand-blue">{loan.memberId}</td>
                          <td className="p-3 text-sm font-extrabold text-right text-gray-800">{formatCurrency(amountGuaranteed)}</td>
                          <td className="p-3 text-center">
                            <span className="bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">{loan.status || 'Active'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-gray-500 font-medium">Not guaranteeing any active loans.</p>
                </div>
              )}
             </div>
          )}

          {activeTab === 'shares' && (
             <div className="space-y-6 animation-fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-extrabold text-brand-accent">Share Capital Holdings</h3>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
                  <p className="text-xl font-extrabold text-brand-green">{formatCurrency(member.financials.shares)}</p>
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                    <th className="p-3">Date</th>
                    <th className="p-3">Transaction Type</th>
                    <th className="p-3 text-right">Shares Acquired</th>
                    <th className="p-3 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shareHoldings.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium text-gray-600">{tx.date}</td>
                      <td className="p-3 text-sm font-bold text-gray-800">{tx.type}</td>
                      <td className="p-3 text-sm font-bold text-right text-brand-primary">{tx.shares}</td>
                      <td className="p-3 text-sm font-extrabold text-right text-brand-green">{formatCurrency(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          )}

          {activeTab === 'audit' && (
             <div className="space-y-6 animation-fade-in">
              <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Audit Trail</h3>
              <div className="space-y-4">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="flex p-4 border border-gray-200 rounded-lg bg-gray-50 items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0 text-gray-500">
                      <History size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    </div>
                    <div className="ml-auto text-xs font-bold text-gray-400">
                      {log.date}
                    </div>
                  </div>
                ))}
              </div>
             </div>
          )}

          {activeTab === 'actions' && (
             <div className="space-y-6 animation-fade-in">
              <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3">Direct Transactions</h3>
              <div className="grid grid-cols-2 gap-6">
                 {/* Deposit Savings */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                   <h4 className="font-extrabold text-brand-accent mb-2">Deposit Cash / Savings</h4>
                   <p className="text-xs text-gray-500 mb-4">Post a manual deposit into this member's savings account.</p>
                   <div className="space-y-3">
                     <input type="number" placeholder="Amount (KES)" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-brand-accent" />
                     <button 
                       disabled={isPosting || !depositAmount || parseFloat(depositAmount) <= 0}
                       onClick={async () => {
                         setIsPosting(true);
                         try {
                           await postMemberDeposit(id || '', { amount: parseFloat(depositAmount) });
                           toast.success(`KES ${parseFloat(depositAmount).toLocaleString()} deposited to savings`);
                           setDepositAmount('');
                           await refreshMembers();
                         } catch { toast.error('Failed to post deposit'); }
                         finally { setIsPosting(false); }
                       }}
                       className="w-full bg-brand-accent hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                     >{isPosting ? 'Posting...' : 'Post Deposit'}</button>
                   </div>
                 </div>

                 {/* Share Capital */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                   <h4 className="font-extrabold text-brand-amber mb-2 flex items-center"><DollarSign size={16} className="mr-2" /> Share Capital Deposit</h4>
                   <p className="text-xs text-gray-500 mb-4">Post share capital / monthly contribution to this member.</p>
                   <div className="space-y-3">
                     <input type="number" placeholder="Amount (KES)" value={shareCapitalAmount} onChange={(e) => setShareCapitalAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-brand-amber" />
                     <button
                       disabled={isPosting || !shareCapitalAmount || parseFloat(shareCapitalAmount) <= 0}
                       onClick={async () => {
                         setIsPosting(true);
                         try {
                           await apiFetch(`/members/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount: parseFloat(shareCapitalAmount), type: 'SHARES' }) });
                           toast.success(`KES ${parseFloat(shareCapitalAmount).toLocaleString()} posted to share capital`);
                           setShareCapitalAmount('');
                           await refreshMembers();
                         } catch { toast.error('Failed to post share capital'); }
                         finally { setIsPosting(false); }
                       }}
                       className="w-full bg-brand-amber hover:opacity-90 text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                     >{isPosting ? 'Posting...' : 'Post Share Capital'}</button>
                   </div>
                 </div>

                 {/* Disburse Loan */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                   <h4 className="font-extrabold text-brand-green mb-2">Disburse Loan</h4>
                   <p className="text-xs text-gray-500 mb-4">Directly disburse an approved loan to their wallet.</p>
                   <div className="space-y-3">
                     <select className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-brand-green">
                        {member.financials.activeLoanBalance > 0 ? (
                           <option value="active">Active Loan - {formatCurrency(member.financials.activeLoanBalance)}</option>
                        ) : (
                           <option value="">No approved loans pending disbursement</option>
                        )}
                     </select>
                     <button disabled={member.financials.activeLoanBalance === 0 || isPosting} onClick={async () => {
                       setIsPosting(true);
                       try {
                         await disburseMemberLoan(id || '', { loanId: 'active' });
                         toast.success('Funds disbursed');
                         await refreshMembers();
                       } catch { toast.error('Failed to disburse funds'); }
                       finally { setIsPosting(false); }
                     }} className="w-full bg-brand-green hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50">{isPosting ? 'Disbursing...' : 'Disburse Funds'}</button>
                   </div>
                 </div>

                 {/* Reset Credentials */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                   <h4 className="font-extrabold text-brand-primary mb-2 flex items-center"><Key size={16} className="mr-2" /> Reset Credentials</h4>
                   <p className="text-xs text-gray-500 mb-4">Generate a new temporary password for this member.</p>
                   {newCredentials ? (
                     <div className="bg-brand-primary/10 border border-brand-primary/20 p-3 rounded-lg mt-2">
                       <p className="text-sm font-bold text-brand-primary mb-1">New Credentials Generated!</p>
                       <p className="text-xs text-gray-600 mb-1">Email: <span className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">{newCredentials.email}</span></p>
                       <p className="text-xs text-gray-600">Password: <span className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">{newCredentials.temporaryPassword}</span></p>
                       <button onClick={() => {
                         navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.temporaryPassword}`);
                         toast.success('Copied to clipboard');
                       }} className="mt-2 text-xs bg-white border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-colors text-brand-primary px-3 py-1 rounded font-bold">
                         Copy Credentials
                       </button>
                     </div>
                   ) : (
                     <button onClick={handleResetCredentials} disabled={isResetting} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                       {isResetting ? 'Resetting...' : 'Reset Password'}
                     </button>
                   )}
                 </div>

                 {/* Apply Penalty */}
                 <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 col-span-2">
                   <h4 className="font-extrabold text-red-600 mb-2">Apply Penalty Fee</h4>
                   <p className="text-xs text-gray-500 mb-4">Post a penalty fee (e.g. late meeting attendance) to their arrears ledger.</p>
                   <div className="flex gap-4">
                     <input type="number" placeholder="Penalty Amount" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-500" />
                     <input type="text" placeholder="Reason (e.g. Late Arrival)" value={penaltyReason} onChange={(e) => setPenaltyReason(e.target.value)} className="flex-[2] bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-500" />
                     <button 
                       disabled={isPosting || !penaltyAmount || parseFloat(penaltyAmount) <= 0 || !penaltyReason}
                       onClick={async () => {
                         setIsPosting(true);
                         try {
                           await applyMemberPenalty(id || '', { amount: parseFloat(penaltyAmount), reason: penaltyReason });
                           toast.success(`Penalty of KES ${parseFloat(penaltyAmount).toLocaleString()} applied`);
                           setPenaltyAmount('');
                           setPenaltyReason('');
                           await refreshMembers();
                         } catch { toast.error('Failed to apply fee'); }
                         finally { setIsPosting(false); }
                       }}
                       className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                     >{isPosting ? 'Applying...' : 'Apply Fee'}</button>
                   </div>
                  </div>

                 {/* Process Withdrawal */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 col-span-2">
                   <h4 className="font-extrabold text-gray-800 mb-2 flex items-center"><LogOut size={16} className="mr-2" /> Process Withdrawal / Exit</h4>
                   <p className="text-xs text-gray-500 mb-4">Refund savings or process a partial withdrawal for this member.</p>
                   <div className="flex gap-4">
                     <input type="number" placeholder="Amount (KES)" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-800" />
                     <button 
                       disabled={isPosting || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > member.financials.savings}
                       onClick={async () => {
                         setIsPosting(true);
                         try {
                           await new Promise(r => setTimeout(r, 1000)); // Simulated API call
                           toast.success(`Withdrawal of KES ${parseFloat(withdrawalAmount).toLocaleString()} processed`);
                           setWithdrawalAmount('');
                           await refreshMembers();
                         } catch { toast.error('Failed to process withdrawal'); }
                         finally { setIsPosting(false); }
                       }}
                       className="bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                     >{isPosting ? 'Processing...' : 'Process Withdrawal'}</button>
                   </div>
                   {parseFloat(withdrawalAmount) > member.financials.savings && (
                     <p className="text-xs text-red-500 mt-2 font-bold">Amount exceeds total savings ({formatCurrency(member.financials.savings)})</p>
                   )}
                 </div>
              </div>
             </div>
          )}

        </div>
      </div>

      {showStatement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h2 className="text-2xl font-extrabold text-brand-blue tracking-tight">TaskMe Chama</h2>
                <p className="text-sm font-bold text-gray-500 mt-1">Official Member Statement</p>
              </div>
              <button onClick={() => setShowStatement(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-end mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder</p>
                  <p className="text-lg font-extrabold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Statement Date</p>
                  <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold rounded-tl-lg">Date</th>
                    <th className="px-4 py-3 font-bold">Transaction Details</th>
                    <th className="px-4 py-3 font-bold">Reference</th>
                    <th className="px-4 py-3 font-bold text-right text-red-600">Debit (Out)</th>
                    <th className="px-4 py-3 font-bold text-right text-green-600 rounded-tr-lg">Credit (In)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...member.transactions, ...(member.finesList || [])].length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                  ) : [...member.transactions, ...(member.finesList || [])].map((t: any, idx: number) => {
                    const isDebit = t.type === 'LOAN_DISBURSEMENT' || String(t.type).includes('WITHDRAWAL') || t.type === 'FINE';
                    return (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-600">{new Date(t.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{t.type === 'FINE' ? (t.reason || 'Penalty Fee') : t.type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.reference || t.id?.substring(0, 8) || '-'}</td>
                        <td className="px-4 py-3 font-bold text-right text-red-600">{isDebit ? t.amount?.toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 font-bold text-right text-green-600">{!isDebit ? t.amount?.toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => {
                  try {
                    const csv = [
                      ['Date', 'Type', 'Reference', 'Debit', 'Credit'],
                      ...[...member.transactions, ...(member.finesList || [])].map((t: any) => {
                        const isDebit = t.type === 'LOAN_DISBURSEMENT' || String(t.type).includes('WITHDRAWAL') || t.type === 'FINE';
                        return [
                          new Date(t.createdAt || Date.now()).toLocaleDateString(),
                          t.type === 'FINE' ? (t.reason || 'Penalty Fee') : t.type,
                          t.reference || t.id?.substring(0, 8) || '-',
                          isDebit ? t.amount : 0,
                          !isDebit ? t.amount : 0
                        ];
                      })
                    ].map(e => e.join(",")).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Statement_${member.name.replace(/\\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    toast.success('Statement downloaded successfully');
                  } catch (err) {
                    toast.error('Failed to generate statement');
                  }
                }}
                className="flex items-center px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl shadow-md transition-all"
              >
                <FileText size={18} className="mr-2" /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editMemberData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 text-left">
            <h3 className="text-xl font-extrabold text-gray-800 mb-4">Edit Member Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Name</label>
                <input 
                  type="text" 
                  value={editMemberData.name} 
                  onChange={(e) => setEditMemberData({...editMemberData, name: e.target.value})} 
                  className="w-full mt-1 border-2 border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-brand-primary outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Phone</label>
                <input 
                  type="text" 
                  value={editMemberData.phone} 
                  onChange={(e) => setEditMemberData({...editMemberData, phone: e.target.value})} 
                  className="w-full mt-1 border-2 border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-brand-primary outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Role</label>
                <select 
                  value={editMemberData.role} 
                  onChange={(e) => setEditMemberData({...editMemberData, role: e.target.value})} 
                  className="w-full mt-1 border-2 border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-brand-primary outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="OFFICIAL">Official</option>
                  <option value="CHAMA_ADMIN">Chama Admin</option>
                </select>
              </div>
              {editMemberData.role === 'OFFICIAL' && (
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Official Position</label>
                  <select 
                    value={editMemberData.officialPosition || ''} 
                    onChange={(e) => setEditMemberData({...editMemberData, officialPosition: e.target.value})} 
                    className="w-full mt-1 border-2 border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-brand-primary outline-none"
                  >
                    <option value="">Select Position</option>
                    <option value="Chairperson">Chairperson</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Category</label>
                <select 
                  value={editMemberData.category} 
                  onChange={(e) => setEditMemberData({...editMemberData, category: e.target.value})} 
                  className="w-full mt-1 border-2 border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-brand-primary outline-none"
                >
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-brand-primary text-white font-bold py-2.5 rounded-xl hover:bg-brand-primary-dark shadow-md transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
