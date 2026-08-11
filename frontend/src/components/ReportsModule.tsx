import { useState, useEffect } from 'react';
import { fetchOfficialsFinancialReport, fetchOfficialsMembers, fetchStaffPerformance, fetchMemberStatement } from '../api';
import toast from 'react-hot-toast';

export function ReportsModule() {
  const [activeTab, setActiveTab] = useState('financial');
  const [reportType, setReportType] = useState('balanceSheet');
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [memberStatement, setMemberStatement] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      loadStatement(selectedMember);
    }
  }, [selectedMember]);

  const loadData = async () => {
    try {
      const financialReport = await fetchOfficialsFinancialReport();
      setLedgers(Array.isArray(financialReport) ? financialReport : financialReport?.ledgers || []);
      const m = await fetchOfficialsMembers();
      setMembers(m || []);
      const staff = await fetchStaffPerformance();
      setStaffData(staff || []);
    } catch (e) {
      toast.error('Failed to load data');
    }
  };

  const loadStatement = async (id: string) => {
    try {
      const statement = await fetchMemberStatement(id);
      setMemberStatement(statement || []);
    } catch (e) {
      toast.error('Failed to load member statement');
    }
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-4 flex gap-2 overflow-x-auto no-scrollbar">
        {['financial', 'staff', 'member'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-colors whitespace-nowrap shrink-0 ${activeTab === tab ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            {tab} Reports
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[450px]">
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <select 
                value={reportType} 
                onChange={e => setReportType(e.target.value)}
                className="border border-gray-200 p-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gray-50 outline-none focus:border-brand-green"
              >
                <option value="balanceSheet">Balance Sheet</option>
                <option value="incomeStatement">Income Statement</option>
                <option value="trialBalance">Trial Balance</option>
                <option value="cashFlow">Cash Flow Statement</option>
              </select>
              <button onClick={printReport} className="bg-brand-accent text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity">
                Print / PDF
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-gray-50/30">
              <h2 className="text-base sm:text-lg font-extrabold text-center mb-4 sm:mb-6 uppercase text-gray-800 tracking-wider">
                {reportType.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <div className="space-y-2 text-xs sm:text-sm">
                {ledgers.length === 0 ? (
                  <p className="text-center text-gray-400 py-6">No financial records found</p>
                ) : (
                  ledgers.map((l, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-100 py-2.5">
                      <span className="font-medium text-gray-700 truncate mr-2">{l.accountCode} - {l.name}</span>
                      <span className="font-mono font-bold text-gray-900 shrink-0">KES {(l.balance || 0).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="font-extrabold text-base sm:text-lg text-brand-accent">Staff Performance</h2>
              <button onClick={printReport} className="bg-brand-accent text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl">
                Print
              </button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-left divide-y divide-gray-100">
                  <thead>
                    <tr className="text-[10px] sm:text-xs uppercase text-gray-500 font-bold bg-gray-50">
                      <th className="p-3">Staff Name</th>
                      <th className="p-3">Members Reg.</th>
                      <th className="p-3">Loans Proc.</th>
                      <th className="p-3">Tasks Comp.</th>
                      <th className="p-3">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {staffData.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-400">No staff performance data available</td></tr>
                    ) : (
                      staffData.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-800">{s.name || 'Staff Member'}</td>
                          <td className="p-3">{s.membersRegistered || 0}</td>
                          <td className="p-3">{s.loansProcessed || 0}</td>
                          <td className="p-3">{s.tasksCompleted || 0}</td>
                          <td className="p-3 text-gray-500">{s.lastActivity || 'Recent'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <select 
                value={selectedMember} 
                onChange={e => setSelectedMember(e.target.value)}
                className="border border-gray-200 p-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gray-50 outline-none focus:border-brand-green w-full sm:min-w-[250px]"
              >
                <option value="">Search Member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.memberNumber})</option>)}
              </select>
              <button onClick={printReport} className="bg-brand-accent text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl disabled:opacity-50" disabled={!selectedMember}>
                Print Statement
              </button>
            </div>

            {selectedMember && (
              <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-white shadow-sm">
                <div className="text-center mb-6 border-b border-gray-100 pb-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-brand-primary">Member Statement</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="w-full text-left divide-y divide-gray-100 mt-4">
                      <thead>
                        <tr className="text-[10px] sm:text-xs uppercase text-gray-500 font-bold bg-gray-50">
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Debit</th>
                          <th className="p-3 text-right">Credit</th>
                          <th className="p-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                        {memberStatement.length === 0 ? (
                          <tr><td colSpan={5} className="p-4 text-center text-gray-400">No transactions found</td></tr>
                        ) : (
                          memberStatement.map((l: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 font-medium text-gray-800">{l.description || l.accountName}</td>
                              <td className="p-3 text-right whitespace-nowrap">{l.accountType === 'ASSET' ? l.balance?.toLocaleString() : '-'}</td>
                              <td className="p-3 text-right whitespace-nowrap">{l.accountType !== 'ASSET' ? l.balance?.toLocaleString() : '-'}</td>
                              <td className="p-3 text-right font-mono font-bold whitespace-nowrap">KES {l.balance?.toLocaleString() || 0}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
