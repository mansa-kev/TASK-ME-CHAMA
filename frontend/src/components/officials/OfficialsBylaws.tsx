import React, { useState, useEffect } from 'react';
import { fetchChamaBylaws, updateChamaBylaws } from '../../api';
import { 
  BookOpen, 
  ShieldCheck, 
  Percent, 
  Calendar, 
  Users, 
  Coins, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  CheckCircle2,
  Lock,
  Scale
} from 'lucide-react';

interface ChamaBylaws {
  id: string;
  chamaId: string;
  minMonthlyContribution: number;
  contributionDeadlineDay: number;
  loanMultiplierCap: number;
  interestRateMethod: 'REDUCING_BALANCE' | 'FLAT_RATE' | 'AMORTIZED';
  defaultInterestRate: number;
  gracePeriodDays: number;
  lateMeetingFine: number;
  absentMeetingFine: number;
  lateContributionPenaltyRate: number;
  multiSigThreshold: number;
  requiredSignatories: string[];
  shareValuation: number;
}

const defaultBylaws: ChamaBylaws = {
  id: 'bylaws-default',
  chamaId: '',
  minMonthlyContribution: 2500,
  contributionDeadlineDay: 5,
  loanMultiplierCap: 3.0,
  interestRateMethod: 'REDUCING_BALANCE',
  defaultInterestRate: 12.0,
  gracePeriodDays: 14,
  lateMeetingFine: 200,
  absentMeetingFine: 500,
  lateContributionPenaltyRate: 10.0,
  multiSigThreshold: 2,
  requiredSignatories: ['CHAIRPERSON', 'TREASURER'],
  shareValuation: 100.0,
};

export const OfficialsBylaws: React.FC = () => {
  const [bylaws, setBylaws] = useState<ChamaBylaws>(defaultBylaws);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadBylaws = async () => {
    try {
      const data = await fetchChamaBylaws();
      if (data && data.id) {
        setBylaws(data);
      }
    } catch (err) {
      console.error('Failed to load group bylaws:', err);
    }
  };

  useEffect(() => {
    loadBylaws();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bylaws) return;

    try {
      setSaving(true);
      await updateChamaBylaws(bylaws);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update bylaws');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !bylaws) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading group bylaws & governance engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            Group Constitution & Financial Bylaws
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure automated rules, interest formulas, loan caps, late fines, and multi-sig financial thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Bylaws Saved & Active
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Contribution & Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Savings & Contribution Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Minimum Monthly Contribution (KES)
              </label>
              <input
                type="number"
                required
                value={bylaws.minMonthlyContribution}
                onChange={(e) => setBylaws({ ...bylaws, minMonthlyContribution: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Baseline monthly savings per active member.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Contribution Deadline (Day of Month)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={bylaws.contributionDeadlineDay}
                onChange={(e) => setBylaws({ ...bylaws, contributionDeadlineDay: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">e.g. 5th of every month.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Single Share Unit Valuation (KES)
              </label>
              <input
                type="number"
                required
                value={bylaws.shareValuation}
                onChange={(e) => setBylaws({ ...bylaws, shareValuation: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Base unit price for share capital allotment.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Loan Policies & Interest Engine */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Percent className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Credit, Table Banking & Interest Formula</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Loan Multiplier Cap
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={bylaws.loanMultiplierCap}
                onChange={(e) => setBylaws({ ...bylaws, loanMultiplierCap: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Max borrowable times member savings (e.g. 3.0x).</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Interest Calculation Method
              </label>
              <select
                value={bylaws.interestRateMethod}
                onChange={(e) => setBylaws({ ...bylaws, interestRateMethod: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="REDUCING_BALANCE">Reducing Balance (Standard)</option>
                <option value="FLAT_RATE">Flat Rate</option>
                <option value="AMORTIZED">Amortized Fixed Installment</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">Algorithm for calculating interest amortizations.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Default Annual Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={bylaws.defaultInterestRate}
                onChange={(e) => setBylaws({ ...bylaws, defaultInterestRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Annualized interest rate applied to loans.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Grace Period (Days)
              </label>
              <input
                type="number"
                required
                value={bylaws.gracePeriodDays}
                onChange={(e) => setBylaws({ ...bylaws, gracePeriodDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Days after due date before default penalty triggers.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Disciplinary & Meeting Fines */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Coins className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">Automated Fines & Default Penalties</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Late Meeting Attendance Fine (KES)
              </label>
              <input
                type="number"
                required
                value={bylaws.lateMeetingFine}
                onChange={(e) => setBylaws({ ...bylaws, lateMeetingFine: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Auto-charged on meeting roll call tardiness.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Absent Without Apology Fine (KES)
              </label>
              <input
                type="number"
                required
                value={bylaws.absentMeetingFine}
                onChange={(e) => setBylaws({ ...bylaws, absentMeetingFine: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Auto-charged on missed meeting roll call.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Late Contribution Penalty (%)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={bylaws.lateContributionPenaltyRate}
                onChange={(e) => setBylaws({ ...bylaws, lateContributionPenaltyRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Penalty % added to arrears after the deadline day.</span>
            </div>
          </div>
        </div>

        {/* Section 4: Multi-Sig Governance Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Lock className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-gray-900">Multi-Sig Treasury Approvals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Required Approval Threshold (Number of Signatures)
              </label>
              <select
                value={bylaws.multiSigThreshold}
                onChange={(e) => setBylaws({ ...bylaws, multiSigThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 Official (Single Approval)</option>
                <option value="2">2 of 3 Officials (Recommended Committee Standard)</option>
                <option value="3">3 of 3 Officials (Unanimous Executive Board)</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Number of executive committee signatures required to disburse funds.
              </span>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" /> Security Fortress Protection
              </span>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Multi-sig matrix prevents unilateral fraud. Disbursals, withdrawals, and ledger settlements are held in escrow until the threshold of verified signatures is satisfied.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-100 transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Constitution & Bylaws
          </button>
        </div>
      </form>
    </div>
  );
};
export default OfficialsBylaws;
