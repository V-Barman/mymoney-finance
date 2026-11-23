# MyMoney — Personal Expense Tracker & Wealth Manager

A fast, 100% private, offline-first personal finance web application, Progressive Web App (PWA), and Android app (`APK` + Google Play `AAB`). Manage daily expenses, multi-account balances, budgets, savings goals, debts/loans, recurring bills, and net worth directly on your device—with zero ads, zero servers, and zero telemetry.

---

## Core Features

- **100% Private & Offline On-Device Storage**: Every profile, account, and transaction stays locally on your device (`localStorage` isolated per profile). Works offline via Workbox PWA cache or bundled inside Android WebView.
- **Multi-Profile Local Auth & PIN Lock**: Create multiple isolated personal profiles on one device with optional PIN protection, or open the Sample Demo Portfolio to explore features first.
- **Dual Tracking Modes**:
  - **Simple Expense Tracker**: Clean Day, Week, Month, and Year spending analytics, budgets, and savings goals.
  - **Full Finance Manager**: Unlocks Accounts & Credit Cards, Debts & Loans, Recurring Bills, Financial Calendar heatmap, and Assets & Net Worth tracking.
- **Exact Minor-Unit Currency Precision**: Uses integer minor-unit math (`paise`/`cents`) across 8 currencies (`INR ₹`, `USD $`, `EUR €`, `GBP £`, `AED د.إ`, `CAD CA$`, `AUD A$`, `SGD S$`) with zero floating-point drift.
- **Day / Week / Month / Year Tracking**: Step across days, weeks (Mon–Sun), months, or years with dynamic Income vs. Expense bar charts, category donut splits, and savings rate tracking.
- **Double-Entry Style Transfers**: Internal transfers update source and destination account balances without inflating income or expense totals.
- **Budgets & Smart Alerts**: Monthly category caps with customizable alert thresholds and 1-click setup from unbudgeted categories.
- **Savings Goals & Milestones**: Track goal targets, fund goals from accounts, and celebrate 100% completion with confetti.
- **Debts, Loans & Recurring Schedules**: Track borrowed liabilities/lent receivables and execute recurring income or bill schedules in one tap.
- **Reports, CSV, Print & JSON Backup**: Export Excel-compatible UTF-8 BOM CSVs, print clean white-paper Financial Statements, and export/restore complete JSON backups.
- **Android Ready**: Includes standalone `public/MyMoney.apk`, Play Store-ready `public/MyMoney.aab`, hosted privacy policy (`public/privacy.html`), and Play Store graphics.

---

## How to Use MyMoney

### 1. Create Your Profile
1. Open the app and select **Create Profile**.
2. Enter your **Name** (and optional Email/Mobile), pick your **Currency**, and optionally set a **Login PIN / Password** (leave blank for 1-tap login).
3. Choose **Simple Expense Tracker** or **Full Finance Manager**.
4. Enter starting Cash/Bank balances and your Monthly Savings Goal (plus an optional first Savings Goal).
5. Keep **"Start fresh with zero sample data"** checked for real personal tracking, or uncheck it to load sample demo entries.
6. Tap **Create Profile & Open Dashboard**.

### 2. Track Spending Day / Week / Month / Year
- Use the **Day · Week · Month · Year** switcher on the **Dashboard** or **Analytics** tab to inspect any timeframe.
- Tap **+ Add Expense**, **+ Add Income**, or **Transfer** in the top bar or quick-action strip to record entries.
- Click any transaction row to inspect full details, edit, or delete it.

### 3. Manage Data, Backups & Sample Reset
- **Wipe Sample Data**: Click **Delete All Sample Data** on the Dashboard banner or **Clear Demo Ledger** in **Settings** to keep your profile while resetting the ledger to zero.
- **Export / Backup**: Open **Reports & Export** for CSV downloads and printable statements, or **Settings → Download JSON Backup** to save a portable `.json` backup file.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling & Motion**: Tailwind CSS v4, `motion`, `lucide-react`, `canvas-confetti`
- **Charts**: `recharts`
- **PWA**: `vite-plugin-pwa` (Workbox offline caching + Web App Manifest)
- **Android Wrapper**: Native Java `WebView` (`scripts/android/`) compiled cleanly with Android SDK 35 (`aapt2`, `d8`, `zipalign`, `apksigner`, `bundletool`)

---

## Local Development

### Prerequisites
- Node.js 18+ and npm

### Run Locally
```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Type-check with TypeScript
npm run lint

# Build production web & PWA bundle into dist/
npm run build
```

---

## Android APK & Google Play Store (`.aab`) Packaging

Pre-built packages are included in `public/`:
- `public/MyMoney.apk` — Signed standalone APK for direct Android installation (`minSdkVersion 24`, `targetSdkVersion 35`).
- `public/MyMoney.aab` — Signed & `bundletool`-validated Android App Bundle (`com.bappabarman.mymoney`) ready for Google Play Console.
- `public/privacy.html` — Offline-friendly Privacy Policy page required for Play Store listing.
- `public/play-store-feature-graphic.png` — `1024x500` Play Store feature banner.

To rebuild the Android packages locally (requires Android SDK 35 & `bundletool.jar` under `/opt/android-sdk`):
```bash
# Build signed standalone APK
bash scripts/build-apk.sh

# Build signed & validated Play Store AAB
bash scripts/build-aab.sh
```

> **Note for Google Play Console**: Keep your own private upload keystore safe when publishing to Google Play Store (`KEYSTORE_PASS` / `KEY_PASS` can be configured before building).

---

## How to Push This Project to GitHub

1. Create a new empty repository on [GitHub](https://github.com/new) (do **not** initialize with README or `.gitignore`, since both are already included).
2. Run these commands in your terminal inside the project root:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: MyMoney personal finance web, PWA & Android app"
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

If prompted for a password on HTTPS push, use a GitHub **Personal Access Token (PAT)** instead of your account password, or authenticate via SSH / `gh auth login`.

---

## Project Structure

```text
├── public/
│   ├── MyMoney.apk                      # Signed standalone Android APK
│   ├── MyMoney.aab                      # Play Store Android App Bundle
│   ├── privacy.html                     # Privacy Policy page
│   ├── play-store-feature-graphic.png   # Play Store 1024x500 graphic
│   └── pwa-*.png / icon.svg             # App & PWA icons
├── scripts/
│   ├── android/                         # AndroidManifest.xml & MainActivity.java
│   ├── build-apk.sh                     # APK build & sign script
│   └── build-aab.sh                     # Play Store AAB build & validation script
├── src/
│   ├── components/
│   │   ├── common/                      # Navbar, Sidebar, MobileNav, Modal, PWAInstallModal, etc.
│   │   └── modules/                     # AuthScreen, Dashboard, Transactions, Accounts, Budgets, Goals, Debts, Recurring, Calendar, Assets, Reports, Settings
│   ├── context/FinanceContext.tsx       # Reactive ledger & multi-profile state store
│   ├── hooks/usePWAInstall.ts           # PWA install prompt hook
│   ├── types/finance.ts                 # TypeScript domain models
│   └── utils/                           # Currency math, period calculations, local storage DAL, CSV export, APK downloader
├── package.json
└── vite.config.ts
```

---

## Privacy

MyMoney collects **zero personal data** and makes **zero external tracking requests**. See [`public/privacy.html`](public/privacy.html) for the complete privacy policy.
