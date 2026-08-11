import { useState } from 'react';
import { 
  LayoutDashboard, Wallet, CreditCard, FileText,
  Package, Bell, Settings, LifeBuoy,
  LogOut, ChevronDown, PieChart,
  ShieldCheck, HeartHandshake
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { getUser } from '../api';

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const MEMBER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'home',
    title: 'Home & Payments',
    items: [
      { id: 'dash', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { id: 'wallet', name: 'Payments & Topup', path: '/dashboard/wallet', icon: Wallet }
    ]
  },
  {
    id: 'finances',
    title: 'My Finances',
    items: [
      { id: 'savings', name: 'My Savings & Shares', path: '/dashboard/savings', icon: PieChart },
      { id: 'loans', name: 'My Loans & Borrowing', path: '/dashboard/loans', icon: CreditCard },
      { id: 'statements', name: 'Financial Statements', path: '/dashboard/statements', icon: FileText },
      { id: 'guarantorship', name: 'Guarantor Requests', path: '/dashboard/guarantorship', icon: ShieldCheck }
    ]
  },
  {
    id: 'chama',
    title: 'Chama & Officials',
    items: [
      { id: 'group', name: 'Group & Officials Desk', path: '/dashboard/group', icon: HeartHandshake, badge: 'Direct' },
      { id: 'market', name: 'Marketplace', path: '/dashboard/marketplace', icon: Package }
    ]
  },
  {
    id: 'account',
    title: 'Account & Support',
    items: [
      { id: 'notifs', name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
      { id: 'profile', name: 'Profile & KYC', path: '/dashboard/profile', icon: Settings },
      { id: 'support', name: 'Help Desk', path: '/dashboard/support', icon: LifeBuoy }
    ]
  }
];

export function MembersSideNav({ onClose }: { onClose?: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const user = getUser();
  const userName = user?.name || 'Member';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userRole = user?.role === 'MEMBER' ? 'Chama Member' : 'Member';

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-full h-full bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-dark text-white flex flex-col rounded-2xl shadow-xl border border-brand-primary-dark overflow-hidden relative">
      
      {/* Header & Mobile Close */}
      <div className="p-4 border-b border-white/10 bg-brand-primary-dark/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-black text-sm shrink-0">
            TC
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black uppercase tracking-wider text-white truncate">Task-Me Chama</h2>
            <p className="text-[10px] text-white/70 truncate">Member Portal</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:hidden shrink-0"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links with Group Accordions */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3 custom-scrollbar">
        {MEMBER_NAV_GROUPS.map((group) => {
          const isCollapsed = !!collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white/60 hover:text-white/90 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <span>{group.title}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 text-white/40 group-hover:text-white/80 ${
                    isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`} 
                />
              </button>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isExact = item.path === '/dashboard';
                    const isActive = isExact 
                      ? location.pathname === '/dashboard' 
                      : location.pathname.startsWith(item.path);

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        end={isExact}
                        onClick={() => onClose && onClose()}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
                          isActive 
                            ? 'bg-brand-accent text-white shadow-md font-extrabold translate-x-1' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={16} className={isActive ? 'text-white' : 'text-white/70'} />
                          <span className="truncate leading-tight">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-white/20 text-white rounded-md shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer Profile Area */}
      <div className="p-3 border-t border-white/10 bg-brand-primary-dark/60 relative">
        <div 
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors"
        >
          <div className="w-9 h-9 bg-brand-accent rounded-xl flex items-center justify-center text-white font-black text-sm mr-2.5 shadow-md border border-white/20">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-white/70 truncate">{userRole}</p>
          </div>
          <ChevronDown size={14} className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 p-1.5 space-y-1 z-50">
            <NavLink
              to="/dashboard/profile"
              onClick={() => { setProfileOpen(false); onClose && onClose(); }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Settings size={14} /> My Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}
