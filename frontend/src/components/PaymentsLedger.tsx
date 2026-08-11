import { useState } from 'react';
import { ArrowRightLeft, ArrowDownRight, ArrowUpRight, Search, Download, Filter, CheckCircle2, XCircle, Clock, FileText, Upload, Plus, FileSignature, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useData } from './data';
import { createPayment, deletePayment, uploadFile } from '../api';

export function PaymentsLedger() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inbound' | 'outbound' | 'reconciliation' | 'invoicing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const { payments, setPayments } = useData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, narration: '', method: 'M-Pesa' });
  const [outboundData, setOutboundData] = useState({ recipient: '', amount: 0, purpose: 'Loan Disbursement' });
  
  const [invoiceData, setInvoiceData] = useState({ memberName: '', description: '', amount: 0 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value);
  };

  const inboundTransactions = payments.filter((p: any) => p.type === 'INBOUND').map((p: any) => ({
    id: p.receiptNo,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
    method: 'Bank Transfer',
    ref: p.receiptNo,
    narration: p.narration || 'General Savings',
    amount: p.amount,
    status: p.status === 'COMPLETED' ? 'Completed' : 'Pending',
    originalId: p.id
  }));

  const outboundTransactions = payments.filter((p: any) => p.type === 'OUTBOUND').map((p: any) => ({
    id: p.receiptNo,
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
    recipient: 'B2C Transfer',
    purpose: p.narration || 'Loan Disbursement',
    amount: p.amount,
    status: p.status === 'COMPLETED' ? 'Completed' : 'Pending',
    originalId: p.id
  }));

  const totalInbound = inboundTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalOutbound = outboundTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const netFlow = totalInbound - totalOutbound;

  const handleCaptureReceipt = async () => {
    setIsSubmitting(true);
    try {
      const res = await createPayment({
        receiptNo: `RCT-${Math.floor(Math.random() * 100000)}`,
        amount: formData.amount,
        type: 'INBOUND',
        status: 'COMPLETED',
        narration: formData.narration
      });
      setPayments(prev => [...prev, res]);
      toast.success('Manual receipt captured');
      setShowReceiptModal(false);
      setFormData({ amount: 0, narration: '', method: 'M-Pesa' });
    } catch (err) {
      toast.error('Failed to capture receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisbursement = async () => {
    setIsSubmitting(true);
    try {
      const res = await createPayment({
        receiptNo: `DIS-${Math.floor(Math.random() * 100000)}`,
        amount: outboundData.amount,
        type: 'OUTBOUND',
        status: 'COMPLETED',
        narration: outboundData.purpose
      });
      setPayments(prev => [...prev, res]);
      toast.success('Disbursement processed');
      setShowDisbursementModal(false);
      setOutboundData({ recipient: '', amount: 0, purpose: 'Loan Disbursement' });
    } catch (err) {
      toast.error('Failed to disburse funds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        await deletePayment(id);
        toast.success('Payment deleted');
        setPayments(payments.filter(p => p.id !== id));
      } catch (err) {
        toast.error('Failed to delete payment');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-green/20 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight">Payments & Ledger</h2>
          <p className="text-sm font-medium text-brand-accent mt-1">Manage inflows, outflows, invoices, and bank reconciliation.</p>
        </div>
        <div className="relative z-10 flex space-x-3">
          <button onClick={() => setShowReceiptModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-green hover:bg-green-600 px-5 py-2.5 rounded-lg shadow-md transition-colors">
            <ArrowDownRight size={16} className="mr-2" /> Receive Funds
          </button>
          <button onClick={() => setShowDisbursementModal(true)} className="flex items-center text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark px-5 py-2.5 rounded-lg shadow-md transition-colors">
            <ArrowUpRight size={16} className="mr-2" /> Disburse Funds
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'inbound', name: 'Inbound' },
            { id: 'outbound', name: 'Outbound' },
            { id: 'reconciliation', name: 'Reconciliation' },
            { id: 'invoicing', name: 'Invoicing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 border-b-2 text-sm font-bold transition-colors ${
                activeTab === tab.id 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        
        {activeTab === 'overview' && (
          <div className="p-6 animation-fade-in space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 border-l-4 border-l-brand-green">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Inbound</p>
                <p className="text-xl font-extrabold text-brand-green">{formatCurrency(totalInbound)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 border-l-4 border-l-brand-primary">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Outbound</p>
                <p className="text-xl font-extrabold text-brand-primary">{formatCurrency(totalOutbound)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 border-l-4 border-l-brand-accent">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Net Flow</p>
                <p className="text-xl font-extrabold text-gray-800">{formatCurrency(netFlow)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 border-l-4 border-l-gray-400">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transactions</p>
                <p className="text-xl font-extrabold text-gray-800">{payments.length}</p>
              </div>
            </div>

            <h3 className="font-extrabold text-gray-800 border-b border-gray-100 pb-2">Recent Transactions</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                  <th className="py-2">Receipt/Ref</th>
                  <th className="py-2">Type</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.slice(0, 5).map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-bold">{p.receiptNo}</td>
                    <td className="py-3 text-xs font-medium">
                      <span className={`px-2 py-1 rounded ${p.type === 'INBOUND' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-primary/10 text-brand-primary'}`}>{p.type}</span>
                    </td>
                    <td className="py-3 text-sm font-extrabold text-right">{formatCurrency(p.amount)}</td>
                    <td className="py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inbound' && (
          <div className="animation-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex-1 max-w-sm relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search inbound receipts..." className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-green" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                  <th className="p-4">Receipt No</th>
                  <th className="p-4">Narration</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inboundTransactions.filter((t: any) => t.id.toLowerCase().includes(searchTerm.toLowerCase())).map((trx: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-sm text-gray-800">{trx.id}</td>
                    <td className="p-4 text-sm text-brand-blue font-medium">{trx.narration}</td>
                    <td className="p-4 text-sm text-gray-500">{trx.date}</td>
                    <td className="p-4 text-right font-extrabold text-gray-800">{formatCurrency(trx.amount)}</td>
                    <td className="p-4 text-center">
                      <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded text-[10px] font-bold uppercase">{trx.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(trx.originalId)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'outbound' && (
          <div className="animation-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex-1 max-w-sm relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search outbound disbursements..." className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {outboundTransactions.filter((t: any) => t.id.toLowerCase().includes(searchTerm.toLowerCase())).map((trx: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-sm text-gray-800">{trx.id}</td>
                    <td className="p-4 text-sm text-brand-blue font-medium">{trx.purpose}</td>
                    <td className="p-4 text-sm text-gray-500">{trx.date}</td>
                    <td className="p-4 text-right font-extrabold text-gray-800">{formatCurrency(trx.amount)}</td>
                    <td className="p-4 text-center">
                      <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-[10px] font-bold uppercase">{trx.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(trx.originalId)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div className="p-6 animation-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-brand-accent">Bank Reconciliation</h3>
              <label className="flex items-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 cursor-pointer">
                <Upload size={16} className="mr-2" /> Upload Bank CSV
                <input type="file" className="hidden" accept=".csv" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  toast.loading('Uploading bank statement...');
                  try {
                    const res = await uploadFile(file);
                    toast.dismiss();
                    toast.success(`Bank statement uploaded: ${res.fileName}`);
                  } catch (err) {
                    toast.dismiss();
                    toast.error('Failed to upload bank statement');
                  }
                }} />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {/* System Transactions */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-3 font-extrabold text-sm border-b border-gray-200">System Records (Task-Me)</div>
                <div className="p-4 space-y-4 h-64 overflow-y-auto">
                  {payments.slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-brand-green/30 bg-brand-green/5 rounded-lg">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{p.receiptNo}</p>
                        <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-brand-green">{formatCurrency(p.amount)}</p>
                        <span className="text-[10px] font-bold text-brand-green flex items-center"><CheckCircle2 size={12} className="mr-1" /> Matched</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Statement */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-3 font-extrabold text-sm border-b border-gray-200">Bank Statement</div>
                <div className="p-4 space-y-4 h-64 overflow-y-auto">
                  {payments.slice(0, 3).map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-gray-200 bg-white rounded-lg shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-gray-800">BANK-REF-{Math.floor(Math.random() * 10000)}</p>
                        <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-gray-800">{formatCurrency(p.amount)}</p>
                        <span className="text-[10px] font-bold text-brand-green flex items-center"><CheckCircle2 size={12} className="mr-1" /> Matched</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-bold text-sm text-gray-800">BANK-REF-9921</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-red-600">{formatCurrency(15000)}</p>
                      <span className="text-[10px] font-bold text-red-600 flex items-center"><XCircle size={12} className="mr-1" /> Unmatched</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoicing' && (
          <div className="p-6 animation-fade-in grid grid-cols-2 gap-8">
            <div className="space-y-4 printable-hide">
              <h3 className="font-extrabold text-brand-accent mb-4">Create Invoice</h3>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Member Name</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={invoiceData.memberName} onChange={e => setInvoiceData({...invoiceData, memberName: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Item Description</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={invoiceData.description} onChange={e => setInvoiceData({...invoiceData, description: e.target.value})} placeholder="e.g. Monthly Contribution" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Amount</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm" value={invoiceData.amount} onChange={e => setInvoiceData({...invoiceData, amount: parseFloat(e.target.value)})} placeholder="0" />
              </div>
              <button onClick={() => {
                toast.success('Invoice generated! Printing...');
                setTimeout(() => window.print(), 500);
              }} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg flex items-center justify-center">
                <FileSignature size={18} className="mr-2" /> Generate Invoice
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative invoice-print-area">
              <style>{`@media print { body * { visibility: hidden; } .invoice-print-area, .invoice-print-area * { visibility: visible; } .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; } .printable-hide { display: none !important; } }`}</style>
              <div className="absolute top-4 right-4 text-4xl opacity-10"><FileText /></div>
              <h4 className="text-2xl font-extrabold text-gray-800 mb-6">INVOICE</h4>
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-500">Billed To:</p>
                <p className="font-extrabold text-brand-blue text-lg">{invoiceData.memberName || 'Client Name'}</p>
              </div>
              <table className="w-full mb-6">
                <thead className="border-b border-gray-300">
                  <tr className="text-left text-xs text-gray-500 font-bold uppercase">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="py-3 font-medium">{invoiceData.description || 'Item description...'}</td>
                    <td className="py-3 text-right font-extrabold">{formatCurrency(invoiceData.amount || 0)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-500">Total Due</span>
                <span className="text-2xl font-extrabold text-brand-green">{formatCurrency(invoiceData.amount || 0)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Manual Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-accent text-lg">Receive Funds</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Amount (KES)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-green outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Method</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-green outline-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option>M-Pesa</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Narration / Purpose</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-green outline-none" rows={3} value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowReceiptModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting} onClick={handleCaptureReceipt} className="flex-1 bg-brand-green hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Capture Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disbursement Modal */}
      {showDisbursementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-primary text-lg">Disburse Funds</h3>
              <button onClick={() => setShowDisbursementModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Recipient Member/Vendor</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={outboundData.recipient} onChange={e => setOutboundData({...outboundData, recipient: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Amount (KES)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={outboundData.amount} onChange={e => setOutboundData({...outboundData, amount: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Purpose</label>
                <select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" value={outboundData.purpose} onChange={e => setOutboundData({...outboundData, purpose: e.target.value})}>
                  <option>Loan Disbursement</option>
                  <option>Salary</option>
                  <option>Expense</option>
                  <option>Dividend</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDisbursementModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={isSubmitting} onClick={handleDisbursement} className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white py-2.5 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Disburse Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
