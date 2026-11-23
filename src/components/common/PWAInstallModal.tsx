import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ShieldCheck,
  WifiOff,
  Zap,
  PackageCheck,
  Loader2,
  AlertCircle,
  Store,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { downloadAndroidApk, downloadAndroidBundle } from '../../utils/apkDownload';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [copiedPrivacy, setCopiedPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'playstore' | 'pwa'>('apk');
  const [downloading, setDownloading] = useState<'apk' | 'aab' | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const privacyUrl = `${originUrl}/privacy.html`;

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPrivacy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(privacyUrl);
      setCopiedPrivacy(true);
      setTimeout(() => setCopiedPrivacy(false), 2000);
    }
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDownloadApk = async () => {
    setDownloading('apk');
    setDownloadStatus(null);
    const result = await downloadAndroidApk();
    setDownloading(null);
    if (result.ok) {
      setDownloadStatus({
        type: 'success',
        text: 'MyMoney.apk downloaded! Open your Downloads folder and tap it to install on Android.',
      });
    } else {
      setDownloadStatus({
        type: 'error',
        text: result.error || 'Download failed.',
      });
    }
  };

  const handleDownloadBundle = async () => {
    setDownloading('aab');
    setDownloadStatus(null);
    const result = await downloadAndroidBundle();
    setDownloading(null);
    if (result.ok) {
      setDownloadStatus({
        type: 'success',
        text: 'MyMoney.aab downloaded! Upload this signed Android App Bundle in Google Play Console.',
      });
    } else {
      setDownloadStatus({
        type: 'error',
        text: result.error || 'Bundle download failed.',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install & Publish MyMoney"
      subtitle="Run offline on Android or publish free on Google Play Store"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Banner with App Icon */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white border border-emerald-800/40 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="MyMoney Icon"
              className="w-full h-full rounded-[14px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icon.svg';
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>MyMoney</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v1.1.0 · SDK 35
              </span>
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
              Signed Android APK &amp; Google Play AAB · 100% Free &amp; Offline
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center text-center">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Target SDK 35</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Android 7 – 15</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center text-center">
            <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">100% Offline</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Runs Locally</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Zero Data Sent</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Private Ledger</span>
          </div>
        </div>

        {/* Tab selection: APK vs Play Store AAB vs Chrome PWA */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('apk');
              setDownloadStatus(null);
            }}
            className={`py-2 px-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Direct .APK
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('playstore');
              setDownloadStatus(null);
            }}
            className={`py-2 px-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'playstore'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Play Store .AAB
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('pwa');
              setDownloadStatus(null);
            }}
            className={`py-2 px-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Web / PWA
          </button>
        </div>

        {activeTab === 'apk' ? (
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={downloading !== null}
              onClick={handleDownloadApk}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-70 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
            >
              {downloading === 'apk' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing MyMoney.apk...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download MyMoney.apk for Android</span>
                </>
              )}
            </motion.button>

            {downloadStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                  downloadStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                }`}
              >
                {downloadStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{downloadStatus.text}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Install Directly on Your Phone:</span>
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
                <li>Tap <strong>Download MyMoney.apk</strong> right here inside the app.</li>
                <li>Open your phone&apos;s <strong>Files / Downloads</strong> app and tap <code>MyMoney.apk</code>.</li>
                <li>Allow <strong>&quot;Install unknown apps&quot;</strong> if prompted, then tap <strong>Install</strong>.</li>
              </ol>
            </div>
          </div>
        ) : activeTab === 'playstore' ? (
          <div className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={downloading !== null}
              onClick={handleDownloadBundle}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-70 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
            >
              {downloading === 'aab' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing MyMoney.aab...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>Download Play Store Bundle (.AAB)</span>
                </>
              )}
            </motion.button>

            {downloadStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                  downloadStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                }`}
              >
                {downloadStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{downloadStatus.text}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Privacy Policy URL (Required by Google Play)
                </span>
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={privacyUrl}
                  className="flex-1 px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyPrivacy}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedPrivacy ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrivacy ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Store Listing Assets Included:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <a
                  href="/pwa-512x512.png"
                  download="MyMoney-Icon-512x512.png"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-600 transition-colors"
                >
                  <span>Icon (512×512)</span>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                </a>
                <a
                  href="/play-store-feature-graphic.png"
                  download="MyMoney-Feature-1024x500.png"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-600 transition-colors"
                >
                  <span>Banner (1024×500)</span>
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                </a>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                Package ID: <code className="font-mono">com.bappabarman.mymoney</code> · Target Android 15 (SDK 35) · Free App · Zero Data Collected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong>Already Installed!</strong> MyMoney is currently running in standalone
                  mode on your device.
                </div>
              </div>
            ) : isInstallable ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your browser supports direct installation. Click below to add MyMoney directly to
                  your home screen.
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Add MyMoney to Home Screen</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Chrome Mobile Install:</span>
                  </h4>
                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal pl-4">
                    <li>Open this link in <strong>Google Chrome</strong> on your Android phone.</li>
                    <li>
                      Tap Chrome&apos;s menu (<strong>⋮</strong>) &rarr; <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </li>
                  </ol>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Copy App URL for your Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={appUrl}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 truncate"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleCopyUrl}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
