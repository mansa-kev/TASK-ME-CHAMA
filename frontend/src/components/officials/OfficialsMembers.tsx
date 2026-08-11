import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, UserCheck, ShieldAlert, MoreVertical, 
  Check, X, Search, Filter, AlertCircle, FileText, CheckCircle2,
  Calendar, MapPin, AlertTriangle
} from 'lucide-react';
import { fetchOfficialsMembers, addOfficialsMember, approveOfficialsMember, rejectOfficialsMember, addOfficialsDiscipline, fetchOfficialsDiscipline } from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

export function OfficialsMembers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'directory' | 'approvals' | 'discipline'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [disciplineRecords, setDisciplineRecords] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, temporaryPassword: string} | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', role: 'MEMBER' });
  const [disciplineForm, setDisciplineForm] = useState({ memberId: '', type: 'Warning', reason: '' });

  const loadMembers = () => {
    fetchOfficialsMembers()
      .then(data => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(console.error);
      
    fetchOfficialsDiscipline()
      .then(data => {
        if (Array.isArray(data)) setDisciplineRecords(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addOfficialsMember(newMember);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success('Member added successfully');
        setCreatedCredentials({
          email: res.email || newMember.email,
          temporaryPassword: res.temporaryPassword
        });
        setIsAddModalOpen(false);
        setNewMember({ name: '', email: '', phone: '', role: 'MEMBER' });
        loadMembers();
      }
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleDisciplineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineForm.memberId || !disciplineForm.reason) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await addOfficialsDiscipline(disciplineForm);
      toast.success('Disciplinary record submitted');
      setDisciplineForm({ memberId: '', type: 'Warning', reason: '' });
      loadMembers();
    } catch (error) {
      toast.error('Failed to submit disciplinary record');
    }
  };

  const pendingMembers = members.filter(m => m.status === 'PENDING');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const query = searchQuery.toLowerCase();
      return (
        m.name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.phone?.toLowerCase().includes(query)
      );
    });
  }, [members, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your group members, approvals, and attendance.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm text-xs sm:text-sm"
        >
          <UserPlus size={16} />
          <span>Add Member Manually</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'directory'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={16} />
            Member Directory
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'approvals'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserCheck size={16} />
            Pending Approvals
            {pendingMembers.length > 0 && (
              <span className="ml-1.5 bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'discipline'
                ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShieldAlert size={18} />
            Attendance & Discipline
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative w-full sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search members by name, email or phone..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors sm:text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setSearchQuery(searchQuery ? '' : 'ACTIVE')}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-xl font-medium transition-colors ${searchQuery === 'ACTIVE' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <Filter size={18} />
                  Active Only
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {members.length === 0 ? 'Loading members...' : 'No members found.'}
                        </td>
                      </tr>
                    ) : filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold">
                              {member.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.phone || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'ACTIVE' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => navigate(`/officials/members/${member.id}`)} className="text-brand-primary hover:text-brand-primary/80 font-semibold">View Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {pendingMembers.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No pending approvals at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingMembers.map((applicant) => (
                    <div key={applicant.id} className="border border-gray-200 rounded-xl p-5 hover:border-brand-primary/30 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="h-12 w-12 bg-brand-amber/10 text-brand-amber rounded-full flex items-center justify-center font-bold text-lg">
                            {applicant.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{applicant.name}</h3>
                            <p className="text-xs text-gray-500">Applied on {new Date(applicant.appliedOn).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="bg-brand-amber/10 text-brand-amber text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pending
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{applicant.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                          <FileText size={14} className="text-gray-400" />
                          <span>{applicant.email}</span>
                        </div>
                        <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-700 mt-2 border border-gray-100 italic">
                          "{applicant.notes}"
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={async () => {
                            try {
                              await approveOfficialsMember(applicant.id);
                              toast.success(`Approved ${applicant.name}`);
                              loadMembers();
                            } catch (e) { toast.error('Failed to approve'); }
                          }}
                          className="flex-1 bg-brand-primary text-white py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await rejectOfficialsMember(applicant.id);
                              toast.success(`Rejected ${applicant.name}`);
                              loadMembers();
                            } catch (e) { toast.error('Failed to reject'); }
                          }}
                          className="flex-1 bg-white border border-gray-200 text-red-600 py-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discipline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Log Event Form */}
                <form onSubmit={handleDisciplineSubmit} className="lg:col-span-1 bg-gray-50 rounded-xl p-5 border border-gray-200 h-fit">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-brand-accent" />
                    Log Disciplinary Action
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                      <select 
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                        value={disciplineForm.memberId}
                        onChange={(e) => setDisciplineForm({ ...disciplineForm, memberId: e.target.value })}
                      >
                        <option value="">Select member...</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                      <select 
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                        value={disciplineForm.type}
                        onChange={(e) => setDisciplineForm({ ...disciplineForm, type: e.target.value })}
                      >
                        <option value="Warning">Warning</option>
                        <option value="Fine">Fine</option>
                        <option value="Suspension">Suspension</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                      <textarea 
                        required
                        rows={3} 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white" 
                        placeholder="Describe the incident..."
                        value={disciplineForm.reason}
                        onChange={(e) => setDisciplineForm({ ...disciplineForm, reason: e.target.value })}
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                      Submit Record
                    </button>
                  </div>
                </form>

                {/* History List */}
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Records</h3>
                  <div className="space-y-4">
                    {disciplineRecords.map((record) => (
                      <div key={record.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white shadow-sm">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          record.type === 'Warning' ? 'bg-brand-amber/10 text-brand-amber' : 'bg-red-100 text-red-600'
                        }`}>
                          {record.type === 'Warning' ? <AlertTriangle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{record.memberName}</h4>
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar size={12} />
                                {new Date(record.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              record.type === 'Warning' ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {record.type} {record.amount && `(KES ${record.amount})`}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{record.reason}</p>
                          {record.status && (
                            <div className="mt-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                record.status === 'Unpaid' ? 'bg-gray-100 text-gray-600' : 'bg-brand-green/10 text-brand-green'
                              }`}>
                                Status: {record.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Add New Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20"
                  value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20"
                  value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20"
                  value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-primary/20"
                  value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="MEMBER">Member</option>
                  <option value="TREASURER">Treasurer</option>
                  <option value="CHAIRMAN">Chairman</option>
                  <option value="SECRETARY">Secretary</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-brand-primary text-white py-2.5 rounded-xl font-bold hover:bg-opacity-90">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div className="mx-auto bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={32} className="text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Member Created!</h3>
              <p className="text-gray-500 text-sm mt-1">Please securely share these credentials.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1 font-medium">Email Address</div>
                <div className="text-gray-900 font-bold font-mono">{createdCredentials.email}</div>
              </div>
              <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/20">
                <div className="text-sm text-brand-primary mb-1 font-medium">Temporary Password</div>
                <div className="text-xl text-brand-primary font-black font-mono tracking-wider">{createdCredentials.temporaryPassword}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                <div className="mt-0.5">⚠️</div>
                <div>Make sure to copy this password now. It will not be shown again. The member will be required to change it on their first login.</div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
