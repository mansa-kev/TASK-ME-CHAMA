import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { PortalProvider, usePortal } from './contexts/PortalContext';

import { MembersSideNav } from './components/MembersSideNav';
import { getAuthToken } from './api';
import { SideNav } from './components/SideNav';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { MembersDirectory } from './components/MembersDirectory';
import { MemberProfile } from './components/MemberProfile';

import { KycValidation } from './components/KycValidation';
import { BosaLedgers } from './components/BosaLedgers';
import { ChamasLedger } from './components/ChamasLedger';
import { ChamaProfile } from './components/ChamaProfile';
import { PaymentsLedger } from './components/PaymentsLedger';
import { AccountsLedger } from './components/AccountsLedger';
import { InventoryLedger } from './components/InventoryLedger';
import { OperationsModule } from './components/OperationsModule';
import { CommunicationModule } from './components/CommunicationModule';
import { IndividualOnboarding } from './components/IndividualOnboarding';
import { ChamaOnboarding } from './components/ChamaOnboarding';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { MembersDashboard } from './components/MembersDashboard';
import { WalletModule } from './components/WalletModule';
import { MySavings } from './components/MySavings';
import { MyLoans } from './components/MyLoans';
import { StatementsModule } from './components/StatementsModule';
import { GuarantorshipModule } from './components/GuarantorshipModule';
import { GroupInfoModule } from './components/GroupInfoModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { MemberNotificationsModule } from './components/MemberNotificationsModule';
import { MemberProfileModule } from './components/MemberProfileModule';
import { MemberSupportModule } from './components/MemberSupportModule';
import { SupportModule } from './components/SupportModule';
import { BranchManagement } from './components/BranchManagement';
import { StatsModule } from './components/StatsModule';
import { DataProvider } from './components/data';
import { Search, Home, Users, Building2, Wallet, TrendingUp, Banknote, Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { LoginScreen } from './components/auth/LoginScreen';
import { OfficialsLayout } from './components/OfficialsLayout';
import { OfficialsDashboard } from './components/officials/OfficialsDashboard';
import { OfficialsMembers } from './components/officials/OfficialsMembers';
import { OfficialsContributions } from './components/officials/OfficialsContributions';
import { OfficialsLoans } from './components/officials/OfficialsLoans';
import { OfficialsTreasury } from './components/officials/OfficialsTreasury';
import { OfficialsMeetings } from './components/officials/OfficialsMeetings';
import { OfficialsReports } from './components/officials/OfficialsReports';
import { OfficialsSettings } from './components/officials/OfficialsSettings';
import { OfficialsCommunication } from './components/officials/OfficialsCommunication';
import { OfficialsMarketplace } from './components/officials/OfficialsMarketplace';
import { OfficialsBylaws } from './components/officials/OfficialsBylaws';
import { OfficialsSubscription } from './components/officials/OfficialsSubscription';
import { OfficialsMemberVetting } from './components/officials/OfficialsMemberVetting';
import { OfficialsRosca } from './components/officials/OfficialsRosca';
import { OfficialsReconciliation } from './components/officials/OfficialsReconciliation';







import { useNavigate } from 'react-router';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-screen w-full bg-bg-app p-2 sm:p-4 flex gap-4 overflow-hidden relative">
      {/* Desktop Floating Detached Sidebar */}
      {isDesktopSidebarOpen && (
        <div className="hidden lg:block w-[260px] flex-shrink-0 h-full transition-all duration-300 ease-in-out">
          <SideNav onClose={() => setIsDesktopSidebarOpen(false)} />
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
              <SideNav onClose={() => setIsSidebarOpen(false)} />
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
        
        {/* Scrollable Dashboard Content */}
        <main className="mt-2 sm:mt-4 flex-1 overflow-y-auto pr-1 sm:pr-2 pb-20 lg:pb-4 main-scrollbar relative">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Sticky Bottom Navigation Bar for Super Admin */}
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
            onClick={() => navigate('/dashboard/members')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/members') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Members</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/chamas')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/chamas') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Groups</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/accounts')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/accounts') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Accounts</span>
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
  );
}

function MembersLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-bg-app p-2 sm:p-4 flex gap-4 overflow-hidden relative">
      {/* Desktop Floating Detached Sidebar */}
      {isDesktopSidebarOpen && (
        <div className="hidden lg:block w-[260px] flex-shrink-0 h-full transition-all duration-300 ease-in-out">
          <MembersSideNav onClose={() => setIsDesktopSidebarOpen(false)} />
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
              <MembersSideNav onClose={() => setIsSidebarOpen(false)} />
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
        
        {/* Scrollable Dashboard Content with bottom spacing for mobile nav bar */}
        <main className="mt-2 sm:mt-4 flex-1 overflow-y-auto pr-1 sm:pr-2 pb-20 lg:pb-4 main-scrollbar relative">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Sticky Bottom Navigation Bar for Members */}
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
            onClick={() => navigate('/dashboard/wallet')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/wallet') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Wallet</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/savings')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/savings') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Savings</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard/loans')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-bold transition-colors ${
              location.pathname.startsWith('/dashboard/loans') ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
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
  );
}

function AppContent() {
  const { currentPortal } = usePortal();
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <DataProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm font-bold shadow-xl border border-gray-100',
          style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1f2937',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Router>
        {currentPortal === 'members' ? (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<MembersLayout />}>
              <Route index element={<MembersDashboard />} />
              <Route path="wallet" element={<WalletModule />} />
              <Route path="savings" element={<MySavings />} />
              <Route path="loans" element={<MyLoans />} />
              <Route path="statements" element={<StatementsModule />} />
              <Route path="guarantorship" element={<GuarantorshipModule />} />
              <Route path="group" element={<GroupInfoModule />} />
              <Route path="marketplace" element={<MarketplaceModule />} />
              <Route path="notifications" element={<MemberNotificationsModule />} />
              <Route path="profile" element={<MemberProfileModule />} />
              <Route path="support" element={<MemberSupportModule />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : currentPortal === 'officials' ? (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<OfficialsLayout />}>
              <Route index element={<OfficialsDashboard />} />
              <Route path="officials-bylaws" element={<OfficialsBylaws />} />
              <Route path="officials-subscription" element={<OfficialsSubscription />} />
              <Route path="officials-members" element={<OfficialsMembers />} />
              <Route path="officials-vetting" element={<OfficialsMemberVetting />} />
              <Route path="officials-contributions" element={<OfficialsContributions />} />
              <Route path="officials-rosca" element={<OfficialsRosca />} />
              <Route path="officials-loans" element={<OfficialsLoans />} />
              <Route path="officials-treasury" element={<OfficialsTreasury />} />
              <Route path="officials-reconciliation" element={<OfficialsReconciliation />} />
              <Route path="officials-meetings" element={<OfficialsMeetings />} />
              <Route path="officials-reports" element={<OfficialsReports />} />
              <Route path="officials-marketplace" element={<OfficialsMarketplace />} />
              <Route path="officials-communication" element={<OfficialsCommunication />} />
              <Route path="officials-settings" element={<OfficialsSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="registration/individual" element={<IndividualOnboarding />} />
              <Route path="registration/chama" element={<ChamaOnboarding />} />
              <Route path="members" element={<MembersDirectory />} />
              <Route path="members/kyc" element={<KycValidation />} />
              <Route path="members/:id" element={<MemberProfile />} />
              <Route path="bosa/*" element={<BosaLedgers />} />
              <Route path="chamas/*" element={<ChamasLedger />} />
              <Route path="chamas/:id" element={<ChamaProfile />} />
              <Route path="payments/*" element={<PaymentsLedger />} />
              <Route path="accounts/*" element={<AccountsLedger />} />
              <Route path="inventory/*" element={<InventoryLedger />} />
              <Route path="operations/*" element={<OperationsModule />} />
              <Route path="operations/branches" element={<BranchManagement />} />
              <Route path="communication" element={<CommunicationModule />} />
              <Route path="support" element={<SupportModule />} />
              <Route path="reports/*" element={<ReportsModule />} />
              <Route path="settings" element={<SettingsModule />} />
              <Route path="analytics" element={<AnalyticsModule />} />
              <Route path="stats" element={<StatsModule />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </Router>
    </DataProvider>
  );
}

function App() {
  return (
    <PortalProvider>
      <AppContent />
    </PortalProvider>
  );
}

export default App;
