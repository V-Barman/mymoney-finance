import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  PieChart as PieIcon,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Receipt,
  Layers,
  ChevronLeft,
  ChevronRight,
  Target,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/currency';
import {
  computeBudgetProgress,
  computePeriodCategoryBreakdown,
  computePeriodChartSeries,
  filterTransactionsByPeriod,
  formatPeriodLabel,
  getTodayLocalIso,
} from '../../utils/calculations';
import { TimePeriodGranularity, Transaction } from '../../types/finance';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { WealthTiltCard } from '../common/WealthTiltCard';
import { GoalModal } from './GoalModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DashboardViewProps {
  onSelectTx: (tx: Transaction) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTx }) => {
  const {
    summary,
    periodSummary,
    profile,
    transactions,
    categories,
    budgets,
    goals,
    recurring,
    selectedMonth,
    granularity,
    setGranularity,
    periodAnchor,
    setPeriodAnchor,
    shiftPeriod,
    resetPeriodToToday,
    openTxModal,
    setCurrentTab,
    executeRecurringPayment,
    updateTrackingMode,
    clearAllData,
    darkMode,
  } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [showConfirmClearSample, setShowConfirmClearSample] = useState(false);
  const [txScope, setTxScope] = useState<'period' | 'all'>('period');
  const [periodDirection, setPeriodDirection] = useState<number>(1);

  const handleShiftPeriod = (delta: -1 | 1) => {
    setPeriodDirection(delta);
    shiftPeriod(delta);
  };

  const isSimpleMode = profile.trackingMode === 'simple';

  // Category Map
  const categoriesMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color }));
    return map;
  }, [categories]);

  // Period Category Breakdown
  const categorySpending = useMemo(() => {
    return computePeriodCategoryBreakdown(
      transactions,
      categoriesMap,
      periodAnchor,
      granularity
    );
  }, [transactions, categoriesMap, periodAnchor, granularity]);

  // Period Cashflow Chart Series (Day / Week / Month / Year)
  const chartData = useMemo(() => {
    return computePeriodChartSeries(transactions, periodAnchor, granularity);
  }, [transactions, periodAnchor, granularity]);

  // Budgets progress for active month
  const budgetProgress = useMemo(() => {
    return computeBudgetProgress(budgets, transactions, periodAnchor.slice(0, 7) || selectedMonth).slice(0, 4);
  }, [budgets, transactions, periodAnchor, selectedMonth]);

  // Upcoming bills
  const upcomingBills = useMemo(() => {
    return recurring
      .filter((r) => r.status === 'active' && r.type === 'expense')
      .slice(0, 3);
  }, [recurring]);

  // Active Goals
  const activeGoals = useMemo(() => {
    return goals.filter((g) => !g.isCompleted).slice(0, 3);
  }, [goals]);

  // Period or Recent transactions
  const displayedTransactions = useMemo(() => {
    const base =
      txScope === 'period'
        ? filterTransactionsByPeriod(transactions, periodAnchor, granularity)
        : transactions;
    return [...base]
      .sort((a, b) => {
        const dCmp = b.date.localeCompare(a.date);
        if (dCmp !== 0) return dCmp;
        const tCmp = (b.time || '').localeCompare(a.time || '');
        if (tCmp !== 0) return tCmp;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      })
      .slice(0, 8);
  }, [transactions, txScope, periodAnchor, granularity]);

  const periodLabel = formatPeriodLabel(periodAnchor, granularity);
  const periodDescriptor =
    granularity === 'day'
      ? 'Daily'
      : granularity === 'week'
      ? 'Weekly'
      : granularity === 'month'
      ? 'Monthly'
      : 'Yearly';

  const chartSubtitle =
    granularity === 'day'
      ? '7-day daily cashflow ending on selected day'
      : granularity === 'week'
      ? 'Day-by-day spending & income (Mon – Sun)'
      : granularity === 'month'
      ? 'Daily spending & income across the month'
      : 'Month-by-month breakdown (Jan – Dec)';

  const monthlyGoalProgress =
    profile.monthlySavingsTarget > 0
      ? Math.min(100, Math.max(0, Math.round((summary.monthlySavings / profile.monthlySavingsTarget) * 100)))
      : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-12"
    >
      {/* Sample Data Banner (One-Click Delete All Sample Data) */}
      {profile.isSampleData && (
        <motion.div
          variants={itemVariants}
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Sample Demo Data Active:</strong> Delete all sample transactions & accounts anytime to start tracking your own real expenses.
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setShowConfirmClearSample(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Sample Data</span>
          </motion.button>
        </motion.div>
      )}

      {/* Greeting + Mode Switcher + Goal Quick Action */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hi, {profile.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isSimpleMode
              ? 'Simple Expense Tracker · Track spending Day, Week, Month & Year wise'
              : 'Emerald Wealth Dashboard · Complete overview of accounts, budgets & goals'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Simple vs Full Mode Pill */}
          <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => updateTrackingMode('simple')}
              className={`relative px-3 py-1.5 min-h-[36px] text-[11px] font-bold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                isSimpleMode
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isSimpleMode && (
                <motion.span
                  layoutId="dashboard-mode-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-emerald-700 dark:bg-emerald-600 shadow-xs"
                />
              )}
              <Sliders className="w-3 h-3 relative z-10" />
              <span className="relative z-10">Simple Mode</span>
            </button>
            <button
              type="button"
              onClick={() => updateTrackingMode('full')}
              className={`relative px-3 py-1.5 min-h-[36px] text-[11px] font-bold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                !isSimpleMode
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {!isSimpleMode && (
                <motion.span
                  layoutId="dashboard-mode-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-emerald-700 dark:bg-emerald-600 shadow-xs"
                />
              )}
              <Layers className="w-3 h-3 relative z-10" />
              <span className="relative z-10">Full Mode</span>
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Set Goal</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Day / Week / Month / Year Switcher & Period Navigator */}
      <motion.div
        variants={itemVariants}
        className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        {/* Granularity Segmented Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['day', 'week', 'month', 'year'] as TimePeriodGranularity[]).map((g) => {
            const active = granularity === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`relative px-3 py-2 min-h-[40px] text-xs font-bold rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-granularity-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-emerald-700 dark:bg-emerald-600 shadow-xs"
                  />
                )}
                <span className="relative z-10">
                  {g === 'day'
                    ? 'Day'
                    : g === 'week'
                    ? 'Week'
                    : g === 'month'
                    ? 'Month'
                    : 'Year'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Period Stepping & Date Jump */}
        <div className="flex items-center justify-between md:justify-end gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => handleShiftPeriod(-1)}
            aria-label="Previous period"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 min-w-0 overflow-hidden">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <AnimatePresence mode="wait" initial={false} custom={periodDirection}>
              <motion.span
                key={`${granularity}-${periodAnchor}`}
                custom={periodDirection}
                initial={{ opacity: 0, x: periodDirection * 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: periodDirection * -14 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate tabular-nums"
              >
                {periodLabel}
              </motion.span>
            </AnimatePresence>
            {granularity === 'day' && (
              <input
                type="date"
                value={periodAnchor}
                onChange={(e) => {
                  if (e.target.value) {
                    setPeriodDirection(e.target.value >= periodAnchor ? 1 : -1);
                    setPeriodAnchor(e.target.value);
                  }
                }}
                aria-label="Pick specific date"
                className="w-5 h-5 opacity-70 hover:opacity-100 cursor-pointer bg-transparent text-xs"
              />
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => handleShiftPeriod(1)}
            aria-label="Next period"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {periodAnchor !== getTodayLocalIso() && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setPeriodDirection(getTodayLocalIso() >= periodAnchor ? 1 : -1);
                resetPeriodToToday();
              }}
              className="px-3 py-2 min-h-[40px] text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl whitespace-nowrap cursor-pointer"
            >
              Today
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Balance / Net Worth with 3D Pointer Tilt & Cashflow Ratio Meter */}
        <motion.div variants={itemVariants}>
          <WealthTiltCard className="h-full p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-xl shadow-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                {isSimpleMode ? 'Available Balance' : 'Total Net Worth'}
              </span>
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-emerald-300">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                <AnimatedCounter
                  value={isSimpleMode ? summary.totalAccountBalance : summary.totalNetWorth}
                  currencyCode={profile.currency}
                />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-emerald-300/80">
                {isSimpleMode ? (
                  <span>Across Cash & Bank wallets</span>
                ) : (
                  <>
                    <span>Assets: {formatCurrency(summary.totalAssets, profile.currency, { compact: true })}</span>
                    <span>·</span>
                    <span>Liabilities: {formatCurrency(summary.totalLiabilities, profile.currency, { compact: true })}</span>
                  </>
                )}
              </div>
            </div>

            {/* Live Period Cashflow Ratio Pulse Bar */}
            <div className="space-y-1.5 pt-2 border-t border-emerald-700/60">
              <div className="w-full h-1.5 rounded-full bg-emerald-950/70 overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX:
                      periodSummary.income + periodSummary.expenses > 0
                        ? Math.max(
                            0.08,
                            periodSummary.income / (periodSummary.income + periodSummary.expenses)
                          )
                        : 0.5,
                  }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-200/90">
                <span>{isSimpleMode ? 'Entries this period' : 'Liquid Account Balance'}</span>
                <span className="font-semibold text-emerald-300">
                  {isSimpleMode ? (
                    `${periodSummary.transactionCount} entries`
                  ) : (
                    <AnimatedCounter
                      value={summary.totalAccountBalance}
                      currencyCode={profile.currency}
                      options={{ compact: true }}
                    />
                  )}
                </span>
              </div>
            </div>
          </WealthTiltCard>
        </motion.div>

        {/* Card 2: Period Income */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {periodDescriptor} Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              <AnimatedCounter
                value={periodSummary.income}
                currencyCode={profile.currency}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {periodLabel}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => openTxModal('income')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors self-start cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </motion.button>
        </motion.div>

        {/* Card 3: Period Expenses */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {periodDescriptor} Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              <AnimatedCounter
                value={periodSummary.expenses}
                currencyCode={profile.currency}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total spend across categories
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => openTxModal('expense')}
            className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 flex items-center gap-1 transition-colors self-start cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </motion.button>
        </motion.div>

        {/* Card 4: Period Net Savings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {periodDescriptor} Net Savings
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div
              className={`text-2xl font-bold ${
                periodSummary.netSavings >= 0
                  ? 'text-teal-700 dark:text-teal-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <AnimatedCounter
                value={periodSummary.netSavings}
                currencyCode={profile.currency}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Savings Rate:</span>
              <span className="text-xs font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                {periodSummary.savingsRate}%
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => (isSimpleMode ? setCurrentTab('goals') : openTxModal('transfer'))}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors self-start cursor-pointer"
          >
            {isSimpleMode ? (
              <>
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Goals</span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Internal Transfer</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Quick Action Bar */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
      >
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider">
          Quick Actions:
        </span>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => openTxModal('expense')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50 transition-colors cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => openTxModal('income')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50 transition-colors cursor-pointer"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Add Income</span>
        </motion.button>
        {!isSimpleMode && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => openTxModal('transfer')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Transfer</span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>New Goal</span>
        </motion.button>
        {!isSimpleMode && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setCurrentTab('accounts')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Accounts</span>
          </motion.button>
        )}
      </motion.div>

      {/* Middle Row: Dynamic Day/Week/Month/Year Charts & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {periodDescriptor} Income vs Expenses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chartSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="label" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                <YAxis stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    `${profile.currencySymbol}${Number(value || 0).toLocaleString()}`,
                    '',
                  ]}
                  contentStyle={{
                    borderRadius: '16px',
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="#047857"
                  radius={[5, 5, 0, 0]}
                  name="Income"
                  isAnimationActive={true}
                  animationDuration={700}
                />
                <Bar
                  dataKey="expense"
                  fill="#f43f5e"
                  radius={[5, 5, 0, 0]}
                  name="Expense"
                  isAnimationActive={true}
                  animationDuration={700}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Period Category Donut Chart */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {periodDescriptor} Spending Split
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{periodLabel}</p>
            </div>
          </div>

          {categorySpending.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 px-3">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No expenses recorded for this {granularity}
              </p>
              <button
                type="button"
                onClick={() => openTxModal('expense')}
                className="mt-3 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl cursor-pointer"
              >
                + Record Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      isAnimationActive={true}
                      animationDuration={700}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        formatCurrency(Number(val), profile.currency),
                        '',
                      ]}
                      contentStyle={{
                        borderRadius: '14px',
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {categorySpending.slice(0, 4).map((cat) => (
                  <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(cat.amount, profile.currency, { hideDecimals: true })}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Grid: Transactions & Goals/Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Span): Transactions */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {txScope === 'period' ? `${periodDescriptor} Activity` : 'Recent Transactions'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {txScope === 'period' ? periodLabel : 'Latest ledger entries across all dates'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTxScope('period')}
                  className={`relative px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    txScope === 'period'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {txScope === 'period' && (
                    <motion.span
                      layoutId="dashboard-tx-scope-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-white dark:bg-slate-700 shadow-xs"
                    />
                  )}
                  <span className="relative z-10">This {granularity}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxScope('all')}
                  className={`relative px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    txScope === 'all'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {txScope === 'all' && (
                    <motion.span
                      layoutId="dashboard-tx-scope-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-white dark:bg-slate-700 shadow-xs"
                    />
                  )}
                  <span className="relative z-10">All Recent</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('transactions')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap cursor-pointer"
              >
                View All ({transactions.length})
              </button>
            </div>
          </div>

          {displayedTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 stroke-1" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {txScope === 'period'
                  ? `No transactions recorded for this ${granularity}`
                  : 'Your ledger is clean and ready'}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                Add your first expense or income entry to see live Day, Week, Month, and Year insights.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openTxModal('expense')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
                >
                  + Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => openTxModal('income')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  + Add Income
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {displayedTransactions.map((tx, idx) => {
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.18 }}
                    whileHover={{ x: 3 }}
                    onClick={() => onSelectTx(tx)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : isTransfer
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="w-5 h-5" />
                        ) : (
                          <Receipt className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{tx.categoryName || (isTransfer ? 'Transfer' : 'General')}</span>
                          <span>·</span>
                          <span>{formatDate(tx.date, profile.dateFormat)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right pl-3 shrink-0">
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          isIncome
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatCurrency(tx.amount, profile.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                        {tx.paymentMethod.replace('_', ' ')}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Right Column (1 Span): Personal Goals + Budgets / Upcoming Bills */}
        <div className="space-y-6">
          {/* Goals Card (Always Visible) */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Goals</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setCurrentTab('goals')}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  All
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-3">
              {/* Monthly Savings Target Progress Ring */}
              {profile.monthlySavingsTarget > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Monthly Savings Goal
                    </div>
                    <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-mono tabular-nums">
                      {formatCurrency(Math.max(0, summary.monthlySavings), profile.currency, { hideDecimals: true })} /{' '}
                      {formatCurrency(profile.monthlySavingsTarget, profile.currency, { hideDecimals: true })}
                    </div>
                  </div>
                  <CircularProgressRing
                    percentage={monthlyGoalProgress}
                    size={52}
                    strokeWidth={5}
                    color="#059669"
                    trackColorClass="stroke-emerald-200/80 dark:stroke-emerald-900/70"
                    labelClassName="text-[11px] font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-300"
                  />
                </div>
              )}

              {activeGoals.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No custom savings goals yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsGoalModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl cursor-pointer"
                  >
                    + Set Your First Goal
                  </button>
                </div>
              ) : (
                activeGoals.map((g) => {
                  const pct =
                    g.targetAmount > 0
                      ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                      : 0;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {g.title}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: pct / 100 }}
                          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full w-full rounded-full"
                          style={{ backgroundColor: g.color || '#059669', transformOrigin: 'left' }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {formatCurrency(g.currentAmount, profile.currency, { hideDecimals: true })} /{' '}
                        {formatCurrency(g.targetAmount, profile.currency, { hideDecimals: true })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Budget Health Card */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Budget Utilization</h2>
              <button
                type="button"
                onClick={() => setCurrentTab('budgets')}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
              >
                Manage
              </button>
            </div>

            {budgetProgress.length === 0 ? (
              <div className="py-5 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No category budgets configured yet.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentTab('budgets')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Create Budget
                </button>
              </div>
            ) : (
              <div className="space-y-4 mt-3">
                {budgetProgress.map((b) => (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{b.categoryName}</span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {formatCurrency(b.spent, profile.currency, { hideDecimals: true })} /{' '}
                        {formatCurrency(b.amount, profile.currency, { hideDecimals: true })}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: Math.min(100, b.utilization) / 100 }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
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
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Bills Card (Full Mode) */}
          {!isSimpleMode && (
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Bills</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('recurring')}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                >
                  All Bills
                </button>
              </div>

              {upcomingBills.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                  No recurring bills scheduled.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                  {upcomingBills.map((bill) => (
                    <div key={bill.id} className="py-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{bill.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Due: {formatDate(bill.nextDueDate, profile.dateFormat)} · {bill.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(bill.amount, profile.currency, { hideDecimals: true })}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          title="Record as paid now"
                          onClick={() => executeRecurringPayment(bill.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Goal Creation Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      {/* Delete All Sample Data Confirmation */}
      <ConfirmDialog
        isOpen={showConfirmClearSample}
        title="Delete All Sample Data?"
        message="This will wipe all pre-loaded sample transactions, budgets, goals, debts, and assets while keeping your personal profile intact so you can start completely fresh."
        confirmLabel="Yes, Delete Sample Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setShowConfirmClearSample(false);
        }}
        onCancel={() => setShowConfirmClearSample(false)}
      />
    </motion.div>
  );
};
