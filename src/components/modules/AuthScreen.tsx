import React, { useEffect, useState } from 'react';
import {
  Wallet,
  UserPlus,
  LogIn,
  ArrowRight,
  Lock,
  CheckCircle2,
  Trash2,
  Target,
  Sliders,
  Layers,
  Smartphone,
  AlertCircle,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES, toMinorUnits } from '../../utils/currency';
import { toLocalIsoDate } from '../../utils/calculations';
import { TrackingMode } from '../../types/finance';

const PREVIEW_SCALES = [
  {
    key: 'Day',
    title: 'Today Spend',
    bars: [0.35, 0.62, 0.48, 0.85, 0.42, 0.68, 0.54],
    goalPct: 78,
  },
  {
    key: 'Week',
    title: 'Weekly Flow',
    bars: [0.52, 0.74, 0.38, 0.65, 0.9, 0.58, 0.72],
    goalPct: 84,
  },
  {
    key: 'Month',
    title: 'Monthly Trend',
    bars: [0.44, 0.58, 0.71, 0.63, 0.82, 0.75, 0.88],
    goalPct: 91,
  },
  {
    key: 'Year',
    title: 'Annual View',
    bars: [0.6, 0.48, 0.76, 0.69, 0.84, 0.92, 0.79],
    goalPct: 95,
  },
] as const;

export const AuthScreen: React.FC = () => {
  const {
    savedProfiles,
    createNewProfile,
    loginToProfile,
    openDemoProfile,
    deleteSavedProfile,
    openInstallModal,
    darkMode,
    toggleDarkMode,
  } = useFinance();

  const [mode, setMode] = useState<'login' | 'create'>(
    savedProfiles.length > 0 ? 'login' : 'create'
  );
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewBoost, setPreviewBoost] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showGoalFields, setShowGoalFields] = useState(false);

  // Create profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('simple');
  const [monthlySavingsStr, setMonthlySavingsStr] = useState('10000');
  const [cashOpeningStr, setCashOpeningStr] = useState('0');
  const [bankOpeningStr, setBankOpeningStr] = useState('0');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetStr, setGoalTargetStr] = useState('');
  const [goalDate, setGoalDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return toLocalIsoDate(d);
  });
  const [startFresh, setStartFresh] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // Login form state
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    savedProfiles[0]?.id || ''
  );
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pinShakeCount, setPinShakeCount] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Keep selectedProfileId synced when a profile is deleted
  useEffect(() => {
    if (savedProfiles.length === 0) {
      setSelectedProfileId('');
    } else if (!savedProfiles.some((p) => p.id === selectedProfileId)) {
      setSelectedProfileId(savedProfiles[0].id);
    }
  }, [savedProfiles, selectedProfileId]);

  // Gentle auto-cycle for the interactive showcase scale (Day -> Week -> Month -> Year)
  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewIdx((prev) => (prev + 1) % PREVIEW_SCALES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  const activePreview = PREVIEW_SCALES[previewIdx];

  const selectedProfileMeta =
    savedProfiles.find((p) => p.id === selectedProfileId) || savedProfiles[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!name.trim()) {
      setCreateError('Please enter your name to create your profile.');
      return;
    }

    setIsLaunching(true);
    const goalTargetMinor = toMinorUnits(goalTargetStr);

    setTimeout(() => {
      createNewProfile({
        name: name.trim(),
        email: email.trim(),
        pin: pin.trim() || undefined,
        currency,
        monthlySavingsTarget: toMinorUnits(monthlySavingsStr || '0'),
        trackingMode,
        startingCashBalance: toMinorUnits(cashOpeningStr || '0'),
        startingBankBalance: toMinorUnits(bankOpeningStr || '0'),
        includeSampleData: !startFresh,
        initialGoal:
          goalTitle.trim() && goalTargetMinor > 0
            ? {
                title: goalTitle.trim(),
                targetAmount: goalTargetMinor,
                targetDate: goalDate,
                category: 'Personal Goal',
              }
            : null,
      });
    }, 240);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!selectedProfileMeta) return;

    const res = loginToProfile(selectedProfileMeta.id, loginPin);
    if (!res.ok) {
      setLoginError(res.error || 'Unable to log in.');
      setPinShakeCount((c) => c + 1);
    }
  };

  const currencySymbol = SUPPORTED_CURRENCIES[currency]?.symbol || '₹';

  return (
    <div className="relative min-h-screen bg-[#F8F7FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Subtle GPU-Composited Ambient Emerald Aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="animate-aurora-a absolute -top-28 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-500/12 dark:bg-emerald-500/14 blur-3xl" />
        <div className="animate-aurora-b absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full bg-teal-500/10 dark:bg-teal-500/12 blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 pt-4 pb-2"
      >
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-800/20"
          >
            <Wallet className="w-5 h-5" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            My<span className="text-emerald-700 dark:text-emerald-400">Money</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={openInstallModal}
            className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Split Viewport */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Showcase Panel (Desktop full column, Compact animated card on mobile) */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-emerald-950/20 border border-emerald-800/40 relative overflow-hidden"
          >
            {/* Subtle internal shimmer ring */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/15 blur-2xl" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300/90">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Private On-Device Ledger · Works Offline</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white [text-wrap:balance] leading-tight">
                Your money, clear across every day, week, month &amp; year.
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed hidden sm:block">
                Create your personal profile to start tracking real expenses, set custom savings goals, and switch seamlessly between Simple Expense Tracker and Full Wealth Manager.
              </p>
            </div>

            {/* Interactive Animated Timeframe Preview Widget (Hidden on ultra-tiny phones to keep form above the fold, visible sm+) */}
            <div className="hidden sm:block my-6 p-4 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-md space-y-4 relative z-10">
              {/* Interactive Scale Selector */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-white/10 rounded-xl">
                {PREVIEW_SCALES.map((scale, idx) => {
                  const isActive = previewIdx === idx;
                  return (
                    <button
                      key={scale.key}
                      type="button"
                      onClick={() => setPreviewIdx(idx)}
                      className={`relative py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        isActive ? 'text-emerald-950' : 'text-emerald-100/80 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="auth-preview-scale-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="absolute inset-0 bg-emerald-400 rounded-lg shadow-xs"
                        />
                      )}
                      <span className="relative z-10">{scale.key}</span>
                    </button>
                  );
                })}
              </div>

              {/* Animated Bars + Goal Ring */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-200/80">
                    <span>{activePreview.title}</span>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => setPreviewBoost((b) => (b >= 3 ? 0 : b + 1))}
                      className="px-2 py-0.5 rounded-md bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 font-mono tabular-nums font-semibold transition-colors cursor-pointer"
                    >
                      {previewBoost > 0 ? `+${previewBoost} boost` : '+ Simulate'}
                    </motion.button>
                  </div>
                  <div className="h-16 flex items-end gap-1.5">
                    {activePreview.bars.map((val, i) => {
                      const boostedVal =
                        i === activePreview.bars.length - 1
                          ? Math.min(1, val + previewBoost * 0.08)
                          : Math.min(1, val + (i % 2 === 0 ? previewBoost * 0.03 : 0));
                      return (
                        <div key={i} className="flex-1 h-full flex items-end">
                          <motion.div
                            initial={false}
                            animate={{ scaleY: boostedVal }}
                            transition={{
                              type: 'spring',
                              stiffness: 260,
                              damping: 22,
                              delay: i * 0.025,
                            }}
                            style={{ originY: 1 }}
                            className={`w-full h-full rounded-t-md ${
                              i === activePreview.bars.length - 1
                                ? 'bg-emerald-400'
                                : 'bg-emerald-400/45'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Goal Ring */}
                <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="5"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="25"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 25}
                      initial={{ strokeDashoffset: 2 * Math.PI * 25 }}
                      animate={{
                        strokeDashoffset:
                          2 *
                          Math.PI *
                          25 *
                          (1 - Math.min(100, activePreview.goalPct + previewBoost * 3) / 100),
                      }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                  <span className="absolute text-[11px] font-mono font-bold tabular-nums text-white">
                    {Math.min(100, activePreview.goalPct + previewBoost * 3)}%
                  </span>
                </div>
              </div>

              {/* Animated Trend Sparkline */}
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 240 32" preserveAspectRatio="none">
                <motion.path
                  key={activePreview.key}
                  d="M0,26 C35,24 55,14 90,17 C125,20 155,8 190,11 C215,13 228,4 240,3"
                  fill="none"
                  stroke="#6ee7b7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </div>

            {/* Quiet Unboxed Feature Footer */}
            <div className="mt-4 sm:mt-0 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-emerald-200/80 relative z-10">
              <span>Zero sample clutter</span>
              <span aria-hidden="true">·</span>
              <span>PIN lock ready</span>
              <span aria-hidden="true">·</span>
              <span>CSV &amp; JSON export</span>
            </div>
          </motion.section>

          {/* Right Interactive Auth Card */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 p-5 sm:p-7 flex flex-col justify-between"
          >
            <div>
              {/* Spring-Animated Tab Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('create');
                    setCreateError(null);
                    setConfirmDeleteId(null);
                  }}
                  className={`relative min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    mode === 'create'
                      ? 'text-emerald-950 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode === 'create' && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                    />
                  )}
                  <UserPlus className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">Create Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginError(null);
                  }}
                  className={`relative min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    mode === 'login'
                      ? 'text-emerald-950 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode === 'login' && (
                    <motion.div
                      layoutId="auth-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                    />
                  )}
                  <LogIn className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">Log In ({savedProfiles.length})</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'create' ? (
                  <motion.form
                    key="create-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleCreateSubmit}
                    className="space-y-4"
                  >
                    <div className="pb-1 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                          Create Your Own Profile
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Personalize your ledger — your Dashboard opens immediately.
                        </p>
                      </div>
                      <motion.div
                        key={`${name.trim().charAt(0).toUpperCase() || 'M'}-${currency}`}
                        initial={{ scale: 0.85, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60"
                      >
                        <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center">
                          {name.trim() ? name.trim().charAt(0).toUpperCase() : 'M'}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 pr-0.5">
                          {currencySymbol}
                        </span>
                      </motion.div>
                    </div>

                    {createError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{createError}</span>
                      </motion.div>
                    )}

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Bappa Barman"
                          className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email or Mobile (Optional)
                        </label>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. you@email.com"
                          className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow"
                        />
                      </div>
                    </div>

                    {/* Currency & Optional PIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                        >
                          {Object.entries(SUPPORTED_CURRENCIES).map(([code, meta]) => (
                            <option key={code} value={code}>
                              {meta.symbol} {code} — {meta.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Login PIN / Password (Optional)
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Leave blank for 1-tap login"
                            className="w-full min-h-[44px] pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Animated Tracking Mode Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Choose Your Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(
                          [
                            {
                              id: 'simple' as TrackingMode,
                              title: 'Simple Expense Tracker',
                              desc: 'Day, Week, Month & Year + Goals',
                              icon: Sliders,
                            },
                            {
                              id: 'full' as TrackingMode,
                              title: 'Full Finance Manager',
                              desc: 'Accounts, Cards, Debts & Assets',
                              icon: Layers,
                            },
                          ] as const
                        ).map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = trackingMode === opt.id;
                          return (
                            <motion.button
                              key={opt.id}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={() => setTrackingMode(opt.id)}
                              className={`relative p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                  <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>{opt.title}</span>
                                </div>
                                {isSelected && (
                                  <motion.span
                                    layoutId="auth-mode-dot"
                                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                    className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {opt.desc}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Starting Balances & Monthly Savings Goal */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                          Cash ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={cashOpeningStr}
                          onChange={(e) => setCashOpeningStr(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                          Bank ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={bankOpeningStr}
                          onChange={(e) => setBankOpeningStr(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate">
                          Goal/mo ({currencySymbol})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={monthlySavingsStr}
                          onChange={(e) => setMonthlySavingsStr(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Smooth Collapsible First Custom Goal */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowGoalFields((v) => !v)}
                        className="w-full min-h-[42px] px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Set a Custom Savings Goal (Optional)</span>
                        </span>
                        <motion.span
                          animate={{ rotate: showGoalFields ? 180 : 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {showGoalFields && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                            className="px-3.5 pb-3.5 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-2"
                          >
                            <input
                              type="text"
                              value={goalTitle}
                              onChange={(e) => setGoalTitle(e.target.value)}
                              placeholder="e.g. Emergency Fund"
                              className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={goalTargetStr}
                              onChange={(e) => setGoalTargetStr(e.target.value)}
                              placeholder={`Target (${currencySymbol})`}
                              className="min-h-[40px] px-3 py-2 text-xs font-mono tabular-nums rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                            <input
                              type="date"
                              value={goalDate}
                              onChange={(e) => setGoalDate(e.target.value)}
                              className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Clean Slate vs Sample Data */}
                    <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={startFresh}
                        onChange={(e) => setStartFresh(e.target.checked)}
                        className="w-4 h-4 accent-emerald-700 rounded shrink-0"
                      />
                      <span className="text-xs font-medium text-emerald-950 dark:text-emerald-200">
                        Start fresh with zero sample data
                      </span>
                    </label>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLaunching}
                      type="submit"
                      className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-80 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-colors cursor-pointer"
                    >
                      {isLaunching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Opening Your Dashboard...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Create Profile &amp; Open Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    <div className="pb-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Log In to MyMoney
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pick a saved local profile to resume your ledger immediately.
                      </p>
                    </div>

                    {loginError && (
                      <motion.div
                        key={`err-${pinShakeCount}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                        transition={{ duration: 0.35 }}
                        className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </motion.div>
                    )}

                    {savedProfiles.length === 0 ? (
                      <div className="py-8 text-center space-y-3">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto"
                        >
                          <UserPlus className="w-6 h-6" />
                        </motion.div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No profiles created on this device yet
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                          Create your personal profile in seconds or explore the sample demo portfolio.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => setMode('create')}
                            className="min-h-[42px] px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
                          >
                            Create My Profile
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={openDemoProfile}
                            className="min-h-[42px] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                          >
                            Explore Sample Demo
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Select Your Profile
                          </label>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {savedProfiles.map((p, idx) => {
                              const isSelected = selectedProfileMeta?.id === p.id;
                              return (
                                <motion.div
                                  key={p.id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                                  whileTap={{ scale: 0.985 }}
                                  onClick={() => {
                                    setSelectedProfileId(p.id);
                                    setLoginPin('');
                                    setLoginError(null);
                                    setConfirmDeleteId(null);
                                  }}
                                  className={`relative p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                      {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                        <span className="truncate">{p.name}</span>
                                        {p.hasPin && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                                        <span>{p.currencySymbol} {p.currency}</span>
                                        <span aria-hidden="true">·</span>
                                        <span>{p.trackingMode === 'simple' ? 'Simple Tracker' : 'Full Manager'}</span>
                                        {p.isSampleData && (
                                          <>
                                            <span aria-hidden="true">·</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">Sample</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {confirmDeleteId === p.id ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteSavedProfile(p.id);
                                          setConfirmDeleteId(null);
                                        }}
                                        className="min-h-[34px] px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        title="Delete Profile"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDeleteId(p.id);
                                        }}
                                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedProfileMeta?.hasPin && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                            >
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Enter PIN / Password for {selectedProfileMeta.name}
                              </label>
                              <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="password"
                                  required
                                  autoFocus
                                  value={loginPin}
                                  onChange={(e) => setLoginPin(e.target.value)}
                                  placeholder="Enter your PIN or password"
                                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Log In &amp; Open Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Quick Demo Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Want to preview features first?
              </span>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={openDemoProfile}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Open Sample Demo Portfolio →
              </motion.button>
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="relative z-10 text-center text-[11px] text-slate-400 dark:text-slate-600 py-3 px-4">
        MyMoney · Private on-device personal finance
      </footer>
    </div>
  );
};
