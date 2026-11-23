import { Account, Asset, Budget, Category, DebtLoan, RecurringPayment, SavingsGoal, Transaction, UserProfile } from '../types/finance';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@fintech.dev',
  currency: 'INR',
  currencySymbol: '₹',
  monthlySavingsTarget: 6000000, // ₹60,000 in minor units
  dateFormat: 'DD/MM/YYYY',
  hasCompletedOnboarding: true,
  theme: 'emerald',
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'HDFC Salary Account',
    type: 'bank',
    openingBalance: 12500000, // ₹1,25,000
    currentBalance: 12500000,
    currency: 'INR',
    accountNumberMasked: '•••• 4821',
    institution: 'HDFC Bank',
    color: '#047857', // Emerald 700
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-2',
    name: 'ICICI Wealth Savings',
    type: 'savings',
    openingBalance: 32000000, // ₹3,20,000
    currentBalance: 32000000,
    currency: 'INR',
    accountNumberMasked: '•••• 9104',
    institution: 'ICICI Bank',
    color: '#059669', // Emerald 600
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-3',
    name: 'Paytm UPI Wallet',
    type: 'wallet',
    openingBalance: 650000, // ₹6,500
    currentBalance: 650000,
    currency: 'INR',
    accountNumberMasked: 'UPI: 98765@paytm',
    institution: 'Paytm Payments Bank',
    color: '#0d9488', // Teal 600
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-4',
    name: 'Cash In Hand',
    type: 'cash',
    openingBalance: 1800000, // ₹18,000
    currentBalance: 1800000,
    currency: 'INR',
    institution: 'Physical Vault',
    color: '#15803d', // Green 700
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-5',
    name: 'Amazon Pay ICICI Card',
    type: 'credit_card',
    openingBalance: -1250000, // ₹12,500 current bill
    currentBalance: -1250000,
    currency: 'INR',
    accountNumberMasked: '•••• 3099',
    institution: 'ICICI Cards',
    creditLimit: 30000000, // ₹3,00,000 limit
    color: '#064e3b', // Deep Emerald 900
    createdAt: '2026-01-01',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'cat-inc-1', name: 'Tech Salary', type: 'income', icon: 'Briefcase', color: '#059669', isDefault: true },
  { id: 'cat-inc-2', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#10b981', isDefault: true },
  { id: 'cat-inc-3', name: 'Dividends & Capital Gains', type: 'income', icon: 'TrendingUp', color: '#047857', isDefault: true },
  { id: 'cat-inc-4', name: 'Rental Yield', type: 'income', icon: 'Home', color: '#0d9488', isDefault: true },
  { id: 'cat-inc-5', name: 'Cashback & Rewards', type: 'income', icon: 'Gift', color: '#14b8a6', isDefault: true },

  // Expense Categories
  { id: 'cat-exp-1', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#047857', isDefault: true },
  { id: 'cat-exp-2', name: 'Food & Groceries', type: 'expense', icon: 'ShoppingBag', color: '#059669', isDefault: true },
  { id: 'cat-exp-3', name: 'Dining & Cafes', type: 'expense', icon: 'Utensils', color: '#10b981', isDefault: true },
  { id: 'cat-exp-4', name: 'Transportation & Fuel', type: 'expense', icon: 'Car', color: '#0284c7', isDefault: true },
  { id: 'cat-exp-5', name: 'Utilities & WiFi', type: 'expense', icon: 'Zap', color: '#d97706', isDefault: true },
  { id: 'cat-exp-6', name: 'Shopping & Gadgets', type: 'expense', icon: 'Package', color: '#7c3aed', isDefault: true },
  { id: 'cat-exp-7', name: 'Healthcare & Fitness', type: 'expense', icon: 'HeartPulse', color: '#e11d48', isDefault: true },
  { id: 'cat-exp-8', name: 'Entertainment & OTT', type: 'expense', icon: 'Film', color: '#6366f1', isDefault: true },
  { id: 'cat-exp-9', name: 'Education & Books', type: 'expense', icon: 'GraduationCap', color: '#0891b2', isDefault: true },
  { id: 'cat-exp-10', name: 'Travel & Vacations', type: 'expense', icon: 'Plane', color: '#f59e0b', isDefault: true },
  { id: 'cat-exp-11', name: 'Personal Care', type: 'expense', icon: 'Sparkles', color: '#ec4899', isDefault: true },
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const prevYear = prevMonthDate.getFullYear();
const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Current Month Income
  {
    id: 'tx-101',
    type: 'income',
    amount: 18500000, // ₹1,85,000
    categoryId: 'cat-inc-1',
    categoryName: 'Tech Salary',
    fromAccountId: 'acc-1',
    date: `${currentYear}-${currentMonth}-01`,
    time: '10:00',
    paymentMethod: 'net_banking',
    description: 'Monthly Senior Engineer Salary Credit',
    notes: 'Direct company payroll deposit',
    createdAt: `${currentYear}-${currentMonth}-01T10:00:00Z`,
  },
  {
    id: 'tx-102',
    type: 'income',
    amount: 4500000, // ₹45,000
    categoryId: 'cat-inc-2',
    categoryName: 'Freelance & Consulting',
    fromAccountId: 'acc-2',
    date: `${currentYear}-${currentMonth}-03`,
    time: '14:30',
    paymentMethod: 'net_banking',
    description: 'UI/UX Architecture Consulting Milestone 2',
    notes: 'Client invoice paid in full',
    createdAt: `${currentYear}-${currentMonth}-03T14:30:00Z`,
  },

  // Current Month Expenses
  {
    id: 'tx-201',
    type: 'expense',
    amount: 3200000, // ₹32,000
    categoryId: 'cat-exp-1',
    categoryName: 'Housing & Rent',
    fromAccountId: 'acc-1',
    date: `${currentYear}-${currentMonth}-02`,
    time: '09:15',
    paymentMethod: 'net_banking',
    description: 'Apartment Monthly Rent to Landlord',
    notes: 'Transferred via IMPS with ref 99420',
    createdAt: `${currentYear}-${currentMonth}-02T09:15:00Z`,
  },
  {
    id: 'tx-202',
    type: 'expense',
    amount: 680000, // ₹6,800
    categoryId: 'cat-exp-2',
    categoryName: 'Food & Groceries',
    fromAccountId: 'acc-5',
    date: `${currentYear}-${currentMonth}-03`,
    time: '18:40',
    paymentMethod: 'card',
    description: 'Nature Basket Organic Groceries & Pantry',
    notes: 'Paid using ICICI Credit Card',
    createdAt: `${currentYear}-${currentMonth}-03T18:40:00Z`,
  },
  {
    id: 'tx-203',
    type: 'expense',
    amount: 245000, // ₹2,450
    categoryId: 'cat-exp-3',
    categoryName: 'Dining & Cafes',
    fromAccountId: 'acc-3',
    date: `${currentYear}-${currentMonth}-04`,
    time: '20:30',
    paymentMethod: 'upi',
    description: 'Bistro Weekend Dinner with Friends',
    notes: 'Scan & Pay via Paytm UPI',
    createdAt: `${currentYear}-${currentMonth}-04T20:30:00Z`,
  },
  {
    id: 'tx-204',
    type: 'expense',
    amount: 149900, // ₹1,499
    categoryId: 'cat-exp-5',
    categoryName: 'Utilities & WiFi',
    fromAccountId: 'acc-3',
    date: `${currentYear}-${currentMonth}-05`,
    time: '11:20',
    paymentMethod: 'upi',
    description: 'Airtel Xstream 300Mbps High Speed Fiber',
    notes: 'Monthly recurring broadband bill',
    createdAt: `${currentYear}-${currentMonth}-05T11:20:00Z`,
  },
  {
    id: 'tx-205',
    type: 'expense',
    amount: 320000, // ₹3,200
    categoryId: 'cat-exp-4',
    categoryName: 'Transportation & Fuel',
    fromAccountId: 'acc-5',
    date: `${currentYear}-${currentMonth}-05`,
    time: '16:00',
    paymentMethod: 'card',
    description: 'HPCL Petrol Pump Tank Refill',
    notes: 'Credit card rewards point applied',
    createdAt: `${currentYear}-${currentMonth}-05T16:00:00Z`,
  },
  {
    id: 'tx-206',
    type: 'expense',
    amount: 84900, // ₹849
    categoryId: 'cat-exp-8',
    categoryName: 'Entertainment & OTT',
    fromAccountId: 'acc-5',
    date: `${currentYear}-${currentMonth}-06`,
    time: '12:00',
    paymentMethod: 'card',
    description: 'Netflix Premium 4K Family Subscription',
    createdAt: `${currentYear}-${currentMonth}-06T12:00:00Z`,
  },

  // Internal Transfer
  {
    id: 'tx-301',
    type: 'transfer',
    amount: 2500000, // ₹25,000
    categoryId: '',
    fromAccountId: 'acc-1', // HDFC Bank
    toAccountId: 'acc-2', // ICICI Wealth Savings
    date: `${currentYear}-${currentMonth}-02`,
    time: '10:30',
    paymentMethod: 'net_banking',
    description: 'Monthly Automated Savings Allocation',
    notes: 'Internal transfer to high yield savings vault',
    createdAt: `${currentYear}-${currentMonth}-02T10:30:00Z`,
  },

  // Previous month entries for rich comparison charts
  {
    id: 'tx-prev-1',
    type: 'income',
    amount: 18500000,
    categoryId: 'cat-inc-1',
    categoryName: 'Tech Salary',
    fromAccountId: 'acc-1',
    date: `${prevYear}-${prevMonth}-01`,
    time: '10:00',
    paymentMethod: 'net_banking',
    description: 'Previous Month Tech Salary',
    createdAt: `${prevYear}-${prevMonth}-01T10:00:00Z`,
  },
  {
    id: 'tx-prev-2',
    type: 'expense',
    amount: 3200000,
    categoryId: 'cat-exp-1',
    categoryName: 'Housing & Rent',
    fromAccountId: 'acc-1',
    date: `${prevYear}-${prevMonth}-02`,
    time: '09:00',
    paymentMethod: 'net_banking',
    description: 'Apartment Rent',
    createdAt: `${prevYear}-${prevMonth}-02T09:00:00Z`,
  },
  {
    id: 'tx-prev-3',
    type: 'expense',
    amount: 1850000,
    categoryId: 'cat-exp-2',
    categoryName: 'Food & Groceries',
    fromAccountId: 'acc-5',
    date: `${prevYear}-${prevMonth}-15`,
    time: '19:15',
    paymentMethod: 'card',
    description: 'Groceries Supermarket',
    createdAt: `${prevYear}-${prevMonth}-15T19:15:00Z`,
  },
  {
    id: 'tx-prev-4',
    type: 'expense',
    amount: 890000,
    categoryId: 'cat-exp-6',
    categoryName: 'Shopping & Gadgets',
    fromAccountId: 'acc-5',
    date: `${prevYear}-${prevMonth}-20`,
    time: '15:45',
    paymentMethod: 'card',
    description: 'Ergonomic Desk Accessories',
    createdAt: `${prevYear}-${prevMonth}-20T15:45:00Z`,
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    categoryId: 'cat-exp-1',
    categoryName: 'Housing & Rent',
    amount: 3500000, // ₹35,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.9,
    createdAt: '2026-01-01',
  },
  {
    id: 'b-2',
    categoryId: 'cat-exp-2',
    categoryName: 'Food & Groceries',
    amount: 2000000, // ₹20,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.8,
    createdAt: '2026-01-01',
  },
  {
    id: 'b-3',
    categoryId: 'cat-exp-3',
    categoryName: 'Dining & Cafes',
    amount: 800000, // ₹8,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.75,
    createdAt: '2026-01-01',
  },
  {
    id: 'b-4',
    categoryId: 'cat-exp-4',
    categoryName: 'Transportation & Fuel',
    amount: 800000, // ₹8,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.8,
    createdAt: '2026-01-01',
  },
  {
    id: 'b-5',
    categoryId: 'cat-exp-5',
    categoryName: 'Utilities & WiFi',
    amount: 500000, // ₹5,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.8,
    createdAt: '2026-01-01',
  },
  {
    id: 'b-6',
    categoryId: 'cat-exp-6',
    categoryName: 'Shopping & Gadgets',
    amount: 1500000, // ₹15,000
    month: `${currentYear}-${currentMonth}`,
    alertThreshold: 0.8,
    createdAt: '2026-01-01',
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency 6-Month Vault',
    targetAmount: 60000000, // ₹6,00,000
    currentAmount: 43500000, // ₹4,35,000
    targetDate: `${currentYear}-12-31`,
    category: 'Safety Net',
    icon: 'ShieldCheck',
    color: '#059669',
    linkedAccountId: 'acc-2',
    notes: 'Keep in liquid high-interest ICICI savings account',
    isCompleted: false,
    createdAt: '2026-01-01',
  },
  {
    id: 'goal-2',
    title: 'Autumn Vacation in Japan',
    targetAmount: 35000000, // ₹3,50,000
    currentAmount: 21000000, // ₹2,10,000
    targetDate: `${currentYear}-10-15`,
    category: 'Travel',
    icon: 'Plane',
    color: '#0284c7',
    linkedAccountId: 'acc-2',
    notes: 'Flights, JR pass, and Tokyo/Kyoto stay',
    isCompleted: false,
    createdAt: '2026-01-10',
  },
  {
    id: 'goal-3',
    title: 'New EV SUV Downpayment',
    targetAmount: 50000000, // ₹5,00,000
    currentAmount: 31000000, // ₹3,10,000
    targetDate: `${currentYear + 1}-03-31`,
    category: 'Vehicle',
    icon: 'Car',
    color: '#7c3aed',
    linkedAccountId: 'acc-2',
    notes: 'Tata Curvv EV or Nexon EV long-range downpayment',
    isCompleted: false,
    createdAt: '2026-02-01',
  },
];

export const INITIAL_DEBTS: DebtLoan[] = [
  {
    id: 'debt-1',
    type: 'borrowed',
    counterparty: 'SBI Home Finance',
    principalAmount: 350000000, // ₹35,00,000 original
    outstandingBalance: 245000000, // ₹24,50,000 current
    interestRate: 8.5,
    dueDate: `${currentYear}-${currentMonth}-10`,
    emiAmount: 2850000, // ₹28,500 monthly EMI
    notes: 'Apartment housing loan, 20-year term',
    isSettled: false,
    createdAt: '2024-05-15',
  },
  {
    id: 'debt-2',
    type: 'lent',
    counterparty: 'Rohan Verma (Colleague)',
    principalAmount: 5000000, // ₹50,000
    outstandingBalance: 3000000, // ₹30,000 remaining
    interestRate: 0,
    dueDate: `${currentYear}-${currentMonth}-25`,
    notes: 'Emergency medical loan to friend, partial payment received',
    isSettled: false,
    createdAt: '2026-01-20',
  },
];

export const INITIAL_RECURRING: RecurringPayment[] = [
  {
    id: 'rec-1',
    title: 'Apartment Monthly Rent',
    type: 'expense',
    amount: 3200000, // ₹32,000
    categoryId: 'cat-exp-1',
    accountId: 'acc-1',
    frequency: 'monthly',
    nextDueDate: `${currentYear}-${currentMonth}-01`,
    autoRemind: true,
    status: 'active',
    notes: 'Due on 1st of every month to landlord',
    createdAt: '2026-01-01',
  },
  {
    id: 'rec-2',
    title: 'Airtel Xstream Fiber Broadband',
    type: 'expense',
    amount: 149900, // ₹1,499
    categoryId: 'cat-exp-5',
    accountId: 'acc-3',
    frequency: 'monthly',
    nextDueDate: `${currentYear}-${currentMonth}-10`,
    autoRemind: true,
    status: 'active',
    notes: 'Fiber net + OTT bundle',
    createdAt: '2026-01-01',
  },
  {
    id: 'rec-3',
    title: 'SBI Home Loan EMI',
    type: 'expense',
    amount: 2850000, // ₹28,500
    categoryId: 'cat-exp-1',
    accountId: 'acc-1',
    frequency: 'monthly',
    nextDueDate: `${currentYear}-${currentMonth}-10`,
    autoRemind: true,
    status: 'active',
    notes: 'Auto-debited from HDFC account',
    createdAt: '2026-01-01',
  },
  {
    id: 'rec-4',
    title: 'Netflix & Spotify Family',
    type: 'expense',
    amount: 114800, // ₹1,148
    categoryId: 'cat-exp-8',
    accountId: 'acc-5',
    frequency: 'monthly',
    nextDueDate: `${currentYear}-${currentMonth}-22`,
    autoRemind: true,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'rec-5',
    title: 'Monthly Tech Salary',
    type: 'income',
    amount: 18500000, // ₹1,85,000
    categoryId: 'cat-inc-1',
    accountId: 'acc-1',
    frequency: 'monthly',
    nextDueDate: `${currentYear}-${currentMonth}-30`,
    autoRemind: true,
    status: 'active',
    notes: 'Monthly corporate salary credit',
    createdAt: '2026-01-01',
  },
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-1',
    name: '2BHK Luxury Apartment, Green Glen',
    category: 'real_estate',
    purchaseValue: 650000000, // ₹65,00,000
    currentValue: 840000000, // ₹84,00,000
    purchaseDate: '2023-04-10',
    notes: 'Primary residential property in IT corridor',
    createdAt: '2023-04-10',
  },
  {
    id: 'ast-2',
    name: 'Nifty 50 Index & Large Cap Mutual Funds',
    category: 'mutual_funds',
    purchaseValue: 120000000, // ₹12,00,000
    currentValue: 168000000, // ₹16,80,000
    purchaseDate: '2024-01-15',
    notes: 'Systematic monthly SIP investment',
    createdAt: '2024-01-15',
  },
  {
    id: 'ast-3',
    name: 'Sovereign Gold Bonds (RBI Tranche IV)',
    category: 'gold',
    purchaseValue: 40000000, // ₹4,00,000
    currentValue: 58000000, // ₹5,80,000
    purchaseDate: '2023-09-20',
    notes: '2.5% semi-annual coupon + gold appreciation',
    createdAt: '2023-09-20',
  },
  {
    id: 'ast-4',
    name: 'HDFC High-Interest Cumulative FD',
    category: 'fixed_deposit',
    purchaseValue: 50000000, // ₹5,00,000
    currentValue: 53800000, // ₹5,38,000
    purchaseDate: '2025-06-01',
    notes: '7.4% compounding annual interest',
    createdAt: '2025-06-01',
  },
];
