import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus, FileDown, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Filter, UploadCloud, X, FileImage, ShieldCheck, Eye, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { uploadFile, updateMemberKycAdmin, deleteMember, updateMemberStatus, updateMember } from '../api';

export function MembersDirectory() {
  const [members, setMembers] = useState<any[]>([]);
  const [operationsArrears, setOperationsArrears] = useState<any[]>([]);

  useEffect(() => {
    import('../api').then(({ fetchMembers, fetchArrearsRecords }) => {
      fetchMembers().then(setMembers).catch(console.error);
      fetchArrearsRecords().then(setOperationsArrears).catch(console.error);
    });
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        return <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Active</span>;
      case 'Suspended':
        return <span className="bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit"><AlertTriangle size={12} className="mr-1" /> Suspended</span>;
      case 'Dormant':
        return <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit">Dormant</span>;
      case 'Defaulted':
        return <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit"><XCircle size={12} className="mr-1" /> Defaulted</span>;
      default:
        return <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 size={12} className="mr-1" /> Active</span>;
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

      {/* Members Table / Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-extrabold">
                <th className="p-4">Member Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Role</th>
                <th className="p-4">Total Savings</th>
                <th className="p-4">Active Loan</th>
                <th className="p-4">Fines/Arrears</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-brand-primary/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-sm mr-3 overflow-hidden shrink-0">
                        {member.passportPhoto || member.profilePicture ? (
                          <img src={member.passportPhoto || member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <Link to={`/dashboard/members/${member.id}`} className="font-extrabold text-brand-blue hover:underline text-sm flex items-center">
                          {member.name}
                          {member.hasArrears && (
                            <span className="ml-2 inline-flex items-center text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">
                              <ShieldAlert size={10} className="mr-1" /> Arrears
                            </span>
                          )}
                        </Link>
                        <span className="text-xs text-gray-500 font-medium">{member.id} • {member.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {member.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${member.role !== 'Member' ? 'bg-brand-accent/10 text-brand-accent-light border border-brand-accent/20' : 'bg-gray-100 text-gray-600'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-gray-800">{formatCurrency(member.financials.savings)}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Shares: {formatCurrency(member.financials.shares)}</div>
                  </td>
                  <td className="p-4">
                    <span className={`font-extrabold ${member.financials.activeLoanBalance > 0 ? 'text-brand-primary' : 'text-gray-400'}`}>
                      {formatCurrency(member.financials.activeLoanBalance)}
                    </span>
                  </td>
                  <td className="p-4">
                    {member.hasArrears || member.financials.fines > 0 ? (
                      <span className="flex items-center text-red-600 font-bold text-sm">
                        <ShieldAlert size={14} className="mr-1" /> {formatCurrency(member.totalArrears > 0 ? member.totalArrears : member.financials.fines)}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-bold">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="p-4 relative">
                    <div className="flex items-center justify-center space-x-2 relative">
                      <Link 
                        to={`/dashboard/members/${member.id}`}
                        title="View Profile"
                        className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setShowUploadModal(true);
                        }}
                        title="Upload KYC Documents"
                        className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                      >
                        <UploadCloud size={18} />
                      </button>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                        className={`p-2 rounded-lg transition-colors relative ${activeDropdown === member.id ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeDropdown === member.id && (
                        <div className="absolute right-0 top-10 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[100] overflow-hidden animation-fade-in text-left">
                          <button onClick={() => { setEditMemberData(member); setShowEditModal(true); setActiveDropdown(null); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                            <Edit2 size={16} className="mr-3 text-gray-400" /> Edit Details
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-sm overflow-hidden shrink-0">
                    {member.passportPhoto || member.profilePicture ? (
                      <img src={member.passportPhoto || member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <Link to={`/dashboard/members/${member.id}`} className="font-extrabold text-brand-blue hover:underline text-sm flex items-center">
                      {member.name}
                      {member.hasArrears && (
                        <span className="ml-2 inline-flex items-center text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          <ShieldAlert size={10} className="mr-1" /> Arrears
                        </span>
                      )}
                    </Link>
                    <div className="text-xs text-gray-500 font-medium">{member.id} • {member.phone}</div>
                  </div>
                </div>
                {getStatusBadge(member.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Savings</span>
                  <span className="text-sm font-extrabold text-gray-800">{formatCurrency(member.financials.savings)}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Loan Balance</span>
                  <span className={`text-sm font-extrabold ${member.financials.activeLoanBalance > 0 ? 'text-brand-primary' : 'text-gray-400'}`}>
                    {formatCurrency(member.financials.activeLoanBalance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {member.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${member.role !== 'Member' ? 'bg-brand-accent/10 text-brand-accent-light border border-brand-accent/20' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center space-x-1 relative">
                  <Link 
                    to={`/dashboard/members/${member.id}`}
                    title="View Profile"
                    className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedMember(member);
                      setShowUploadModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                  >
                    <UploadCloud size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                    className={`p-1.5 rounded-lg transition-colors ${activeDropdown === member.id ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10'}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {activeDropdown === member.id && (
                    <div className="absolute right-0 bottom-10 mb-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[100] overflow-hidden animation-fade-in text-left">
                      <button onClick={() => { setEditMemberData(member); setShowEditModal(true); setActiveDropdown(null); }} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary w-full text-left">
                        <Edit2 size={16} className="mr-3 text-gray-400" /> Edit Details
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
          ))}
          {filteredMembers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No members found matching your search and category filter.
            </div>
          )}
        </div>
      </div>
      
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
