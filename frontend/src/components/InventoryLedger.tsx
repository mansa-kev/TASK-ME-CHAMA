import { useState } from 'react';
import { Package, Smartphone, Car, Search, Home, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, Store, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { useData } from './data';
import { createInventoryItem, assignInventoryItem, fetchInventoryItems, fetchMarketplaceItems } from '../api';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function InventoryLedger() {
  const [activeTab, setActiveTab] = useState<'stock' | 'distribution' | 'asset_finance' | 'marketplace'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const { inventory: assets, setInventory } = useData();
  const [formData, setFormData] = useState({ name: '', category: 'Electronics', price: 0, serial: '', condition: 'New', dateAcquired: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignForm, setAssignForm] = useState({ itemId: '', memberId: '' });
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  useEffect(() => {
    fetchMarketplaceItems().then(data => {
      if(data) setMarketplaceItems(data);
    }).catch(console.error);
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createInventoryItem({
        name: formData.name,
        value: parseFloat(formData.price as any) || 0,
        serialNumber: formData.serial || `SN-${Math.floor(Math.random() * 10000)}`,
        condition: formData.condition || 'NEW',
        dateAcquired: new Date(formData.dateAcquired).toISOString()
      });
      setInventory(prev => [...prev, { ...res, serial: formData.serial, condition: formData.condition, dateAcquired: formData.dateAcquired, member: 'Unassigned', progress: 0, status: 'Available' }]);
      toast.success('Product added to stock');
      setShowAddModal(false);
      setFormData({ name: '', category: 'Electronics', price: 0, serial: '', condition: 'New', dateAcquired: new Date().toISOString().split('T')[0] });
    } catch (err) {
      toast.error('Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const totalValue = assets.reduce((sum: number, a: any) => sum + (a.price || 0), 0);
  const availableItems = assets.filter((a: any) => !a.member || a.member === 'Unassigned').length;
  const assignedItems = assets.length - availableItems;



  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/20 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-accent tracking-tight">Inventory & Assets</h2>
          <p className="text-xs sm:text-sm font-medium text-brand-accent mt-1">Manage stock, distribute assets, and run the member marketplace.</p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-5 py-2.5 rounded-xl shadow-md transition-colors">
            <Plus size={16} className="mr-2" /> Add Stock Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {[
            { id: 'stock', name: 'Stock Overview', icon: Package },
            { id: 'distribution', name: 'Distribution', icon: BarChart3 },
            { id: 'asset_finance', name: 'Asset Finance', icon: LinkIcon },
            { id: 'marketplace', name: 'Marketplace', icon: Store }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-3 sm:py-4 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        
        {activeTab === 'stock' && (
          <div className="animation-fade-in p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stock Value</p>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-primary">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-brand-green/5 p-4 sm:p-5 rounded-2xl border border-brand-green/20 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Available Items</p>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-green">{availableItems}</p>
              </div>
              <div className="bg-brand-accent/5 p-4 sm:p-5 rounded-2xl border border-brand-accent/20 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Items</p>
                <p className="text-xl sm:text-2xl font-extrabold text-brand-accent">{assignedItems}</p>
              </div>
            </div>

            <div className="flex-1 max-w-sm relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search stock..." className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-brand-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                    <th className="p-3">Name / Ref</th>
                    <th className="p-3">Serial No.</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3 text-right">Value</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Date Acquired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.map((asset: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-bold text-sm text-gray-800">{asset.name}</p>
                        <p className="text-xs text-gray-500">{asset.category}</p>
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-500">{asset.serial || `SN-${Math.floor(Math.random()*10000)}`}</td>
                      <td className="p-3"><span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{asset.condition || 'New'}</span></td>
                      <td className="p-3 text-right font-extrabold text-gray-800">{formatCurrency(asset.price)}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${asset.member === 'Unassigned' || !asset.member ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-accent/10 text-brand-accent'}`}>
                          {asset.member === 'Unassigned' || !asset.member ? 'Available' : 'Assigned'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-medium">{asset.dateAcquired || '2026-07-23'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="animation-fade-in p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="font-extrabold text-gray-800 text-base sm:text-lg">Asset Distribution</h3>
              <button onClick={() => setShowAssignModal(true)} className="w-full sm:w-auto text-xs sm:text-sm font-bold text-brand-blue bg-brand-blue/10 px-4 py-2 rounded-xl hover:bg-brand-blue/20">
                Transfer/Assign Item
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Available */}
              <div className="border border-brand-green/30 bg-brand-green/5 rounded-2xl p-4">
                <h4 className="font-extrabold text-brand-green mb-4 border-b border-brand-green/20 pb-2">Available in Store ({availableItems})</h4>
                <div className="space-y-3">
                  {assets.filter((a: any) => !a.member || a.member === 'Unassigned').map((asset: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-brand-green/20">
                      <p className="font-bold text-sm text-gray-800">{asset.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{asset.serial || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned */}
              <div className="border border-brand-accent/30 bg-brand-accent/5 rounded-2xl p-4">
                <h4 className="font-extrabold text-brand-accent mb-4 border-b border-brand-accent/20 pb-2">Assigned ({assignedItems})</h4>
                <div className="space-y-3">
                  {assets.filter((a: any) => a.member && a.member !== 'Unassigned').map((asset: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-brand-accent/20">
                      <p className="font-bold text-sm text-gray-800">{asset.name}</p>
                      <p className="text-xs text-brand-accent font-bold mt-1">To: {asset.member}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance */}
              <div className="border border-red-300 bg-red-50 rounded-2xl p-4">
                <h4 className="font-extrabold text-red-600 mb-4 border-b border-red-200 pb-2">In Maintenance (0)</h4>
                <div className="text-center py-8 text-gray-400 text-xs sm:text-sm font-medium">
                  No items currently under maintenance.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'asset_finance' && (
          <div className="animation-fade-in p-4 sm:p-6">
            <h3 className="font-extrabold text-gray-800 mb-4 sm:mb-6 text-base sm:text-lg">Asset Finance Portfolio</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
                    <th className="p-3">Item / Asset</th>
                    <th className="p-3">Linked Member</th>
                    <th className="p-3 text-right">Loan Amount</th>
                    <th className="p-3 w-64">Repayment Progress</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.filter((a: any) => a.member && a.member !== 'Unassigned').map((asset: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-bold text-sm text-gray-800">{asset.name}</p>
                      </td>
                      <td className="p-3 font-bold text-brand-blue text-sm">{asset.member}</td>
                      <td className="p-3 text-right font-extrabold text-gray-800">{formatCurrency(asset.price)}</td>
                      <td className="p-3">
                        <div className="flex justify-between items-end mb-1">
                           <p className="text-[10px] font-bold text-gray-500">{asset.progress || 10}% Paid</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-brand-primary h-full rounded-full" style={{ width: `${asset.progress || 10}%` }}></div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded text-[10px] font-bold uppercase">Paying</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="animation-fade-in p-4 sm:p-6 bg-gray-50 min-h-[400px]">
            <h3 className="font-extrabold text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Member Marketplace</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {marketplaceItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                  {!item.available && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-extrabold z-10">Out of Stock</div>
                  )}
                  {item.available && (
                    <div className="absolute top-3 right-3 bg-brand-green/10 text-brand-green px-2 py-1 rounded-lg text-[10px] font-extrabold z-10">In Stock</div>
                  )}
                  <div className="h-36 sm:h-40 bg-gray-100 flex items-center justify-center text-5xl sm:text-6xl">
                    {item.image}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                    <h4 className="font-extrabold text-gray-800 text-sm mt-1 mb-3 line-clamp-1">{item.name}</h4>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500">Cash Price:</span>
                        <span className="font-extrabold text-brand-green">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500">Flex Pay:</span>
                        <span className="font-extrabold text-brand-primary">{formatCurrency(item.price * 1.1)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-500">Installments:</span>
                        <span className="font-extrabold text-brand-accent">{formatCurrency(item.price * 1.2)}</span>
                      </div>
                    </div>

                    <button disabled={!item.available} className="w-full bg-brand-blue text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-accent text-lg">Add Stock Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Product Name</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Electronics">Electronics</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Condition</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Serial Number / Reg</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Value (KES)</label>
                <input required type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-blue text-lg">Transfer / Assign Item</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Select Item</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none"
                  value={assignForm.itemId}
                  onChange={(e) => setAssignForm({ ...assignForm, itemId: e.target.value })}
                >
                  <option value="">Select Item...</option>
                  {assets.filter((a: any) => !a.member || a.member === 'Unassigned').map((asset: any, idx: number) => (
                    <option key={idx} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Assign To Member</label>
                <input 
                  type="text" 
                  placeholder="Enter Member ID..." 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue outline-none" 
                  value={assignForm.memberId}
                  onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={async () => { 
                    if (!assignForm.itemId || !assignForm.memberId) return toast.error('Fill in all fields');
                    try {
                      await assignInventoryItem(assignForm.itemId, assignForm.memberId);
                      const updated = await fetchInventoryItems().catch(() => assets);
                      setInventory(updated);
                      toast.success('Item assigned successfully'); 
                      setShowAssignModal(false); 
                      setAssignForm({ itemId: '', memberId: '' });
                    } catch (e) {
                      toast.error('Assignment failed');
                    }
                  }} 
                  className="flex-1 bg-brand-blue text-white py-2.5 rounded-lg font-bold text-sm shadow-md"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
