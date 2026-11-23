import React, { useMemo, useState } from 'react';
import { Percent, Layers } from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toMajorUnits } from '../../utils/currency';
import { getWeekBounds, toLocalIsoDate } from '../../utils/calculations';
import { TimePeriodGranularity } from '../../types/finance';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const AnalyticsView: React.FC = () => {
  const { transactions, accounts, profile, darkMode } = useFinance();
  const [granularity, setGranularity] = useState<TimePeriodGranularity>('month');

  // Dynamic Cashflow Series across Day / Week / Month / Year
  const trendData = useMemo(() => {
    const now = new Date();
    const data: {
      label: string;
      income: number;
      expense: number;
      savings: number;
      savingsRate: number;
    }[] = [];

    if (granularity === 'day') {
      // Last 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const iso = toLocalIsoDate(d);
        let incMinor = 0;
        let expMinor = 0;
        for (const t of transactions) {
          if (t.date === iso) {
            if (t.type === 'income') incMinor += t.amount;
            if (t.type === 'expense') expMinor += t.amount;
          }
        }
        const inc = toMajorUnits(incMinor);
        const exp = toMajorUnits(expMinor);
        const sav = inc - exp;
        data.push({
          label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          income: inc,
          expense: exp,
          savings: sav,
          savingsRate: inc > 0 ? Math.max(0, Math.round((sav / inc) * 100)) : 0,
        });
      }
      return data;
    }

    if (granularity === 'week') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
        const { startIso, endIso } = getWeekBounds(toLocalIsoDate(anchor));
        let incMinor = 0;
        let expMinor = 0;
        for (const t of transactions) {
          if (t.date >= startIso && t.date <= endIso) {
            if (t.type === 'income') incMinor += t.amount;
            if (t.type === 'expense') expMinor += t.amount;
          }
        }
        const inc = toMajorUnits(incMinor);
        const exp = toMajorUnits(expMinor);
        const sav = inc - exp;
        const sDate = new Date(startIso + 'T00:00:00');
        data.push({
          label: sDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          income: inc,
          expense: exp,
          savings: sav,
          savingsRate: inc > 0 ? Math.max(0, Math.round((sav / inc) * 100)) : 0,
        });
      }
      return data;
    }

    if (granularity === 'month') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        let incMinor = 0;
        let expMinor = 0;
        for (const t of transactions) {
          if (t.date.slice(0, 7) === ym) {
            if (t.type === 'income') incMinor += t.amount;
            if (t.type === 'expense') expMinor += t.amount;
          }
        }
        const inc = toMajorUnits(incMinor);
        const exp = toMajorUnits(expMinor);
        const sav = inc - exp;
        data.push({
          label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income: inc,
          expense: exp,
          savings: sav,
          savingsRate: inc > 0 ? Math.max(0, Math.round((sav / inc) * 100)) : 0,
        });
      }
      return data;
    }

    // granularity === 'year' -> last 4 years
    const curYear = now.getFullYear();
    for (let y = curYear - 3; y <= curYear; y++) {
      const yStr = String(y);
      let incMinor = 0;
      let expMinor = 0;
      for (const t of transactions) {
        if (t.date.slice(0, 4) === yStr) {
          if (t.type === 'income') incMinor += t.amount;
          if (t.type === 'expense') expMinor += t.amount;
        }
      }
      const inc = toMajorUnits(incMinor);
      const exp = toMajorUnits(expMinor);
      const sav = inc - exp;
      data.push({
        label: yStr,
        income: inc,
        expense: exp,
        savings: sav,
        savingsRate: inc > 0 ? Math.max(0, Math.round((sav / inc) * 100)) : 0,
      });
    }
    return data;
  }, [transactions, granularity]);

  // Account Balance Distribution
  const accountDistribution = useMemo(() => {
    const active = accounts.filter((a) => !a.isArchived && a.currentBalance > 0);
    const total = active.reduce((sum, a) => sum + a.currentBalance, 0);

    return active.map((a) => ({
      name: a.name,
      balance: a.currentBalance,
      color: a.color,
      percentage: total > 0 ? Math.round((a.currentBalance / total) * 100) : 0,
    }));
  }, [accounts]);

  // Lifetime Totals
  const lifetimeStats = useMemo(() => {
    let totalInc = 0;
    let totalExp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') totalInc += t.amount;
      if (t.type === 'expense') totalExp += t.amount;
    });
    const totalSav = totalInc - totalExp;
    const rate = totalInc > 0 ? Math.max(0, Math.round((totalSav / totalInc) * 100)) : 0;
    return { totalInc, totalExp, totalSav, rate };
  }, [transactions]);

  const tooltipStyle = {
    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
    borderColor: darkMode ? '#334155' : '#e2e8f0',
    color: darkMode ? '#f8fafc' : '#0f172a',
    borderRadius: '16px',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
    fontWeight: '500',
  };

  const granularityLabel =
    granularity === 'day'
      ? 'Last 14 Days (Day-wise)'
      : granularity === 'week'
      ? 'Last 8 Weeks (Week-wise)'
      : granularity === 'month'
      ? 'Last 6 Months (Month-wise)'
      : 'Multi-Year (Year-wise)';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare income, spending & savings Day, Week, Month, and Year wise
          </p>
        </div>

        {/* Day / Week / Month / Year Selector */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs self-start sm:self-auto">
          {(['day', 'week', 'month', 'year'] as TimePeriodGranularity[]).map((g) => {
            const active = granularity === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`relative px-3.5 py-2 min-h-[38px] text-xs font-bold rounded-xl capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="analytics-granularity-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-emerald-700 dark:bg-emerald-600 shadow-xs"
                  />
                )}
                <span className="relative z-10">
                  {g === 'day' ? 'Day' : g === 'week' ? 'Week' : g === 'month' ? 'Month' : 'Year'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cumulative Income</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
            <AnimatedCounter value={lifetimeStats.totalInc} currencyCode={profile.currency} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cumulative Outflow</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={lifetimeStats.totalExp} currencyCode={profile.currency} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Net Saved</span>
          <div className="text-xl font-bold font-mono tabular-nums text-teal-700 dark:text-teal-400 mt-1">
            <AnimatedCounter value={lifetimeStats.totalSav} currencyCode={profile.currency} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Savings Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
              {lifetimeStats.rate}%
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-md font-semibold">
              Wealth building
            </span>
          </div>
        </motion.div>
      </div>

      {/* Cashflow Velocity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cashflow & Savings Velocity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {granularityLabel} comparison of inflows, outflows & savings
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500" />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Expense
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Net Savings
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="label" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
              <YAxis stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val: any) => [
                  `${profile.currencySymbol}${Number(val || 0).toLocaleString()}`,
                  '',
                ]}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="income" fill="#047857" radius={[6, 6, 0, 0]} name="Income" isAnimationActive={true} animationDuration={700} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" isAnimationActive={true} animationDuration={700} />
              <Bar dataKey="savings" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Savings" isAnimationActive={true} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Savings Rate Progression</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">% of income retained</span>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                  <YAxis stroke={darkMode ? '#64748b' : '#94a3b8'} domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Savings Rate']}
                    contentStyle={tooltipStyle}
                  />
                  <Line
                    type="monotone"
                    dataKey="savingsRate"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 4 }}
                    name="Savings Rate %"
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            Target savings rate recommended for financial freedom: 25% – 40%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Reserve Split</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Positive balances</span>
            </div>

            {accountDistribution.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                Add funds or an opening balance to your accounts to see allocation
              </div>
            ) : (
              <div className="space-y-4 mt-3">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountDistribution}
                        dataKey="balance"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        isAnimationActive={true}
                        animationDuration={700}
                      >
                        {accountDistribution.map((entry, index) => (
                          <Cell key={`acc-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [
                          formatCurrency(Number(val), profile.currency),
                          '',
                        ]}
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {accountDistribution.map((acc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: acc.color }} />
                        <span className="text-slate-700 dark:text-slate-300 truncate">{acc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(acc.balance, profile.currency, { hideDecimals: true })}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">({acc.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
