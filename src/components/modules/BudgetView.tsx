import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { computeBudgetProgress } from '../../utils/calculations';
import { BudgetModal } from './BudgetModal';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const BudgetView: React.FC = () => {
  const { budgets, deleteBudget, transactions, selectedMonth, profile, categories } =
    useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined);

  const budgetDetails = computeBudgetProgress(budgets, transactions, selectedMonth);

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetDetails.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  // Unbudgeted categories that had spending this month
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const unbudgetedCategories = categories.filter(
    (c) => c.type === 'expense' && !budgetedCategoryIds.has(c.id)
  );

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setPreselectedCategoryId(undefined);
    setIsModalOpen(true);
  };

  const handleAddNew = (defaultCatId?: string) => {
    setEditingBudget(null);
    setPreselectedCategoryId(defaultCatId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Budget Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending caps and variance tracking for {selectedMonth}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => handleAddNew()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Cap</span>
        </motion.button>
      </div>

      {/* Aggregate Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Budget Limit</span>
            <div className="text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalBudgeted} currency={profile.currency} />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Month Spend</span>
            <div className="text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalSpent} currency={profile.currency} />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Remaining Cushion</span>
            <div
              className={`text-xl font-extrabold font-mono tabular-nums mt-1 ${
                totalRemaining >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <AnimatedCounter value={totalRemaining} currency={profile.currency} />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Utilization</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {overallUtilization}%
              </span>
              {overallUtilization > 100 ? (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800/50">
                  Over Budget
                </span>
              ) : overallUtilization >= 80 ? (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/50">
                  Near Limit
                </span>
              ) : (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                  Healthy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Big Progress bar with spring animation */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.min(100, overallUtilization) / 100 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left' }}
              className={`h-full w-full rounded-full transition-colors duration-300 ${
                overallUtilization > 100
                  ? 'bg-rose-500'
                  : overallUtilization >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Category Budgets Grid or Empty State */}
      {budgetDetails.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No category spending limits set yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Set monthly caps for Food, Rent, Travel, or Shopping below to receive early warning alerts at your chosen threshold.
          </p>
          <button
            type="button"
            onClick={() => handleAddNew()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Budget</span>
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetDetails.map((b, index) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
              b.isOverBudget
                ? 'border-rose-300 dark:border-rose-800/60 shadow-xs shadow-rose-100 dark:shadow-rose-950/30'
                : b.isWarning
                ? 'border-amber-300 dark:border-amber-800/60 shadow-xs shadow-amber-50 dark:shadow-amber-950/30'
                : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.categoryName}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Limit: {formatCurrency(b.amount, profile.currency, { hideDecimals: true })}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => handleEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => deleteBudget(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Progress visual with motion */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Spent:</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {formatCurrency(b.spent, profile.currency)} ({b.utilization}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.min(100, b.utilization) / 100 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                    style={{ transformOrigin: 'left' }}
                    className={`h-full w-full rounded-full transition-colors duration-300 ${
                      b.isOverBudget
                        ? 'bg-rose-500'
                        : b.isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                <span
                  className={`font-mono tabular-nums font-bold ${
                    b.remaining >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatCurrency(b.remaining, profile.currency)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {b.isOverBudget ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Exceeded by {formatCurrency(Math.abs(b.remaining), profile.currency)}</span>
                </div>
              ) : b.isWarning ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Approaching limit ({b.utilization}%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Within safe threshold</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unbudgeted Categories Strip */}
      {unbudgetedCategories.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Unbudgeted Expense Categories
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Add limits to these categories to prevent unexpected overspending:
          </p>
          <div className="flex flex-wrap gap-2">
            {unbudgetedCategories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleAddNew(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
          setPreselectedCategoryId(undefined);
        }}
        editBudget={editingBudget}
        defaultCategoryId={preselectedCategoryId}
      />
    </div>
  );
};
