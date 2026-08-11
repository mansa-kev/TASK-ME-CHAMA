import { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  FileText,
  Users, 
  Package, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown, 
  Building, 
  Briefcase, 
  MessagesSquare, 
  Scale, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  FileSpreadsheet,
  ChevronsUpDown
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router';
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

const OFFICIALS_NAV_GROUPS: NavGroup[] = [
  {
    id: 'members_group',
    title: 'Members & Approvals',
    items: [
      { id: 'dashboard', name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { id: 'members', name: 'Members Directory', path: '/dashboard/officials-members', icon: Users },
      { id: 'vetting', name: 'Member Approvals', path: '/dashboard/officials-vetting', icon: ShieldCheck, badge: 'Vetting' },
    ]
  },
  {
    id: 'money_group',
    title: 'Money & Accounts',
    items: [
      { id: 'contributions', name: 'Contributions & Savings', path: '/dashboard/officials-contributions', icon: Wallet },
      { id: 'treasury', name: 'Bank & M-Pesa Accounts', path: '/dashboard/officials-treasury', icon: Building },
      { id: 'reconciliation', name: 'Verify Payments', path: '/dashboard/officials-reconciliation', icon: FileSpreadsheet },
      { id: 'loans', name: 'Member Loans', path: '/dashboard/officials-loans', icon: CreditCard },
    ]
  },
  {
    id: 'rotations_group',
    title: 'Rotations & Assets',
    items: [
      { id: 'rosca', name: 'Merry-Go-Round Rotations', path: '/dashboard/officials-rosca', icon: RotateCcw },
      { id: 'marketplace', name: 'Group Purchases & Assets', path: '/dashboard/officials-marketplace', icon: Package },
    ]
  },
  {
    id: 'governance_group',
    title: 'Meetings & Rules',
    items: [
      { id: 'meetings', name: 'Meetings & Minutes', path: '/dashboard/officials-meetings', icon: Briefcase },
      { id: 'bylaws', name: 'Group Rules & Bylaws', path: '/dashboard/officials-bylaws', icon: Scale },
      { id: 'communication', name: 'Send Messages & SMS', path: '/dashboard/officials-communication', icon: MessagesSquare },
    ]
  },
  {
    id: 'admin_group',
    title: 'Reports & Settings',
    items: [
      { id: 'reports', name: 'Financial Reports', path: '/dashboard/officials-reports', icon: FileText },
      { id: 'settings', name: 'Group Settings', path: '/dashboard/officials-settings', icon: Settings },
    ]
  }
];

export function OfficialsSideNav({ onClose }: { onClose?: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.name || 'Group Official';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userRole = user?.role === 'CHAMA_ADMIN' ? 'Group Official' : 'Official';

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleToggleAll = () => {
    const allCollapsed = OFFICIALS_NAV_GROUPS.every(g => !!collapsedGroups[g.id]);
    if (allCollapsed) {
      // Expand all
      setCollapsedGroups({});
    } else {
      // Collapse all
      const newCollapsed: Record<string, boolean> = {};
      OFFICIALS_NAV_GROUPS.forEach(g => {
        newCollapsed[g.id] = true;
      });
      setCollapsedGroups(newCollapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const areAllCollapsed = OFFICIALS_NAV_GROUPS.every(g => !!collapsedGroups[g.id]);

  return (
    <aside className="w-full h-full bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-dark text-white flex flex-col rounded-2xl shadow-xl border border-white/10 overflow-hidden relative">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-brand-primary-dark/60 backdrop-blur-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-brand-accent rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
            TC
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate leading-tight">Task-Me Chama</h2>
            <p className="text-[10px] text-white/70 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Officials Portal
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleAll}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
            title={areAllCollapsed ? 'Expand All Modules' : 'Collapse All Modules'}
          >
            <ChevronsUpDown size={14} />
          </button>

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
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-2.5 custom-scrollbar">
        {OFFICIALS_NAV_GROUPS.map((group) => {
          const isCollapsed = !!collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1 bg-white/[0.04] rounded-xl p-1.5 border border-white/5">
              {/* Group Header Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left group"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                  <span className="truncate">{group.title}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white/60">
                    {group.items.length}
                  </span>
                  <ChevronDown 
                    size={13} 
                    className={`text-white/50 group-hover:text-white transition-transform duration-200 ${
                      isCollapsed ? '-rotate-90' : 'rotate-0'
                    }`} 
                  />
                </div>
              </button>

              {/* Submodule Items */}
              {!isCollapsed && (
                <div className="space-y-0.5 pt-0.5 transition-all duration-200">
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
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all duration-200 font-medium text-xs ${
                          isActive 
                            ? 'bg-brand-accent text-white font-bold shadow-md shadow-brand-accent/20 translate-x-0.5' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-white/75'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                            isActive ? 'bg-white text-brand-accent' : 'bg-white/20 text-white'
                          }`}>
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

      {/* Bottom Profile Area */}
      <div className="mt-auto border-t border-white/10 bg-brand-primary-dark/60 backdrop-blur-md p-3">
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                {userInitials}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] text-white/70 font-medium truncate">{userRole}</p>
              </div>
            </div>
            <ChevronDown size={14} className={`text-white/50 transition-transform duration-200 shrink-0 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-brand-primary-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button 
                onClick={() => { setProfileOpen(false); navigate('/dashboard/officials-settings'); }}
                className="w-full flex items-center gap-2.5 p-2.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <User size={14} /> Group Settings
              </button>
              <div className="h-px bg-white/10 w-full" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
