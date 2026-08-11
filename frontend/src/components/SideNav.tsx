import { useState } from 'react';
import { 
  LayoutDashboard, Building2, Users, CreditCard, 
  Zap, MessageSquare, ShieldCheck, LifeBuoy, Book, 
  BarChart2, Settings, ChevronDown, ChevronRight,
  LogOut, User, Sparkles, ChevronsUpDown
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { getUser } from '../api';

interface SubModule {
  name: string;
  path: string;
}

interface Module {
  id: number;
  name: string;
  path: string;
  icon: any;
  subModules?: SubModule[];
}

const MODULES: Module[] = [
  // 1. Core Operations
  { id: 1, name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 2, name: 'Platform Analytics', path: '/dashboard/analytics', icon: BarChart2 },

  // 2. Member & Group Management
  { 
    id: 3, name: 'Members & KYC', path: '/dashboard/members', icon: Users,
    subModules: [
      { name: 'Members Directory', path: '/dashboard/members' },
      { name: 'KYC Validation', path: '/dashboard/members/kyc' }
    ]
  },
  { id: 4, name: 'Chama Groups', path: '/dashboard/chamas', icon: Building2 },

  // 3. Financial Ledgers
  { 
    id: 5, name: 'Accounts & Ledgers', path: '/dashboard/accounts', icon: Book,
    subModules: [
      { name: 'Accounts Ledger', path: '/dashboard/accounts' },
      { name: 'BOSA Ledgers', path: '/dashboard/bosa' },
      { name: 'Payments Ledger', path: '/dashboard/payments' }
    ]
  },

  // 4. Admin & Operations
  { 
    id: 6, name: 'Operations', path: '/dashboard/operations', icon: Zap,
    subModules: [
      { name: 'General Operations', path: '/dashboard/operations' },
      { name: 'Branch Management', path: '/dashboard/operations/branches' }
    ]
  },
  { 
    id: 7, name: 'Communication & Support', path: '/dashboard/communication', icon: MessageSquare,
    subModules: [
      { name: 'Communication', path: '/dashboard/communication' },
      { name: 'Support Tickets', path: '/dashboard/support' }
    ]
  },
  
  // 5. System
  { id: 8, name: 'Reports', path: '/dashboard/reports', icon: Book },
  { id: 9, name: 'System Settings', path: '/dashboard/settings', icon: Settings }
];

export function SideNav({ onClose }: { onClose?: () => void }) {
  const [expandedModules, setExpandedModules] = useState<number[]>([3, 4]);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.name || 'Super Admin';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userRole = user?.role || 'Super Admin';

  const toggleModule = (id: number) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const toggleAllModules = () => {
    const modulesWithSubs = MODULES.filter(m => m.subModules && m.subModules.length > 0).map(m => m.id);
    const allExpanded = modulesWithSubs.every(id => expandedModules.includes(id));
    if (allExpanded) {
      setExpandedModules([]);
    } else {
      setExpandedModules(modulesWithSubs);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-full h-full bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-dark text-white flex flex-col rounded-2xl shadow-xl border border-brand-primary-dark overflow-hidden relative">
      
      {/* Platform Environment Header */}
      <div className="p-4 border-b border-white/10 bg-brand-primary-dark/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-brand-accent rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
            TC
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black tracking-wide text-white truncate">Task-Me Chama</p>
            <p className="text-[10px] text-white/70 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Super Admin Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleAllModules}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
            title="Toggle Submodules"
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

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5 custom-scrollbar">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const isExpanded = expandedModules.includes(module.id);
          const hasSubModules = module.subModules && module.subModules.length > 0;
          
          const isExact = module.path === '/dashboard';
          const isActiveGroup = isExact 
            ? location.pathname === '/dashboard' 
            : location.pathname.startsWith(module.path);

          return (
            <div key={module.id} className="space-y-1">
              {hasSubModules ? (
                // Accordion Parent
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-xs font-bold ${
                    isActiveGroup && !isExpanded
                      ? 'bg-brand-accent text-white font-extrabold shadow-md' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className="text-white/80 shrink-0" />
                    <span className="truncate">{module.name}</span>
                  </div>
                  <ChevronDown size={14} className={`text-white/60 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
              ) : (
                // Regular Link
                <NavLink
                  to={module.path}
                  end={isExact}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
                    isActiveGroup
                      ? 'bg-brand-accent text-white font-extrabold shadow-md translate-x-0.5' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={`shrink-0 ${isActiveGroup ? 'text-white' : 'text-white/80'}`} />
                    <span className="truncate">{module.name}</span>
                  </div>
                </NavLink>
              )}

              {/* Sub Modules Dropdown */}
              {hasSubModules && isExpanded && (
                <div className="mt-1 ml-4 space-y-0.5 border-l-2 border-white/20 pl-2.5">
                  {module.subModules!.map((sub) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        end
                        onClick={() => onClose && onClose()}
                        className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSubActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-white/10 bg-brand-primary-dark/60 relative">
        <div 
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors"
        >
          <div className="w-9 h-9 bg-brand-accent rounded-xl flex items-center justify-center text-white font-black text-xs mr-2.5 shadow-md border border-white/20 shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-white/70 truncate">{userRole}</p>
          </div>
          <ChevronDown size={14} className={`text-white/60 transition-transform shrink-0 ${profileOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 p-1.5 space-y-1 z-50">
            <NavLink
              to="/dashboard/settings"
              onClick={() => { setProfileOpen(false); onClose && onClose(); }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Settings size={14} /> Platform Settings
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
