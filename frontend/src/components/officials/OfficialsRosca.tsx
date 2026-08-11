import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Shuffle,
  Send,
  AlertCircle,
  ShieldCheck,
  Plus,
  ArrowRight,
  UserCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchOfficialsMerryGoRoundSchedule,
  recordOfficialsMerryGoRoundPayout,
  createMerryGoRoundCycle,
  shuffleMerryGoRoundSlots
} from '../../api';

export function OfficialsRosca() {
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '2026 Q3 Executive Rotation',
    contributionAmount: 5000,
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [payoutLoadingId, setPayoutLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOfficialsMerryGoRoundSchedule();
      setScheduleData(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch Merry-Go-Round rotation schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMerryGoRoundCycle({
        name: createForm.name,
        contributionAmount: Number(createForm.contributionAmount),
        frequency: createForm.frequency,
        startDate: createForm.startDate
      });
      toast.success('New Merry-Go-Round rotation cycle created!');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create rotation cycle');
    }
  };

  const handleShuffle = async () => {
    if (!scheduleData?.cycle?.id) {
      toast.error('No active cycle to shuffle');
      return;
    }
    try {
      await shuffleMerryGoRoundSlots(scheduleData.cycle.id);
      toast.success('Slot rotation sequence randomly shuffled and finalized!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to shuffle rotation slots');
    }
  };

  const handleDisbursePayout = async (slotId: string, memberName: string, amount: number) => {
    setPayoutLoadingId(slotId);
    try {
      await recordOfficialsMerryGoRoundPayout({ slotId });
      toast.success(`KES ${amount.toLocaleString()} disbursed to ${memberName} via M-Pesa B2C!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disburse pot payout');
    } finally {
      setPayoutLoadingId(null);
    }
  };

  const cycle = (Array.isArray(scheduleData) && scheduleData.length > 0) ? scheduleData[0] : null;
  const slots = cycle?.slots || [];

  const totalPotValue = cycle?.contributionAmount ? cycle.contributionAmount * (slots.length || 10) : 0;
  const completedRounds = slots.filter((s: any) => s.status === 'PAID').length;
  const currentSlot = slots.find((s: any) => s.status === 'PENDING') || slots[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 sm:pb-12 animation-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Rotation Engine
            </span>
            <span className="flex items-center gap-1 text-[11px] sm:text-xs text-white/80">
              <Sparkles className="w-3 h-3 text-emerald-300" /> Automated Payouts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Merry-Go-Round Rotation</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            Automated rotating savings schedule, member contribution tracking, and pot distribution.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Cycle
          </button>
          <button
            onClick={handleShuffle}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle Slots
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      {!cycle ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
          <RotateCcw className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Rotation Cycle</h3>
          <p className="text-gray-500 max-w-sm mb-6 text-sm">
            Create a new Merry-Go-Round cycle to automatically manage slots, contributions, and pot payouts for your members.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Initialize First Cycle
          </button>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Pot per Round</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            KES {totalPotValue.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            KES {cycle.contributionAmount.toLocaleString()} per seat
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Round</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            Round #{cycle.currentRound || 1} <span className="text-xs font-normal text-gray-500">/ {slots.length}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {completedRounds} recipients paid so far
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Recipient</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-gray-900 mt-2 truncate">
            {currentSlot?.memberName || 'Completed'}
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            Due: {currentSlot?.expectedDate || 'N/A'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Rotation Progress</span>
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {Math.round((completedRounds / (slots.length || 1)) * 100)}%
          </p>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${Math.round((completedRounds / (slots.length || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Recipient Spotlight Banner */}
      {currentSlot && currentSlot.status === 'PENDING' && (
        <div className="bg-gradient-to-br from-gray-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
                ACTIVE POT PAYOUT READY
              </span>
              <span className="text-xs text-white/60">• Slot Position #{currentSlot.position}</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Recipient: {currentSlot.memberName}
            </h3>
            <p className="text-xs text-white/80">
              Phone: <span className="font-mono text-emerald-300">{currentSlot.phone}</span> • Payout Sum: <span className="font-bold text-white">KES {totalPotValue.toLocaleString()}</span>
            </p>
          </div>

          <button
            onClick={() => handleDisbursePayout(currentSlot.id, currentSlot.memberName, totalPotValue)}
            disabled={payoutLoadingId === currentSlot.id}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {payoutLoadingId === currentSlot.id ? 'Processing M-Pesa B2C...' : `Disburse KES ${totalPotValue.toLocaleString()} via M-Pesa`}
          </button>
        </div>
      )}

      {/* Rotation Slot Schedule Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Rotation Slot Distribution ({slots.length} Members)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Sequential order of monthly pot distribution</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
            Cycle: {cycle.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Slot #</th>
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-5 py-3.5">Mobile Phone</th>
                <th className="px-5 py-3.5">Payout Amount</th>
                <th className="px-5 py-3.5">Scheduled Date</th>
                <th className="px-5 py-3.5">Disbursement Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slots.map((slot: any) => {
                const isPaid = slot.status === 'PAID';
                const isCurrent = slot.id === currentSlot?.id && !isPaid;

                return (
                  <tr
                    key={slot.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isPaid
                          ? 'bg-gray-100 text-gray-500'
                          : isCurrent
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        #{slot.position}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-sm">{slot.memberName}</p>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">
                          ● Current Turn
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-600">{slot.phone}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      KES {(slot.payoutAmount || totalPotValue).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{slot.expectedDate}</td>
                    <td className="px-5 py-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Paid ({slot.receiptNo || 'Confirmed'})
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <Clock className="w-3.5 h-3.5" />
                          Ready for Payout
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Upcoming Turn
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isPaid && (
                        <button
                          onClick={() => handleDisbursePayout(slot.id, slot.memberName, totalPotValue)}
                          disabled={payoutLoadingId === slot.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Cycle Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Initialize New ROSCA Cycle</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cycle Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Contribution per Seat (KES)</label>
                <input
                  type="number"
                  value={createForm.contributionAmount}
                  onChange={e => setCreateForm({ ...createForm, contributionAmount: Number(e.target.value) })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rotation Frequency</label>
                <select
                  value={createForm.frequency}
                  onChange={e => setCreateForm({ ...createForm, frequency: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="WEEKLY">Weekly Rotation</option>
                  <option value="MONTHLY">Monthly Rotation</option>
                  <option value="BI_WEEKLY">Bi-Weekly (Every 2 Weeks)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={createForm.startDate}
                  onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Launch Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
