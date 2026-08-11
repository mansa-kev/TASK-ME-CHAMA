import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchMembers, fetchStats, fetchAnalytics, fetchChamas,
  fetchBranches, fetchProducts, fetchInventoryItems, fetchKycDocuments,
  fetchSupportTickets, fetchCommunicationLogs, fetchAuditLogs, fetchOperationsTasks,
  fetchAppraisals, fetchCommissions, fetchArrearsRecords, fetchAccountLedgers, fetchJournalVouchers, fetchPayments
} from '../api';

export interface DashboardStats {
  totalMembers: { count: number; growth: number };
  totalSavings: { amount: number; growth: number };
  activeLoans: { amount: number; count: number; averageSize: number };
  repaymentRate: { percentage: number; target: number };
}

export interface ChartDataPoint {
  month: string;
  savings: number;
  disbursements: number;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  joinDate: string;
  status: string;
  kyc: { idNumber: string; kraPin: string; nextOfKin: string };
  profilePicture?: string;
  passportPhoto?: string;
  idDocument?: string;
  idFront?: string;
  idBack?: string;
  financials: {
    shares: number;
    savings: number;
    welfare: number;
    fines: number;
    activeLoanBalance: number;
  };
}

export interface ChamaGroup {
  id: string;
  name: string;
  memberCount: number;
  meetingFrequency: string;
  totalPool: number;
  activeLoans: number;
  nextPayoutDate: string;
  nextPayoutMember: string;
}

interface DataContextType {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  chamas: ChamaGroup[];
  kycApprovals: any[];
  setKycApprovals: React.Dispatch<React.SetStateAction<any[]>>;
  products: any[];
  inventory: any[];
  branchManagement: any[];
  communications: any[];
  supportTickets: any[];
  accountsLedger: any[];
  bosaLedger: any[];
  auditLogs: any[];
  operationsTasks: any[];
  operationsAppraisals: any[];
  operationsCommissions: any[];
  operationsArrears: any[];
  transactions: any[];
  journalVouchers: any[];
  payments: any[];
  setPayments: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  setOperationsTasks: React.Dispatch<React.SetStateAction<any[]>>;
  setSupportTickets: React.Dispatch<React.SetStateAction<any[]>>;
  setAccountsLedger: React.Dispatch<React.SetStateAction<any[]>>;
  setJournalVouchers: React.Dispatch<React.SetStateAction<any[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: { count: 0, growth: 0 },
    totalSavings: { amount: 0, growth: 0 },
    activeLoans: { amount: 0, count: 0, averageSize: 0 },
    repaymentRate: { percentage: 0, target: 0 }
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [chamas, setChamas] = useState<ChamaGroup[]>([]);
  const [kycApprovals, setKycApprovals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [branchManagement, setBranchManagement] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [accountsLedger, setAccountsLedger] = useState<any[]>([]);
  const [bosaLedger, setBosaLedger] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [operationsTasks, setOperationsTasks] = useState<any[]>([]);
  const [operationsAppraisals, setOperationsAppraisals] = useState<any[]>([]);
  const [operationsCommissions, setOperationsCommissions] = useState<any[]>([]);
  const [operationsArrears, setOperationsArrears] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [journalVouchers, setJournalVouchers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = user.role === 'TCM_SUPER_ADMIN' || user.role === 'CHAMA_ADMIN';
        
        if (!isAdmin) {
          setIsLoading(false);
          return;
        }

        const [
          statsData, analyticsData, membersData, chamasData, branchesData, productsData, inventoryData,
          kycData, ticketsData, commsData, auditData, tasksData,
          appraisalsData, commissionsData, arrearsData, ledgersData, vouchersData, paymentsData
        ] = await Promise.all([
          fetchStats().catch(() => ({
            totalMembers: { count: 0, growth: 0 },
            totalSavings: { amount: 0, growth: 0 },
            activeLoans: { amount: 0, count: 0, averageSize: 0 },
            repaymentRate: { percentage: 0, target: 0 }
          })),
          fetchAnalytics().catch(() => []),
          fetchMembers().catch(() => []),
          fetchChamas().catch(() => []),
          fetchBranches().catch(() => []),
          fetchProducts().catch(() => []),
          fetchInventoryItems().catch(() => []),
          fetchKycDocuments().catch(() => []),
          fetchSupportTickets().catch(() => []),
          fetchCommunicationLogs().catch(() => []),
          fetchAuditLogs().catch(() => []),
          fetchOperationsTasks().catch(() => []),
          fetchAppraisals().catch(() => []),
          fetchCommissions().catch(() => []),
          fetchArrearsRecords().catch(() => []),
          fetchAccountLedgers().catch(() => []),
          fetchJournalVouchers().catch(() => []),
          fetchPayments().catch(() => [])
        ]);

        setStats(statsData);
        const actualChartData = Array.isArray(analyticsData) ? analyticsData : [];
        setChartData(actualChartData);
        setBranchManagement(branchesData);
        setProducts(productsData);
        setInventory(inventoryData);
        setPayments(paymentsData);
        const actualKyc = Array.isArray(kycData) ? kycData : (kycData?.data || []);
        const mappedKyc = actualKyc.map((k: any) => ({
          id: k.id,
          name: k.user?.name || 'Unknown User',
          type: 'Member',
          docs: 'National ID, KRA Pin',
          submitted: k.createdAt ? k.createdAt.split('T')[0] : 'N/A',
          status: k.status === 'PENDING' ? 'Pending' : (k.status === 'APPROVED' ? 'Approved' : 'Rejected')
        }));
        setKycApprovals(mappedKyc);
        setSupportTickets(ticketsData);
        setCommunications(commsData);
        setAuditLogs(auditData);
        setOperationsTasks(tasksData);
        setOperationsAppraisals(appraisalsData);
        setOperationsCommissions(commissionsData);
        setOperationsArrears(arrearsData);
        setAccountsLedger(ledgersData);
        setJournalVouchers(vouchersData);

        const actualMembers = Array.isArray(membersData) ? membersData : (membersData?.data || []);
        const mappedUsers = actualMembers.map((u: any) => ({
          id: u.id,
          ledgerId: u.ledger?.id || '',
          name: u.name,
          role: u.role,
          phone: u.phone || '',
          joinDate: u.createdAt ? u.createdAt.split('T')[0] : '',
          status: 'Active',
          transactions: u.ledger?.transactions || [],
          kyc: { idNumber: u.idNumber || '', kraPin: u.kraPin || '', nextOfKin: u.nextOfKinName || '' },
          profilePicture: u.profilePicture,
          passportPhoto: u.passportPhoto,
          idDocument: u.idDocument,
          idFront: u.idFront,
          idBack: u.idBack,
          financials: {
            shares: u.ledger?.sharesBalance || 0,
            savings: u.ledger?.savingsBalance || 0,
            welfare: 0,
            fines: 0,
            activeLoanBalance: u.ledger?.activeLoanBalance || 0,
          }
        }));

        // Map arrears data to members
        const membersWithArrears = mappedUsers.map((m: any) => {
          const memberArrears = arrearsData.filter((a: any) => a.memberId === m.id);
          const totalArrears = memberArrears.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
          return {
            ...m,
            hasArrears: totalArrears > 0,
            totalArrears: totalArrears,
            financials: {
              ...m.financials,
              fines: totalArrears // Update fines to reflect actual arrears for backward compatibility
            }
          };
        });

        setMembers(membersWithArrears);

        const actualChamas = Array.isArray(chamasData) ? chamasData : (chamasData?.data || []);
        const mappedChamas = actualChamas.map((c: any) => {
          return {
            id: c.id,
            name: c.name,
            memberCount: c.members?.length || 0,
            meetingFrequency: c.meetingFrequency || 'Monthly',
            totalPool: c.totalPool || 0,
            activeLoans: c.activeLoans || 0,
            nextPayoutDate: c.nextPayoutDate || '',
            nextPayoutMember: c.nextPayoutMember || ''
          };
        });
        setChamas(mappedChamas);

      } catch (err) {
        console.error('Failed to fetch data from backend', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ 
      stats, chartData, members, setMembers, chamas, kycApprovals, setKycApprovals,
      products, inventory, branchManagement, communications, supportTickets,
      accountsLedger, bosaLedger, auditLogs, operationsTasks, operationsAppraisals,
      operationsCommissions, operationsArrears, transactions, 
      journalVouchers, payments, setPayments, setProducts, setInventory, setOperationsTasks, setSupportTickets,
      setAccountsLedger, setJournalVouchers
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
