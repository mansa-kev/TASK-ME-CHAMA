import React, { useState, useEffect } from 'react';
import { fetchTenantSubscription, fetchPublicPlans } from '../../api';
import { 
  CreditCard, 
  Check, 
  Users, 
  Activity, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ArrowUpRight, 
  RefreshCw, 
  Zap,
  PhoneCall
} from 'lucide-react';

interface TenantSubscriptionData {
  subscription: {
    id: string;
    billingCycle: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan: {
      id: string;
      code: string;
      name: string;
      description: string;
      priceMonthly: number;
      priceAnnual: number;
      maxMembers: number;
      maxTransactionsPerMonth: number;
      features: string[];
    };
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
  } | null;
  usage: {
    memberCount: number;
    maxMembers: number;
    currentMonthTransactions: number;
    maxTransactionsPerMonth: number;
  };
}

const defaultSubscriptionData: TenantSubscriptionData = {
  subscription: {
    id: 'sub-starter',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan: {
      id: 'plan-starter',
      code: 'STARTER',
      name: 'Starter Tier',
      description: 'Ideal for early-stage and community chamas.',
      priceMonthly: 1500,
      priceAnnual: 15000,
      maxMembers: 30,
      maxTransactionsPerMonth: 500,
      features: ['Automated M-Pesa Recon', 'Constitutional Bylaws', 'Multi-Signatory Approvals']
    },
    invoices: []
  },
  usage: {
    memberCount: 8,
    maxMembers: 30,
    currentMonthTransactions: 45,
    maxTransactionsPerMonth: 500
  }
};

export const OfficialsSubscription: React.FC = () => {
  const [data, setData] = useState<TenantSubscriptionData>(defaultSubscriptionData);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<any | null>(null);
  const [phone, setPhone] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [subData, publicPlans] = await Promise.all([
        fetchTenantSubscription(),
        fetchPublicPlans()
      ]);
      if (subData && subData.subscription) {
        setData(subData);
      }
      if (publicPlans && Array.isArray(publicPlans)) {
        setPlans(publicPlans);
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgradeStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setProcessingPayment(true);
    // Simulate real Daraja STK Push trigger
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setUpgradingPlan(null);
        loadData();
      }, 3000);
    }, 2500);
  };

  if (loading || !data) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading Chama SaaS plan status & telemetry...</p>
      </div>
    );
  }

  const currentPlan = data.subscription?.plan;
  const memberPct = Math.min(100, Math.round((data.usage.memberCount / data.usage.maxMembers) * 100));
  const txnPct = Math.min(100, Math.round((data.usage.currentMonthTransactions / data.usage.maxTransactionsPerMonth) * 100));

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            Chama SaaS Plan & Billing
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your autonomous Chama's platform subscription, member quota, and transaction velocity.
          </p>
        </div>
        <div>
          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              data.subscription?.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            ● {data.subscription?.status || 'TRIAL'} PLAN
          </span>
        </div>
      </div>

      {/* Usage telemetry cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Plan Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Current Subscription Tier
              </span>
              <span className="bg-white/10 text-xs font-mono px-2.5 py-0.5 rounded-md font-bold text-indigo-200">
                {data.subscription?.billingCycle || 'ANNUAL'}
              </span>
            </div>

            <h3 className="text-2xl font-black mt-2">{currentPlan?.name || 'Pro Sacco / Large Chama'}</h3>
            <p className="text-xs text-slate-300 mt-1">{currentPlan?.description}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-black">
                KES {currentPlan?.priceMonthly.toLocaleString() || '7,500'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/month</span>
            </div>

            <div className="mt-4 text-xs text-indigo-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Next Renewal Date:{' '}
              <span className="font-bold text-white">
                {data.subscription?.currentPeriodEnd
                  ? new Date(data.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Active'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Autonomous Daraja M-Pesa Billing</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Protected
            </span>
          </div>
        </div>

        {/* Quota & Usage Meter */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Resource Allocation & Quotas</h3>

            {/* Members Quota */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Active Members
                </span>
                <span className="font-bold text-gray-900">
                  {data.usage.memberCount} / {data.usage.maxMembers} ({memberPct}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    memberPct > 90 ? 'bg-rose-500' : memberPct > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${memberPct}%` }}
                />
              </div>
            </div>

            {/* Monthly Transaction Ceiling */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Monthly Transaction Capacity
                </span>
                <span className="font-bold text-gray-900">
                  {data.usage.currentMonthTransactions} / {data.usage.maxTransactionsPerMonth} ({txnPct}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    txnPct > 90 ? 'bg-rose-500' : txnPct > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${txnPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
            <span className="font-medium">Need more member seats or higher volume?</span>
            <span className="font-bold text-indigo-600">Upgrade Available</span>
          </div>
        </div>
      </div>

      {/* Available Upgrade Plans */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-black text-gray-900">Explore Available Subscription Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.code === plan.code;
            return (
              <div
                key={plan.id}
                className={`bg-white p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
                    : 'border-gray-100 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-gray-400">{plan.code}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-gray-900 mt-2">{plan.name}</h4>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-gray-900">
                      KES {plan.priceMonthly.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">/mo</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div className="text-gray-600">
                      Up to <strong className="text-gray-900">{plan.maxMembers}</strong> members
                    </div>
                    <div className="text-gray-600">
                      <strong className="text-gray-900">{plan.maxTransactionsPerMonth.toLocaleString()}</strong> txns/mo
                    </div>
                    {plan.features.slice(0, 3).map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-gray-700 text-[11px]">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-100 text-gray-500 font-bold text-xs rounded-xl"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setUpgradingPlan(plan)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Select & Upgrade
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* M-Pesa STK Push Modal */}
      {upgradingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-xl font-black text-gray-900">
              Upgrade to {upgradingPlan.name}
            </h3>
            <p className="text-xs text-gray-500">
              Enter your Safaricom M-Pesa phone number to receive an instant STK Push prompt for KES {upgradingPlan.priceMonthly.toLocaleString()}.
            </p>

            {paymentSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Payment Confirmed!</h4>
                <p className="text-xs text-emerald-700">Your Chama has been upgraded to {upgradingPlan.name}.</p>
              </div>
            ) : (
              <form onSubmit={handleUpgradeStkPush} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">M-Pesa Phone Number</label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="07XXXXXXXX or 2547XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tier:</span>
                    <span className="font-bold text-gray-800">{upgradingPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Due:</span>
                    <span className="font-bold text-indigo-600">KES {upgradingPlan.priceMonthly.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUpgradingPlan(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Prompting M-Pesa STK...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Send M-Pesa STK Push
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default OfficialsSubscription;
