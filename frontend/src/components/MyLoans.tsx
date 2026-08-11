import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Activity, CheckCircle, FileText, Download, Users, X } from 'lucide-react';
import { apiFetch, createLoan, addGuarantor } from '../api';
import toast from 'react-hot-toast';

export function MyLoans() {
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestTerm, setRequestTerm] = useState('3');
  const [selectedGuarantors, setSelectedGuarantors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/members/me');
        setProfile(data);
        const membersData = await apiFetch('/members');
        setMembers(membersData.filter((m: any) => m.id !== data.id));
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || selectedGuarantors.length === 0) return;
    setIsSubmitting(true);
    try {
      const loan = await createLoan({
        memberId: profile.id,
        memberName: profile.name,
        productName: "Personal Loan",
        principal: parseFloat(requestAmount),
        interestRate: 12.0,
        duration: parseInt(requestTerm),
        interestMethod: "REDUCING_BALANCE"
      });

      const amountPerGuarantor = selectedGuarantors.length > 0 ? parseFloat(requestAmount) / selectedGuarantors.length : 0;
      let allGuarantorsSuccess = true;
      for (const g of selectedGuarantors) {
        try {
          await addGuarantor(loan.id, {
            guarantorId: g.id,
            guarantorName: g.name,
            amountGuaranteed: amountPerGuarantor
          });
        } catch (guarantorError: any) {
          allGuarantorsSuccess = false;
          toast.error(`Failed to add ${g.name}: ${guarantorError.message || 'Insufficient savings'}`);
        }
      }
      
      if (allGuarantorsSuccess) {
        setRequestSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('Some guarantors were rejected. Your loan request is pending, but you may need to add different guarantors.');
        setRequestSuccess(true);
        setTimeout(() => window.location.reload(), 4000);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit loan request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeLoan = profile?.loans?.find((l: any) => l.status === 'ACTIVE' || l.status === 'DISBURSED' || l.balance > 0);
  const activeLoanBalance = profile?.ledger?.activeLoanBalance || 0;
  const hasActiveLoan = activeLoanBalance > 0 || !!activeLoan;
  const currentInterestRate = activeLoan?.interestRate ?? 12;
  const currentDuration = activeLoan?.duration ?? 3;

  const calculateEstimatedEMI = () => {
    const p = parseFloat(requestAmount) || 0;
    if (p <= 0) return 0;
    const r = 0.12 / 12;
    const n = parseInt(requestTerm) || 3;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">My Loans</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your active loans and request new credit lines.</p>
        </div>
        {hasActiveLoan && (
          <button 
            onClick={() => {
              const p = activeLoanBalance;
              const r = (currentInterestRate / 100) / 12;
              const n = currentDuration; 
              const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
              let csv = "Month,Principal,Interest,Balance\n";
              let bal = p;
              for (let i = 1; i <= n; i++) {
                const interest = bal * r;
                const princ = emi - interest;
                bal -= princ;
                csv += `${i},${princ.toFixed(2)},${interest.toFixed(2)},${Math.max(0, bal).toFixed(2)}\n`;
              }
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Amortization_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Amortization schedule downloaded');
            }}
            className="bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Download className="w-4 h-4" />
            Amortization Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Loan Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-brand-accent to-brand-amber text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
              <div className="bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                {hasActiveLoan ? 'Active Facility' : 'Good Standing'}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">Outstanding Balance</p>
              <h3 className="text-2xl sm:text-4xl font-black mb-1">KES {activeLoanBalance.toLocaleString()}</h3>
            </div>
          </div>

          {hasActiveLoan ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Loan Facility Details</h2>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-3 bg-gray-50/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-brand-accent" /> Interest Rate</p>
                  <p className="font-black text-gray-900 text-base sm:text-lg">{currentInterestRate}% p.a</p>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500" /> Duration</p>
                  <p className="font-black text-gray-900 text-base sm:text-lg">{currentDuration} Months</p>
                </div>
                <div className="p-3 bg-gray-50/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-500" /> Installment Amount</p>
                  <p className="font-black text-gray-900 text-base sm:text-lg">
                    KES {Math.round((activeLoanBalance * ((currentInterestRate / 100) / 12) * Math.pow(1 + ((currentInterestRate / 100) / 12), currentDuration)) / (Math.pow(1 + ((currentInterestRate / 100) / 12), currentDuration) - 1) || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-100 p-6 sm:p-8 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-emerald-900 mb-1">No Active Loans</h3>
              <p className="text-xs sm:text-sm text-emerald-700/80 max-w-md mx-auto">
                Your account is in good standing. You are eligible to apply for a new loan based on 3x your savings multiplier.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Request Loan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-accent" />
              Apply for a Loan
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            {requestSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Request Submitted!</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-5">Your loan application has been recorded and submitted for official review.</p>
                <button 
                  onClick={() => setRequestSuccess(false)}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoanRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (KES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">KES</span>
                    <input
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      required
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all font-black text-base sm:text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[11px] text-brand-accent mt-1.5 font-bold">Max limit: KES {((profile?.ledger?.savingsBalance || 0) * 3).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Repayment Term</label>
                  <select 
                    value={requestTerm}
                    onChange={(e) => setRequestTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-sm font-medium"
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Guarantors</label>
                  {selectedGuarantors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedGuarantors.map(g => (
                        <span key={g.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-accent/10 text-brand-accent rounded-lg text-xs font-bold">
                          {g.name}
                          <button type="button" onClick={() => setSelectedGuarantors(prev => prev.filter(pg => pg.id !== g.id))} className="hover:text-brand-amber">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <select
                    onChange={(e) => {
                      const member = members.find(m => m.id === e.target.value);
                      if (member && !selectedGuarantors.find(g => g.id === member.id)) {
                        setSelectedGuarantors([...selectedGuarantors, member]);
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all text-sm font-medium"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a member guarantor...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-bold text-gray-900">12% p.a (Reducing)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Processing Fee</span>
                    <span className="font-bold text-gray-900">2%</span>
                  </div>
                  {calculateEstimatedEMI() > 0 && (
                    <div className="flex justify-between text-xs pt-1.5 border-t border-gray-200">
                      <span className="font-bold text-brand-accent">Est. Monthly Repayment</span>
                      <span className="font-black text-gray-900">KES {calculateEstimatedEMI().toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !requestAmount || hasActiveLoan || selectedGuarantors.length === 0}
                  className="w-full bg-brand-accent hover:bg-brand-amber text-white font-black py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,80,0,0.25)] hover:shadow-[0_0_20px_rgba(255,153,0,0.4)] disabled:opacity-50 disabled:shadow-none mt-4 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : hasActiveLoan ? (
                    'Clear existing loan first'
                  ) : (
                    'Submit Loan Application'
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
