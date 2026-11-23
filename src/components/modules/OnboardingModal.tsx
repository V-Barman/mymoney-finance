import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Wallet, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { SUPPORTED_CURRENCIES, toMinorUnits } from '../../utils/currency';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, setShowOnboarding, profile, updateProfile } = useFinance();
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState(profile.currency);
  const [savingsTargetStr, setSavingsTargetStr] = useState(String(profile.monthlySavingsTarget / 100));
  const [userName, setUserName] = useState(profile.name);

  if (!showOnboarding) return null;

  const handleFinish = () => {
    const meta = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.INR;
    updateProfile({
      name: userName || 'Aarav Sharma',
      currency: selectedCurrency,
      currencySymbol: meta.symbol,
      monthlySavingsTarget: toMinorUnits(savingsTargetStr || 50000),
      hasCompletedOnboarding: true,
    });
    setShowOnboarding(false);
  };

  return (
    <Modal
      isOpen={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      title="Welcome to MyMoney"
      subtitle={`Step ${step} of 3 · Personalize your financial cockpit`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Full Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Base Currency
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => {
                  const isSelected = selectedCurrency === code;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      key={code}
                      type="button"
                      onClick={() => setSelectedCurrency(code)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-base text-emerald-800 dark:text-emerald-400 shrink-0">
                        {info.symbol}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{code}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{info.name}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
              <Wallet className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                Setting a monthly savings target enables smart wealth analytics, budget tracking, and real-time savings rate calculations.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Monthly Savings Amount ({SUPPORTED_CURRENCIES[selectedCurrency]?.symbol || '₹'})
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={savingsTargetStr}
                onChange={(e) => setSavingsTargetStr(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                You can change this target at any time in Profile & Settings.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Architecture & Storage Ready</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-5 list-disc">
                <li>Local persistence active via isolated data access layer</li>
                <li>Integer minor-units exact decimal math engine enabled</li>
                <li>Sample portfolio pre-loaded with bank, credit card, and goals</li>
                <li>Clear demo data anytime in Settings</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Back
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enter My Dashboard</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
