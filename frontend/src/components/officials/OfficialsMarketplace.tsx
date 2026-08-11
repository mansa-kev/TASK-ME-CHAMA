import { usePrompt } from '../common/PromptProvider';
import React, { useState, useEffect } from 'react';
import { Package, Truck, Users, Plus, Search, Tag, Box, ArrowRightLeft, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  fetchInventoryItems, createInventoryItem, assignInventoryItem, 
  fetchInventoryAllocations, createInventoryAllocation, updateInventoryItem 
} from '../../api';

export function OfficialsMarketplace() {
  const showPrompt = usePrompt();

  const [activeTab, setActiveTab] = useState<'inventory' | 'allocation'>('inventory');
  
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 0, value: 0 });

  const loadInventory = async () => {
    fetchInventoryItems().then(data => {
      if (Array.isArray(data)) setInventoryItems(data);
    }).catch(() => toast.error('Failed to load inventory'));
  };

  const loadAllocations = () => {
    fetchInventoryAllocations().then(data => {
      if (Array.isArray(data)) setAllocations(data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadInventory();
    loadAllocations();
  }, []);

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createInventoryItem({ ...newItem, unitPrice: newItem.value })
      .then(() => {
        toast.success('Item added successfully');
        setShowAddItem(false);
        setNewItem({ name: '', category: '', quantity: 0, value: 0 });
      })
      .catch(() => toast.error('Failed to add item'));
  };

  const handleNewAllocation = async () => {
    const memberName = await showPrompt("Enter Member Name to allocate asset to:");
    const asset = await showPrompt("Enter Asset Name:");
    const quantity = await showPrompt("Enter Quantity:");
    if (memberName && asset && quantity) {
      createInventoryAllocation({ memberName, item: asset, quantity: Number(quantity) })
        .then(() => {
          toast.success(`${asset} allocation for ${memberName} initiated`);
          loadAllocations();
        })
        .catch(() => toast.error('Failed to allocate asset'));
    }
  };

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + ((item.quantity || 1) * Number(item.unitPrice || item.value || 0)), 0);
  const activeAllocationsValue = allocations.filter(a => a.status !== 'Completed').reduce((sum, alloc) => sum + Number(alloc.totalCost || 0), 0);
  const membersFinancedCount = new Set(allocations.map(a => a.memberName)).size;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Asset & Inventory Finance</h1>
          <p className="text-gray-500">Manage physical items and asset-financed loans</p>
        </div>
        <button 
          onClick={activeTab === 'inventory' ? () => setShowAddItem(true) : handleNewAllocation}
          className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-brand-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'inventory' ? 'Add Item' : 'New Allocation'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
            <p className="text-xl font-bold text-gray-900">KES {totalInventoryValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-brand-accent/10 text-brand-accent rounded-lg">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Allocations</p>
            <p className="text-xl font-bold text-gray-900">KES {activeAllocationsValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-brand-green rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Members Financed</p>
            <p className="text-xl font-bold text-gray-900">{membersFinancedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-max mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'inventory' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Box className="w-4 h-4 mr-2" />
          Asset Inventory
        </button>
        <button
          onClick={() => setActiveTab('allocation')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'allocation' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Truck className="w-4 h-4 mr-2" />
          Asset Allocation
        </button>
      </div>

      {activeTab === 'inventory' && <InventoryTab items={inventoryItems} />}
      {activeTab === 'allocation' && <AllocationTab allocations={allocations} />}

      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input required type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Value (KES)</label>
                <input required type="number" value={newItem.value} onChange={e => setNewItem({...newItem, value: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddItem(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryTab({ items }: { items: any[] }) {
  const [search, setSearch] = useState('');
  
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = async (item: any) => {
    const qty = await showPrompt("Enter new quantity:", item.quantity);
    const price = await showPrompt("Enter new price:", item.unitPrice || item.value);
    if (qty !== null && price !== null) {
       updateInventoryItem(item.id, { quantity: Number(qty), unitPrice: Number(price) })
         .then(() => toast.success('Item updated'))
         .catch(() => toast.error('Failed to update item'));
    }
  };
  const handleFilter = async () => { /* Add filter logic */ };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          />
        </div>
        <button onClick={handleFilter} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (KES)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.category || item.condition || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity || 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{Number(item.unitPrice || item.value || 0).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{( (item.quantity || 1) * Number(item.unitPrice || item.value || 0) ).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(item)} className="text-brand-primary hover:text-brand-primary/80">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllocationTab({ allocations }: { allocations: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = allocations.filter(a => a.memberName.toLowerCase().includes(search.toLowerCase()) || a.item.toLowerCase().includes(search.toLowerCase()));

  const handleView = (alloc: any) => {
    toast(`Allocation Details for ${alloc.memberName}:\nItem: ${alloc.item} (Qty: ${alloc.quantity})\nCost: KES ${alloc.totalCost.toLocaleString()}\nStatus: ${alloc.status}`, { icon: '📦', duration: 5000 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search allocations..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost (KES)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((alloc) => (
              <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold mr-3">
                      {alloc.memberName.charAt(0)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{alloc.memberName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{alloc.item}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{alloc.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{alloc.totalCost.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{alloc.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                    alloc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    alloc.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alloc.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {alloc.status === 'Pending Approval' && <Clock className="w-3 h-3 mr-1" />}
                    {alloc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleView(alloc)} className="text-brand-primary hover:text-brand-primary/80">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
