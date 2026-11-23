import React, { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { exportAccountsToCSV, exportTransactionsToCSV } from '../../utils/export';
import { formatCurrency, formatDate } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const ReportsView: React.FC = () => {
  const { transactions, accounts, profile, summary, selectedMonth } = useFinance();
  const [reportPeriod, setReportPeriod] = useState<string>('selected-month');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const accountsMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  const filteredReportTransactions = useMemo(() => {
    const todayLocal = getTodayLocalIso();
    const targetMonth = selectedMonth || todayLocal.slice(0, 7);
    const targetYear = targetMonth.slice(0, 4);

    return transactions
      .filter((t) => {
        if (reportPeriod === 'selected-month') {
          return t.date.slice(0, 7) === targetMonth;
        }
        if (reportPeriod === 'year-to-date') {
          return t.date.slice(0, 4) === targetYear;
        }
        return true; // all-time
      })
      .sort((a, b) => {
        const dCmp = b.date.localeCompare(a.date);
        if (dCmp !== 0) return dCmp;
        return (b.time || '').localeCompare(a.time || '');
      });
  }, [transactions, reportPeriod, selectedMonth]);

  // Aggregate stats for this period
  const periodStats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredReportTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    const sav = inc - exp;
    const rate = inc > 0 ? Math.max(0, Math.round((sav / inc) * 100)) : 0;
    return { inc, exp, sav, rate };
  }, [filteredReportTransactions]);

  const handleExportTransactionsExcel = () => {
    exportTransactionsToCSV(filteredReportTransactions, accountsMap, profile.currency, true);
  };

  const handleExportTransactionsCSV = () => {
    exportTransactionsToCSV(filteredReportTransactions, accountsMap, profile.currency, false);
  };

  const handleExportAccounts = () => {
    exportAccountsToCSV(accounts, profile.currency);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reports & Ledger Exports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download certified audit trails, Excel spreadsheets, and print-ready balance statements
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Financial Statement</span>
        </motion.button>
      </div>

      {/* Export Options Grid */}
      <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Excel CSV */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excel-Ready Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export UTF-8 BOM CSV formatted specifically for Microsoft Excel and Google Sheets without encoding glitches.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleExportTransactionsExcel}
            className="mt-5 w-full py-2.5 px-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel CSV</span>
          </motion.button>
        </motion.div>

        {/* Card 2: Plain CSV */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Standard Raw CSV</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Clean RFC-4180 standard CSV file for custom python scripts, databases, and accounting software.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleExportTransactionsCSV}
            className="mt-5 w-full py-2.5 px-4 text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Standard CSV</span>
          </motion.button>
        </motion.div>

        {/* Card 3: Accounts Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -3 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accounts Summary Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export account names, types, current calculated balances, credit limits, and archive states.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleExportAccounts}
            className="mt-5 w-full py-2.5 px-4 text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Accounts CSV</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Period Summary Table Preview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="no-print p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Executive Summary Preview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audited numbers for selected timeframe</p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['selected-month', 'year-to-date', 'all-time'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setReportPeriod(period)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  reportPeriod === period
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {period === 'selected-month'
                  ? `Month (${selectedMonth})`
                  : period === 'year-to-date'
                  ? 'Full Year'
                  : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Period Total Inflow</span>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
              <AnimatedCounter value={periodStats.inc} currency={profile.currency} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Period Total Outflow</span>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={periodStats.exp} currency={profile.currency} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Period Savings</span>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                periodStats.sav >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <AnimatedCounter value={periodStats.sav} currency={profile.currency} />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Savings Rate</span>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
              {periodStats.rate}%
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filteredReportTransactions.length} transactions included in this audit period.
        </div>
      </motion.div>

      {/* Print Statement Modal */}
      {isPrintModalOpen && (
        <div className="print-statement-root fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="print-statement-root w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center font-bold">
                  M
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">MyMoney Financial Statement</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Client: {profile.name} · Statement Date: {formatDate(getTodayLocalIso(), profile.dateFormat)}
                  </p>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Statement Summary Sheet */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Total Net Worth:</span>
                  <div className="text-base font-bold font-mono text-emerald-900 dark:text-emerald-300">
                    {formatCurrency(summary.totalNetWorth, profile.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Liquid Account Balances:</span>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(summary.totalAccountBalance, profile.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Capital Holdings & Assets:</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {formatCurrency(summary.totalAssets, profile.currency)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Outstanding Liabilities & Debts:</span>
                  <div className="text-sm font-bold font-mono text-rose-700 dark:text-rose-400">
                    {formatCurrency(summary.totalLiabilities, profile.currency)}
                  </div>
                </div>
              </div>

              {/* Transactions table */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Recent Ledger Audit Items</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredReportTransactions.slice(0, 10).map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400">
                            {formatDate(t.date, profile.dateFormat)}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">{t.description}</td>
                          <td className="py-2 px-3 uppercase text-[10px] text-slate-500 dark:text-slate-400">{t.type}</td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-slate-900 dark:text-white">
                            {formatCurrency(t.amount, profile.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
