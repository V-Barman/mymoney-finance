import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Wallet,
  ArrowRight,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency, formatDate, toMinorUnits } from '../../utils/currency';
import { GoalModal } from './GoalModal';
import { Modal } from '../common/Modal';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { triggerGoalCelebration } from '../../utils/confetti';

export const SavingsGoalsView: React.FC = () => {
  const { goals, contributeToGoal, deleteGoal, updateGoal, accounts, profile } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Contribute Modal
  const [contributeTargetGoal, setContributeTargetGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmountStr, setContributionAmountStr] = useState('');
  const [contributionAccount, setContributionAccount] = useState('');
  const [contributionNote, setContributionNote] = useState('');
  const [contributionError, setContributionError] = useState<string | null>(null);

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenContribute = (g: SavingsGoal) => {
    setContributeTargetGoal(g);
    setContributionAmountStr('');
    const activeAcc = accounts.find((a) => !a.isArchived);
    setContributionAccount(g.linkedAccountId || activeAcc?.id || '');
    setContributionNote('');
    setContributionError(null);
  };

  const handleConfirmContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeTargetGoal) return;
    const amountMinor = toMinorUnits(contributionAmountStr);
    if (!contributionAmountStr || amountMinor <= 0) {
      setContributionError('Please enter a valid contribution amount.');
      return;
    }
    if (!contributionAccount) {
      setContributionError('Please select a funding account.');
      return;
    }

    contributeToGoal(
      contributeTargetGoal.id,
      amountMinor,
      contributionAccount,
      contributionNote || `Contribution to ${contributeTargetGoal.title}`
    );
    setContributeTargetGoal(null);
  };

  const handleEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setIsGoalModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleMarkDone = (goal: SavingsGoal) => {
    updateGoal(goal.id, { isCompleted: true });
    triggerGoalCelebration();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Savings Goals & Vaults</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earmark funds for milestones, life events, and capital expenditure
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </motion.button>
      </div>

      {/* Aggregate Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-6 flex-1">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Goal Target</span>
              <div className="text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                <AnimatedCounter value={totalTarget} currencyCode={profile.currency} />
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Currently Saved</span>
              <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                <AnimatedCounter value={totalSaved} currencyCode={profile.currency} />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {completedGoals.length} Completed
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            <CircularProgressRing
              percentage={totalProgress}
              size={68}
              strokeWidth={6}
              color="#059669"
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white">Overall Progress</div>
              <div>Across {goals.length} vault{goals.length === 1 ? '' : 's'}</div>
            </div>
          </div>
        </div>

        {/* Animated GPU Progress bar */}
        <div className="mt-4">
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.min(100, totalProgress) / 100 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-full w-full rounded-full bg-emerald-600 dark:bg-emerald-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Active Goals Grid or Empty State */}
      {activeGoals.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No active savings goals yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create targets for your emergency fund, home, travel, or education and track progress automatically.
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeGoals.map((goal, idx) => {
          const progress = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {goal.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{goal.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Visual with Radial Ring */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        <AnimatedCounter value={goal.currentAmount} currencyCode={profile.currency} />
                      </div>
                      <div className="text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 mt-0.5">
                        Target {formatCurrency(goal.targetAmount, profile.currency, { compact: true })}
                      </div>
                    </div>
                    <CircularProgressRing
                      percentage={progress}
                      size={56}
                      strokeWidth={5}
                      color={goal.color || '#059669'}
                    />
                  </div>

                  {/* GPU-composited individual goal bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: progress / 100 }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full w-full rounded-full"
                      style={{ backgroundColor: goal.color, transformOrigin: 'left' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5 tabular-nums">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{progress}% reached</span>
                    <span>Remaining: {formatCurrency(remaining, profile.currency)}</span>
                  </div>
                </div>

                {/* Date Deadline */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target Date: {formatDate(goal.targetDate, profile.dateFormat)}</span>
                </div>
              </div>

              {/* Contribute Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleMarkDone(goal)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Mark Done
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => handleOpenContribute(goal)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Funds</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Completed Milestones ({completedGoals.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <motion.div
                key={goal.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{goal.title}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                    {formatCurrency(goal.targetAmount, profile.currency)} fully achieved
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateGoal(goal.id, { isCompleted: false })}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Reopen
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributeTargetGoal && (
        <Modal
          isOpen={Boolean(contributeTargetGoal)}
          onClose={() => setContributeTargetGoal(null)}
          title={`Add Funds to ${contributeTargetGoal.title}`}
          subtitle="Deposit into your savings goal vault"
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmContribution} className="space-y-4">
            <AnimatePresence>
              {contributionError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 rounded-xl bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800 text-red-700 dark:text-rose-300 text-xs font-medium"
                >
                  {contributionError}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contribution Amount ({profile.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="e.g. 15000"
                value={contributionAmountStr}
                onChange={(e) => setContributionAmountStr(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deduct from Account
              </label>
              <select
                value={contributionAccount}
                onChange={(e) => setContributionAccount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {accounts
                  .filter((a) => !a.isArchived)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.currentBalance, profile.currency, { hideDecimals: true })})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly salary bonus allocation"
                value={contributionNote}
                onChange={(e) => setContributionNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setContributeTargetGoal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Confirm Deposit
              </motion.button>
            </div>
          </form>
        </Modal>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        editGoal={editingGoal}
      />
    </div>
  );
};
