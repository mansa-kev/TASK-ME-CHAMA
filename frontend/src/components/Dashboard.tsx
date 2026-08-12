import { useState, useEffect, useRef } from 'react';
import { useData } from './data';
import { getUser, fetchStats, generateAIReport, saveAIReport } from '../api';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Users, Wallet, CreditCard, TrendingUp, AlertCircle, Search, 
  Landmark, ShieldCheck, Banknote, AlertTriangle, Layers, Activity, 
  Clock, Sparkles, Building2, Zap, MessageSquare, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, Radio, Send, ChevronRight, BarChart3, X, Download, Share2, Save
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { stats, chartData, members, chamas, supportTickets, payments, isLoading } = useData();
  const user = getUser();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setIsGeneratingReport(true);
    setReportContent('');
    try {
      const response = await generateAIReport();
      setReportContent(response.report);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate AI report');
      setIsReportModalOpen(false);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportContent) return;
    try {
      setIsSaving(true);
      await saveAIReport({
        title: `AI Performance Report - ${new Date().toLocaleDateString()}`,
        content: reportContent,
        generatedBy: user?.name || 'Admin'
      });
      toast.success('Report saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF Downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  const handleWhatsAppShare = () => {
    if (!reportContent) return;
    const summary = reportContent.substring(0, 500) + '...\n\n*Review full report on the Task-Me Chama portal.*';
    const encodedText = encodeURIComponent(`*Task-Me Chama AI Report*\n\n${summary}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Welcome back, {user?.name || 'Admin'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateReport} className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-brand-primary-dark transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Report
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-brand-primary" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Members</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">{stats?.totalMembers?.count || 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Savings</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">KES {(stats?.totalSavings?.amount || 0).toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Loans</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">KES {(stats?.activeLoans?.amount || 0).toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monthly Growth</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">{(stats?.totalSavings?.growth || 0) > 0 ? '+' : ''}{stats?.totalSavings?.growth || 0}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-brand-primary" /> Savings vs Loans Overview
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData && chartData.length > 0 ? chartData : [{ name: 'Jan', savings: 0, loans: 0 }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `KES ${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, undefined]}
                />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                <Area type="monotone" dataKey="loans" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoans)" />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-primary" /> Recent Support Tickets
          </h3>
          <div className="space-y-4">
            {(stats?.recentTickets || supportTickets || []).slice(0, 5).map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ticket.status === 'Open' ? 'bg-red-100 text-red-600' :
                    ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">{ticket.category} • {ticket.memberId}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!(stats?.recentTickets || supportTickets) || (stats?.recentTickets || supportTickets).length === 0) && (
              <div className="text-center text-sm text-gray-500 py-4">No recent tickets</div>
            )}
          </div>
        </div>

        {/* 4 New KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending KYC Validations</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-gray-900">{stats?.pendingKyc?.count || 0}</h3>
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">{stats?.pendingKyc?.percentage || 0}%</span>
            </div>
            <button onClick={() => navigate('/dashboard/kyc')} className="mt-3 text-xs font-bold text-brand-primary hover:underline">View all →</button>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Upcoming Repayments</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-gray-900">{stats?.upcomingRepayments?.count || 0}</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{stats?.upcomingRepayments?.percentage || 0}% pending</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Chama Groups</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-gray-900">{stats?.activeChamas?.count || 0}</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{stats?.activeChamas?.percentage || 0}% active</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending Contributions</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black text-gray-900">KES {(stats?.pendingContributions?.amount || 0).toLocaleString()}</h3>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{stats?.pendingContributions?.percentage || 0}% of all</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand-primary" /> Member Statuses
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: members.filter((m: any) => m.status === 'Active').length || 0 },
                    { name: 'Dormant', value: members.filter((m: any) => m.status === 'Dormant').length || 0 },
                    { name: 'Defaulted', value: members.filter((m: any) => m.status === 'Defaulted').length || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#9ca3af" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-brand-primary" /> Top Members
          </h3>
          <div className="space-y-4">
            {(stats?.topMembers || []).map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                    #{member.rank}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.percentage.toFixed(1)}% of pool</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-brand-primary">KES {member.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {(!stats?.topMembers || stats.topMembers.length === 0) && (
              <div className="text-center text-sm text-gray-500 py-4">No top members found.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-brand-primary" /> Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-extrabold">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats?.recentTransactions || payments || []).slice(0, 5).map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-brand-primary/5 transition-colors text-sm">
                    <td className="p-3 font-bold text-gray-900">{payment.reference}</td>
                    <td className="p-3 text-gray-500">{payment.date}</td>
                    <td className="p-3 text-gray-700">{payment.description || `${payment.type} - ${payment.memberId}`}</td>
                    <td className="p-3 font-bold text-brand-primary">KES {payment.amount?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!(stats?.recentTransactions || payments) || (stats?.recentTransactions || payments).length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-primary" />
                AI Executive Report
              </h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-brand-primary w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-gray-600 font-bold text-lg animate-pulse">Gemini is analyzing your operations...</p>
                </div>
              ) : (
                <div 
                  ref={reportRef} 
                  className="prose prose-sm sm:prose-base prose-indigo max-w-none text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm"
                >
                  <ReactMarkdown>{reportContent}</ReactMarkdown>
                </div>
              )}
            </div>
            
            {!isGeneratingReport && (
              <div className="p-5 border-t border-gray-100 bg-white flex flex-wrap gap-3 justify-end">
                <button 
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={handleWhatsAppShare}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md shadow-green-500/20"
                >
                  <Share2 className="w-4 h-4" /> Share to WhatsApp
                </button>
                <button 
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Report
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold transition-colors ml-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
