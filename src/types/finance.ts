export type TransactionType = 'income' | 'expense' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'wallet' | 'savings' | 'credit_card';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'net_banking' | 'cheque' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number; // in minor units (e.g. cents/paise)
  currentBalance: number; // calculated in minor units
  currency: string;
  accountNumberMasked?: string;
  institution?: string;
  creditLimit?: number; // for credit cards (minor units)
  color: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in minor units (e.g. paise / cents)
  categoryId: string;
  categoryName?: string;
  fromAccountId: string; // Used for expense, transfer source, or income destination
  toAccountId?: string; // Used strictly for transfer destination
  date: string; // ISO string YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringRuleId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName?: string;
  amount: number; // monthly limit in minor units
  month: string; // YYYY-MM
  alertThreshold: number; // default 0.8 (80%)
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number; // in minor units
  currentAmount: number; // in minor units
  targetDate: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
  linkedAccountId?: string;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number; // minor units
  date: string;
  fromAccountId: string;
  note?: string;
}

export type DebtType = 'borrowed' | 'lent'; // borrowed = liability (owe), lent = asset (owed to user)

export interface DebtLoan {
  id: string;
  type: DebtType;
  counterparty: string; // Person / Bank name
  principalAmount: number; // minor units
  outstandingBalance: number; // minor units
  interestRate: number; // e.g. 10.5 (%)
  dueDate: string; // YYYY-MM-DD
  emiAmount?: number; // minor units
  notes?: string;
  isSettled: boolean;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number; // minor units
  date: string;
  accountId: string;
  note?: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringPayment {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number; // minor units
  categoryId: string;
  accountId: string;
  frequency: RecurringFrequency;
  nextDueDate: string; // YYYY-MM-DD
  autoRemind: boolean;
  status: 'active' | 'paused';
  notes?: string;
  createdAt: string;
}

export type AssetCategory = 'real_estate' | 'stocks' | 'mutual_funds' | 'gold' | 'vehicle' | 'fixed_deposit' | 'crypto' | 'other';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  purchaseValue: number; // minor units
  currentValue: number; // minor units
  purchaseDate: string;
  notes?: string;
  createdAt: string;
}

export type TrackingMode = 'simple' | 'full';

export type TimePeriodGranularity = 'day' | 'week' | 'month' | 'year';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  pin?: string;
  currency: string; // e.g., 'INR', 'USD', 'EUR', 'GBP'
  currencySymbol: string; // e.g., '₹', '$', '€', '£'
  monthlySavingsTarget: number; // minor units
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  hasCompletedOnboarding: boolean;
  trackingMode?: TrackingMode;
  isSampleData?: boolean;
  theme: 'emerald';
  darkMode?: boolean;
  createdAt?: string;
}

export interface SavedProfileMeta {
  id: string;
  name: string;
  email: string;
  hasPin: boolean;
  currency: string;
  currencySymbol: string;
  trackingMode: TrackingMode;
  isSampleData?: boolean;
  createdAt: string;
  lastLoginAt: string;
}

