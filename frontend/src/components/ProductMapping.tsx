import { Package, Plus, Search, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useData } from './data';
import { createProduct } from '../api';

export function ProductMapping() {
  const { products, setProducts } = useData();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SAVINGS',
    interestRate: 0,
    maxTerm: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createProduct({
        name: formData.name,
        type: formData.type,
        interestRate: parseFloat(formData.interestRate.toString()),
        maxTerm: parseInt(formData.maxTerm.toString(), 10)
      });
      setProducts(prev => [...prev, res]);
      toast.success('Product created successfully');
      setShowModal(false);
      setFormData({ name: '', type: 'SAVINGS', interestRate: 0, maxTerm: 0 });
    } catch (err) {
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-accent/40 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-accent/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <Package className="mr-3 text-brand-accent" size={28} />
            Global CHAMA Products
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            Define system-wide financial products and map them to member onboarding defaults.
          </p>
        </div>
        <div className="relative z-10">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center text-sm font-bold text-gray-800 bg-brand-accent hover:bg-brand-accent-light px-5 py-2.5 rounded-lg shadow-md transition-colors"
          >
            <Plus size={16} className="mr-2" /> Create Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Value / Target</th>
                <th className="p-4 text-center">Onboarding Default</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((prod, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800 text-sm">{prod.name}</td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{prod.type || prod.category}</span>
                  </td>
                  <td className="p-4 text-sm font-bold text-brand-primary">{prod.interestRate ? prod.interestRate + '%' : (prod.price || '-')}</td>
                  <td className="p-4 text-center">
                    {(prod.default || prod.maxTerm > 0) ? <CheckCircle2 size={16} className="mx-auto text-brand-green" /> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="p-4 text-center">
                    {prod.active ? (
                      <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-1 rounded text-[10px] font-bold uppercase">Active</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-brand-accent text-lg">Create New Product</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Configure parameters for savings or loan products.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Product Name</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-accent outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Emergency Loan" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Type</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-accent outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="SAVINGS">Savings</option>
                  <option value="LOAN">Loan</option>
                  <option value="WELFARE">Welfare</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Interest Rate (%)</label>
                  <input required type="number" step="0.1" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-accent outline-none" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Max Term (Months)</label>
                  <input required type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-accent outline-none" value={formData.maxTerm} onChange={e => setFormData({...formData, maxTerm: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 bg-brand-accent hover:bg-brand-accent-light text-gray-800 py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
