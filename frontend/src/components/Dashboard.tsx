import { useState, useEffect } from 'react';
import { useData } from './data';
import { getUser, fetchStats } from '../api';
import { 
  Users, Wallet, CreditCard, TrendingUp, AlertCircle, Search, 
  Landmark, ShieldCheck, Banknote, AlertTriangle, Layers, Activity, 
  Clock, Sparkles, Building2, Zap, MessageSquare, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, Radio, Send, ChevronRight, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router';
import { DateFilterButtons } from './DateFilterButtons';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { chartData, members, chamas, supportTickets, payments } = useData();
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Here is an overview of your Sacco's performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilterButtons activeFilter="All Time" onChange={() => {}} />
          <button onClick={() => navigate('/dashboard/reports')} className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-brand-primary-dark transition-colors">
            Generate Report
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
          <h3 className="text-3xl font-black text-gray-900 mt-1">{members.length || 2845}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Savings</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">KES 12.4M</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Loans</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">KES 8.2M</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monthly Growth</p>
          <h3 className="text-3xl font-black text-gray-900 mt-1">+14.5%</h3>
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-primary" /> Recent Support Tickets
          </h3>
          <div className="space-y-4">
            {supportTickets && supportTickets.slice(0, 5).map((ticket: any) => (
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
            {(!supportTickets || supportTickets.length === 0) && (
              <div className="text-center text-sm text-gray-500 py-4">No recent tickets</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-brand-primary" /> Member Statuses
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: members.filter((m: any) => m.status === 'Active').length || 2150 },
                    { name: 'Dormant', value: members.filter((m: any) => m.status === 'Dormant').length || 450 },
                    { name: 'Defaulted', value: members.filter((m: any) => m.status === 'Defaulted').length || 245 }
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
                {payments && payments.slice(0, 5).map((payment: any) => (
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
                {(!payments || payments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 text-sm">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
