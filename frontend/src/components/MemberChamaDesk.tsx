import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Phone, 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  Vote,
  FileCheck2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiFetch, getUser } from '../api';
import toast from 'react-hot-toast';

export function MemberChamaDesk() {
  const user = getUser();
  const [activeSubTab, setActiveSubTab] = useState<'contact' | 'inquiry' | 'welfare' | 'voting'>('contact');
  const [officials, setOfficials] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Form State
  const [inquiryCategory, setInquiryCategory] = useState('Payment / Contribution Discrepancy');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Welfare Claim Form State
  const [welfareType, setWelfareType] = useState('Medical Emergency');
  const [welfareAmount, setWelfareAmount] = useState('');
  const [welfareReason, setWelfareReason] = useState('');
  const [welfareContact, setWelfareContact] = useState('');
  const [submittingWelfare, setSubmittingWelfare] = useState(false);

  // Active Polls State
  const [hasVoted, setHasVoted] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chamaData, ticketData] = await Promise.all([
        apiFetch('/chamas/mine').catch(() => ({ officials: [] })),
        apiFetch('/supportTickets').catch(() => [])
      ]);
      setOfficials(chamaData?.officials || []);
      setTickets(ticketData || []);
    } catch (err) {
      console.error('Error fetching chama desk data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      toast.error('Please fill in both the subject and message');
      return;
    }

    setSubmittingInquiry(true);
    try {
      const payload = {
        subject: `[${inquiryCategory}] ${inquirySubject}`,
        description: inquiryMessage,
        priority: 'MEDIUM',
        status: 'OPEN'
      };

      const res = await apiFetch('/supportTickets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      toast.success('Inquiry submitted to Group Officials successfully!');
      setInquirySubject('');
      setInquiryMessage('');
      setTickets(prev => [res, ...prev]);
      setActiveSubTab('inquiry');
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleSendWelfareClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!welfareAmount || !welfareReason.trim()) {
      toast.error('Please specify the amount and explanation for welfare claim');
      return;
    }

    setSubmittingWelfare(true);
    try {
      const payload = {
        subject: `[WELFARE CLAIM: ${welfareType}] KES ${Number(welfareAmount).toLocaleString()}`,
        description: `Welfare Claim Details:\n- Type: ${welfareType}\n- Amount: KES ${Number(welfareAmount).toLocaleString()}\n- Contact Verifier: ${welfareContact || 'Self'}\n- Description: ${welfareReason}`,
        priority: 'HIGH',
        status: 'OPEN'
      };

      const res = await apiFetch('/supportTickets', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      toast.success('Welfare Assistance Claim dispatched to Group Treasurer & Officials!');
      setWelfareAmount('');
      setWelfareReason('');
      setWelfareContact('');
      setTickets(prev => [res, ...prev]);
    } catch (error) {
      toast.error('Failed to submit welfare claim.');
    } finally {
      setSubmittingWelfare(false);
    }
  };

  const handleCastVote = (pollId: string, choice: string) => {
    setHasVoted(prev => ({ ...prev, [pollId]: choice }));
    toast.success(`Your vote for "${choice}" has been recorded!`);
  };

  return (
    <div className="space-y-6 animation-fade-in">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-primary-dark to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/15">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-accent" />
            Officials & Leaders Communication Desk
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Group Officials Direct Portal</h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Reach out directly to your Chairperson, Secretary, or Treasurer. Submit official contribution queries, claim welfare assistance, and participate in active Chama resolutions.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Users className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSubTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'contact' 
              ? 'bg-brand-primary text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Phone className="w-4 h-4" /> 1-Tap Officials Direct Contact
        </button>
        <button
          onClick={() => setActiveSubTab('inquiry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'inquiry' 
              ? 'bg-brand-primary text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Official Message & Inquiries
        </button>
        <button
          onClick={() => setActiveSubTab('welfare')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'welfare' 
              ? 'bg-brand-primary text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" /> Welfare Assistance Claims
        </button>
        <button
          onClick={() => setActiveSubTab('voting')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'voting' 
              ? 'bg-brand-primary text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Vote className="w-4 h-4" /> AGM Resolutions & Polls
        </button>
      </div>

      {/* Tab 1: 1-Tap Direct Officials Contact */}
      {activeSubTab === 'contact' && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900">
              Need immediate assistance with a payment confirmation, urgent loan approval, or meeting schedule? Tap below to call or WhatsApp your Chama leaders directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {officials.length > 0 ? (
              officials.map((official, idx) => {
                const phone = official.phone || '0700000000';
                const cleanPhone = phone.replace(/\D/g, '');
                const waPhone = cleanPhone.startsWith('0') ? `254${cleanPhone.slice(1)}` : cleanPhone;
                const roleLabel = official.role === 'CHAMA_ADMIN' ? 'Group Official / Administrator' : official.role;

                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent text-white flex items-center justify-center font-black text-lg shadow-sm">
                          {official.name?.charAt(0) || 'O'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm">{official.name}</h4>
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-md mt-0.5">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        Tel: <span className="font-semibold text-gray-800 font-mono">{official.phone || 'Available in Admin'}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${official.name}, I am reaching out regarding our Chama matters on Task-Me Chama.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
                <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-gray-700 text-sm">Group Officials</p>
                <p className="text-xs text-gray-500 mt-1">Official contacts will appear here once appointed by the Chama administrator.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Direct Inquiries */}
      {activeSubTab === 'inquiry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Inquiry Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-accent" />
              Send Official Inquiry / Message
            </h3>
            <p className="text-xs text-gray-500">
              Submit a formal request or clarification to the executive committee. Track replies directly in this portal.
            </p>

            <form onSubmit={handleSendInquiry} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Inquiry Category</label>
                <select
                  value={inquiryCategory}
                  onChange={(e) => setInquiryCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-accent outline-none"
                >
                  <option value="Payment / Contribution Discrepancy">Payment / Contribution Discrepancy</option>
                  <option value="Loan Application & Guarantorship">Loan Application & Guarantorship</option>
                  <option value="Meeting Attendance & Apology">Meeting Attendance & Apology</option>
                  <option value="Merry-Go-Round Payout Schedule">Merry-Go-Round Payout Schedule</option>
                  <option value="General Question">General Chama Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  placeholder="e.g. M-Pesa transaction KES 2,000 reference not showing"
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details / Explanation</label>
                <textarea
                  rows={4}
                  placeholder="Explain your inquiry clearly, including transaction dates, M-Pesa reference codes, or meeting dates if applicable..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-accent outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingInquiry}
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {submittingInquiry ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send to Officials
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Inquiries & Status Tracker */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-gray-400" />
              Inquiry & Ticket Tracker
            </h3>
            <p className="text-xs text-gray-500 mb-4">Live record of communications with your Chama leaders.</p>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[420px]">
              {tickets.length > 0 ? (
                tickets.map((ticket, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">{ticket.subject}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        ticket.status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : ticket.status === 'IN_PROGRESS' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.status || 'OPEN'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{ticket.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/60">
                      <span>Priority: <strong className="text-gray-600">{ticket.priority}</strong></span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No inquiries sent yet. Use the form to send a message to officials.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Welfare Assistance Claims */}
      {activeSubTab === 'welfare' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Apply for Welfare / Benevolent Assistance</h3>
              <p className="text-xs text-gray-500">Request financial relief from the Chama Welfare Fund as provided in the constitution.</p>
            </div>
          </div>

          <form onSubmit={handleSendWelfareClaim} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Type of Assistance</label>
                <select
                  value={welfareType}
                  onChange={(e) => setWelfareType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Bereavement Support">Bereavement Support</option>
                  <option value="Disaster Relief">Disaster / Emergency Relief</option>
                  <option value="Celebratory Benefit">Celebratory Grant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount Requested (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={welfareAmount}
                  onChange={(e) => setWelfareAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Supporting Contact / Verifier (Optional)</label>
              <input
                type="text"
                placeholder="Name & phone of hospital, next-of-kin, or local elder for verification"
                value={welfareContact}
                onChange={(e) => setWelfareContact(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reason & Circumstances</label>
              <textarea
                rows={4}
                placeholder="Kindly explain the situation to help the committee expedite review and disbursement..."
                value={welfareReason}
                onChange={(e) => setWelfareReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                required
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Welfare claims are verified by the Group Treasurer and Welfare Committee according to the bylaws before emergency fund disbursement.
              </span>
            </div>

            <button
              type="submit"
              disabled={submittingWelfare}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submittingWelfare ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" /> Submit Welfare Assistance Claim
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: AGM Resolutions & Voting */}
      {activeSubTab === 'voting' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full mb-1">
                  Active Chama Resolution
                </span>
                <h3 className="font-extrabold text-base text-gray-900">2026 Emergency Welfare Contribution Increase (KES 500 to KES 1,000)</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Proposed by Executive Committee: Increase monthly welfare kitty contribution to enhance hospitalisation support coverage.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-700">Cast Your Vote:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCastVote('res-1', 'YES (Agree)')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    hasVoted['res-1'] === 'YES (Agree)' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  ✓ YES (Agree)
                </button>
                <button
                  type="button"
                  onClick={() => handleCastVote('res-1', 'NO (Disagree)')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    hasVoted['res-1'] === 'NO (Disagree)' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  ✕ NO (Disagree)
                </button>
                <button
                  type="button"
                  onClick={() => handleCastVote('res-1', 'ABSTAIN')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    hasVoted['res-1'] === 'ABSTAIN' 
                      ? 'bg-gray-800 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ABSTAIN
                </button>
              </div>
              {hasVoted['res-1'] && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
                  <CheckCircle2 className="w-4 h-4" /> You voted: {hasVoted['res-1']}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
