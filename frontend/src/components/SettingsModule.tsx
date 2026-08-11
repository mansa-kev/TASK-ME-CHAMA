import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Shield, Globe, User, Percent, Database, 
  UsersRound, Plus, Edit, Lock, Unlock, Mail, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  fetchProducts, 
  createProduct, 
  updateProduct,
  fetchUsers, 
  updateUserRole, 
  updateUserProfile,
  fetchRoles, 
  createRole, 
  updateRole,
  fetchSystemConstants, 
  createSystemConstant, 
  updateSystemConstant,
  deleteSystemConstant,
  fetchMemberTypes, 
  createMemberType,
  deleteMemberType,
  deleteProduct,
  deleteRole,
  getUser,
  toggleUserLock,
  resetUserPassword
} from '../api';
import { format } from 'date-fns';

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState('sacco_setup');

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <Settings className="mr-3 text-gray-700" size={28} />
            System Administration
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            Configure global parameters, users, roles, and settings.
          </p>
        </div>
      </div>
      
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <TabButton active={activeTab === 'sacco_setup'} onClick={() => setActiveTab('sacco_setup')} icon={<Globe size={18} />} label="SACCO Setup" />
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Database size={18} />} label="Products" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="User Management" />
            <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')} icon={<Shield size={18} />} label="Roles & Permissions" />
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="My Profile" />
            <TabButton active={activeTab === 'rates'} onClick={() => setActiveTab('rates')} icon={<Percent size={18} />} label="Rates" />
            <TabButton active={activeTab === 'constants'} onClick={() => setActiveTab('constants')} icon={<Settings size={18} />} label="Constants" />
            <TabButton active={activeTab === 'member_types'} onClick={() => setActiveTab('member_types')} icon={<UsersRound size={18} />} label="Member Types" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'sacco_setup' && <SaccoSetupTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'roles' && <RolesTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'rates' && <RatesTab />}
          {activeTab === 'constants' && <ConstantsTab />}
          {activeTab === 'member_types' && <MemberTypesTab />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center px-5 py-4 text-sm font-bold border-l-4 transition-colors text-left ${active ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
    >
      <span className="mr-3">{icon}</span> {label}
    </button>
  );
}

// ==========================================
// TABS
// ==========================================

function SaccoSetupTab() {
  const [org, setOrg] = useState({ name: '', phone: '', email: '', address: '', county: '', taxPin: '', currency: 'KES' });
  const [constantId, setConstantId] = useState<string|null>(null);
  
  useEffect(() => {
    const load = async () => {
      try {
        const constants = await fetchSystemConstants();
        const setup = constants.find((c: any) => c.key === 'SACCO_SETUP');
        if (setup) {
          setConstantId(setup.id);
          try { setOrg(JSON.parse(setup.value)); } catch(e){}
        }
      } catch(e) {}
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      if (constantId) {
        await updateSystemConstant(constantId, { value: JSON.stringify(org) });
      } else {
        const res = await createSystemConstant({ key: 'SACCO_SETUP', value: JSON.stringify(org), description: 'Global SACCO configuration' });
        setConstantId(res.id);
      }
      toast.success('SACCO setup saved successfully');
    } catch(e) { toast.error('Failed to save setup'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3 mb-6 flex items-center">
        <Globe className="mr-2 text-brand-primary" size={20} /> Organization Details
      </h3>
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer group">
            <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-center px-2">Upload<br/>Logo</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputField label="Organization Name" value={org.name} onChange={(e: any) => setOrg({...org, name: e.target.value})} />
          <InputField label="Tax PIN (KRA)" value={org.taxPin} onChange={(e: any) => setOrg({...org, taxPin: e.target.value})} />
          <InputField label="Email" type="email" value={org.email} onChange={(e: any) => setOrg({...org, email: e.target.value})} />
          <InputField label="Phone" value={org.phone} onChange={(e: any) => setOrg({...org, phone: e.target.value})} />
          <InputField label="Address" value={org.address} onChange={(e: any) => setOrg({...org, address: e.target.value})} />
          <InputField label="County" value={org.county} onChange={(e: any) => setOrg({...org, county: e.target.value})} />
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Currency</label>
            <select value={org.currency} onChange={e => setOrg({...org, currency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none transition-colors">
              <option value="KES">KES - Kenya Shillings</option>
              <option value="USD">USD - US Dollars</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSave} className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-brand-primary-dark transition-colors shadow-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'LOAN', interestRate: '', maxTerm: '', status: 'ACTIVE' });

  const load = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data || []);
    } catch(e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(formData);
      toast.success('Product created');
      setShowModal(false);
      load();
    } catch(e) {
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-extrabold text-brand-accent flex items-center">
          <Database className="mr-2 text-brand-green" size={20} /> Products
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={16} className="mr-2" /> Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4 font-bold">Name</th>
              <th className="py-3 px-4 font-bold">Type</th>
              <th className="py-3 px-4 font-bold">Interest Rate</th>
              <th className="py-3 px-4 font-bold">Max Term</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-3 px-4 text-sm font-bold text-gray-800">{p.name}</td>
                <td className="py-3 px-4 text-sm font-medium">{p.type}</td>
                <td className="py-3 px-4 text-sm font-medium text-brand-green">{p.interestRate}%</td>
                <td className="py-3 px-4 text-sm font-medium">{p.maxTerm} mos</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${p.status === 'ACTIVE' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-right">
                  <div className="flex justify-end gap-2 text-gray-400">
                    <button onClick={() => {
                        const newName = prompt('Enter new product name:', p.name);
                        if (newName && newName !== p.name) {
                          updateProduct(p.id, { ...p, name: newName }).then(() => { toast.success('Product updated'); load(); });
                        }
                    }} className="hover:text-brand-primary transition-colors p-1" title="Edit"><Edit size={16} /></button>
                    <button 
                      className="hover:text-red-500 transition-colors p-1" 
                      title="Delete"
                      onClick={async () => {
                        if (confirm('Delete this product?')) {
                          try {
                            await deleteProduct(p.id);
                            toast.success('Product deleted');
                            load();
                          } catch { toast.error('Failed to delete product'); }
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No products found. Add your first product.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add Product" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Name" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} required />
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
                <option value="LOAN">LOAN</option>
                <option value="SAVINGS">SAVINGS</option>
              </select>
            </div>
            <InputField label="Interest Rate (%)" type="number" step="0.01" value={formData.interestRate} onChange={(e:any) => setFormData({...formData, interestRate: e.target.value})} required />
            <InputField label="Max Term (Months)" type="number" value={formData.maxTerm} onChange={(e:any) => setFormData({...formData, maxTerm: e.target.value})} required />
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-brand-primary-dark transition-colors">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const load = async () => {
    try { setUsers(await fetchUsers() || []); } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role);
      toast.success('Role updated successfully');
      load();
    } catch(e) { toast.error('Failed to update role'); }
  };

  const ROLES = ['TCM_SUPER_ADMIN', 'CHAMA_ADMIN', 'MEMBER', 'CREDIT_OFFICER', 'ACCOUNTANT', 'FIELD_AGENT'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3 mb-6 flex items-center">
        <Users className="mr-2 text-brand-amber" size={20} /> User Management
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4 font-bold">Name</th>
              <th className="py-3 px-4 font-bold">Email / Phone</th>
              <th className="py-3 px-4 font-bold">Role</th>
              <th className="py-3 px-4 font-bold">Date Joined</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm font-bold text-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    {u.firstName} {u.lastName}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="font-medium text-gray-800">{u.email}</div>
                  <div className="text-xs text-gray-400">{u.phone}</div>
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={u.role || 'MEMBER'} 
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-brand-primary cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 font-medium">{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-3 text-gray-400">
                    <button 
                      onClick={async () => {
                        try {
                          await toggleUserLock(u.id);
                          toast.success(`User ${u.locked ? 'unlocked' : 'locked'}`);
                          load();
                        } catch(e) { toast.error('Failed to toggle lock'); }
                      }}
                      className="hover:text-brand-amber transition-colors p-1 bg-white border border-gray-200 rounded shadow-sm" title="Lock/Unlock User">
                      {u.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const res = await resetUserPassword(u.id);
                          toast.success(`Password reset. Temp pass: ${res.tempPassword}`, { duration: 6000 });
                        } catch(e) { toast.error('Failed to reset password'); }
                      }}
                      className="hover:text-brand-primary transition-colors p-1 bg-white border border-gray-200 rounded shadow-sm" title="Reset Password">
                      <Mail size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RolesTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string|null>(null);
  
  const load = async () => {
    try { setRoles(await fetchRoles() || []); } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  const PERMISSION_CATEGORIES = ['Members', 'Loans', 'Payments', 'Reports', 'Settings', 'Communication', 'Accounts'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-extrabold text-brand-accent flex items-center">
          <Shield className="mr-2 text-brand-primary" size={20} /> Roles & Permissions
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={16} className="mr-2" /> Create Role
        </button>
      </div>

      <div className="space-y-4">
        {roles.map(role => (
          <div key={role.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
            <div 
              className="p-5 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-800 text-base">{role.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{role.description || 'Custom role with specific permissions'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
                  {role.permissions?.length || 0} Permissions
                </div>
                <button 
                  className="text-gray-400 hover:text-red-500 p-1" 
                  title="Delete Role"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this role?')) {
                      try {
                        await deleteRole(role.id);
                        toast.success('Role deleted');
                        load();
                      } catch { toast.error('Failed to delete role'); }
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {expandedRole === role.id && (
              <div className="p-6 border-t border-gray-200 bg-white animation-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {PERMISSION_CATEGORIES.map(cat => (
                    <div key={cat} className="space-y-3">
                      <h5 className="text-xs font-extrabold text-brand-accent border-b border-gray-100 pb-1">{cat}</h5>
                      <div className="space-y-2" id={`role-perms-${role.id}`}>
                        {['Read', 'Write', 'Approve', 'Delete'].map(act => {
                          const permStr = `${cat}_${act}`.toUpperCase();
                          const isChecked = role.permissions?.includes(permStr) || false;
                          return (
                            <label key={act} className="flex items-center text-sm text-gray-700 font-medium cursor-pointer group">
                              <input type="checkbox" name="permission" value={permStr} className="mr-2.5 w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" defaultChecked={isChecked} /> 
                              <span className="group-hover:text-brand-primary transition-colors">{act}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end">
                  <button onClick={async () => {
                     try {
                        const container = document.getElementById(`role-perms-${role.id}`);
                        if (!container) return;
                        const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="permission"]');
                        const selectedPerms = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
                        await updateRole(role.id, { description: role.description || "Updated", permissions: selectedPerms });
                        toast.success('Permissions updated'); 
                        setExpandedRole(null);
                        load();
                     } catch { toast.error('Failed to update permissions'); }
                  }} className="text-sm font-bold bg-brand-primary hover:bg-brand-primary-dark text-white px-6 py-2 rounded-lg transition-colors shadow-sm">
                    Save Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {roles.length === 0 && <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-300">No custom roles defined yet. Create one to get started.</div>}
      </div>

      {showModal && (
        <Modal title="Create Custom Role" onClose={() => setShowModal(false)}>
           <form onSubmit={async (e) => {
             e.preventDefault();
             try {
               const form = e.target as any;
               await createRole({ name: form.roleName.value, description: form.desc.value });
               toast.success('Role created successfully');
               setShowModal(false);
               load();
             } catch(err) { toast.error('Failed to create role'); }
           }} className="space-y-4">
             <InputField name="roleName" label="Role Name" placeholder="e.g. Audit Viewer" required />
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Description / Capabilities</label>
                <textarea name="desc" rows={3} placeholder="Brief description of what this role can do..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none resize-none"></textarea>
             </div>
             <div className="pt-4 flex gap-3">
               <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
               <button type="submit" className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-brand-primary-dark transition-colors">Create Role</button>
             </div>
           </form>
        </Modal>
      )}
    </div>
  );
}

function ProfileTab() {
  const [profile, setProfile] = useState<any>({});
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    const fetchProf = async () => {
      try {
        const u = await getUser();
        if (u) setProfile(u);
      } catch(e) {}
    };
    fetchProf();
  }, []);

  const handleUpdate = async () => {
    try {
      await updateUserProfile(profile.id, { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone });
      toast.success('Profile updated successfully');
    } catch { toast.error('Update failed'); }
  };

  const handlePassword = async () => {
    try {
      if (!password) return toast.error('Enter password');
      await updateUserProfile(profile.id, { password });
      toast.success('Password updated securely');
      setPassword('');
    } catch { toast.error('Password update failed'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <h3 className="text-lg font-extrabold text-brand-accent border-b border-gray-100 pb-3 mb-6 flex items-center">
        <User className="mr-2 text-gray-500" size={20} /> My Profile
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-5">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Personal Information</h4>
          <InputField label="First Name" value={profile.firstName || ''} onChange={(e: any) => setProfile({...profile, firstName: e.target.value})} />
          <InputField label="Last Name" value={profile.lastName || ''} onChange={(e: any) => setProfile({...profile, lastName: e.target.value})} />
          <InputField label="Email Address" type="email" value={profile.email || ''} onChange={() => {}} disabled />
          <InputField label="Phone Number" value={profile.phone || ''} onChange={(e: any) => setProfile({...profile, phone: e.target.value})} />
          <div className="pt-2">
            <button onClick={handleUpdate} className="bg-brand-primary hover:bg-brand-primary-dark text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
              Update Profile
            </button>
          </div>
        </div>
        
        <div className="space-y-5 relative">
          <div className="hidden md:block absolute left-[-20px] top-0 bottom-0 w-px bg-gray-100"></div>
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">Security & Password</h4>
          <InputField label="New Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="••••••••" />
          <div className="pt-2">
            <button onClick={handlePassword} className="bg-brand-accent hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatesTab() {
  const [products, setProducts] = useState<any[]>([]);
  const load = async () => {
    try { setProducts(await fetchProducts() || []); } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  const handleSaveRates = async () => {
    try {
      await Promise.all(products.map(p => updateProduct(p.id, { interestRate: Number(p.interestRate) })));
      toast.success('Rates updated successfully');
      load();
    } catch(e) { toast.error('Failed to update rates'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-extrabold text-brand-accent flex items-center">
          <Percent className="mr-2 text-brand-primary" size={20} /> Interest Rates Configuration
        </h3>
        <button onClick={handleSaveRates} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-5 py-2 rounded-lg transition-colors shadow-sm">
          Save All Changes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4 font-bold">Product Name</th>
              <th className="py-3 px-4 font-bold">Type</th>
              <th className="py-3 px-4 font-bold">Current Rate (%)</th>
              <th className="py-3 px-4 font-bold">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm font-bold text-gray-800">{p.name}</td>
                <td className="py-4 px-4 text-sm font-medium">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.type === 'LOAN' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{p.type}</span>
                </td>
                <td className="py-4 px-4 text-sm">
                  <div className="flex items-center max-w-[120px]">
                    <input type="number" step="0.1" value={p.interestRate} onChange={(e) => {
                      const newProds = [...products];
                      const idx = newProds.findIndex(x => x.id === p.id);
                      if (idx > -1) newProds[idx].interestRate = e.target.value;
                      setProducts(newProds);
                    }} className="w-20 bg-white border border-gray-300 rounded-l-lg px-3 py-1.5 text-sm font-bold focus:border-brand-primary outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 py-1.5 text-sm font-bold text-gray-500">%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 font-medium">Today</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">No products available to configure rates.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConstantsTab() {
  const [constants, setConstants] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const load = async () => {
    try { setConstants(await fetchSystemConstants() || []); } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  const handleUpdate = async (id: string, value: string) => {
    try {
      await updateSystemConstant(id, { value });
      toast.success('Constant updated successfully');
      load();
    } catch(e) { toast.error('Failed to update constant'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-extrabold text-brand-accent flex items-center">
          <Settings className="mr-2 text-gray-600" size={20} /> System Constants
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={16} className="mr-2" /> Add Constant
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
              <th className="py-3 px-4 font-bold w-1/4">Key</th>
              <th className="py-3 px-4 font-bold w-1/4">Value</th>
              <th className="py-3 px-4 font-bold w-2/4">Description</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {constants.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 px-4 text-sm font-bold text-brand-accent font-mono">{c.key}</td>
                <td className="py-4 px-4 text-sm">
                   <input 
                     defaultValue={c.value} 
                     onBlur={(e) => { if(e.target.value !== c.value) handleUpdate(c.id, e.target.value); }}
                     className="bg-transparent border-b border-dashed border-gray-400 focus:border-solid focus:border-brand-primary focus:bg-white px-2 py-1 outline-none w-full font-mono text-gray-800 transition-all"
                   />
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{c.description}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-xs font-bold text-brand-primary hover:text-white hover:bg-brand-primary px-3 py-1 rounded transition-colors border border-transparent hover:border-brand-primary">Save</button>
                    <button 
                      className="text-gray-400 hover:text-red-500 p-1" 
                      title="Delete Constant"
                      onClick={async () => {
                        if (confirm('Delete this constant?')) {
                          try {
                            await deleteSystemConstant(c.id);
                            toast.success('Constant deleted');
                            load();
                          } catch { toast.error('Failed to delete constant'); }
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {constants.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">No system constants defined.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add System Constant" onClose={() => setShowModal(false)}>
           <form onSubmit={async (e) => {
             e.preventDefault();
             try {
               await createSystemConstant({ 
                 key: (e.target as any).keyField.value, 
                 value: (e.target as any).valField.value,
                 description: (e.target as any).descField.value 
               });
               toast.success('Constant created successfully');
               setShowModal(false);
               load();
             } catch(err) { toast.error('Failed to create constant'); }
           }} className="space-y-4">
             <InputField name="keyField" label="Key (e.g. MAX_LOGIN_ATTEMPTS)" placeholder="Uppercase with underscores" required />
             <InputField name="valField" label="Value" placeholder="Numeric or string value" required />
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Description</label>
                <textarea name="descField" rows={2} placeholder="What is this constant used for?" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none resize-none"></textarea>
             </div>
             <div className="pt-4 flex gap-3">
               <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
               <button type="submit" className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-brand-primary-dark transition-colors">Save Constant</button>
             </div>
           </form>
        </Modal>
      )}
    </div>
  );
}

function MemberTypesTab() {
  const [types, setTypes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const load = async () => {
    try { setTypes(await fetchMemberTypes() || []); } catch(e) {}
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animation-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-extrabold text-brand-accent flex items-center">
          <UsersRound className="mr-2 text-brand-blue" size={20} /> Member Types & Tiers
        </h3>
        <button onClick={() => setShowModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={16} className="mr-2" /> Add Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map(t => (
          <div key={t.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:border-brand-primary hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-primary/10 to-transparent rounded-bl-full group-hover:from-brand-primary/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-extrabold text-gray-800 text-xl">{t.name}</h4>
              <button 
                className="text-gray-400 hover:text-red-500 p-1 z-10 relative" 
                title="Delete Tier"
                onClick={async () => {
                  if (confirm('Delete this tier?')) {
                    try {
                      await deleteMemberType(t.id);
                      toast.success('Tier deleted');
                      load();
                    } catch { toast.error('Failed to delete tier'); }
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium text-gray-500">Min Shares</span> 
                <span className="font-bold text-brand-primary">{t.minShares?.toLocaleString()} KES</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                <span className="font-medium text-gray-500">Loan Multiplier</span> 
                <span className="font-bold text-brand-accent">{t.maxLoanMultiplier}x</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Benefits</span>
                <p className="text-sm text-gray-700 italic">{t.benefits || 'Standard system benefits apply to this tier.'}</p>
              </div>
            </div>
          </div>
        ))}
        {types.length === 0 && <div className="col-span-full text-center py-12 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-300">No member tiers defined. Add one to categorize your members.</div>}
      </div>

      {showModal && (
        <Modal title="Add Member Tier" onClose={() => setShowModal(false)}>
           <form onSubmit={async (e) => {
             e.preventDefault();
             try {
               await createMemberType({ 
                 name: (e.target as any).nameF.value, 
                 minShares: Number((e.target as any).minSharesF.value),
                 maxLoanMultiplier: Number((e.target as any).multF.value),
                 benefits: (e.target as any).benF.value 
               });
               toast.success('Member tier created successfully');
               setShowModal(false);
               load();
             } catch(err) { toast.error('Failed to create member tier'); }
           }} className="space-y-4">
             <InputField name="nameF" label="Tier Name" placeholder="e.g. Gold, Premium, Basic" required />
             <div className="grid grid-cols-2 gap-4">
                <InputField name="minSharesF" label="Minimum Shares" type="number" placeholder="0" required />
                <InputField name="multF" label="Loan Multiplier" type="number" step="0.1" placeholder="e.g. 3.0" required />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold text-gray-600 uppercase">Key Benefits</label>
               <textarea name="benF" rows={3} placeholder="List main benefits of this tier..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none resize-none"></textarea>
             </div>
             <div className="pt-4 flex gap-3">
               <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
               <button type="submit" className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-brand-primary-dark transition-colors">Save Tier</button>
             </div>
           </form>
        </Modal>
      )}
    </div>
  );
}

// ==========================================
// UTILITY COMPONENTS
// ==========================================

function InputField({ label, name, value, onChange, type = "text", required, placeholder, ...rest }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</label>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-primary outline-none focus:ring-1 focus:ring-brand-primary/50 transition-shadow"
        {...rest}
      />
    </div>
  );
}

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animation-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-brand-primary/20 overflow-hidden transform transition-all">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-extrabold text-gray-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
