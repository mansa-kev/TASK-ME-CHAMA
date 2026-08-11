import { usePrompt } from '../common/PromptProvider';
import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  DollarSign, 
  ShieldAlert, 
  FileText,
  UserCheck,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  fetchOfficialsLoans, approveOfficialsLoan, disburseOfficialsLoan, rejectOfficialsLoan,
  recordOfficialsLoanPayment, sendOfficialsGuarantorNotice, fetchOfficialsLoanReport
} from '../../api';



export function OfficialsLoans() {
  const showPrompt = usePrompt();

  const [activeTab, setActiveTab] = useState<'applications' | 'active' | 'guarantors'>('applications');
  const [loans, setLoans] = useState<any[]>([]);

  const loadLoans = async () => {
    fetchOfficialsLoans()
      .then(data => {
        if (Array.isArray(data)) setLoans(data);
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    loadLoans();
  }, []);

  const tabs = [
    { id: 'applications', label: 'Loan Applications', icon: FileText },
    { id: 'active', label: 'Active Loans', icon: DollarSign },
    { id: 'guarantors', label: 'Guarantor Oversight', icon: ShieldAlert },
  ] as const;

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-gray-800">Pending Applications</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Amount & Purpose</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.filter(l => l.status === 'PENDING_GUARANTORS' || l.status === 'PENDING_APPROVAL').map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                        {app.memberName ? app.memberName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{app.memberName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{app.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">KES {(app.principal || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{app.productName || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(app.applicationDate || new Date()), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-brand-amber/10 text-brand-amber`}>
                      Reviewing
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1.5 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors tooltip-trigger" 
                        title="Approve"
                        onClick={async () => {
                          approveOfficialsLoan(app.id)
                            .then(() => { toast.success('Loan approved'); loadLoans(); })
                            .catch(() => toast.error('Failed to approve loan'));
                        }}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger" 
                        title="Reject"
                        onClick={async () => {
                          rejectOfficialsLoan(app.id)
                            .then(() => { toast.success('Loan rejected'); loadLoans(); })
                            .catch(() => toast.error('Failed to reject loan'));
                        }}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors ml-2" onClick={async () => {
                        toast.success(`Viewing details for Loan App #${app.id}`);
                      }}>
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActiveLoansTab = () => {
    const totalActivePrincipal = loans.filter(l => l.status === 'ACTIVE' || l.status === 'IN_ARREARS').reduce((sum, l) => sum + (l.principal || 0), 0);
    const expectedCollections = loans.filter(l => l.status === 'ACTIVE' || l.status === 'IN_ARREARS').reduce((sum, l) => sum + (l.balance || 0), 0);
    const totalInArrears = loans.filter(l => l.status === 'IN_ARREARS').reduce((sum, l) => sum + (l.balance || 0), 0);

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Active Principal</p>
            <p className="text-2xl font-bold text-gray-900">KES {totalActivePrincipal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-amber/10 flex items-center justify-center text-brand-amber">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Expected Collections</p>
            <p className="text-2xl font-bold text-gray-900">KES {expectedCollections.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total in Arrears</p>
            <p className="text-2xl font-bold text-gray-900">KES {totalInArrears.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Active Loans Portfolio</h3>
          <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80" onClick={async () => {
            const csvContent = "data:text/csv;charset=utf-8," + "Borrower,Principal,Balance,Status\n" + loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'IN_ARREARS').map(l => `${l.memberName || l.memberId},${l.principal},${l.balance},${l.status}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "active_loans.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>Export List</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Outstanding Balance</th>
                <th className="px-6 py-4">Next Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.status === 'IN_ARREARS').map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{loan.memberName || loan.memberId}</p>
                    <p className="text-xs text-gray-500">{loan.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">KES {(loan.balance || 0).toLocaleString()}</p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full" 
                        style={{ width: `${(((loan.principal || 0) - (loan.balance || 0)) / (loan.principal || 1)) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{loan.dueDate ? format(new Date(loan.dueDate), 'MMM dd, yyyy') : '-'}</p>
                    <p className="text-xs font-medium text-gray-500">KES {(loan.principal || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      loan.status === 'ACTIVE' ? 'bg-brand-green/10 text-brand-green' :
                      loan.status === 'DISBURSED' ? 'bg-brand-amber/10 text-brand-amber' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary font-bold text-xs rounded-lg hover:bg-brand-primary hover:text-white transition-colors" onClick={async () => {
                      const amountStr = await showPrompt(`Enter payment amount for ${loan.memberName || loan.memberId}:`);
                      if (amountStr) {
                        const amount = Number(amountStr);
                        if (!isNaN(amount) && amount > 0) {
                          recordOfficialsLoanPayment(loan.id, amount)
                            .then(() => {
                              toast.success(`Recorded payment of KES ${amount} for loan ${loan.id}`);
                              loadLoans();
                            })
                            .catch(() => toast.error('Failed to record payment'));
                        } else {
                          toast.error('Invalid amount');
                        }
                      }
                    }}>
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  };

  const renderGuarantorsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Guarantor Risk Oversight</h3>
          <div className="flex gap-2">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search guarantors..." 
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="px-6 py-4">Guarantor</th>
                <th className="px-6 py-4">Guaranteed Borrower</th>
                <th className="px-6 py-4">Amount Guaranteed</th>
                <th className="px-6 py-4">Loan Status</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.flatMap(l => (l.guarantors || []).map((g: any) => ({ ...g, borrowerName: l.memberName, loanStatus: l.status }))).map((record: any) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                        {record.memberId ? record.memberId.charAt(0) : 'U'}
                      </div>
                      <p className="font-medium text-gray-900">{record.memberId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {record.borrowerName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    KES {record.amountGuaranteed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      record.loanStatus === 'ACTIVE' ? 'bg-brand-green/10 text-brand-green' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.loanStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold bg-brand-primary/10 text-brand-primary">
                      Standard
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-brand-primary text-sm font-bold hover:underline flex items-center gap-1" onClick={async () => {
                      sendOfficialsGuarantorNotice({ guarantorId: record.memberId, loanId: record.id })
                        .then(() => toast.success(`Intervention notice sent to ${record.memberId}`))
                        .catch(() => toast.error('Failed to send notice'));
                    }}>
                      Intervene <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Review applications, track active loans, and monitor guarantors.</p>
        </div>
        <button className="w-full sm:w-auto bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm" onClick={async () => {
          toast.loading('Generating report...', { id: 'report' });
          fetchOfficialsLoanReport()
            .then((blob: any) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Loan_Report_${new Date().getTime()}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Report downloaded', { id: 'report' });
            })
            .catch(() => toast.error('Failed to generate report', { id: 'report' }));
        }}>
          <FileText className="h-4 w-4" />
          Generate Loan Report
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'active' && renderActiveLoansTab()}
        {activeTab === 'guarantors' && renderGuarantorsTab()}
      </div>
    </div>
  );
}
