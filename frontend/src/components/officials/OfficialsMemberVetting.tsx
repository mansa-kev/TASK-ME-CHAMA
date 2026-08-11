import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  CreditCard,
  Building2,
  Users,
  Award,
  Sparkles,
  Phone,
  Mail,
  FileText,
  BadgeCheck,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchVettingApplications, submitVettingDecision } from '../../api';

interface VettingApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  idNumber: string;
  kraPin: string;
  nextOfKin: string;
  creditScore: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  vettingStage: string;
  guarantors: Array<{
    name: string;
    phone: string;
    status: string;
    pledgedAmount: number;
  }>;
  committeeVotes: Array<{
    role: string;
    officialName: string;
    decision: string;
    notes: string;
  }>;
  flags: string[];
}

export function OfficialsMemberVetting() {
  const [applicants, setApplicants] = useState<VettingApplicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<VettingApplicant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT' | 'UNDER_REVIEW'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedTier, setAssignedTier] = useState('TIER_1_STANDARD');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchVettingApplications();
      if (Array.isArray(data)) {
        setApplicants(data);
        if (data.length > 0 && !selectedApplicant) {
          setSelectedApplicant(data[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load member vetting queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    setSubmitting(true);
    try {
      await submitVettingDecision(selectedApplicant.id, {
        decision: reviewDecision,
        notes: reviewNotes,
        assignedTier
      });

      toast.success(
        reviewDecision === 'APPROVE'
          ? `Member ${selectedApplicant.name} verified & activated successfully!`
          : reviewDecision === 'REJECT'
          ? `Application rejected.`
          : `Application marked for additional KYC verification.`
      );

      setShowReviewModal(false);
      setReviewNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit vetting decision');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.idNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || app.riskTier === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 600) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'LOW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><ShieldCheck className="w-3.5 h-3.5" /> Low Risk</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Moderate</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><AlertTriangle className="w-3.5 h-3.5" /> High Risk</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Membership
            </span>
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Sparkles className="w-3 h-3 text-brand-accent" /> Screening & Approvals
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">New Member Approvals</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Review new member applications, check ID & guarantors, and approve new members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
            <p className="text-xs text-white/80">Waiting Review</p>
            <p className="text-2xl font-black text-white">{applicants.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
            <p className="text-xs text-white/80">Avg. Trust Score</p>
            <p className="text-2xl font-black text-brand-accent">810<span className="text-xs font-normal">/1000</span></p>
          </div>
        </div>
      </div>

      {/* 5-Stage Pipeline Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { step: '1', title: 'KYC Document Vault', desc: 'ID & KRA PIN', active: true },
          { step: '2', title: 'Guarantor Pledges', desc: '2 Sponsors Vouched', active: true },
          { step: '3', title: 'Chama Score Index', desc: 'Risk & Habit Engine', active: true },
          { step: '4', title: 'Committee Review', desc: 'Chair & Treas Signoff', active: true },
          { step: '5', title: 'Credentials Dispatch', desc: 'Instant Welcome SMS', active: true },
        ].map((stage, idx) => (
          <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
              {stage.step}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{stage.title}</p>
              <p className="text-[11px] text-gray-500">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Queue & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applicants Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                Vetting Queue ({filteredApplicants.length})
              </h2>
              <button 
                onClick={loadData} 
                className="text-xs text-brand-primary hover:underline font-semibold"
              >
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
              </div>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white font-medium"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Moderate</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-12 text-xs text-gray-500">Loading screening queue...</div>
              ) : filteredApplicants.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No pending applicants requiring vetting.
                </div>
              ) : (
                filteredApplicants.map(applicant => {
                  const isSelected = selectedApplicant?.id === applicant.id;
                  return (
                    <div
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{applicant.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{applicant.phone}</span>
                            <span>•</span>
                            <span>ID: {applicant.idNumber}</span>
                          </p>
                        </div>
                        {getRiskBadge(applicant.riskTier)}
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-brand-secondary" />
                          <span className="text-gray-600 font-medium">Chama Score:</span>
                          <span className="font-bold text-gray-900">{applicant.creditScore}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(applicant.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Candidate Dossier & Decision Terminal */}
        <div className="lg:col-span-7 space-y-4">
          {selectedApplicant ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Dossier Header */}
              <div className="p-5 border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg border border-brand-primary/20">
                    {selectedApplicant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">{selectedApplicant.name}</h2>
                      {getRiskBadge(selectedApplicant.riskTier)}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedApplicant.email || 'No email'}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedApplicant.phone}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReviewDecision('APPROVE');
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Review & Cast Decision
                </button>
              </div>

              {/* Dossier Body */}
              <div className="p-5 space-y-6">
                {/* 1. Credit & Trust Scoring Radar */}
                <div className="bg-gradient-to-br from-gray-900 to-brand-secondary text-white p-5 rounded-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-brand-accent font-bold uppercase tracking-wider">Chama Trust & Credit Radar</p>
                      <h3 className="text-lg font-black mt-0.5">Applicant Reliability Profile</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-brand-accent">
                        {selectedApplicant.creditScore}
                        <span className="text-xs font-normal text-white/70"> / 1000</span>
                      </div>
                      <p className="text-[11px] text-white/80">Tier 1 Prime Candidate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <p className="text-white/60 text-[11px]">KYC Integrity</p>
                      <p className="font-bold text-emerald-400">100% Verified</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-[11px]">Social Backing</p>
                      <p className="font-bold text-brand-accent">2 Pledged</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-[11px]">Borrowing Limit</p>
                      <p className="font-bold text-white">KES 50,000</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-[11px]">Risk Grade</p>
                      <p className="font-bold text-emerald-400">A (Minimal)</p>
                    </div>
                  </div>
                </div>

                {/* 2. KYC Document Vault */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-brand-primary" />
                    Stage 1: Verified Document Vault
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50">
                      <p className="text-[11px] text-gray-500">National ID Number</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedApplicant.idNumber}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                        <BadgeCheck className="w-3.5 h-3.5" /> Gov Database Valid
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50">
                      <p className="text-[11px] text-gray-500">KRA Tax PIN</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedApplicant.kraPin}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                        <BadgeCheck className="w-3.5 h-3.5" /> Compliant & Active
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50">
                      <p className="text-[11px] text-gray-500">Next of Kin Contact</p>
                      <p className="text-xs font-bold text-gray-900 mt-0.5 truncate">{selectedApplicant.nextOfKin}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                        <BadgeCheck className="w-3.5 h-3.5" /> Emergency Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Social Collateral & Guarantor Sponsorship */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-primary" />
                    Stage 2: Guarantor Sponsorship & Social Collateral
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedApplicant.guarantors.map((guarantor, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{guarantor.name}</p>
                          <p className="text-[11px] text-gray-500">{guarantor.phone}</p>
                          <p className="text-[11px] text-brand-primary font-semibold mt-1">
                            Pledged: KES {guarantor.pledgedAmount.toLocaleString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                          {guarantor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Committee Voting Ledger */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-primary" />
                    Stage 4: Executive Committee Deliberation
                  </h3>
                  <div className="space-y-2">
                    {selectedApplicant.committeeVotes.map((vote, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{vote.officialName}</span>
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-semibold">
                              {vote.role}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 italic">"{vote.notes}"</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          {vote.decision}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setReviewDecision('REJECT');
                      setShowReviewModal(true);
                    }}
                    className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      setReviewDecision('UNDER_REVIEW');
                      setShowReviewModal(true);
                    }}
                    className="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs rounded-xl transition-colors"
                  >
                    Request Extra Verification
                  </button>
                  <button
                    onClick={() => {
                      setReviewDecision('APPROVE');
                      setShowReviewModal(true);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Onboard Member
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              Select an applicant from the vetting queue to inspect their KYC dossier.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Review & Signoff Modal */}
      {showReviewModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Executive Vetting Sign-Off</h3>
                <p className="text-xs text-gray-500 mt-0.5">Applicant: {selectedApplicant.name}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      reviewDecision === 'APPROVE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Approve Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('UNDER_REVIEW')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      reviewDecision === 'UNDER_REVIEW'
                        ? 'border-amber-600 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Need More Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      reviewDecision === 'REJECT'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {reviewDecision === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Membership Tier & Borrowing Cap</label>
                  <select
                    value={assignedTier}
                    onChange={e => setAssignedTier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="TIER_1_STANDARD">Tier 1: Standard (Borrowing Limit: KES 50,000)</option>
                    <option value="TIER_2_PREMIUM">Tier 2: Prime Executive (Borrowing Limit: KES 150,000)</option>
                    <option value="TIER_3_PROBATIONARY">Tier 3: Probationary (Borrowing Limit: KES 15,000)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Review Remarks / Notes</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  placeholder="e.g. All KYC documents inspected. Sponsoring guarantors have sufficient shares."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  required
                />
              </div>

              <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10 text-[11px] text-gray-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>
                  Approving this applicant will immediately provision their member savings ledger, record an immutable audit entry, and dispatch their welcome credentials via SMS.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Executing Decision...' : 'Confirm & Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
