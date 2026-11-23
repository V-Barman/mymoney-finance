import React, { useMemo, useState } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Plus,
  Receipt,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { TimePeriodGranularity, Transaction } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/currency';
import { exportTransactionsToCSV } from '../../utils/export';
import {
  formatPeriodLabel,
  getTodayLocalIso,
  isDateInPeriod,
  shiftPeriodAnchor,
} from '../../utils/calculations';

interface TransactionHistoryViewProps {
  onSelectTx: (tx: Transaction) => void;
}

type HistoryRangeMode = 'all' | TimePeriodGranularity;

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({ onSelectTx }) => {
  const { transactions, accounts, categories, profile, openTxModal } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rangeMode, setRangeMode] = useState<HistoryRangeMode>('all');
  const [anchorDate, setAnchorDate] = useState<string>(() => getTodayLocalIso());
  const [periodDirection, setPeriodDirection] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description?.toLowerCase().includes(q);
          const matchNote = tx.notes?.toLowerCase().includes(q);
          const matchCat = tx.categoryName?.toLowerCase().includes(q);
          if (!matchDesc && !matchNote && !matchCat) return false;
        }

        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        if (selectedAccount !== 'all') {
          if (tx.fromAccountId !== selectedAccount && tx.toAccountId !== selectedAccount) {
            return false;
          }
        }

        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        if (rangeMode !== 'all') {
          if (!isDateInPeriod(tx.date, anchorDate, rangeMode)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          const dCmp = b.date.localeCompare(a.date);
          if (dCmp !== 0) return dCmp;
          const tCmp = (b.time || '').localeCompare(a.time || '');
          if (tCmp !== 0) return tCmp;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        if (sortBy === 'date-asc') {
          const dCmp = a.date.localeCompare(b.date);
          if (dCmp !== 0) return dCmp;
          const tCmp = (a.time || '').localeCompare(b.time || '');
          if (tCmp !== 0) return tCmp;
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedAccount,
    selectedCategory,
    rangeMode,
    anchorDate,
    sortBy,
  ]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expense += tx.amount;
    }
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const accountsMap = new Map<string, string>();
    accounts.forEach((a) => accountsMap.set(a.id, a.name));
    exportTransactionsToCSV(filteredTransactions, accountsMap, profile.currency, true);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track expenses Day, Week, Month & Year wise or search all entries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => openTxModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </motion.button>
        </div>
      </div>

      {/* Day / Week / Month / Year Filter Strip */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'day', label: 'Day' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'year', label: 'Year' },
            ] as { id: HistoryRangeMode; label: string }[]
          ).map((tab) => {
            const active = rangeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRangeMode(tab.id)}
                className={`relative px-2.5 py-2 min-h-[40px] text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="history-range-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-emerald-700 dark:bg-emerald-600 shadow-xs"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {rangeMode !== 'all' && (
          <div className="flex items-center justify-between md:justify-end gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => {
                setPeriodDirection(-1);
                setAnchorDate(shiftPeriodAnchor(anchorDate, rangeMode, -1));
              }}
              aria-label="Previous period"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <div className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums overflow-hidden">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <AnimatePresence mode="wait" initial={false} custom={periodDirection}>
                <motion.span
                  key={`${rangeMode}-${anchorDate}`}
                  custom={periodDirection}
                  initial={{ opacity: 0, x: periodDirection * 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: periodDirection * -12 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="whitespace-nowrap"
                >
                  {formatPeriodLabel(anchorDate, rangeMode)}
                </motion.span>
              </AnimatePresence>
              {rangeMode === 'day' && (
                <input
                  type="date"
                  value={anchorDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPeriodDirection(e.target.value >= anchorDate ? 1 : -1);
                      setAnchorDate(e.target.value);
                    }
                  }}
                  className="w-4 h-4 opacity-70 cursor-pointer bg-transparent"
                />
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => {
                setPeriodDirection(1);
                setAnchorDate(shiftPeriodAnchor(anchorDate, rangeMode, 1));
              }}
              aria-label="Next period"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Period Filtered Totals Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filtered Income</div>
          <div className="text-sm sm:text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
            +{formatCurrency(filteredTotals.income, profile.currency)}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filtered Expenses</div>
          <div className="text-sm sm:text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            -{formatCurrency(filteredTotals.expense, profile.currency)}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Net Balance</div>
          <div
            className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
              filteredTotals.net >= 0
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(filteredTotals.net, profile.currency)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by title, category, notes..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredTransactions.length} recorded entries</span>
          {(searchQuery || rangeMode !== 'all' || selectedType !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedAccount('all');
                setSelectedCategory('all');
                setRangeMode('all');
              }}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 stroke-1" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No transactions match your filters</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your period/search criteria or record a new entry
            </p>
            <button
              type="button"
              onClick={() => openTxModal('expense')}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
            >
              Record Entry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const fromAcc = accounts.find((a) => a.id === tx.fromAccountId);
              const toAcc = tx.toAccountId ? accounts.find((a) => a.id === tx.toAccountId) : null;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 3 }}
                  onClick={() => onSelectTx(tx)}
                  className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : isTransfer
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {tx.categoryName || (isTransfer ? 'Internal Transfer' : 'General')}
                        </span>
                        <span>·</span>
                        <span>
                          {isTransfer ? `${fromAcc?.name || 'A'} → ${toAcc?.name || 'B'}` : fromAcc?.name}
                        </span>
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
    </div>
  );
};
