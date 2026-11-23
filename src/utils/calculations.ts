import { Account, Asset, Budget, DebtLoan, TimePeriodGranularity, Transaction } from '../types/finance';

/**
 * Calculates accurate real-time balance for an account based on:
 * Opening Balance + Income - Expenses + Transfers In - Transfers Out
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.openingBalance;

  for (const t of transactions) {
    if (t.type === 'income' && t.fromAccountId === account.id) {
      // Income received into this account
      balance += t.amount;
    } else if (t.type === 'expense' && t.fromAccountId === account.id) {
      // Expense paid out from this account
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.fromAccountId === account.id) {
        // Transferred out of this account
        balance -= t.amount;
      }
      if (t.toAccountId === account.id) {
        // Transferred into this account
        balance += t.amount;
      }
    }
  }

  return balance;
}

export interface FinancialSummary {
  totalNetWorth: number;
  totalAccountBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // percentage 0-100
  totalBorrowed: number;
  totalLent: number;
}

/**
 * Computes high-level financial summary across accounts, transactions, assets and debts
 */
export function computeFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  assets: Asset[],
  debts: DebtLoan[],
  selectedMonth?: string // YYYY-MM
): FinancialSummary {
  const currentMonthStr = selectedMonth || getTodayLocalIso().slice(0, 7);

  // 1. Calculate each account balance
  const accountBalances = accounts.map((acc) => ({
    ...acc,
    balance: calculateAccountBalance(acc, transactions),
  }));

  // 2. Separate asset balances vs liabilities (credit card debt)
  let totalPositiveAccountBalance = 0;
  let totalCreditCardDebt = 0;

  for (const acc of accountBalances) {
    if (acc.isArchived) continue;
    if (acc.type === 'credit_card') {
      // If credit card has negative balance or used limit, it is a liability
      if (acc.balance < 0) {
        totalCreditCardDebt += Math.abs(acc.balance);
      } else {
        totalPositiveAccountBalance += acc.balance;
      }
    } else {
      if (acc.balance >= 0) {
        totalPositiveAccountBalance += acc.balance;
      } else {
        // Negative balance in bank or wallet is treated as overdraft liability
        totalCreditCardDebt += Math.abs(acc.balance);
      }
    }
  }

  // 3. Physical & Investment Assets
  const totalInvestmentsAndPhysicalAssets = assets.reduce(
    (sum, a) => sum + (a.currentValue || 0),
    0
  );

  // 4. Debts: Borrowed (Liability) vs Lent (Asset receivable)
  let totalBorrowed = 0;
  let totalLent = 0;

  for (const debt of debts) {
    if (debt.isSettled) continue;
    if (debt.type === 'borrowed') {
      totalBorrowed += debt.outstandingBalance;
    } else if (debt.type === 'lent') {
      totalLent += debt.outstandingBalance;
    }
  }

  const totalAssets = totalPositiveAccountBalance + totalInvestmentsAndPhysicalAssets + totalLent;
  const totalLiabilities = totalCreditCardDebt + totalBorrowed;
  const totalNetWorth = totalAssets - totalLiabilities;
  const totalAccountBalance = accountBalances.reduce(
    (sum, a) => (a.isArchived ? sum : sum + a.balance),
    0
  );

  // 5. Monthly Income & Expenses (Only for the specified month, transfers excluded!)
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  for (const t of transactions) {
    const txMonth = t.date.slice(0, 7);
    if (txMonth !== currentMonthStr) continue;

    if (t.type === 'income') {
      monthlyIncome += t.amount;
    } else if (t.type === 'expense') {
      monthlyExpenses += t.amount;
    }
    // Note: 'transfer' is NEVER counted as income or expense!
  }

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((monthlySavings / monthlyIncome) * 100)) : 0;

  return {
    totalNetWorth,
    totalAccountBalance,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    totalBorrowed,
    totalLent,
  };
}

/**
 * Computes category-wise expense breakdown for a given month or all time
 */
export function computeCategoryBreakdown(
  transactions: Transaction[],
  categoriesMap: Map<string, { name: string; color: string }>,
  targetMonth?: string
) {
  const categoryTotals: Record<string, { name: string; color: string; amount: number }> = {};

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (targetMonth && t.date.slice(0, 7) !== targetMonth) continue;

    const catInfo = categoriesMap.get(t.categoryId) || {
      name: t.categoryName || 'Other',
      color: '#64748B',
    };

    if (!categoryTotals[t.categoryId]) {
      categoryTotals[t.categoryId] = {
        name: catInfo.name,
        color: catInfo.color,
        amount: 0,
      };
    }
    categoryTotals[t.categoryId].amount += t.amount;
  }

  const totalExpense = Object.values(categoryTotals).reduce((sum, item) => sum + item.amount, 0);

  return Object.entries(categoryTotals)
    .map(([categoryId, data]) => ({
      categoryId,
      name: data.name,
      color: data.color,
      amount: data.amount,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Budget tracking calculations
 */
export function computeBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  currentMonth: string
) {
  return budgets.map((b) => {
    // Calculate total spent in this budget category for the month
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.categoryId === b.categoryId &&
          t.date.slice(0, 7) === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = b.amount - spent;
    const utilization = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const isOverBudget = spent > b.amount;
    const isWarning = !isOverBudget && spent >= b.amount * (b.alertThreshold || 0.8);

    return {
      ...b,
      spent,
      remaining,
      utilization: Math.round(utilization),
      isOverBudget,
      isWarning,
    };
  });
}

// ==========================================
// Day / Week / Month / Year Tracking Helpers
// ==========================================

export function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalIsoDate(iso: string): Date {
  const parts = iso.split('-').map((n) => parseInt(n, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}

export function getTodayLocalIso(): string {
  return toLocalIsoDate(new Date());
}

/**
 * Returns Monday..Sunday bounds in YYYY-MM-DD for the week containing anchorIso
 */
export function getWeekBounds(anchorIso: string): { startIso: string; endIso: string } {
  const d = parseLocalIsoDate(anchorIso);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMon);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  return {
    startIso: toLocalIsoDate(mon),
    endIso: toLocalIsoDate(sun),
  };
}

export function shiftPeriodAnchor(
  anchorIso: string,
  granularity: TimePeriodGranularity,
  delta: number
): string {
  const d = parseLocalIsoDate(anchorIso);
  if (granularity === 'day') {
    d.setDate(d.getDate() + delta);
  } else if (granularity === 'week') {
    d.setDate(d.getDate() + delta * 7);
  } else if (granularity === 'month') {
    d.setMonth(d.getMonth() + delta);
  } else if (granularity === 'year') {
    d.setFullYear(d.getFullYear() + delta);
  }
  return toLocalIsoDate(d);
}

export function formatPeriodLabel(anchorIso: string, granularity: TimePeriodGranularity): string {
  const d = parseLocalIsoDate(anchorIso);
  const todayIso = getTodayLocalIso();

  if (granularity === 'day') {
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return anchorIso === todayIso ? `Today · ${formatted}` : formatted;
  }

  if (granularity === 'week') {
    const { startIso, endIso } = getWeekBounds(anchorIso);
    const s = parseLocalIsoDate(startIso);
    const e = parseLocalIsoDate(endIso);
    const sLabel = s.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const eLabel = e.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const currentWeek = getWeekBounds(todayIso);
    const prefix = startIso === currentWeek.startIso ? 'This Week · ' : '';
    return `${prefix}${sLabel} – ${eLabel}`;
  }

  if (granularity === 'month') {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  return `Year ${d.getFullYear()}`;
}

export function isDateInPeriod(
  txDateIso: string,
  anchorIso: string,
  granularity: TimePeriodGranularity
): boolean {
  if (!txDateIso) return false;
  if (granularity === 'day') {
    return txDateIso === anchorIso;
  }
  if (granularity === 'week') {
    const { startIso, endIso } = getWeekBounds(anchorIso);
    return txDateIso >= startIso && txDateIso <= endIso;
  }
  if (granularity === 'month') {
    return txDateIso.slice(0, 7) === anchorIso.slice(0, 7);
  }
  return txDateIso.slice(0, 4) === anchorIso.slice(0, 4);
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  anchorIso: string,
  granularity: TimePeriodGranularity
): Transaction[] {
  return transactions.filter((t) => isDateInPeriod(t.date, anchorIso, granularity));
}

export interface PeriodSummary {
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
}

export function computePeriodSummary(
  transactions: Transaction[],
  anchorIso: string,
  granularity: TimePeriodGranularity
): PeriodSummary {
  const matched = filterTransactionsByPeriod(transactions, anchorIso, granularity);
  let income = 0;
  let expenses = 0;

  for (const t of matched) {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expenses += t.amount;
  }

  const netSavings = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round((netSavings / income) * 100)) : 0;

  return {
    income,
    expenses,
    netSavings,
    savingsRate,
    transactionCount: matched.length,
  };
}

export function computePeriodCategoryBreakdown(
  transactions: Transaction[],
  categoriesMap: Map<string, { name: string; color: string }>,
  anchorIso: string,
  granularity: TimePeriodGranularity
) {
  const matched = filterTransactionsByPeriod(transactions, anchorIso, granularity);
  return computeCategoryBreakdown(matched, categoriesMap);
}

export interface PeriodChartPoint {
  label: string;
  income: number;
  expense: number;
  savings: number;
  isSelected?: boolean;
}

export function computePeriodChartSeries(
  transactions: Transaction[],
  anchorIso: string,
  granularity: TimePeriodGranularity
): PeriodChartPoint[] {
  const anchor = parseLocalIsoDate(anchorIso);
  const toMajor = (minor: number) => Math.round((minor / 100) * 100) / 100;

  if (granularity === 'day') {
    // Show 7 consecutive days ending on anchorIso so daily trend is clear
    const points: PeriodChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - i);
      const iso = toLocalIsoDate(d);
      let inc = 0;
      let exp = 0;
      for (const t of transactions) {
        if (t.date === iso) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
        }
      }
      points.push({
        label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        income: toMajor(inc),
        expense: toMajor(exp),
        savings: toMajor(inc - exp),
        isSelected: iso === anchorIso,
      });
    }
    return points;
  }

  if (granularity === 'week') {
    const { startIso } = getWeekBounds(anchorIso);
    const start = parseLocalIsoDate(startIso);
    const points: PeriodChartPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = toLocalIsoDate(d);
      let inc = 0;
      let exp = 0;
      for (const t of transactions) {
        if (t.date === iso) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
        }
      }
      points.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income: toMajor(inc),
        expense: toMajor(exp),
        savings: toMajor(inc - exp),
        isSelected: iso === anchorIso,
      });
    }
    return points;
  }

  if (granularity === 'month') {
    // Group into days of the selected month (1..daysInMonth)
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const points: PeriodChartPoint[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toLocalIsoDate(new Date(year, month, day));
      let inc = 0;
      let exp = 0;
      for (const t of transactions) {
        if (t.date === iso) {
          if (t.type === 'income') inc += t.amount;
          else if (t.type === 'expense') exp += t.amount;
        }
      }
      points.push({
        label: String(day),
        income: toMajor(inc),
        expense: toMajor(exp),
        savings: toMajor(inc - exp),
      });
    }
    return points;
  }

  // granularity === 'year' -> 12 months (Jan..Dec)
  const year = anchor.getFullYear();
  const points: PeriodChartPoint[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const ym = `${year}-${String(m + 1).padStart(2, '0')}`;
    let inc = 0;
    let exp = 0;
    for (const t of transactions) {
      if (t.date.slice(0, 7) === ym) {
        if (t.type === 'income') inc += t.amount;
        else if (t.type === 'expense') exp += t.amount;
      }
    }
    points.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      income: toMajor(inc),
      expense: toMajor(exp),
      savings: toMajor(inc - exp),
    });
  }
  return points;
}

