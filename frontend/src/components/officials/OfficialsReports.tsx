import React, { useState, useEffect } from 'react';
import { FileBarChart, Users, Coins, Download, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchOfficialsFinancialReport, fetchMemberStatement, recalculateDividends, approveDividends } from '../../api';

const defaultFinancials = {
  revenue: 0,
  expenses: 0,
  netIncome: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  equity: 0,
};

export function OfficialsReports() {
  const [activeTab, setActiveTab] = useState<'financials' | 'statements' | 'dividends'>('financials');
  const [searchQuery, setSearchQuery] = useState('');
  const [financials, setFinancials] = useState(defaultFinancials);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dividendData, setDividendData] = useState<{ distributableProfit: number; totalShares: number; dividendPerShare: number }>({
    distributableProfit: 0,
    totalShares: 0,
    dividendPerShare: 0
  });

  const loadFinancials = () => {
    fetchOfficialsFinancialReport()
      .then((data) => {
        if (data) {
          if (data.financials) {
            setFinancials(data.financials);
            const profit = data.financials.netIncome > 0 ? data.financials.netIncome * 0.8 : 0;
            const shares = (data.members || []).reduce((acc: number, m: any) => acc + (m.shares || 0), 0) || 1;
            setDividendData({
              distributableProfit: profit,
              totalShares: shares,
              dividendPerShare: Number((profit / shares).toFixed(2))
            });
          }
          if (data.members) setMembers(data.members);
        }
      })
      .catch(() => toast.error('Failed to fetch reports'));
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const handleExport = () => {
    const csv = `REVENUE,EXPENSES,NET INCOME,ASSETS,LIABILITIES,EQUITY\n${financials.revenue},${financials.expenses},${financials.netIncome},${financials.totalAssets},${financials.totalLiabilities},${financials.equity}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial_Report_Q3_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };
  const handleGeneratePDF = (member: any) => {
    toast.loading('Generating statement...', { id: 'stmt' });
    fetchMemberStatement(member.id)
      .then((blob: any) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Statement_${member.number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Statement generated for ${member.name}`, { id: 'stmt' });
      })
      .catch(() => toast.error('Failed to generate statement', { id: 'stmt' }));
  };
  const handleRecalculate = () => {
    recalculateDividends().then(() => {
      toast.success('Dividend calculations updated based on latest share values');
    }).catch(() => toast.error('Failed to recalculate dividends'));
  };
  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this dividend distribution? This action cannot be undone.')) {
      approveDividends().then(() => {
        toast.success('Dividend Distribution Approved and posted to member wallets');
      }).catch(() => toast.error('Failed to approve dividends'));
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Financial statements, member reports, and dividend distribution.</p>
        </div>
        <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors text-xs sm:text-sm shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('financials')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'financials' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <FileBarChart className="w-4 h-4 mr-2" />
          Financial Statements
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'statements' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4 mr-2" />
          Member Statements
        </button>
        <button
          onClick={() => setActiveTab('dividends')}
          className={`shrink-0 flex items-center justify-center py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'dividends' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Coins className="w-4 h-4 mr-2" />
          Dividend Distribution
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'financials' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-brand-primary">Q3 2026 Summary</h2>
              <button className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                <Filter className="w-4 h-4 mr-1" /> Period: Q3 2026
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* P&L */}
              <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Profit & Loss</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium">KES {financials.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Total Expenses</span>
                    <span>- KES {financials.expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span className="text-brand-primary">Net Income</span>
                    <span className="text-brand-green">KES {financials.netIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Balance Sheet */}
              <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Balance Sheet</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Assets</span>
                    <span className="font-medium">KES {financials.totalAssets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Liabilities</span>
                    <span className="font-medium">KES {financials.totalLiabilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span className="text-brand-primary">Total Equity</span>
                    <span>KES {financials.equity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statements' && (
          <div className="p-0">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <h2 className="text-lg font-semibold text-brand-primary">Generate Statements</h2>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-4 font-medium">Member</th>
                    <th className="p-4 font-medium">ID Number</th>
                    <th className="p-4 font-medium">Shares</th>
                    <th className="p-4 font-medium">Total Contributions</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">{member.name}</td>
                      <td className="p-4 text-gray-500">{member.number}</td>
                      <td className="p-4 text-gray-700">{member.shares}</td>
                      <td className="p-4 font-medium">KES {member.contributions.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${member.status === 'Active' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-amber/10 text-brand-amber'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleGeneratePDF(member)} className="text-brand-primary hover:underline font-medium">Generate PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dividends' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-primary mb-6">End of Year Dividend Distribution</h2>
            
            <div className="bg-brand-primary/5 rounded-xl p-6 border border-brand-primary/10 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Distributable Profit</p>
                  <p className="text-2xl font-bold text-brand-primary">KES {dividendData.distributableProfit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Shares</p>
                  <p className="text-2xl font-bold text-brand-primary">{dividendData.totalShares.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dividend Per Share</p>
                  <p className="text-2xl font-bold text-brand-green">KES {dividendData.dividendPerShare.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={handleRecalculate} className="px-5 py-2.5 border border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-primary/5 transition-colors">
                Recalculate
              </button>
              <button onClick={handleApprove} className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors">
                Approve Distribution
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
