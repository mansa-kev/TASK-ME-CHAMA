import { PromptProvider } from './common/PromptProvider';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { OfficialsSideNav } from './OfficialsSideNav';
import { Header } from './Header';
import { Home, Users, Landmark, Banknote, Menu } from 'lucide-react';

export function OfficialsLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <PromptProvider>
    <div className="h-screen w-full bg-bg-app p-2 sm:p-4 flex gap-4 overflow-hidden relative">
      {/* Desktop Floating Detached Sidebar */}
      {isDesktopSidebarOpen && (
        <div className="hidden lg:block w-[280px] flex-shrink-0 h-full transition-all duration-300 ease-in-out">
          <OfficialsSideNav onClose={() => setIsDesktopSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile Off-canvas Slide-over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[70px] sm:top-[88px] z-50 flex lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-[250px] max-w-[85vw] h-full p-2 sm:p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="w-full h-full rounded-2xl border-[3px] border-[#FDB813] shadow-2xl overflow-hidden">
              <OfficialsSideNav onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
        {/* Floating Detached Header */}
        <Header toggleSidebar={() => {
          if (window.innerWidth >= 1024) {
            setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
          } else {
            setIsSidebarOpen(!isSidebarOpen);
          }
        }} />

        {/* Scrollable Content Area with bottom space for mobile navigation */}
        <main className="mt-2 sm:mt-4 flex-1 overflow-x-hidden overflow-y-auto pr-1 sm:pr-2 pb-20 lg:pb-4 main-scrollbar relative">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Sticky Bottom Navigation Bar for Officials */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname === '/dashboard' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/officials-members')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/officials-members') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Members</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/officials-treasury')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/officials-treasury') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Treasury</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/officials-loans')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/officials-loans') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Loans</span>
          </button>

          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-900"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </div>
      </div>
        </div>
    </PromptProvider>
  );
}
