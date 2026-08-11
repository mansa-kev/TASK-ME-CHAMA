import { Bell, AlertCircle, CheckCircle2, MessageSquare, Info, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch, getUser } from '../api';
import toast from 'react-hot-toast';

export function MemberNotificationsModule() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiFetch('/communicationLogs');
        // Map backend CommunicationLog to frontend shape
        const mapped = data.map((log: any) => ({
          id: log.id,
          type: log.type === 'SMS' ? 'alert' : 'info',
          title: log.type === 'SMS' ? 'SMS Alert' : 'System Notification',
          message: log.content,
          time: new Date(log.createdAt).toLocaleString(),
          read: log.status === 'SENT',
          icon: log.type === 'SMS' ? MessageSquare : Info,
          color: log.type === 'SMS' ? 'text-brand-blue' : 'text-gray-600',
          bg: log.type === 'SMS' ? 'bg-brand-blue/10' : 'bg-gray-100',
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Alerts') return n.type === 'alert';
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animation-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <Bell className="text-brand-accent w-8 h-8" />
            Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your account activity and Chama announcements.</p>
        </div>
        <button onClick={markAllRead} className="text-sm font-bold text-brand-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex flex-wrap gap-2">
            {['All', 'Unread', 'Alerts'].map(filter => {
              const unreadCount = notifications.filter(n => !n.read).length;
              return (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors ${
                    activeFilter === filter 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200 bg-gray-100'
                  }`}
                >
                  {filter} {filter === 'Unread' && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-accent text-white text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredNotifications.map(notification => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className={`p-5 flex gap-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.bg} ${notification.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-4">
                      {notification.time}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.read ? 'text-gray-700 font-medium' : 'text-gray-500'} leading-relaxed`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 shrink-0"></div>
                )}
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">You're all caught up!</p>
              <p className="text-sm mt-1">No {activeFilter.toLowerCase()} notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
