import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAccountLedgers, fetchJournalVouchers, createJournalVoucher } from '../api';

export function AccountsLedger() {
  const [activeTab, setActiveTab] = useState('coa');
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  // Voucher Form
  const [voucherLines, setVoucherLines] = useState([{ account: '', debit: '', credit: '' }]);
  const [voucherDesc, setVoucherDesc] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Recon Form
  const [bankBalance, setBankBalance] = useState('');
  const [systemBalance, setSystemBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const accs = await fetchAccountLedgers();
      setLedgers(accs || []);
      const vs = await fetchJournalVouchers();
      setVouchers(vs || []);
      
      const cashAcc = accs?.find((a: any) => a.accountName?.includes('1110') || a.accountName?.toLowerCase().includes('bank'));
      if (cashAcc) setSystemBalance(cashAcc.balance || 0);
    } catch (e) {
      toast.error('Failed to load ledger data');
    }
  };

  const toggleNode = (type: string) => setExpandedNodes(p => ({ ...p, [type]: !p[type] }));

  // Group accounts by type for COA
  const groupedLedgers = ledgers.reduce((acc, curr) => {
    const type = curr.accountType || 'Other';
    if (!acc[type]) acc[type] = { type, accounts: [], total: 0 };
    acc[type].accounts.push(curr);
    acc[type].total += curr.balance || 0;
    return acc;
  }, {} as Record<string, { type: string, accounts: any[], total: number }>);

  // Voucher validation
  const totalDebit = voucherLines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = voucherLines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isVoucherBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handlePostVoucher = async () => {
    if (!isVoucherBalanced) {
      toast.error('Voucher must balance');
      return;
    }
    try {
      for (const line of voucherLines) {
        if (line.account && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)) {
          const acc = ledgers.find(l => l.id === line.account);
          await createJournalVoucher({
            accountName: acc ? `${acc.accountCode} - ${acc.name}` : line.account,
            date: new Date(voucherDate).toISOString(),
            narration: voucherDesc,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0
          });
        }
      }
      toast.success('Journal Voucher Posted');
      setVoucherLines([{ account: '', debit: '', credit: '' }]);
      setVoucherDesc('');
      loadData();
    } catch (e) {
      toast.error('Failed to post voucher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-4">
        {['coa', 'ledger', 'vouchers', 'reconciliation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold capitalize transition-colors ${activeTab === tab ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab === 'coa' ? 'Chart of Accounts' : tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {activeTab === 'coa' && (
          <div className="p-4">
            {Object.values(groupedLedgers).map(group => (
              <div key={group.type} className="mb-2 border border-gray-100 rounded-lg">
                <div 
                  className="bg-gray-50 p-3 flex justify-between cursor-pointer font-bold text-brand-primary"
                  onClick={() => toggleNode(group.type)}
                >
                  <span className="flex items-center gap-2">
                    {expandedNodes[group.type] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {group.type}
                  </span>
                  <span>KES {group.total.toLocaleString()}</span>
                </div>
                {expandedNodes[group.type] && (
                  <div className="p-3 pl-8 divide-y divide-gray-100">
                    {group.accounts.map(acc => (
                      <div key={acc.id} className="flex justify-between py-2 text-sm">
                        <span className="text-gray-700">{acc.accountName}</span>
                        <span className="font-mono font-medium">KES {acc.balance?.toLocaleString() || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead>
                <tr className="text-xs uppercase text-gray-500 font-bold bg-gray-50">
                  <th className="p-3">Date</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Debit (KES)</th>
                  <th className="p-3 text-right">Credit (KES)</th>
                  <th className="p-3 text-right">Running Bal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {vouchers.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-3">{v.date}</td>
                    <td className="p-3 font-medium">{v.accountName || v.accountId}</td>
                    <td className="p-3 text-gray-600">{v.narration}</td>
                    <td className="p-3 text-right font-mono text-brand-green">{v.debit > 0 ? v.debit.toLocaleString() : '-'}</td>
                    <td className="p-3 text-right font-mono text-brand-amber">{v.credit > 0 ? v.credit.toLocaleString() : '-'}</td>
                    <td className="p-3 text-right font-mono font-bold">{(v.balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="border border-gray-200 p-2 rounded-xl" />
              <input type="text" placeholder="Narration..." value={voucherDesc} onChange={e => setVoucherDesc(e.target.value)} className="border border-gray-200 p-2 rounded-xl" />
            </div>
            
            <div className="space-y-2">
              {voucherLines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <select value={line.account} onChange={e => { const nl = [...voucherLines]; nl[i].account = e.target.value; setVoucherLines(nl); }} className="flex-1 border border-gray-200 p-2 rounded-xl">
                    <option value="">Select Account...</option>
                    {ledgers.map(l => <option key={l.id} value={l.id}>{l.accountName}</option>)}
                  </select>
                  <input type="number" placeholder="Debit" value={line.debit} onChange={e => { const nl = [...voucherLines]; nl[i].debit = e.target.value; setVoucherLines(nl); }} className="w-32 border border-gray-200 p-2 rounded-xl text-right" />
                  <input type="number" placeholder="Credit" value={line.credit} onChange={e => { const nl = [...voucherLines]; nl[i].credit = e.target.value; setVoucherLines(nl); }} className="w-32 border border-gray-200 p-2 rounded-xl text-right" />
                  <button onClick={() => setVoucherLines(voucherLines.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">X</button>
                </div>
              ))}
              <button onClick={() => setVoucherLines([...voucherLines, {account: '', debit: '', credit: ''}])} className="text-brand-primary font-bold flex items-center text-sm py-2">
                <Plus size={16} className="mr-1" /> Add Line
              </button>
            </div>

            <div className={`p-4 rounded-xl flex justify-between font-bold border ${isVoucherBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <span>Totals: Dr {totalDebit.toLocaleString()} | Cr {totalCredit.toLocaleString()}</span>
              <span>Diff: {Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
            </div>

            <button disabled={!isVoucherBalanced} onClick={handlePostVoucher} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-xl disabled:opacity-50">
              Post Voucher
            </button>
          </div>
        )}

        {activeTab === 'reconciliation' && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-sm font-bold text-gray-500">System Balance (1110 - Bank Current Account)</p>
                <p className="text-3xl font-bold mt-2 font-mono">KES {systemBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-500">Actual Bank Balance</p>
                <input type="number" value={bankBalance} onChange={e => setBankBalance(e.target.value)} placeholder="Enter bank balance..." className="mt-2 w-full border border-gray-300 p-2 rounded-lg font-mono text-xl" />
              </div>
            </div>
            
            <div className="mb-4">
              {bankBalance && (
                <div className={`p-4 rounded-xl font-bold flex items-center gap-2 ${parseFloat(bankBalance) === systemBalance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {parseFloat(bankBalance) === systemBalance ? <CheckCircle /> : <XCircle />}
                  {parseFloat(bankBalance) === systemBalance ? 'RECONCILED' : `UNRECONCILED - Difference: KES Math.abs(parseFloat(bankBalance) - systemBalance).toLocaleString()`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
