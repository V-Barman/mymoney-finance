import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  CreditCard,
  Menu,
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
  X,
  Smartphone,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance, NavigationTab } from '../../context/FinanceContext';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab, openTxModal, openInstallModal, profile, logout } = useFinance();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isSimpleMode = profile.trackingMode === 'simple';

  const allMoreItems: { tab: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'budgets', label: 'Budgets', icon: PieChart },
    { tab: 'analytics', label: 'Financial Analytics', icon: BarChart3 },
    { tab: 'goals', label: 'Savings Goals', icon: Target },
    { tab: 'debts', label: 'Debts & Loans', icon: HandCoins },
    { tab: 'recurring', label: 'Recurring Bills', icon: Repeat },
    { tab: 'calendar', label: 'Financial Calendar', icon: Calendar },
    { tab: 'assets', label: 'Assets & Wealth', icon: Gem },
    { tab: 'categories', label: 'Categories', icon: Tag },
    { tab: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { tab: 'settings', label: 'App Settings', icon: Settings },
  ];

  const moreItems = isSimpleMode
    ? allMoreItems.filter((i) =>
        ['budgets', 'analytics', 'goals', 'categories', 'reports', 'settings'].includes(i.tab)
      )
    : allMoreItems;

  return (
    <>
      {/* Fixed Bottom Tab Bar */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1 safe-bottom shadow-lg transition-colors">
        <div className="grid grid-cols-5 items-center justify-around h-15">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`relative min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentTab === 'dashboard'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentTab === 'dashboard' && (
              <motion.span
                layoutId="mobile-nav-indicator"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute top-0 w-7 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
              />
            )}
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>

          {/* 2. Transactions */}
          <button
            type="button"
            onClick={() => setCurrentTab('transactions')}
            className={`relative min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentTab === 'transactions'
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentTab === 'transactions' && (
              <motion.span
                layoutId="mobile-nav-indicator"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute top-0 w-7 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
              />
            )}
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Activity</span>
          </button>

          {/* 3. Central Quick Action Button with tactile press */}
          <div className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              type="button"
              onClick={() => openTxModal('expense')}
              className="w-12 h-12 -mt-3 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/35 transition-colors border-2 border-white dark:border-slate-900"
              aria-label="Add transaction"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>

          {/* 4. Goals (Simple) or Accounts (Full) */}
          <button
            type="button"
            onClick={() => setCurrentTab(isSimpleMode ? 'goals' : 'accounts')}
            className={`relative min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentTab === (isSimpleMode ? 'goals' : 'accounts')
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentTab === (isSimpleMode ? 'goals' : 'accounts') && (
              <motion.span
                layoutId="mobile-nav-indicator"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute top-0 w-7 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
              />
            )}
            {isSimpleMode ? <Target className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            <span className="text-[10px] mt-1 tracking-tight">{isSimpleMode ? 'Goals' : 'Accounts'}</span>
          </button>

          {/* 5. More Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`relative min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              isMoreOpen || !['dashboard', 'transactions', 'accounts', 'goals'].includes(currentTab)
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {(isMoreOpen || !['dashboard', 'transactions', 'accounts', 'goals'].includes(currentTab)) && (
              <motion.span
                layoutId="mobile-nav-indicator"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute top-0 w-7 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400"
              />
            )}
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* More Bottom Sheet Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto border-t border-slate-200 dark:border-slate-800 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grab handle */}
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-base font-bold text-slate-900 dark:text-white">All Modules</span>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Install Mobile App Banner */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    openInstallModal();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md shadow-emerald-700/25 active:scale-98 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Install MyMoney on Android</div>
                      <div className="text-[10px] text-emerald-100">Direct Home Screen & APK Package</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20">Install</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.tab;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      key={item.tab}
                      type="button"
                      onClick={() => {
                        setCurrentTab(item.tab);
                        setIsMoreOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-semibold shadow-xs'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs truncate">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out / Switch Profile ({profile.name})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
