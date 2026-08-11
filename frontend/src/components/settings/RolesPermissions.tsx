import { Shield, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RBAC_ROLES } from '../../constants';

export function RolesPermissions() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#334155]">Roles & Permissions</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage granular access controls across your organization.</p>
        </div>
        <button 
          onClick={() => setShowRoleModal(true)}
          className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus size={16} className="mr-2" /> Add Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RBAC_ROLES.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:border-brand-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mr-3">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#334155] text-lg">{role.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    {role.scope}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                {role.capabilities}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                    U{i}
                  </div>
                ))}
              </div>
              <button className="text-xs font-bold text-brand-primary hover:underline">
                View Assigned Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-brand-primary/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-[#334155] text-lg">Create Custom Role</h3>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Role Name</label>
                <input 
                  type="text"
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:border-brand-primary outline-none" 
                  placeholder="e.g. Audit Viewer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Role Scope</label>
                <select className="w-full mt-1 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:border-brand-primary outline-none">
                  <option>System Wide</option>
                  <option>CHAMA Specific</option>
                  <option>Read Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Description / Capabilities</label>
                <textarea 
                  rows={3}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:border-brand-primary outline-none" 
                  placeholder="Brief description of permissions..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { toast.success('Role Created'); setShowRoleModal(false); }}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-md"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
