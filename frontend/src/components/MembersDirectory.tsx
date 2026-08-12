import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, FileDown, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Filter, UploadCloud, X, FileImage, ShieldCheck, Eye, Edit2, Trash2, AlertTriangle, ArrowRight, MessageCircle, Smartphone, Send, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { uploadFile, updateMemberKycAdmin, deleteMember, updateMemberStatus, updateMember } from '../api';
import { useData } from './data';

const colorThemes = [
  { // Blue
    header: 'bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_100%)]',
    text: 'text-[#2563EB]',
    footer: 'bg-[#EFF6FF]',
    tagPrimary: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/10',
    tagSecondary: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/10',
    iconBtn: 'text-[#2563EB]'
  },
  { // Green
    header: 'bg-[linear-gradient(135deg,#16A34A_0%,#15803D_100%)]',
    text: 'text-[#16A34A]',
    footer: 'bg-[#F0FDF4]',
    tagPrimary: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/10',
    tagSecondary: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/10',
    iconBtn: 'text-[#16A34A]'
  },
  { // Purple
    header: 'bg-[linear-gradient(135deg,#7C3AED_0%,#6D28D9_100%)]',
    text: 'text-[#7C3AED]',
    footer: 'bg-[#F5F3FF]',
    tagPrimary: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/10',
    tagSecondary: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/10',
    iconBtn: 'text-[#7C3AED]'
  },
  { // Orange
    header: 'bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)]',
    text: 'text-[#F97316]',
    footer: 'bg-[#FFF7ED]',
    tagPrimary: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/10',
    tagSecondary: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/10',
    iconBtn: 'text-[#F97316]'
  },
  { // Teal
    header: 'bg-[linear-gradient(135deg,#0891B2_0%,#0E7490_100%)]',
    text: 'text-[#0891B2]',
    footer: 'bg-[#ECFEFF]',
    tagPrimary: 'bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/10',
    tagSecondary: 'bg-[#0891B2]/10 text-[#0891B2] border-[#0891B2]/10',
    iconBtn: 'text-[#0891B2]'
  },
  { // Pink
    header: 'bg-[linear-gradient(135deg,#DB2777_0%,#BE185D_100%)]',
    text: 'text-[#DB2777]',
    footer: 'bg-[#FDF2F8]',
    tagPrimary: 'bg-[#DB2777]/10 text-[#DB2777] border-[#DB2777]/10',
    tagSecondary: 'bg-[#DB2777]/10 text-[#DB2777] border-[#DB2777]/10',
    iconBtn: 'text-[#DB2777]'
  }
];

export function MembersDirectory() {
  const { members, setMembers, operationsArrears, isLoading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMessagingDropdown, setActiveMessagingDropdown] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  
  // KYC Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [uploadType, setUploadType] = useState('National ID');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center w-fit"><CheckCircle2 size={10} className="mr-1" /> Active</span>;
      case 'Suspended':
        return <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center w-fit"><AlertTriangle size={10} className="mr-1" /> Suspended</span>;
      case 'Dormant':
        return <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center w-fit">Dormant</span>;
      case 'Defaulted':
        return <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center w-fit"><XCircle size={10} className="mr-1" /> Defaulted</span>;
      default:
        return <span className="bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center w-fit"><CheckCircle2 size={10} className="mr-1" /> Active</span>;
    }
  };

  // Ensure members have a category property, if not default to 'Individual'
  const membersWithCategory = members.map(m => {
    // Check if member has active arrears
    const arrears = operationsArrears?.filter((a: any) => a.memberId === m.id) || [];
    const totalArrears = arrears.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
    
    return {
      ...m,
      category: m.category || 'Individual',
      hasArrears: arrears.length > 0,
      totalArrears,
      financials: {
        savings: m.ledger?.savingsBalance || 0,
        shares: m.ledger?.sharesBalance || 0,
        activeLoanBalance: m.ledger?.activeLoanBalance || 0,
        fines: 0
      }
    };
  });

  const filteredMembers = membersWithCategory.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportExcel = () => {
    try {
      const exportData = filteredMembers.map(m => ({
        ID: m.id,
        Name: m.name,
        Phone: m.phone,
        Category: m.category,
        Role: m.role,
        Status: m.status,
        'Total Savings (KES)': m.financials.savings,
        'Shares Capital (KES)': m.financials.shares,
        'Active Loan (KES)': m.financials.activeLoanBalance,
        'Fines/Arrears (KES)': m.totalArrears > 0 ? m.totalArrears : m.financials.fines
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members Directory');
      
      XLSX.writeFile(workbook, 'TaskMe_Chama_Members.xlsx');
      toast.success('Member directory exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel file');
      console.error(error);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMember(memberToDelete.id);
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      toast.success('Member deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete member');
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleSuspendMember = async (member: any) => {
    const newStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
    const action = member.status === 'Suspended' ? 'activate' : 'suspend';
    
    if(window.confirm(`Are you sure you want to ${action} ${member.name}?`)) {
      try {
        await updateMemberStatus(member.id, newStatus);
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        toast.success(`${member.name} has been ${newStatus.toLowerCase()}.`);
      } catch (error: any) {
        toast.error(`Failed to ${action} member`);
      } finally {
        setActiveDropdown(null);
      }
    }
  };
  
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length || !selectedMember) return;
    
    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const uploadRes = await uploadFile(file);
      
      const updateData: any = {};
      if (uploadType === 'Passport Photo') {
        updateData.passportPhoto = uploadRes.url;
      } else if (uploadType === 'National ID (Front)') {
        updateData.idFront = uploadRes.url;
      } else if (uploadType === 'National ID (Back)') {
        updateData.idBack = uploadRes.url;
      } else {
        updateData.idDocument = uploadRes.url;
      }

      await updateMemberKycAdmin(selectedMember.id, updateData);
      
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...updateData } : m));

      toast.success(`${uploadType} uploaded successfully for ${selectedMember.name}`);
      setShowUploadModal(false);
      setSelectedFileName('');
      setFilePreview(null);
      setSelectedMember(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMemberData, setEditMemberData] = useState<any>(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberData) return;
    try {
      const updated = await updateMember(editMemberData.id, {
        name: editMemberData.name,
        phone: editMemberData.phone,
        role: editMemberData.role,
        category: editMemberData.category
      });
      setMembers(prev => prev.map(m => m.id === editMemberData.id ? { ...m, ...updated } : m));
      toast.success('Member details updated successfully');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update member details');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-brand-primary/20 p-4">
        <div className="flex flex-1 max-w-2xl space-x-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search members by ID or Name..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-48">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          >
            <FileDown size={16} className="mr-2" /> Export XLSX
          </button>
          <button 
            onClick={() => navigate('/dashboard/registration/individual')}
            className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <UserPlus size={16} className="mr-2" /> Add Member
          </button>
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredMembers.map((member, index) => {
          const theme = colorThemes[index % 6];
          return (
          <div key={member.id} className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-black/5 overflow-visible flex flex-col h-full relative">
            
            {/* Header */}
            <div className={`h-[82px] p-4 flex items-start justify-between relative rounded-t-[12px] ${theme.header}`}>
              <div className="flex items-start space-x-3 w-full pr-16">
                <div className={`w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center font-bold text-lg shadow-sm border border-black/5 shrink-0 ${theme.text}`}>
                  {member.passportPhoto || member.profilePicture ? (
                    <img src={member.passportPhoto || member.profilePicture} alt={member.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                  <Link to={`/dashboard/members/${member.id}`} state={{ themeIndex: index % colorThemes.length }} className="font-bold text-white text-[15px] hover:opacity-90 transition-opacity truncate">
                    {member.name}
                  </Link>
                  <div className="text-[11px] text-white/80 leading-[14px] mt-0.5 line-clamp-2 break-all pr-2">
                    {member.id}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                {getStatusBadge(member.status)}
                {member.hasArrears && (
                  <span className="inline-flex items-center text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase border border-red-400 shadow-sm">
                    <ShieldAlert size={10} className="mr-1" /> Arrears
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="bg-white p-[12px_14px_14px] flex-grow flex flex-col">
              {/* Tags section */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.tagPrimary}`}>
                    {member.category}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${theme.tagSecondary}`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border text-gray-600 bg-gray-50 border-gray-200 truncate max-w-[120px]`}>
                    🏢 {member.chamaName || 'TaskMe Chama'}
                  </span>
                  {(member.role === 'OFFICIAL' || member.officialPosition) && member.officialPosition && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200`}>
                      ⭐ {member.officialPosition}
                    </span>
                  )}
                </div>
              </div>

              {/* Financials Grid */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-[#FAFAFC] border border-[#F0F1F5] rounded-[10px] p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-[#64748B] mb-1">SAVINGS</span>
                  <span className="text-[16px] font-bold text-[#172033] mb-1">{formatCurrency(member.financials.savings)}</span>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase">SHARES: {formatCurrency(member.financials.shares)}</span>
                </div>
                <div className="bg-[#FAFAFC] border border-[#F0F1F5] rounded-[10px] p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-[#64748B] mb-1">ACTIVE LOAN</span>
                  <span className="text-[16px] font-bold text-[#172033] mb-1">{formatCurrency(member.financials.activeLoanBalance)}</span>
                  <div className="mt-1 flex items-center">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">FINES: </span>
                    <span className={`text-[10px] font-semibold ml-1 uppercase ${(member.hasArrears || member.financials.fines > 0) ? 'text-red-500' : 'text-[#64748B]'}`}>
                      {(member.hasArrears || member.financials.fines > 0) ? formatCurrency(member.totalArrears > 0 ? member.totalArrears : member.financials.fines) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`h-[50px] px-3 rounded-b-[12px] flex items-center justify-between shrink-0 ${theme.footer}`}>
              <Link 
                to={`/dashboard/members/${member.id}`}
                state={{ themeIndex: index % colorThemes.length }}
                className={`bg-white/65 border border-black/5 rounded-lg px-4 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-white/80 transition-colors ${theme.text}`}
              >
                View Profile
              </Link>
              
              <div className="flex items-center space-x-2 border-l border-black/5 pl-3 h-[24px]">
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveMessagingDropdown(activeMessagingDropdown === member.id ? null : member.id);
                      setActiveDropdown(null);
                    }}
                    className={`p-1 hover:opacity-70 transition-opacity ${theme.iconBtn}`}
                  >
                    <MessageCircle size={18} strokeWidth={2} />
                  </button>
                  
                  {activeMessagingDropdown === member.id && (
                    <div className="absolute right-0 bottom-[calc(100%+0.5rem)] w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-1 z-[99] overflow-hidden animation-fade-in text-left">
                      <button onClick={() => { setActiveMessagingDropdown(null); toast('Inbound messaging coming soon!'); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                        <MessageSquare size={16} className="mr-3 text-gray-400" /> Inbound Messaging
                      </button>
                      <button onClick={() => { setActiveMessagingDropdown(null); window.open(`https://wa.me/${member.phone?.replace(/\D/g, '')}`, '_blank'); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 w-full text-left">
                        <Send size={16} className="mr-3 text-green-500" /> WhatsApp
                      </button>
                      <button onClick={() => { setActiveMessagingDropdown(null); toast('SMS messaging coming soon!'); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                        <Smartphone size={16} className="mr-3 text-gray-400" /> Send SMS
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === member.id ? null : member.id);
                    }}
                    className={`p-1 hover:opacity-70 transition-opacity ${theme.iconBtn}`}
                  >
                    <MoreVertical size={18} strokeWidth={2} />
                  </button>
                  
                  {activeDropdown === member.id && (
                    <div className="absolute right-0 bottom-[calc(100%+0.5rem)] w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-1 z-[99] overflow-hidden animation-fade-in text-left">
                      <button onClick={() => { setEditMemberData(member); setShowEditModal(true); setActiveDropdown(null); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                        <Edit2 size={16} className="mr-3 text-gray-400" /> Edit Details
                      </button>
                      <button onClick={() => { setSelectedMember(member); setShowUploadModal(true); setActiveDropdown(null); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                        <UploadCloud size={16} className="mr-3 text-gray-400" /> Upload KYC
                      </button>
                      <button onClick={() => handleSuspendMember(member)} className={`flex items-center px-4 py-2.5 text-sm font-medium w-full text-left ${member.status === 'Suspended' ? 'text-brand-green hover:bg-brand-green/5' : 'text-gray-700 hover:bg-brand-amber/5 hover:text-brand-amber'}`}>
                        {member.status === 'Suspended' ? (
                          <><CheckCircle2 size={16} className="mr-3 text-brand-green" /> Activate Member</>
                        ) : (
                          <><AlertTriangle size={16} className="mr-3 text-gray-400" /> Suspend Member</>
                        )}
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { setMemberToDelete(member); setActiveDropdown(null); }} className="flex items-center px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 w-full text-left">
                        <Trash2 size={16} className="mr-3" /> Delete Member
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}
        {filteredMembers.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white/50 border border-gray-200/50 rounded-2xl border-dashed">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Members Found</h3>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
      )}
      
      {/* Upload KYC Modal (Admin Override) */}
      {showUploadModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-brand-primary to-brand-blue p-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-extrabold text-lg flex items-center">
                  <ShieldCheck size={20} className="mr-2" /> Admin KYC Override
                </h3>
                <p className="text-xs text-white/80 mt-1 font-medium">Upload physical documents on behalf of {selectedMember.name}</p>
              </div>
              <button onClick={() => {
                setShowUploadModal(false);
                setSelectedFileName('');
                setFilePreview(null);
              }} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Document Type</label>
                  <select 
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                  >
                    <option value="National ID (Front)">National ID (Front)</option>
                    <option value="National ID (Back)">National ID (Back)</option>
                    <option value="Passport Photo">Passport Photo</option>
                    <option value="KRA PIN Certificate">KRA PIN Certificate</option>
                    <option value="Next of Kin ID">Next of Kin ID</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">File Upload</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-brand-primary/5 hover:border-brand-primary transition-colors flex flex-col items-center justify-center overflow-hidden"
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="max-h-32 object-contain mb-2 rounded" />
                    ) : (
                      <FileImage size={32} className={`mb-3 ${selectedFileName ? 'text-brand-primary' : 'text-gray-400'}`} />
                    )}
                    <p className="text-sm font-bold text-gray-700">
                      {selectedFileName ? selectedFileName : "Click to browse or drag and drop"}
                    </p>
                    {!selectedFileName && <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF (Max 5MB)</p>}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg, image/png, application/pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFileName(file.name);
                          if (file.type.startsWith('image/')) {
                            setFilePreview(URL.createObjectURL(file));
                          } else {
                            setFilePreview(null);
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-3 mt-4">
                  <p className="text-[11px] text-gray-600">
                    <span className="font-bold text-brand-green">Note:</span> Documents uploaded via Admin Override will instantly bypass the KYC Validation Inbox and be marked as Verified.
                  </p>
                </div>
                
              </div>
              
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFileName('');
                  setFilePreview(null);
                }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="flex-1 bg-brand-primary text-white rounded-xl py-2.5 text-sm font-bold shadow-md hover:bg-brand-primary-dark disabled:opacity-70 flex justify-center items-center">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UploadCloud size={16} className="mr-2" /> Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">Delete Member?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove <span className="font-bold text-gray-800">{memberToDelete.name}</span>? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setMemberToDelete(null)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDeleteMember} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 shadow-md transition-colors">Delete</button>
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
