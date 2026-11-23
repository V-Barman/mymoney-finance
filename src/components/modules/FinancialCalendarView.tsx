import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt,
  Repeat,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';

interface FinancialCalendarViewProps {
  onSelectTx: (tx: Transaction) => void;
}

export const FinancialCalendarView: React.FC<FinancialCalendarViewProps> = ({ onSelectTx }) => {
  const { transactions, recurring, profile, openTxModal } = useFinance();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => getTodayLocalIso());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month and calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Aggregate day-by-day stats
  const calendarData = useMemo(() => {
    const map = new Map<
      string,
      {
        incomeTotal: number;
        expenseTotal: number;
        txs: Transaction[];
        bills: typeof recurring;
      }
    >();

    // Index transactions
    transactions.forEach((tx) => {
      const day = tx.date.slice(0, 10);
      if (!map.has(day)) {
        map.set(day, { incomeTotal: 0, expenseTotal: 0, txs: [], bills: [] });
      }
      const item = map.get(day)!;
      item.txs.push(tx);
      if (tx.type === 'income') item.incomeTotal += tx.amount;
      if (tx.type === 'expense') item.expenseTotal += tx.amount;
    });

    // Index recurring bills
    recurring.forEach((rec) => {
      const day = rec.nextDueDate.slice(0, 10);
      if (!map.has(day)) {
        map.set(day, { incomeTotal: 0, expenseTotal: 0, txs: [], bills: [] });
      }
      map.get(day)!.bills.push(rec);
    });

    return map;
  }, [transactions, recurring]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(getTodayLocalIso());
  };

  // Selected Day Details
  const selectedDayData = calendarData.get(selectedDayStr);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize income cashflow, daily spend velocity, and recurring billing dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
          >
            Today
          </motion.button>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] rounded-2xl bg-slate-50/40 dark:bg-slate-800/30 opacity-40" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayData = calendarData.get(dateStr);
              const isSelected = selectedDayStr === dateStr;
              const isToday = getTodayLocalIso() === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`min-h-[72px] p-2 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                      : isToday
                      ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-emerald-900 dark:text-emerald-200 font-extrabold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicator dots */}
                    <div className="flex items-center gap-1">
                      {dayData && dayData.incomeTotal > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" title="Income" />
                      )}
                      {dayData && dayData.expenseTotal > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Expense" />
                      )}
                      {dayData && dayData.bills.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Bill Due" />
                      )}
                    </div>
                  </div>

                  {/* Micro amount badge */}
                  {dayData && (
                    <div className="mt-1 space-y-0.5 text-[9px] font-mono tabular-nums leading-tight">
                      {dayData.incomeTotal > 0 && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold truncate">
                          +{formatCurrency(dayData.incomeTotal, profile.currency, { compact: true })}
                        </div>
                      )}
                      {dayData.expenseTotal > 0 && (
                        <div className="text-rose-600 dark:text-rose-400 font-bold truncate">
                          -{formatCurrency(dayData.expenseTotal, profile.currency, { compact: true })}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Day Agenda Drawer (1 Col) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedDayStr, profile.dateFormat)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openTxModal('expense', null, selectedDayStr)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
              >
                + Log Spend
              </button>
            </div>

            {/* Daily Totals */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase">Income</span>
                <div className="text-sm font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {formatCurrency(selectedDayData?.incomeTotal || 0, profile.currency)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                <span className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold uppercase">Expenses</span>
                <div className="text-sm font-bold font-mono text-rose-900 dark:text-rose-200 mt-0.5">
                  {formatCurrency(selectedDayData?.expenseTotal || 0, profile.currency)}
                </div>
              </div>
            </div>

            {/* Day Transactions List */}
            <div className="space-y-2 mt-4 max-h-80 overflow-y-auto pr-1">
              {/* Upcoming bills on this day */}
              {selectedDayData?.bills.map((bill) => (
                <div
                  key={`cal-bill-${bill.id}`}
                  className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                      <Repeat className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>{bill.title}</span>
                    </div>
                    <span className="text-[10px] text-amber-800 dark:text-amber-400">Recurring Bill Due</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-950 dark:text-amber-100">
                    {formatCurrency(bill.amount, profile.currency)}
                  </span>
                </div>
              ))}

              {/* Transactions on this day */}
              {selectedDayData?.txs.map((tx) => {
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';
                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTx(tx)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{tx.description}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {tx.categoryName || tx.type} · {tx.paymentMethod}
                      </div>
                    </div>
                    <div
                      className={`text-xs font-bold font-mono tabular-nums ${
                        isIncome ? 'text-emerald-700 dark:text-emerald-400' : isTransfer ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatCurrency(tx.amount, profile.currency)}
                    </div>
                  </div>
                );
              })}

              {(!selectedDayData || (selectedDayData.txs.length === 0 && selectedDayData.bills.length === 0)) && (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No financial events recorded on this date
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
