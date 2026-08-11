import { useState, useEffect } from 'react';
import { Menu, Mail, Bell, Settings, LogOut, User, ChevronDown, MapPin, Search as SearchIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser, fetchBranches } from '../api';
import { useNavigate } from 'react-router';
import { QuickSearch } from './QuickSearch';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.name || 'User';
  let roleLabel = 'Super Admin';
  if (user?.role === 'CHAMA_ADMIN') roleLabel = 'Group Official';
  else if (user?.role === 'MEMBER') roleLabel = 'Chama Member';
  const encodedName = encodeURIComponent(userName);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchBranches();
        setBranches(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-brand-primary via-brand-primary to-brand-primary-dark text-white rounded-2xl shadow-lg border border-brand-primary-dark flex-shrink-0">
        <div className="w-full h-[62px] sm:h-[72px] flex items-center justify-between px-3 sm:px-5 gap-2 sm:gap-4">
          
          {/* Left section: Hamburger + Logo */}
          <div className="shrink-0 flex items-center space-x-2 sm:space-x-3.5">
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white"
              aria-label="Toggle Sidebar"
              title="Toggle Menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center mr-2 sm:mr-2.5 shadow-md shrink-0">
                <span className="text-brand-primary font-black text-xs sm:text-sm">TC</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-xs sm:text-base leading-none tracking-wide text-white truncate">Task-Me Chama</h1>
                <p className="text-[9px] sm:text-[10px] text-white/70 uppercase tracking-widest mt-0.5 font-bold truncate">{roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Middle section: Search & Branch Selector */}
          <div className="flex-1 flex items-center justify-end sm:justify-center space-x-2 sm:space-x-3 max-w-md sm:max-w-lg">
            {/* Mobile Search Icon Button */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="sm:hidden p-2 bg-black/25 hover:bg-black/35 text-white/90 rounded-xl border border-white/10 transition-colors shadow-inner"
              title="Quick Search (Ctrl+K)"
            >
              <SearchIcon size={16} />
            </button>

            {/* Desktop / Tablet Search Bar */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex flex-1 items-center justify-between bg-black/25 hover:bg-black/35 text-white/80 px-3.5 py-2 rounded-xl border border-white/10 transition-colors shadow-inner text-xs sm:text-sm font-medium"
            >
              <span className="flex items-center gap-2 truncate">
                <SearchIcon size={14} className="text-white/60 shrink-0" />
                <span className="truncate">Quick search...</span>
              </span>
              <span className="text-[10px] bg-black/40 text-white/70 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5">Ctrl+K</span>
            </button>

            <div className="relative shrink-0">
              <button 
                onClick={() => setBranchOpen(!branchOpen)}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-black/25 hover:bg-black/35 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/10 transition-colors text-xs font-bold"
              >
                <MapPin size={13} className="text-brand-accent shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{selectedBranch}</span>
                <ChevronDown size={12} className="opacity-70 shrink-0" />
              </button>

              {branchOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBranchOpen(false)}></div>
                  <div className="absolute top-full right-0 sm:left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1.5 z-50 border border-gray-100 text-gray-800">
                    <button 
                      onClick={() => { setSelectedBranch('All Branches'); setBranchOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 font-bold transition-colors ${selectedBranch === 'All Branches' ? 'text-brand-primary bg-gray-50' : 'text-gray-700'}`}
                    >
                      All Branches
                    </button>
                    {branches.map((b, i) => (
                      <button 
                        key={i}
                        onClick={() => { setSelectedBranch(b.name || b.branchName); setBranchOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 font-bold transition-colors ${selectedBranch === (b.name || b.branchName) ? 'text-brand-primary bg-gray-50' : 'text-gray-700'}`}
                      >
                        {b.name || b.branchName}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right section: Date, Messages, Notifications & Profile */}
          <div className="shrink-0 flex items-center space-x-1.5 sm:space-x-2.5">
            <div className="hidden md:flex items-center bg-brand-primary-dark/80 px-3 py-1.5 rounded-full border border-white/10 shadow-inner text-white/90 text-xs font-bold tracking-wide">
              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            
            {/* Broadcasts Button */}
            <div className="relative">
              <button 
                onClick={() => {
                  const role = user?.role;
                  if (role === 'TCM_SUPER_ADMIN') navigate('/dashboard/saas/sms');
                  else if (role === 'CHAMA_ADMIN') navigate('/dashboard/officials-communication');
                  else navigate('/dashboard/notifications');
                }}
                className="hidden xs:flex relative p-2 text-white/80 hover:text-white bg-brand-primary-dark/80 rounded-xl border border-white/10 hover:bg-white/10 transition-colors shadow-inner"
                title="Broadcasts & SMS"
              >
                <Mail size={15} />
              </button>
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-white/80 hover:text-white bg-brand-primary-dark/80 rounded-xl border border-white/10 hover:bg-white/10 transition-colors shadow-inner"
                title="Notifications"
              >
                <Bell size={15} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-accent rounded-full border border-brand-primary-dark animate-pulse"></span>
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">Notifications & Alerts</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">2 Unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      <div 
                        onClick={() => { setNotifOpen(false); navigate('/dashboard/notifications'); }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-brand-primary">Automated Ledger Sync</span>
                          <span className="text-[9px] text-gray-400">Just now</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium mt-0.5 line-clamp-1">Chart of accounts & journal vouchers synchronized successfully.</p>
                      </div>
                      <div 
                        onClick={() => { setNotifOpen(false); navigate('/dashboard/saas/daraja'); }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-emerald-600">Daraja Gateway Active</span>
                          <span className="text-[9px] text-gray-400">10m ago</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium mt-0.5 line-clamp-1">M-Pesa STK Push callbacks are processing in live webhook mode.</p>
                      </div>
                    </div>
                    <div className="pt-2 px-3 border-t border-gray-100 flex items-center justify-between">
                      <button 
                        onClick={() => {
                          toast.success('All notifications marked as read');
                          setNotifOpen(false);
                        }}
                        className="text-[11px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Mark all as read
                      </button>
                      <button 
                        onClick={() => {
                          setNotifOpen(false);
                          navigate('/dashboard/notifications');
                        }}
                        className="text-[11px] font-black text-brand-primary hover:underline"
                      >
                        View all →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-accent rounded-xl border-2 border-white/20 shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-white transition-all shrink-0"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodedName}&background=1E3A8A&color=fff&bold=true`} 
                  alt={userName}
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 text-gray-800">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-black text-gray-900 truncate">{userName}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || 'admin@taskmechama.com'}</p>
                      <span className="inline-block mt-1 text-[9px] font-black uppercase bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">
                        {user?.role || 'Chama User'}
                      </span>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => { setProfileOpen(false); navigate('/dashboard/settings'); }} 
                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center font-bold text-gray-700 transition-colors"
                      >
                        <User size={14} className="mr-2.5 text-brand-primary" /> Profile Settings
                      </button>
                      <button 
                        onClick={() => { setProfileOpen(false); navigate('/dashboard/settings'); }} 
                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center font-bold text-gray-700 transition-colors"
                      >
                        <Settings size={14} className="mr-2.5 text-brand-primary" /> System Preferences
                      </button>
                    </div>
                    <div className="py-1 border-t border-gray-100">
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 flex items-center text-red-600 font-black transition-colors"
                      >
                        <LogOut size={14} className="mr-2.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <QuickSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
