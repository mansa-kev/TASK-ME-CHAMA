import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiFetch, postMemberDeposit } from '../api';
import toast from 'react-hot-toast';

export function WalletModule() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentType, setPaymentType] = useState('contribution');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/members/me');
        setProfile(data);
        setPhone(data.phone || '');
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    setPaymentStatus('processing');
    
    try {
      // Call the real API
      await postMemberDeposit(profile.id, {
        amount: parseFloat(amount),
        type: paymentType === 'savings' ? 'SAVINGS' : paymentType === 'contribution' ? 'SHARES' : paymentType === 'penalty' ? 'PENALTY' : 'LOAN_REPAYMENT',
        phone,
      });

      // Re-fetch profile so balances update
      const updatedProfile = await apiFetch('/members/me');
      setProfile(updatedProfile);
      
      setTimeout(() => {
        setPaymentStatus('success');
        setIsPaying(false);
        toast.success('Payment processed successfully');
      }, 800);
    } catch (error) {
      console.error('Payment failed', error);
      setIsPaying(false);
      setPaymentStatus('idle');
      toast.error('Payment failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Payments & Wallet</h1>
        <p className="text-xs sm:text-sm text-gray-500">Manage your pending obligations and make instant payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Obligations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Pending Obligations</h2>
              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                Active Cycle
              </span>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Dynamic Monthly Contribution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-orange-100 bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">Monthly Contribution ({new Date().toLocaleString('default', { month: 'short' })})</p>
                    <p className="text-xs text-gray-500">Regular Savings / Shares</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-orange-200/50">
                  <p className="font-black text-gray-900 text-sm sm:text-base">KES {(profile?.chama?.standardContribution || 2500).toLocaleString()}</p>
                  <button 
                    onClick={() => { 
                      setPaymentType('contribution'); 
                      setAmount(String(profile?.chama?.standardContribution || 2500));
                      document.getElementById('payment-amount-input')?.focus();
                    }}
                    className="text-xs font-bold bg-brand-accent text-white sm:bg-transparent sm:text-brand-accent sm:hover:underline px-3 py-1.5 sm:p-0 rounded-lg"
                  >
                    Pay Now →
                  </button>
                </div>
              </div>

              {/* Loan Installment */}
              {profile?.ledger?.activeLoanBalance > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">Loan Installment</p>
                      <p className="text-xs text-gray-500">Scheduled Repayment</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                    <p className="font-black text-gray-900 text-sm sm:text-base">KES {Math.round((profile?.ledger?.activeLoanBalance || 0) / 12).toLocaleString()}</p>
                    <button 
                      onClick={() => { 
                        setPaymentType('loan'); 
                        setAmount(String(Math.round((profile?.ledger?.activeLoanBalance || 0) / 12)));
                        document.getElementById('payment-amount-input')?.focus();
                      }}
                      className="text-xs font-bold bg-brand-primary text-white sm:bg-transparent sm:text-brand-primary sm:hover:underline px-3 py-1.5 sm:p-0 rounded-lg"
                    >
                      Pay Now →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Gateway */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand-accent" />
              Lipa na M-Pesa
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {paymentStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-sm text-gray-500 mb-6">KES {amount} has been credited to your account.</p>
                <button 
                  onClick={() => setPaymentStatus('idle')}
                  className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Make Another Payment
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Type</label>
                  <select 
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-sm font-medium"
                  >
                    <option value="contribution">Monthly Contribution / Shares</option>
                    <option value="savings">Voluntary Savings</option>
                    <option value="loan">Loan Repayment</option>
                    <option value="penalty">Penalty / Fine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (KES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KES</span>
                    <input
                      id="payment-amount-input"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all font-black text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  {/* Quick Amount Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['500', '1000', '2500', '5000'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                          amount === preset 
                            ? 'bg-brand-accent text-white border-brand-accent' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        +{parseInt(preset).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-sm font-medium tracking-wide"
                    placeholder="254700000000"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">A payment PIN prompt will be sent to this phone number.</p>
                </div>

                <button
                  type="submit"
                  disabled={isPaying || !amount || !phone}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 mt-4 flex items-center justify-center gap-2 text-sm"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Awaiting PIN Prompt...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay KES {amount ? parseInt(amount).toLocaleString() : '0'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
