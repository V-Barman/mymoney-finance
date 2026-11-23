import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  Target,
  HandCoins,
  Repeat,
  Calendar,
  Gem,
  Tag,
  FileSpreadsheet,
  Settings,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance, NavigationTab } from '../../context/FinanceContext';
import { AnimatedCounter } from './AnimatedCounter';

interface NavItem {
  tab: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, summary, profile, openInstallModal, logout } = useFinance();

  const isSimpleMode = profile.trackingMode === 'simple';

  const allMainNavItems: NavItem[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'transactions', label: 'Transactions', icon: Receipt },
    { tab: 'accounts', label: 'Accounts', icon: CreditCard },
    { tab: 'budgets', label: 'Budgets', icon: PieChart },
    { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
    { tab: 'goals', label: 'Savings Goals', icon: Target },
    { tab: 'debts', label: 'Debts & Loans', icon: HandCoins },
    { tab: 'recurring', label: 'Recurring & Bills', icon: Repeat },
    { tab: 'calendar', label: 'Financial Calendar', icon: Calendar },
    { tab: 'assets', label: 'Assets & Wealth', icon: Gem },
  ];

  const mainNavItems = isSimpleMode
    ? allMainNavItems.filter((item) =>
        ['dashboard', 'transactions', 'budgets', 'analytics', 'goals'].includes(item.tab)
      )
    : allMainNavItems;

  const secondaryNavItems: NavItem[] = [
    { tab: 'categories', label: 'Categories', icon: Tag },
    { tab: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="no-print hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 shrink-0 min-h-[calc(100vh-61px)] transition-colors">
      {/* Navigation Groups */}
      <div className="space-y-6 flex-1">
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Modules
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setCurrentTab(item.tab)}
                  className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="relative z-10 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Management & Tools
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setCurrentTab(item.tab)}
                  className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill-sec"
                      className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="relative z-10 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Install Android App / APK Banner */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={openInstallModal}
        className="mt-4 w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition-colors cursor-pointer text-left shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold">Install Android App</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">APK & Home Screen</div>
          </div>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      </motion.button>

      {/* Mini Wealth Snapshot Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-lg shadow-emerald-950/20"
      >
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span className="font-medium">Total Net Worth</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </div>
        <div className="text-xl font-bold tracking-tight mt-1 text-white">
          <AnimatedCounter
            value={summary.totalNetWorth}
            currencyCode={profile.currency}
            options={{ compact: true }}
          />
        </div>
        <div className="mt-2 pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[11px] text-emerald-200/90">
          <span>Savings Rate</span>
          <span className="font-mono tabular-nums font-semibold text-emerald-300">
            {summary.savingsRate}%
          </span>
        </div>
      </motion.div>

      {/* User Mini Bar with Switch / Logout */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="truncate flex-1">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {profile.name}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Log Out / Switch Profile"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
