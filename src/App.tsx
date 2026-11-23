import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { SplashScreen } from './components/modules/SplashScreen';
import { OnboardingModal } from './components/modules/OnboardingModal';
import { AuthScreen } from './components/modules/AuthScreen';
import { TransactionModal } from './components/modules/TransactionModal';
import { TransactionDetailModal } from './components/modules/TransactionDetailModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';

// Views
import { DashboardView } from './components/modules/DashboardView';
import { TransactionHistoryView } from './components/modules/TransactionHistoryView';
import { AccountsView } from './components/modules/AccountsView';
import { BudgetView } from './components/modules/BudgetView';
import { AnalyticsView } from './components/modules/AnalyticsView';
import { SavingsGoalsView } from './components/modules/SavingsGoalsView';
import { DebtLoanView } from './components/modules/DebtLoanView';
import { RecurringView } from './components/modules/RecurringView';
import { FinancialCalendarView } from './components/modules/FinancialCalendarView';
import { AssetsView } from './components/modules/AssetsView';
import { CategoriesView } from './components/modules/CategoriesView';
import { ReportsView } from './components/modules/ReportsView';
import { SettingsView } from './components/modules/SettingsView';
import { PageTransition } from './components/common/PageTransition';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Transaction } from './types/finance';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    currentTab,
    toasts,
    dismissToast,
    showInstallModal,
    setShowInstallModal,
  } = useFinance();
  const [selectedDetailTx, setSelectedDetailTx] = useState<Transaction | null>(null);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onSelectTx={setSelectedDetailTx} />;
      case 'transactions':
        return <TransactionHistoryView onSelectTx={setSelectedDetailTx} />;
      case 'accounts':
        return <AccountsView />;
      case 'budgets':
        return <BudgetView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'goals':
        return <SavingsGoalsView />;
      case 'debts':
        return <DebtLoanView />;
      case 'recurring':
        return <RecurringView />;
      case 'calendar':
        return <FinancialCalendarView onSelectTx={setSelectedDetailTx} />;
      case 'assets':
        return <AssetsView />;
      case 'categories':
        return <CategoriesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onSelectTx={setSelectedDetailTx} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen bg-[#F8F7FC] dark:bg-slate-950 font-sans"
          >
            <AuthScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app-shell"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen bg-[#F8F7FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white"
          >
            {/* Top Bar */}
            <Navbar />

            {/* Main Container */}
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              {/* Desktop Sidebar Navigation */}
              <Sidebar />

              {/* Viewport Content Area */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 lg:pb-8">
                <PageTransition tabKey={currentTab}>
                  {renderActiveTab()}
                </PageTransition>
              </main>
            </div>

            {/* Mobile Fixed Bottom Nav */}
            <MobileNav />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Overlays, Toasts, Splash & Modals */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <OfflineIndicator />
      <SplashScreen />
      {isAuthenticated && (
        <>
          <OnboardingModal />
          <TransactionModal />
          <TransactionDetailModal
            transaction={selectedDetailTx}
            onClose={() => setSelectedDetailTx(null)}
          />
        </>
      )}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <FinanceProvider>
        <MainContent />
      </FinanceProvider>
    </MotionConfig>
  );
}
