import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { 
  Users, Wallet, CreditCard, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar
} from 'lucide-react';
import { fetchOfficialsStats, fetchOfficialsRecentActivity } from '../../api';
import { DateFilterButtons } from '../DateFilterButtons';

export function OfficialsDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('This Month');
  const [stats, setStats] = useState({
    totalMembers: 0,
    membersChange: 0,
    totalSavings: 0,
    savingsChange: 0,
    activeLoans: 0,
    loansChange: 0,
    upcomingMeetings: 0,
    meetingsChange: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    let period = '';
    if (activeFilter === 'Today') period = 'daily';
    if (activeFilter === 'This Week') period = 'weekly';
    if (activeFilter === 'This Month') period = 'monthly';
    if (activeFilter === 'This Year') period = 'yearly';

    fetchOfficialsStats(period)
      .then(data => {
        if (!data.error) {
          setStats({
            totalMembers: data.totalMembers || 0,
            membersChange: data.membersChange || 0,
            totalSavings: data.totalSavings || 0,
            savingsChange: data.savingsChange || 0,
            activeLoans: data.activeLoans || 0,
            loansChange: data.loansChange || 0,
            upcomingMeetings: data.upcomingMeetings || 0,
            meetingsChange: data.meetingsChange || 0
          });
        }
      })
      .catch(console.error);

    fetchOfficialsRecentActivity()
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setRecentActivities(data);
        }
      })
      .catch(console.error);
  }, [activeFilter]);

  const dynamicStats = [
    { name: 'Total Liquidity', value: `KES ${stats.totalSavings.toLocaleString()}`, change: `${stats.savingsChange >= 0 ? '+' : ''}${stats.savingsChange}%`, isPositive: stats.savingsChange >= 0, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Active Loans', value: stats.activeLoans.toString(), change: `${stats.loansChange >= 0 ? '+' : ''}${stats.loansChange}%`, isPositive: stats.loansChange >= 0, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Upcoming Meetings', value: stats.upcomingMeetings.toString(), change: `${stats.meetingsChange >= 0 ? '+' : ''}${stats.meetingsChange}%`, isPositive: stats.meetingsChange >= 0, icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { name: 'Active Members', value: stats.totalMembers.toString(), change: `${stats.membersChange >= 0 ? '+' : ''}${stats.membersChange}%`, isPositive: stats.membersChange >= 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in pb-28 sm:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Group Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of your Chama's financial health.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 sm:gap-3 w-full sm:w-auto items-center">
          <DateFilterButtons activeFilter={activeFilter} onChange={setActiveFilter} />
          <button onClick={() => navigate('/dashboard/officials-meetings')} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm shadow-sm">
            <Calendar size={16} /> Schedule Meeting
          </button>
          <button onClick={() => navigate('/dashboard/officials-contributions')} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-brand-accent text-white rounded-xl hover:bg-brand-amber transition-colors font-medium text-xs sm:text-sm shadow-[0_0_15px_rgba(255,80,0,0.2)]">
            <Wallet size={16} /> Collect Money
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dynamicStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ease-out bg-current text-gray-900" />
              
              <div className="flex items-start justify-between mb-4 relative">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.change}
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              
              <div className="relative">
                <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Financial Activity</h2>
            <button onClick={() => navigate('/dashboard/officials-reports')} className="text-xs sm:text-sm text-brand-accent font-medium hover:text-brand-amber">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No recent activity.
              </div>
            ) : recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'loan_request' ? 'bg-blue-100 text-blue-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500 capitalize">{activity.type.replace('_', ' ')} • {activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${activity.type === 'penalty' ? 'text-rose-600' : 'text-gray-900'}`}>
                    {activity.type === 'penalty' ? '-' : '+'}KES {Number(activity.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Action Center */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <h2 className="text-lg font-bold mb-4 relative">Action Center</h2>
            
            <div className="space-y-3 relative">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-brand-accent p-1.5 rounded-lg shrink-0 mt-0.5">
                  <CreditCard size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pending Loan Approvals</p>
                  <button onClick={() => navigate('/dashboard/officials-loans')} className="text-xs text-brand-accent mt-1 hover:text-white transition-colors font-semibold">Review Now &rarr;</button>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <Users size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">New Member Requests</p>
                  <button onClick={() => navigate('/dashboard/officials-members')} className="text-xs text-white/70 mt-1 hover:text-white transition-colors font-semibold">View Applications &rarr;</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
