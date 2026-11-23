import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringPayment } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/currency';
import { RecurringModal } from './RecurringModal';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    deleteRecurring,
    updateRecurring,
    executeRecurringPayment,
    accounts,
    categories,
    profile,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringPayment | null>(null);

  const totalMonthlyBills = recurring
    .filter((r) => r.type === 'expense' && r.status === 'active')
    .reduce((sum, r) => {
      // Normalize to monthly
      if (r.frequency === 'yearly') return sum + Math.round(r.amount / 12);
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      return sum + r.amount;
    }, 0);

  const totalMonthlyIncome = recurring
    .filter((r) => r.type === 'income' && r.status === 'active')
    .reduce((sum, r) => {
      if (r.frequency === 'yearly') return sum + Math.round(r.amount / 12);
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      return sum + r.amount;
    }, 0);

  const handleEdit = (r: RecurringPayment) => {
    setEditingRecurring(r);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecurring(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recurring Payments & Bills</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automate monthly subscriptions, fixed utility obligations, and recurring salary inflows
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Item</span>
        </motion.button>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Monthly Committed Outflow</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalMonthlyBills} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Fixed recurring subscriptions & bills</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Monthly Recurring Inflows</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-300 mt-1">
              <AnimatedCounter value={totalMonthlyIncome} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Contract salary & retainer subscriptions</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Recurring Cards Grid or Empty State */}
      {recurring.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No recurring bills or income scheduled yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add monthly rent, subscriptions, EMIs, or recurring salary entries for 1-tap logging and calendar reminders.
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Recurring Payment</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recurring.map((rec, index) => {
          const isIncome = rec.type === 'income';
          const acc = accounts.find((a) => a.id === rec.accountId);
          const cat = categories.find((c) => c.id === rec.categoryId);
          const isPaused = rec.status === 'paused';

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                isPaused
                  ? 'border-slate-200 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/40'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{rec.title}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="capitalize">{rec.frequency}</span>
                        <span>·</span>
                        <span>{cat?.name || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      title={isPaused ? 'Resume' : 'Pause'}
                      onClick={() =>
                        updateRecurring(rec.id, {
                          status: isPaused ? 'active' : 'paused',
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleEdit(rec)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => deleteRecurring(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Amount with AnimatedCounter */}
                <div className="mt-4">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Scheduled Amount</span>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                      isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : ''}
                    <AnimatedCounter value={rec.amount} currency={profile.currency} />
                  </div>
                </div>

                {/* Account & Next Due Date */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Account:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{acc?.name || 'Primary'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Next Due:
                    </span>
                    <span className="font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatDate(rec.nextDueDate, profile.dateFormat)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isPaused ? 'Rule is paused' : 'Auto reminder on'}
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => executeRecurringPayment(rec.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Log & Advance</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecurring(null);
        }}
        editRecurring={editingRecurring}
      />
    </div>
  );
};
