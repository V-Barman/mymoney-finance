import React from 'react';
import { Wallet, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';

export const SplashScreen: React.FC = () => {
  const { showSplash, setShowSplash, profile, isAuthenticated } = useFinance();

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white overflow-hidden"
        >
          {/* Ambient GPU-composited aurora */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-aurora-a absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="animate-aurora-b absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-400/15 blur-3xl" />
          </div>

          <div className="relative z-10 w-full flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowSplash(false)}
              className="text-xs font-semibold text-emerald-200 hover:text-white px-4 min-h-[40px] rounded-xl bg-white/10 backdrop-blur-md transition-colors cursor-pointer"
            >
              Skip Intro
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm"
          >
            {/* Brand Emerald Vault Medallion */}
            <motion.div
              initial={{ scale: 0.8, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="relative mb-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-emerald-950 rounded-[22px] flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 450, damping: 20 }}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-emerald-400 flex items-center justify-center text-emerald-950 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              My<span className="text-emerald-400">Money</span>
            </h1>
            <p className="text-emerald-200/80 text-sm mt-2 font-medium">
              Personal Expense Tracker & Wealth Manager
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-emerald-200/80 bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-800/50">
              <span>Day · Week · Month · Year</span>
              <span>·</span>
              <span>Goals</span>
              <span>·</span>
              <span>Offline</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xs flex flex-col items-center gap-3 safe-bottom"
          >
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setShowSplash(false)}
              className="w-full min-h-[48px] px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-colors cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open My Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <span className="text-[11px] text-emerald-400/70 font-mono">
              {isAuthenticated ? `Signed in as ${profile.name}` : 'Private On-Device Ledger'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
