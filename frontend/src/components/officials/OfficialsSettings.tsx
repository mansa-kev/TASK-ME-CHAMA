import { usePrompt } from '../common/PromptProvider';
import React, { useState, useEffect } from 'react';
import { Book, Shield, Landmark, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchOfficialsSettings, updateOfficialsSettings, assignOfficialsRole, editOfficialsRole, revokeOfficialsRole, syncOfficialsBank, updateOfficialsBankIntegration } from '../../api';

export function OfficialsSettings() {
  const showPrompt = usePrompt();

  const [activeTab, setActiveTab] = useState<'constitution' | 'roles' | 'bank'>('constitution');
  
  const [formData, setFormData] = useState({
    monthlyContribution: 5000,
    contributionDeadline: '5th of the Month',
    lateFine: 500,
    absenteeismFine: 1000
  });

  const [roles, setRoles] = useState<any[]>([]);

  const loadSettings = async () => {
    fetchOfficialsSettings()
      .then(data => {
        if (data) {
          setFormData({
            monthlyContribution: data.monthlyContribution || 5000,
            contributionDeadline: data.contributionDeadline || '5th of the Month',
            lateFine: data.lateFine || 500,
            absenteeismFine: data.absenteeismFine || 1000
          });
          if (data.roles) setRoles(data.roles);
        }
      })
      .catch(() => toast.error('Failed to fetch settings'));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    updateOfficialsSettings(formData)
      .then(() => toast.success('Settings saved successfully!'))
      .catch(() => toast.error('Failed to save settings'));
  };

  const handleAssignRole = async () => {
    const memberName = await showPrompt("Enter Member Name to assign role:");
    const role = await showPrompt("Enter Role (e.g. Chairman, Treasurer):");
    if (memberName && role) {
      assignOfficialsRole({ memberName, role })
        .then(() => {
          toast.success(`${role} role assigned to ${memberName}`);
          loadSettings();
        })
        .catch(() => toast.error('Failed to assign role'));
    }
  };
  const handleEditRole = async (roleId: string) => {
    const permissions = await showPrompt("Enter new permissions for this role (comma separated):");
    if (permissions) {
      editOfficialsRole(roleId, { permissions: permissions.split(',').map(p => p.trim()) })
        .then(() => {
          toast.success("Role permissions updated successfully");
          loadSettings();
        })
        .catch(() => toast.error('Failed to edit role'));
    }
  };
  const handleRevokeRole = async (roleId: string) => {
    if (window.confirm("Are you sure you want to revoke this role?")) {
      revokeOfficialsRole(roleId)
        .then(() => {
          toast.success("Role revoked successfully");
          loadSettings();
        })
        .catch(() => toast.error('Failed to revoke role'));
    }
  };
  const handleSyncNow = async () => {
    toast.loading('Syncing with M-PESA Paybill...', { id: 'sync' });
    syncOfficialsBank('mpesa')
      .then(() => toast.success('Syncing with M-PESA Paybill... completed', { id: 'sync' }))
      .catch(() => toast.error('Failed to sync', { id: 'sync' }));
  };
  const handleBankSettings = async () => {
    const apiKey = await showPrompt("Enter new API Key for Bank integration:");
    if (apiKey) {
      updateOfficialsBankIntegration('mpesa', { apiKey })
        .then(() => toast.success("Bank integration settings updated"))
        .catch(() => toast.error('Failed to update settings'));
    }
  };
  const handleConnectApi = async () => {
    toast.loading('Connecting via API...', { id: 'connect' });
    syncOfficialsBank('coop')
      .then(() => toast.success('Connecting via API... Success', { id: 'connect' }))
      .catch(() => toast.error('Failed to connect', { id: 'connect' }));
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Group Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure contribution rules, roles, and bank connections.</p>
        </div>
        <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors text-xs sm:text-sm shadow-sm">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('constitution')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'constitution' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Book className="w-4 h-4 mr-2" />
          Constitution & Rules
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'roles' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'bank' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Landmark className="w-4 h-4 mr-2" />
          Bank Integrations
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'constitution' && (
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-brand-primary mb-4 border-b border-gray-100 pb-2">Contribution Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Standard Monthly Contribution (KES)</label>
                  <input 
                    type="number" 
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({...formData, monthlyContribution: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contribution Deadline</label>
                  <select 
                    value={formData.contributionDeadline}
                    onChange={(e) => setFormData({...formData, contributionDeadline: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  >
                    <option>5th of the Month</option>
                    <option>10th of the Month</option>
                    <option>Last day of the Month</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-brand-primary mb-4 border-b border-gray-100 pb-2">Fines & Penalties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Contribution Fine (KES)</label>
                  <input 
                    type="number" 
                    value={formData.lateFine}
                    onChange={(e) => setFormData({...formData, lateFine: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Absenteeism Fine (KES)</label>
                  <input 
                    type="number" 
                    value={formData.absenteeismFine}
                    onChange={(e) => setFormData({...formData, absenteeismFine: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-brand-primary">Assigned Roles</h2>
              <button onClick={handleAssignRole} className="flex items-center text-sm font-medium text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20">
                <Plus className="w-4 h-4 mr-1" /> Assign Role
              </button>
            </div>
            
            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-brand-accent font-medium">{role.role}</p>
                    <div className="flex gap-2 mt-2">
                      {role.permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEditRole(role.id.toString())} className="text-sm font-medium text-brand-primary hover:underline">Edit</button>
                    <button onClick={() => handleRevokeRole(role.id.toString())} className="text-sm font-medium text-red-500 hover:underline flex items-center"><Trash2 className="w-4 h-4 mr-1"/> Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-primary mb-6">Connected Accounts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-brand-green/30 bg-brand-green/5 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ACTIVE</div>
                <h3 className="font-bold text-gray-900 mb-1">M-PESA Paybill</h3>
                <p className="text-sm text-gray-600 mb-4">Business No: 247247 • Acc: Chama123</p>
                <div className="flex gap-3">
                  <button onClick={handleSyncNow} className="text-sm font-medium text-brand-green hover:underline">Sync Now</button>
                  <button onClick={handleBankSettings} className="text-sm font-medium text-gray-500 hover:underline">Settings</button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 mb-1">Co-operative Bank</h3>
                <p className="text-sm text-gray-600 mb-4">Account: 0112345678900</p>
                <div className="flex gap-3">
                  <button onClick={handleConnectApi} className="text-sm font-medium text-brand-primary hover:underline">Connect via API</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
