import React from 'react';
import { Plus, Wallet, SlidersHorizontal, Sun, Moon, Smartphone, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance, NavigationTab } from '../../context/FinanceContext';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    openTxModal,
    selectedMonth,
    setSelectedMonth,
    darkMode,
    toggleDarkMode,
    openInstallModal,
    profile,
    logout,
  } = useFinance();

  // Generate recent 6 months for quick switching
  const monthOptions = React.useMemo(() => {
    const list: { label: string; value: string }[] = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      list.push({ label, value: val });
    }
    return list;
  }, []);

  const isSimpleMode = profile.trackingMode === 'simple';

  const navLinks: { label: string; tab: NavigationTab }[] = isSimpleMode
    ? [
        { label: 'Dashboard', tab: 'dashboard' },
        { label: 'Transactions', tab: 'transactions' },
        { label: 'Goals', tab: 'goals' },
        { label: 'Budgets', tab: 'budgets' },
        { label: 'Analytics', tab: 'analytics' },
      ]
    : [
        { label: 'Dashboard', tab: 'dashboard' },
        { label: 'Transactions', tab: 'transactions' },
        { label: 'Accounts', tab: 'accounts' },
        { label: 'Budgets', tab: 'budgets' },
        { label: 'Analytics', tab: 'analytics' },
      ];

  return (
    <header className="no-print sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-800/20 group-hover:scale-105 transition-transform duration-200">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            My<span className="text-emerald-700 dark:text-emerald-400">Money</span>
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links with animated layout underline */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setCurrentTab(item.tab)}
                className={`relative whitespace-nowrap py-1 transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Period Selector & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Active Period Dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select financial period"
              className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer appearance-none transition-colors"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 dark:text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Install Mobile App / APK Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={openInstallModal}
            title="Install Mobile App / Android APK"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Install App</span>
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-200" />
            )}
          </motion.button>

          {/* Quick Settings Icon */}
          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            title="Application Settings"
            aria-label="Settings"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Switch Profile / Log Out */}
          <button
            type="button"
            onClick={logout}
            title="Log Out / Switch Profile"
            aria-label="Log Out"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => openTxModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Transaction</span>
            <span className="xs:hidden">Add</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
