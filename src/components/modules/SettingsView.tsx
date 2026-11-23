import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  Sparkles,
  Smartphone,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES, toMajorUnits, toMinorUnits } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';
import { FinanceStorage } from '../../utils/storage';
import { downloadFile } from '../../utils/export';
import { downloadAndroidApk } from '../../utils/apkDownload';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TrackingMode } from '../../types/finance';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    updateTrackingMode,
    logout,
    resetToSampleData,
    clearAllData,
    restoreFromJson,
    setShowSplash,
    setShowOnboarding,
    darkMode,
    toggleDarkMode,
    openInstallModal,
  } = useFinance();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [pin, setPin] = useState(profile.pin || '');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(profile.trackingMode || 'full');
  const [currency, setCurrency] = useState(profile.currency);
  const [savingsTargetStr, setSavingsTargetStr] = useState(
    String(toMajorUnits(profile.monthlySavingsTarget))
  );
  const [dateFormat, setDateFormat] = useState(profile.dateFormat);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dialog triggers
  const [showConfirmResetSample, setShowConfirmResetSample] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apkDownloading, setApkDownloading] = useState(false);
  const [apkStatus, setApkStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPin(profile.pin || '');
    setTrackingMode(profile.trackingMode || 'full');
    setCurrency(profile.currency);
    setSavingsTargetStr(String(toMajorUnits(profile.monthlySavingsTarget)));
    setDateFormat(profile.dateFormat);
  }, [profile]);

  const handleDownloadApk = async () => {
    setApkDownloading(true);
    setApkStatus(null);
    const result = await downloadAndroidApk();
    setApkDownloading(false);
    if (result.ok) {
      setApkStatus({
        type: 'success',
        text: 'MyMoney.apk downloaded! Open your Downloads folder and tap it to install.',
      });
    } else {
      setApkStatus({
        type: 'error',
        text: result.error || 'Download failed.',
      });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const meta = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      pin: pin.trim() ? pin.trim() : undefined,
      trackingMode,
      currency,
      currencySymbol: meta.symbol,
      monthlySavingsTarget: toMinorUnits(savingsTargetStr),
      dateFormat,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = FinanceStorage.exportBackupJson();
    const filename = `MyMoney_Backup_${getTodayLocalIso()}.json`;
    downloadFile(jsonStr, filename, 'application/json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = restoreFromJson(text);
        if (success) {
          setImportStatus({ type: 'success', text: 'Backup successfully restored!' });
        } else {
          setImportStatus({ type: 'error', text: 'Invalid MyMoney JSON backup file. Please verify the file contents.' });
        }
      } catch {
        setImportStatus({ type: 'error', text: 'Invalid JSON file format.' });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Profile & Preferences</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage currency settings, appearance themes, savings targets, and secure offline data backups
        </p>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Profile and currency preferences updated successfully!</span>
        </motion.div>
      )}

      {importStatus && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            importStatus.type === 'success'
              ? 'bg-emerald-950 text-white border-emerald-700'
              : 'bg-rose-950 text-white border-rose-700'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{importStatus.text}</span>
        </motion.div>
      )}

      {/* Theme & Appearance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Appearance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {darkMode
                ? 'Emerald Wealth Dark Theme — high contrast slate surfaces for reduced eye strain'
                : 'Emerald Wealth Light Theme — crisp lavender neutral with emerald accents'}
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={toggleDarkMode}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
            darkMode ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
          role="switch"
          aria-checked={darkMode}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              darkMode ? 'translate-x-7' : 'translate-x-0'
            }`}
          >
            {darkMode ? (
              <Moon className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Profile Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
      >
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Personal Information & Formats</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                placeholder="e.g. you@email.com or mobile number"
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {Object.entries(SUPPORTED_CURRENCIES).map(([code, meta]) => (
                  <option key={code} value={code} className="dark:bg-slate-800">
                    {code} ({meta.symbol}) - {meta.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Savings Goal ({SUPPORTED_CURRENCIES[currency]?.symbol || '₹'})
              </label>
              <input
                type="number"
                step="any"
                value={savingsTargetStr}
                onChange={(e) => setSavingsTargetStr(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="DD/MM/YYYY" className="dark:bg-slate-800">DD/MM/YYYY (Standard)</option>
                <option value="MM/DD/YYYY" className="dark:bg-slate-800">MM/DD/YYYY (US Format)</option>
                <option value="YYYY-MM-DD" className="dark:bg-slate-800">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full pl-8 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tracking Mode
              </label>
              <select
                value={trackingMode}
                onChange={(e) => setTrackingMode(e.target.value as TrackingMode)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="simple">Simple Expense Tracker (Day / Week / Month / Year + Goals)</option>
                <option value="full">Full Wealth Manager (Accounts, Cards, Debts, Assets)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out / Switch Profile</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              Save Preferences
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Backup and Restore JSON Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Local Data Persistence & Portability</span>
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your financial transactions, accounts, and budgets are securely retained in local storage via an isolated Data Access Layer (DAL). You can export an unencrypted JSON backup to migrate between browsers or restore anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Download JSON Backup</span>
          </motion.button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Restore From JSON</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Android Mobile App & APK Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Android App & APK Installation</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            APK, AAB & PWA Ready
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          MyMoney is pre-compiled as both a standalone Android <code>.apk</code> for direct phone install and a signed Play Store <code>.aab</code> bundle — containing the complete offline application, charts, and on-device ledger storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            disabled={apkDownloading}
            onClick={handleDownloadApk}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-70 rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            {apkDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing MyMoney.apk...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download MyMoney.apk</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={openInstallModal}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Install Guide</span>
          </motion.button>
        </div>

        {apkStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
              apkStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
            }`}
          >
            {apkStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{apkStatus.text}</span>
          </div>
        )}
      </motion.div>

      {/* Demo Controls & Dangerous Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-400" />
          <span>Demo Data & Environment Reset</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <RotateCcw className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Restore Sample Portfolio</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restores complete seed demonstration data with pre-filled transactions, multi-account ledger, and investments.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowConfirmResetSample(true)}
              className="mt-4 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-600 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors self-start cursor-pointer"
            >
              Reset to Sample Data
            </motion.button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Clear All Data</span>
              </div>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-1">
                Permanently wipes all demo entries, leaving a clean blank slate ready for fresh personal tracking.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="mt-4 px-3.5 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-700 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-600 transition-colors self-start cursor-pointer"
            >
              Clear Demo Ledger
            </motion.button>
          </div>
        </div>

        {/* Guided walkthrough triggers */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSplash(true)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Replay Splash Screen</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            Relaunch Onboarding Setup
          </button>
        </div>
      </motion.div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showConfirmResetSample}
        title="Reset to Sample Data?"
        message="This will overwrite current records with the standard rich fintech demo portfolio (HDFC, ICICI, Zerodha, Amazon Pay card, realistic transactions, and goals)."
        confirmLabel="Reset to Demo"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={resetToSampleData}
        onCancel={() => setShowConfirmResetSample(false)}
      />

      <ConfirmDialog
        isOpen={showConfirmClear}
        title="Clear All Ledger Data?"
        message="Are you sure you want to delete all demo transactions, budgets, goals, and assets? This cannot be undone unless you have a JSON backup."
        confirmLabel="Wipe Ledger"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={clearAllData}
        onCancel={() => setShowConfirmClear(false)}
      />
    </div>
  );
};
