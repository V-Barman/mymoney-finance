import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  Asset,
  Budget,
  Category,
  DebtLoan,
  RecurringPayment,
  SavedProfileMeta,
  SavingsGoal,
  TimePeriodGranularity,
  TrackingMode,
  Transaction,
  UserProfile,
} from '../types/finance';
import {
  calculateAccountBalance,
  computeFinancialSummary,
  computePeriodSummary,
  FinancialSummary,
  getTodayLocalIso,
  parseLocalIsoDate,
  PeriodSummary,
  shiftPeriodAnchor,
  toLocalIsoDate,
} from '../utils/calculations';
import { AppStateData, CreateProfileInput, FinanceStorage } from '../utils/storage';
import { ToastItem } from '../components/common/ToastContainer';
import { triggerGoalCelebration } from '../utils/confetti';
import { formatCurrency } from '../utils/currency';

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budgets'
  | 'analytics'
  | 'goals'
  | 'debts'
  | 'recurring'
  | 'calendar'
  | 'assets'
  | 'categories'
  | 'reports'
  | 'settings';

interface FinanceContextType {
  // Auth & Multi-profile state
  isAuthenticated: boolean;
  savedProfiles: SavedProfileMeta[];
  createNewProfile: (input: CreateProfileInput) => void;
  loginToProfile: (profileId: string, pinAttempt?: string) => { ok: boolean; error?: string };
  openDemoProfile: () => void;
  logout: () => void;
  deleteSavedProfile: (profileId: string) => void;

  profile: UserProfile;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtLoan[];
  recurring: RecurringPayment[];
  assets: Asset[];
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Day / Week / Month / Year expense tracking state
  granularity: TimePeriodGranularity;
  setGranularity: (g: TimePeriodGranularity) => void;
  periodAnchor: string;
  setPeriodAnchor: (isoDate: string) => void;
  shiftPeriod: (delta: number) => void;
  resetPeriodToToday: () => void;
  periodSummary: PeriodSummary;

  summary: FinancialSummary;
  showSplash: boolean;
  setShowSplash: (val: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (val: boolean) => void;
  showInstallModal: boolean;
  setShowInstallModal: (val: boolean) => void;
  openInstallModal: () => void;

  // Transaction Modal controller
  isTxModalOpen: boolean;
  txModalType: 'income' | 'expense' | 'transfer';
  txModalEditItem: Transaction | null;
  txModalDefaultDate: string | null;
  txModalDefaultAccountId: string | null;
  openTxModal: (
    type?: 'income' | 'expense' | 'transfer',
    item?: Transaction | null,
    defaultDate?: string,
    defaultAccountId?: string
  ) => void;
  closeTxModal: () => void;

  // Transaction Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Account Actions
  addAccount: (data: Omit<Account, 'id' | 'createdAt' | 'currentBalance'>) => Account;
  updateAccount: (id: string, data: Partial<Account>) => void;
  archiveAccount: (id: string) => void;

  // Category Actions
  addCategory: (data: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Budget Actions
  addBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => Budget;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Savings Goal Actions
  addGoal: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => SavingsGoal;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  contributeToGoal: (goalId: string, amount: number, accountId: string, note?: string) => void;
  deleteGoal: (id: string) => void;

  // Debt Actions
  addDebt: (data: Omit<DebtLoan, 'id' | 'createdAt'>) => DebtLoan;
  recordDebtPayment: (debtId: string, amount: number, accountId: string, note?: string) => void;
  updateDebt: (id: string, data: Partial<DebtLoan>) => void;
  deleteDebt: (id: string) => void;

  // Recurring Actions
  addRecurring: (data: Omit<RecurringPayment, 'id' | 'createdAt'>) => RecurringPayment;
  updateRecurring: (id: string, data: Partial<RecurringPayment>) => void;
  deleteRecurring: (id: string) => void;
  executeRecurringPayment: (id: string) => void;

  // Asset Actions
  addAsset: (data: Omit<Asset, 'id' | 'createdAt'>) => Asset;
  updateAsset: (id: string, data: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Dark Mode & Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Toast Notifications
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Global Management
  updateProfile: (data: Partial<UserProfile>) => void;
  updateTrackingMode: (mode: TrackingMode) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  restoreFromJson: (json: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    FinanceStorage.isSessionAuthenticated()
  );
  const [savedProfiles, setSavedProfiles] = useState<SavedProfileMeta[]>(() =>
    FinanceStorage.getSavedProfiles()
  );

  const [profile, setProfile] = useState<UserProfile>(() => FinanceStorage.getProfile());
  const [accounts, setAccounts] = useState<Account[]>(() => FinanceStorage.getAccounts());
  const [categories, setCategories] = useState<Category[]>(() => FinanceStorage.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => FinanceStorage.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => FinanceStorage.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => FinanceStorage.getGoals());
  const [debts, setDebts] = useState<DebtLoan[]>(() => FinanceStorage.getDebts());
  const [recurring, setRecurring] = useState<RecurringPayment[]>(() => FinanceStorage.getRecurring());
  const [assets, setAssets] = useState<Asset[]>(() => FinanceStorage.getAssets());

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [granularity, setGranularity] = useState<TimePeriodGranularity>('month');
  const [periodAnchor, setPeriodAnchorState] = useState<string>(() => getTodayLocalIso());
  const [selectedMonth, setSelectedMonthState] = useState<string>(() =>
    getTodayLocalIso().slice(0, 7)
  );

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const openInstallModal = () => setShowInstallModal(true);

  const setPeriodAnchor = (isoDate: string) => {
    setPeriodAnchorState(isoDate);
    if (isoDate.length >= 7) {
      setSelectedMonthState(isoDate.slice(0, 7));
    }
  };

  const setSelectedMonth = (month: string) => {
    setSelectedMonthState(month);
    setPeriodAnchorState(`${month}-01`);
  };

  const shiftPeriod = (delta: number) => {
    const next = shiftPeriodAnchor(periodAnchor, granularity, delta);
    setPeriodAnchor(next);
  };

  const resetPeriodToToday = () => {
    const today = getTodayLocalIso();
    setPeriodAnchor(today);
  };

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mymoney_dark_mode');
      if (saved !== null) return saved === 'true';
      return profile.darkMode ?? false;
    } catch {
      return false;
    }
  });

  // Sync dark class with document element
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('mymoney_dark_mode', String(darkMode));
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to apply full AppStateData into React state
  const applyAppState = (data: AppStateData) => {
    setProfile(data.profile);
    setAccounts(data.accounts);
    setCategories(data.categories);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setGoals(data.goals);
    setDebts(data.debts);
    setRecurring(data.recurring);
    setAssets(data.assets);
    setSavedProfiles(FinanceStorage.getSavedProfiles());
  };

  // Auth / Profile Creation Actions
  const createNewProfile = (input: CreateProfileInput) => {
    const data = FinanceStorage.createProfileAndStart(input);
    applyAppState(data);
    setIsAuthenticated(true);
    setShowOnboarding(false);
    setShowSplash(false);
    setCurrentTab('dashboard');
    addToast(`Welcome, ${data.profile.name}! Your personal dashboard is ready.`, 'success');
  };

  const loginToProfile = (profileId: string, pinAttempt?: string) => {
    const res = FinanceStorage.loginToProfile(profileId, pinAttempt);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    applyAppState(res.data);
    setIsAuthenticated(true);
    setShowOnboarding(false);
    setShowSplash(false);
    setCurrentTab('dashboard');
    addToast(`Signed in as ${res.data.profile.name}`, 'success');
    return { ok: true };
  };

  const openDemoProfile = () => {
    const data = FinanceStorage.createOrOpenDemoProfile();
    applyAppState(data);
    setIsAuthenticated(true);
    setShowOnboarding(false);
    setShowSplash(false);
    setCurrentTab('dashboard');
    addToast('Sample Demo Portfolio opened. You can delete sample data anytime.', 'info');
  };

  const logout = () => {
    FinanceStorage.logout();
    setIsAuthenticated(false);
    setSavedProfiles(FinanceStorage.getSavedProfiles());
    addToast('Signed out cleanly', 'info');
  };

  const deleteSavedProfile = (profileId: string) => {
    FinanceStorage.deleteProfile(profileId);
    const remaining = FinanceStorage.getSavedProfiles();
    setSavedProfiles(remaining);
    if (!FinanceStorage.isSessionAuthenticated()) {
      setIsAuthenticated(false);
    }
    addToast('Profile removed from this device', 'info');
  };

  // Quick action Transaction modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [txModalEditItem, setTxModalEditItem] = useState<Transaction | null>(null);
  const [txModalDefaultDate, setTxModalDefaultDate] = useState<string | null>(null);
  const [txModalDefaultAccountId, setTxModalDefaultAccountId] = useState<string | null>(null);

  // Auto-dismiss splash screen after 1.5 seconds on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Recalculate account balances whenever transactions or opening balances change
  const accountsWithComputedBalances = useMemo(() => {
    return accounts.map((acc) => ({
      ...acc,
      currentBalance: calculateAccountBalance(acc, transactions),
    }));
  }, [accounts, transactions]);

  // Compute live high-level summary (monthly & net worth)
  const summary = useMemo(() => {
    return computeFinancialSummary(
      accountsWithComputedBalances,
      transactions,
      assets,
      debts,
      selectedMonth
    );
  }, [accountsWithComputedBalances, transactions, assets, debts, selectedMonth]);

  // Compute Day/Week/Month/Year period summary
  const periodSummary = useMemo(() => {
    return computePeriodSummary(transactions, periodAnchor, granularity);
  }, [transactions, periodAnchor, granularity]);

  const openTxModal = (
    type: 'income' | 'expense' | 'transfer' = 'expense',
    item: Transaction | null = null,
    defaultDate?: string,
    defaultAccountId?: string
  ) => {
    setTxModalType(type);
    setTxModalEditItem(item);
    setTxModalDefaultDate(defaultDate || null);
    setTxModalDefaultAccountId(defaultAccountId || null);
    setIsTxModalOpen(true);
  };

  const closeTxModal = () => {
    setIsTxModalOpen(false);
    setTxModalEditItem(null);
    setTxModalDefaultDate(null);
    setTxModalDefaultAccountId(null);
  };

  // Transaction CRUD
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    FinanceStorage.setTransactions(updated);

    const typeLabel =
      data.type === 'income' ? 'Income' : data.type === 'expense' ? 'Expense' : 'Transfer';
    addToast(
      `${typeLabel} of ${formatCurrency(data.amount, profile.currency)} recorded successfully`,
      'success'
    );
    return newTx;
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
    setTransactions(updated);
    FinanceStorage.setTransactions(updated);
    addToast('Transaction updated successfully', 'success');
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    FinanceStorage.setTransactions(updated);
    addToast('Transaction deleted from ledger', 'info');
  };

  // Account CRUD
  const addAccount = (data: Omit<Account, 'id' | 'createdAt' | 'currentBalance'>): Account => {
    const newAcc: Account = {
      ...data,
      id: `acc-${Date.now()}`,
      currentBalance: data.openingBalance,
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    FinanceStorage.setAccounts(updated);
    return newAcc;
  };

  const updateAccount = (id: string, data: Partial<Account>) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...data } : a));
    setAccounts(updated);
    FinanceStorage.setAccounts(updated);
  };

  const archiveAccount = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    if (!target) return;
    if (!target.isArchived) {
      const activeCount = accounts.filter((a) => !a.isArchived).length;
      if (activeCount <= 1) {
        addToast('At least one active account must remain for recording transactions.', 'warning');
        return;
      }
    }
    const updated = accounts.map((a) => (a.id === id ? { ...a, isArchived: !a.isArchived } : a));
    setAccounts(updated);
    FinanceStorage.setAccounts(updated);
  };

  // Category CRUD
  const addCategory = (data: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...data,
      id: `cat-custom-${Date.now()}`,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    FinanceStorage.setCategories(updated);
    return newCat;
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setCategories(updated);
    FinanceStorage.setCategories(updated);

    if (data.name) {
      const nextTxs = transactions.map((t) =>
        t.categoryId === id ? { ...t, categoryName: data.name } : t
      );
      setTransactions(nextTxs);
      FinanceStorage.setTransactions(nextTxs);

      const nextBudgets = budgets.map((b) =>
        b.categoryId === id ? { ...b, categoryName: data.name as string } : b
      );
      setBudgets(nextBudgets);
      FinanceStorage.setBudgets(nextBudgets);
    }
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    FinanceStorage.setCategories(updated);

    const remainingBudgets = budgets.filter((b) => b.categoryId !== id);
    if (remainingBudgets.length !== budgets.length) {
      setBudgets(remainingBudgets);
      FinanceStorage.setBudgets(remainingBudgets);
    }
    addToast('Category removed', 'info');
  };

  // Budget CRUD
  const addBudget = (data: Omit<Budget, 'id' | 'createdAt'>): Budget => {
    const newBudget: Budget = {
      ...data,
      id: `budget-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    FinanceStorage.setBudgets(updated);
    return newBudget;
  };

  const updateBudget = (id: string, data: Partial<Budget>) => {
    const updated = budgets.map((b) => (b.id === id ? { ...b, ...data } : b));
    setBudgets(updated);
    FinanceStorage.setBudgets(updated);
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    FinanceStorage.setBudgets(updated);
  };

  // Savings Goals
  const addGoal = (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>): SavingsGoal => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    FinanceStorage.setGoals(updated);
    addToast(`Goal "${newGoal.title}" added!`, 'success');
    return newGoal;
  };

  const updateGoal = (id: string, data: Partial<SavingsGoal>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...data } : g));
    setGoals(updated);
    FinanceStorage.setGoals(updated);
  };

  const contributeToGoal = (goalId: string, amount: number, accountId: string, note?: string) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newSaved = targetGoal.currentAmount + amount;
    const isCompleted = newSaved >= targetGoal.targetAmount;
    updateGoal(goalId, { currentAmount: newSaved, isCompleted });

    if (isCompleted) {
      triggerGoalCelebration();
      addToast(`🎉 Milestone reached! "${targetGoal.title}" is fully funded!`, 'success');
    } else {
      addToast(
        `Added ${formatCurrency(amount, profile.currency)} to "${targetGoal.title}"`,
        'success'
      );
    }

    if (accountId) {
      addTransaction({
        type: 'transfer',
        amount,
        categoryId: '',
        categoryName: 'Savings Goal Allocation',
        fromAccountId: accountId,
        toAccountId: targetGoal.linkedAccountId || accountId,
        date: getTodayLocalIso(),
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'net_banking',
        description: `Goal Contribution: ${targetGoal.title}`,
        notes: note || `Contribution to ${targetGoal.title}`,
      });
    }
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    FinanceStorage.setGoals(updated);
  };

  // Debt & Loan
  const addDebt = (data: Omit<DebtLoan, 'id' | 'createdAt'>): DebtLoan => {
    const newDebt: DebtLoan = {
      ...data,
      id: `debt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...debts, newDebt];
    setDebts(updated);
    FinanceStorage.setDebts(updated);
    return newDebt;
  };

  const recordDebtPayment = (debtId: string, amount: number, accountId: string, note?: string) => {
    const d = debts.find((item) => item.id === debtId);
    if (!d) return;

    const newOutstanding = Math.max(0, d.outstandingBalance - amount);
    const isSettled = newOutstanding === 0;
    updateDebt(debtId, { outstandingBalance: newOutstanding, isSettled });

    if (d.type === 'borrowed') {
      addTransaction({
        type: 'expense',
        amount,
        categoryId: 'cat-exp-1',
        categoryName: 'Debt Repayment',
        fromAccountId: accountId,
        date: getTodayLocalIso(),
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'net_banking',
        description: `Loan Repayment: ${d.counterparty}`,
        notes: note || `Principal/EMI payment for ${d.counterparty}`,
      });
    } else {
      addTransaction({
        type: 'income',
        amount,
        categoryId: 'cat-inc-5',
        categoryName: 'Debt Recovery',
        fromAccountId: accountId,
        date: getTodayLocalIso(),
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: 'net_banking',
        description: `Lent Money Repayment received from ${d.counterparty}`,
        notes: note || `Partial or full recovery from ${d.counterparty}`,
      });
    }
  };

  const updateDebt = (id: string, data: Partial<DebtLoan>) => {
    const updated = debts.map((d) => (d.id === id ? { ...d, ...data } : d));
    setDebts(updated);
    FinanceStorage.setDebts(updated);
  };

  const deleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    FinanceStorage.setDebts(updated);
  };

  // Recurring Payments
  const addRecurring = (data: Omit<RecurringPayment, 'id' | 'createdAt'>): RecurringPayment => {
    const newRec: RecurringPayment = {
      ...data,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...recurring, newRec];
    setRecurring(updated);
    FinanceStorage.setRecurring(updated);
    return newRec;
  };

  const updateRecurring = (id: string, data: Partial<RecurringPayment>) => {
    const updated = recurring.map((r) => (r.id === id ? { ...r, ...data } : r));
    setRecurring(updated);
    FinanceStorage.setRecurring(updated);
  };

  const deleteRecurring = (id: string) => {
    const updated = recurring.filter((r) => r.id !== id);
    setRecurring(updated);
    FinanceStorage.setRecurring(updated);
  };

  const executeRecurringPayment = (id: string) => {
    const rec = recurring.find((r) => r.id === id);
    if (!rec) return;

    addTransaction({
      type: rec.type,
      amount: rec.amount,
      categoryId: rec.categoryId,
      fromAccountId: rec.accountId,
      date: getTodayLocalIso(),
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'net_banking',
      description: `Recurring: ${rec.title}`,
      notes: rec.notes || 'Auto-executed recurring payment',
      isRecurring: true,
      recurringRuleId: rec.id,
    });

    const currentDue = parseLocalIsoDate(rec.nextDueDate);
    if (rec.frequency === 'monthly') {
      currentDue.setMonth(currentDue.getMonth() + 1);
    } else if (rec.frequency === 'weekly') {
      currentDue.setDate(currentDue.getDate() + 7);
    } else if (rec.frequency === 'yearly') {
      currentDue.setFullYear(currentDue.getFullYear() + 1);
    } else {
      currentDue.setDate(currentDue.getDate() + 1);
    }
    const nextDateStr = toLocalIsoDate(currentDue);
    updateRecurring(id, { nextDueDate: nextDateStr });
  };

  // Assets
  const addAsset = (data: Omit<Asset, 'id' | 'createdAt'>): Asset => {
    const newAsset: Asset = {
      ...data,
      id: `ast-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...assets, newAsset];
    setAssets(updated);
    FinanceStorage.setAssets(updated);
    return newAsset;
  };

  const updateAsset = (id: string, data: Partial<Asset>) => {
    const updated = assets.map((a) => (a.id === id ? { ...a, ...data } : a));
    setAssets(updated);
    FinanceStorage.setAssets(updated);
  };

  const deleteAsset = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    setAssets(updated);
    FinanceStorage.setAssets(updated);
  };

  // User Profile (functional updater prevents stale closure overwrites)
  const updateProfile = (data: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated: UserProfile = { ...prev, ...data };
      FinanceStorage.setProfile(updated);
      setSavedProfiles(FinanceStorage.getSavedProfiles());
      return updated;
    });
    if (
      data.trackingMode === 'simple' &&
      !['dashboard', 'transactions', 'goals', 'budgets', 'analytics', 'categories', 'reports', 'settings'].includes(
        currentTab
      )
    ) {
      setCurrentTab('dashboard');
    }
  };

  const updateTrackingMode = (mode: TrackingMode) => {
    updateProfile({ trackingMode: mode });
    addToast(
      mode === 'simple'
        ? 'Switched to Simple Expense Tracker mode'
        : 'Switched to Full Wealth Manager mode',
      'info'
    );
  };

  // System Resets & Imports
  const resetToSampleData = () => {
    const data = FinanceStorage.resetToSampleData();
    applyAppState(data);
    addToast('Sample demo portfolio loaded', 'info');
  };

  const clearAllData = () => {
    const data = FinanceStorage.clearAllData();
    applyAppState(data);
    addToast('All sample & demo data deleted! Fresh ledger ready for your profile.', 'success');
  };

  const restoreFromJson = (jsonString: string): boolean => {
    try {
      const data = FinanceStorage.importBackupJson(jsonString);
      applyAppState(data);
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        isAuthenticated,
        savedProfiles,
        createNewProfile,
        loginToProfile,
        openDemoProfile,
        logout,
        deleteSavedProfile,
        profile,
        accounts: accountsWithComputedBalances,
        categories,
        transactions,
        budgets,
        goals,
        debts,
        recurring,
        assets,
        currentTab,
        setCurrentTab,
        selectedMonth,
        setSelectedMonth,
        granularity,
        setGranularity,
        periodAnchor,
        setPeriodAnchor,
        shiftPeriod,
        resetPeriodToToday,
        periodSummary,
        summary,
        showSplash,
        setShowSplash,
        showOnboarding,
        setShowOnboarding,
        showInstallModal,
        setShowInstallModal,
        openInstallModal,
        isTxModalOpen,
        txModalType,
        txModalEditItem,
        txModalDefaultDate,
        txModalDefaultAccountId,
        openTxModal,
        closeTxModal,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        archiveAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        contributeToGoal,
        deleteGoal,
        addDebt,
        recordDebtPayment,
        updateDebt,
        deleteDebt,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        executeRecurringPayment,
        addAsset,
        updateAsset,
        deleteAsset,
        darkMode,
        toggleDarkMode,
        toasts,
        addToast,
        dismissToast,
        updateProfile,
        updateTrackingMode,
        resetToSampleData,
        clearAllData,
        restoreFromJson,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
