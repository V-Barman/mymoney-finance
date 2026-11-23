import {
  Account,
  Asset,
  Budget,
  Category,
  DebtLoan,
  RecurringPayment,
  SavedProfileMeta,
  SavingsGoal,
  TrackingMode,
  Transaction,
  UserProfile,
} from '../types/finance';
import { SUPPORTED_CURRENCIES } from './currency';
import {
  INITIAL_ACCOUNTS,
  INITIAL_ASSETS,
  INITIAL_BUDGETS,
  INITIAL_CATEGORIES,
  INITIAL_DEBTS,
  INITIAL_RECURRING,
  INITIAL_SAVINGS_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_PROFILE,
} from './sampleData';

const LEGACY_KEYS = {
  PROFILE: 'mymoney_user_profile_v1',
  ACCOUNTS: 'mymoney_accounts_v1',
  CATEGORIES: 'mymoney_categories_v1',
  TRANSACTIONS: 'mymoney_transactions_v1',
  BUDGETS: 'mymoney_budgets_v1',
  GOALS: 'mymoney_goals_v1',
  DEBTS: 'mymoney_debts_v1',
  RECURRING: 'mymoney_recurring_v1',
  ASSETS: 'mymoney_assets_v1',
};

const SYSTEM_KEYS = {
  REGISTRY: 'mymoney_profiles_registry_v1',
  ACTIVE_PROFILE_ID: 'mymoney_active_profile_id_v1',
  SESSION_ACTIVE: 'mymoney_auth_logged_in_v1',
};

type EntityName =
  | 'profile'
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'debts'
  | 'recurring'
  | 'assets';

function getProfileEntityKey(profileId: string, entity: EntityName): string {
  return `mymoney_p_${profileId}_${entity}`;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading key ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to storage:`, err);
  }
}

export interface AppStateData {
  profile: UserProfile;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtLoan[];
  recurring: RecurringPayment[];
  assets: Asset[];
}

export interface CreateProfileInput {
  name: string;
  email?: string;
  pin?: string;
  currency: string;
  monthlySavingsTarget: number; // minor units
  trackingMode: TrackingMode;
  startingCashBalance?: number; // minor units
  startingBankBalance?: number; // minor units
  includeSampleData?: boolean;
  initialGoal?: {
    title: string;
    targetAmount: number; // minor units
    targetDate: string;
    category?: string;
  } | null;
}

function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID);
    if (active) return active;
  } catch {
    // ignore
  }
  return 'default';
}

function ensureLegacyMigrated(): void {
  try {
    const existingRegistry = localStorage.getItem(SYSTEM_KEYS.REGISTRY);
    if (existingRegistry !== null) return;

    const legacyProfileRaw = localStorage.getItem(LEGACY_KEYS.PROFILE);
    const legacyTxRaw = localStorage.getItem(LEGACY_KEYS.TRANSACTIONS);

    if (legacyProfileRaw || legacyTxRaw) {
      const legacyProfile = safeGet<UserProfile>(LEGACY_KEYS.PROFILE, INITIAL_USER_PROFILE);
      const isCustomized = legacyProfile.name !== INITIAL_USER_PROFILE.name;

      if (isCustomized) {
        const id = legacyProfile.id || 'local-user-1';
        const migratedProfile: UserProfile = {
          ...legacyProfile,
          id,
          trackingMode: legacyProfile.trackingMode || 'full',
          isSampleData: false,
          hasCompletedOnboarding: true,
        };

        const entities: [EntityName, string, unknown][] = [
          ['accounts', LEGACY_KEYS.ACCOUNTS, INITIAL_ACCOUNTS],
          ['categories', LEGACY_KEYS.CATEGORIES, INITIAL_CATEGORIES],
          ['transactions', LEGACY_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS],
          ['budgets', LEGACY_KEYS.BUDGETS, INITIAL_BUDGETS],
          ['goals', LEGACY_KEYS.GOALS, INITIAL_SAVINGS_GOALS],
          ['debts', LEGACY_KEYS.DEBTS, INITIAL_DEBTS],
          ['recurring', LEGACY_KEYS.RECURRING, INITIAL_RECURRING],
          ['assets', LEGACY_KEYS.ASSETS, INITIAL_ASSETS],
        ];

        safeSet(getProfileEntityKey(id, 'profile'), migratedProfile);
        for (const [entity, legacyKey, fallback] of entities) {
          safeSet(getProfileEntityKey(id, entity), safeGet(legacyKey, fallback));
        }

        const nowIso = new Date().toISOString();
        const meta: SavedProfileMeta = {
          id,
          name: migratedProfile.name,
          email: migratedProfile.email,
          hasPin: Boolean(migratedProfile.pin),
          currency: migratedProfile.currency,
          currencySymbol: migratedProfile.currencySymbol,
          trackingMode: migratedProfile.trackingMode || 'full',
          isSampleData: false,
          createdAt: migratedProfile.createdAt || nowIso,
          lastLoginAt: nowIso,
        };

        safeSet(SYSTEM_KEYS.REGISTRY, [meta]);
        localStorage.setItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID, id);
        localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'true');
        return;
      }
    }

    safeSet(SYSTEM_KEYS.REGISTRY, []);
  } catch (err) {
    console.error('Migration check failed:', err);
  }
}

function updateRegistryMetaFromProfile(profile: UserProfile): void {
  ensureLegacyMigrated();
  const id = profile.id || getActiveProfileId();
  const list = safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []);
  const nowIso = new Date().toISOString();
  const meta: SavedProfileMeta = {
    id,
    name: profile.name,
    email: profile.email,
    hasPin: Boolean(profile.pin && profile.pin.trim().length > 0),
    currency: profile.currency,
    currencySymbol: profile.currencySymbol,
    trackingMode: profile.trackingMode || 'full',
    isSampleData: Boolean(profile.isSampleData),
    createdAt: profile.createdAt || nowIso,
    lastLoginAt: nowIso,
  };
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...meta, createdAt: list[idx].createdAt };
  } else {
    list.push(meta);
  }
  safeSet(SYSTEM_KEYS.REGISTRY, list);
}

function buildBlankAccounts(
  currency: string,
  cashBalance = 0,
  bankBalance = 0
): Account[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: `acc-cash-${Date.now()}`,
      name: 'Cash Wallet',
      type: 'cash',
      openingBalance: cashBalance,
      currentBalance: cashBalance,
      currency,
      color: '#15803d',
      createdAt: nowIso,
    },
    {
      id: `acc-bank-${Date.now() + 1}`,
      name: 'Primary Bank Account',
      type: 'bank',
      openingBalance: bankBalance,
      currentBalance: bankBalance,
      currency,
      color: '#047857',
      createdAt: nowIso,
    },
  ];
}

export const FinanceStorage = {
  getSavedProfiles: (): SavedProfileMeta[] => {
    ensureLegacyMigrated();
    return safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []);
  },

  isSessionAuthenticated: (): boolean => {
    ensureLegacyMigrated();
    try {
      const loggedIn = localStorage.getItem(SYSTEM_KEYS.SESSION_ACTIVE) === 'true';
      const activeId = localStorage.getItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID);
      if (!loggedIn || !activeId) return false;
      const registry = safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []);
      return registry.some((p) => p.id === activeId);
    } catch {
      return false;
    }
  },

  getActiveProfileId,

  loadProfileState: (profileId: string): AppStateData => {
    const profile = safeGet<UserProfile>(getProfileEntityKey(profileId, 'profile'), {
      ...INITIAL_USER_PROFILE,
      id: profileId,
    });
    return {
      profile,
      accounts: safeGet(getProfileEntityKey(profileId, 'accounts'), []),
      categories: safeGet(getProfileEntityKey(profileId, 'categories'), INITIAL_CATEGORIES),
      transactions: safeGet(getProfileEntityKey(profileId, 'transactions'), []),
      budgets: safeGet(getProfileEntityKey(profileId, 'budgets'), []),
      goals: safeGet(getProfileEntityKey(profileId, 'goals'), []),
      debts: safeGet(getProfileEntityKey(profileId, 'debts'), []),
      recurring: safeGet(getProfileEntityKey(profileId, 'recurring'), []),
      assets: safeGet(getProfileEntityKey(profileId, 'assets'), []),
    };
  },

  createProfileAndStart: (input: CreateProfileInput): AppStateData => {
    ensureLegacyMigrated();
    const id = `prof-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();
    const currMeta = SUPPORTED_CURRENCIES[input.currency] || SUPPORTED_CURRENCIES.INR;
    const includeSample = Boolean(input.includeSampleData);

    const profile: UserProfile = {
      id,
      name: input.name.trim(),
      email: (input.email || '').trim() || `${input.name.trim().toLowerCase().replace(/\s+/g, '.')}@mymoney.local`,
      pin: input.pin?.trim() ? input.pin.trim() : undefined,
      currency: input.currency,
      currencySymbol: currMeta.symbol,
      monthlySavingsTarget: input.monthlySavingsTarget || 0,
      dateFormat: 'DD/MM/YYYY',
      hasCompletedOnboarding: true,
      trackingMode: input.trackingMode,
      isSampleData: includeSample,
      theme: 'emerald',
      createdAt: nowIso,
    };

    let accounts: Account[];
    let transactions: Transaction[];
    let budgets: Budget[];
    let goals: SavingsGoal[];
    let debts: DebtLoan[];
    let recurring: RecurringPayment[];
    let assets: Asset[];

    if (includeSample) {
      accounts = INITIAL_ACCOUNTS.map((a) => ({ ...a, currency: input.currency }));
      transactions = [...INITIAL_TRANSACTIONS];
      budgets = [...INITIAL_BUDGETS];
      goals = [...INITIAL_SAVINGS_GOALS];
      debts = [...INITIAL_DEBTS];
      recurring = [...INITIAL_RECURRING];
      assets = [...INITIAL_ASSETS];
    } else {
      accounts = buildBlankAccounts(
        input.currency,
        input.startingCashBalance || 0,
        input.startingBankBalance || 0
      );
      transactions = [];
      budgets = [];
      goals = [];
      debts = [];
      recurring = [];
      assets = [];
    }

    if (input.initialGoal && input.initialGoal.title.trim() && input.initialGoal.targetAmount > 0) {
      goals = [
        {
          id: `goal-${Date.now()}`,
          title: input.initialGoal.title.trim(),
          targetAmount: input.initialGoal.targetAmount,
          currentAmount: 0,
          targetDate: input.initialGoal.targetDate,
          category: input.initialGoal.category || 'Personal Goal',
          icon: 'Target',
          color: '#059669',
          linkedAccountId: accounts[0]?.id,
          isCompleted: false,
          createdAt: nowIso,
        },
        ...goals,
      ];
    }

    const categories = [...INITIAL_CATEGORIES];

    safeSet(getProfileEntityKey(id, 'profile'), profile);
    safeSet(getProfileEntityKey(id, 'accounts'), accounts);
    safeSet(getProfileEntityKey(id, 'categories'), categories);
    safeSet(getProfileEntityKey(id, 'transactions'), transactions);
    safeSet(getProfileEntityKey(id, 'budgets'), budgets);
    safeSet(getProfileEntityKey(id, 'goals'), goals);
    safeSet(getProfileEntityKey(id, 'debts'), debts);
    safeSet(getProfileEntityKey(id, 'recurring'), recurring);
    safeSet(getProfileEntityKey(id, 'assets'), assets);

    localStorage.setItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID, id);
    localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'true');
    updateRegistryMetaFromProfile(profile);

    return {
      profile,
      accounts,
      categories,
      transactions,
      budgets,
      goals,
      debts,
      recurring,
      assets,
    };
  },

  loginToProfile: (
    profileId: string,
    pinAttempt?: string
  ): { ok: true; data: AppStateData } | { ok: false; error: string } => {
    ensureLegacyMigrated();
    const registry = safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []);
    const exists = registry.some((p) => p.id === profileId);
    if (!exists) {
      return { ok: false, error: 'Profile not found on this device.' };
    }

    const state = FinanceStorage.loadProfileState(profileId);
    if (state.profile.pin && state.profile.pin.trim().length > 0) {
      if ((pinAttempt || '').trim() !== state.profile.pin.trim()) {
        return { ok: false, error: 'Incorrect PIN / passcode. Please try again.' };
      }
    }

    localStorage.setItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID, profileId);
    localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'true');
    updateRegistryMetaFromProfile(state.profile);

    return { ok: true, data: state };
  },

  createOrOpenDemoProfile: (): AppStateData => {
    ensureLegacyMigrated();
    const demoId = 'demo-portfolio';
    const registry = safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []);
    const existing = registry.find((p) => p.id === demoId);

    if (existing) {
      localStorage.setItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID, demoId);
      localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'true');
      const state = FinanceStorage.loadProfileState(demoId);
      updateRegistryMetaFromProfile(state.profile);
      return state;
    }

    const nowIso = new Date().toISOString();
    const demoProfile: UserProfile = {
      ...INITIAL_USER_PROFILE,
      id: demoId,
      trackingMode: 'full',
      isSampleData: true,
      hasCompletedOnboarding: true,
      createdAt: nowIso,
    };

    safeSet(getProfileEntityKey(demoId, 'profile'), demoProfile);
    safeSet(getProfileEntityKey(demoId, 'accounts'), INITIAL_ACCOUNTS);
    safeSet(getProfileEntityKey(demoId, 'categories'), INITIAL_CATEGORIES);
    safeSet(getProfileEntityKey(demoId, 'transactions'), INITIAL_TRANSACTIONS);
    safeSet(getProfileEntityKey(demoId, 'budgets'), INITIAL_BUDGETS);
    safeSet(getProfileEntityKey(demoId, 'goals'), INITIAL_SAVINGS_GOALS);
    safeSet(getProfileEntityKey(demoId, 'debts'), INITIAL_DEBTS);
    safeSet(getProfileEntityKey(demoId, 'recurring'), INITIAL_RECURRING);
    safeSet(getProfileEntityKey(demoId, 'assets'), INITIAL_ASSETS);

    localStorage.setItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID, demoId);
    localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'true');
    updateRegistryMetaFromProfile(demoProfile);

    return {
      profile: demoProfile,
      accounts: INITIAL_ACCOUNTS,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_SAVINGS_GOALS,
      debts: INITIAL_DEBTS,
      recurring: INITIAL_RECURRING,
      assets: INITIAL_ASSETS,
    };
  },

  logout: (): void => {
    try {
      localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'false');
    } catch {
      // ignore
    }
  },

  deleteProfile: (profileId: string): void => {
    ensureLegacyMigrated();
    const entities: EntityName[] = [
      'profile',
      'accounts',
      'categories',
      'transactions',
      'budgets',
      'goals',
      'debts',
      'recurring',
      'assets',
    ];
    for (const entity of entities) {
      localStorage.removeItem(getProfileEntityKey(profileId, entity));
    }
    const registry = safeGet<SavedProfileMeta[]>(SYSTEM_KEYS.REGISTRY, []).filter(
      (p) => p.id !== profileId
    );
    safeSet(SYSTEM_KEYS.REGISTRY, registry);

    if (getActiveProfileId() === profileId) {
      localStorage.removeItem(SYSTEM_KEYS.ACTIVE_PROFILE_ID);
      localStorage.setItem(SYSTEM_KEYS.SESSION_ACTIVE, 'false');
    }
  },

  getProfile: (): UserProfile => {
    const id = getActiveProfileId();
    return safeGet(getProfileEntityKey(id, 'profile'), { ...INITIAL_USER_PROFILE, id });
  },
  setProfile: (profile: UserProfile) => {
    const id = profile.id || getActiveProfileId();
    const normalized = { ...profile, id };
    safeSet(getProfileEntityKey(id, 'profile'), normalized);
    updateRegistryMetaFromProfile(normalized);
  },

  getAccounts: (): Account[] => safeGet(getProfileEntityKey(getActiveProfileId(), 'accounts'), []),
  setAccounts: (accounts: Account[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'accounts'), accounts),

  getCategories: (): Category[] =>
    safeGet(getProfileEntityKey(getActiveProfileId(), 'categories'), INITIAL_CATEGORIES),
  setCategories: (categories: Category[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'categories'), categories),

  getTransactions: (): Transaction[] =>
    safeGet(getProfileEntityKey(getActiveProfileId(), 'transactions'), []),
  setTransactions: (transactions: Transaction[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'transactions'), transactions),

  getBudgets: (): Budget[] => safeGet(getProfileEntityKey(getActiveProfileId(), 'budgets'), []),
  setBudgets: (budgets: Budget[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'budgets'), budgets),

  getGoals: (): SavingsGoal[] => safeGet(getProfileEntityKey(getActiveProfileId(), 'goals'), []),
  setGoals: (goals: SavingsGoal[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'goals'), goals),

  getDebts: (): DebtLoan[] => safeGet(getProfileEntityKey(getActiveProfileId(), 'debts'), []),
  setDebts: (debts: DebtLoan[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'debts'), debts),

  getRecurring: (): RecurringPayment[] =>
    safeGet(getProfileEntityKey(getActiveProfileId(), 'recurring'), []),
  setRecurring: (recurring: RecurringPayment[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'recurring'), recurring),

  getAssets: (): Asset[] => safeGet(getProfileEntityKey(getActiveProfileId(), 'assets'), []),
  setAssets: (assets: Asset[]) =>
    safeSet(getProfileEntityKey(getActiveProfileId(), 'assets'), assets),

  /**
   * Load sample demo transactions/accounts into the active profile
   */
  resetToSampleData: (): AppStateData => {
    const id = getActiveProfileId();
    const currentProfile = FinanceStorage.getProfile();
    const updatedProfile: UserProfile = {
      ...currentProfile,
      id,
      isSampleData: true,
      hasCompletedOnboarding: true,
    };

    const accounts = INITIAL_ACCOUNTS.map((a) => ({
      ...a,
      currency: currentProfile.currency || 'INR',
    }));

    safeSet(getProfileEntityKey(id, 'profile'), updatedProfile);
    safeSet(getProfileEntityKey(id, 'accounts'), accounts);
    safeSet(getProfileEntityKey(id, 'categories'), INITIAL_CATEGORIES);
    safeSet(getProfileEntityKey(id, 'transactions'), INITIAL_TRANSACTIONS);
    safeSet(getProfileEntityKey(id, 'budgets'), INITIAL_BUDGETS);
    safeSet(getProfileEntityKey(id, 'goals'), INITIAL_SAVINGS_GOALS);
    safeSet(getProfileEntityKey(id, 'debts'), INITIAL_DEBTS);
    safeSet(getProfileEntityKey(id, 'recurring'), INITIAL_RECURRING);
    safeSet(getProfileEntityKey(id, 'assets'), INITIAL_ASSETS);
    updateRegistryMetaFromProfile(updatedProfile);

    return {
      profile: updatedProfile,
      accounts,
      categories: INITIAL_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_SAVINGS_GOALS,
      debts: INITIAL_DEBTS,
      recurring: INITIAL_RECURRING,
      assets: INITIAL_ASSETS,
    };
  },

  /**
   * Delete all sample / ledger transactions, budgets, goals, debts, recurring, assets
   * while keeping the user's own profile (name, email, currency, PIN, trackingMode) intact!
   */
  clearAllData: (): AppStateData => {
    const id = getActiveProfileId();
    const currentProfile = FinanceStorage.getProfile();
    const currency = currentProfile.currency || 'INR';
    const blankAccounts = buildBlankAccounts(currency, 0, 0);

    const updatedProfile: UserProfile = {
      ...currentProfile,
      id,
      isSampleData: false,
      hasCompletedOnboarding: true,
    };

    safeSet(getProfileEntityKey(id, 'profile'), updatedProfile);
    safeSet(getProfileEntityKey(id, 'accounts'), blankAccounts);
    safeSet(getProfileEntityKey(id, 'categories'), INITIAL_CATEGORIES);
    safeSet(getProfileEntityKey(id, 'transactions'), []);
    safeSet(getProfileEntityKey(id, 'budgets'), []);
    safeSet(getProfileEntityKey(id, 'goals'), []);
    safeSet(getProfileEntityKey(id, 'debts'), []);
    safeSet(getProfileEntityKey(id, 'recurring'), []);
    safeSet(getProfileEntityKey(id, 'assets'), []);
    updateRegistryMetaFromProfile(updatedProfile);

    return {
      profile: updatedProfile,
      accounts: blankAccounts,
      categories: INITIAL_CATEGORIES,
      transactions: [],
      budgets: [],
      goals: [],
      debts: [],
      recurring: [],
      assets: [],
    };
  },

  /**
   * Export complete active profile data as backup JSON
   */
  exportBackupJson: (): string => {
    const data: AppStateData = {
      profile: FinanceStorage.getProfile(),
      accounts: FinanceStorage.getAccounts(),
      categories: FinanceStorage.getCategories(),
      transactions: FinanceStorage.getTransactions(),
      budgets: FinanceStorage.getBudgets(),
      goals: FinanceStorage.getGoals(),
      debts: FinanceStorage.getDebts(),
      recurring: FinanceStorage.getRecurring(),
      assets: FinanceStorage.getAssets(),
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import complete app data from backup JSON into active profile
   */
  importBackupJson: (jsonString: string): AppStateData => {
    const id = getActiveProfileId();
    const data = JSON.parse(jsonString) as Partial<AppStateData>;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid backup structure');
    }
    const hasKnownSection =
      Boolean(data.profile) ||
      Array.isArray(data.accounts) ||
      Array.isArray(data.transactions) ||
      Array.isArray(data.categories) ||
      Array.isArray(data.budgets) ||
      Array.isArray(data.goals) ||
      Array.isArray(data.debts) ||
      Array.isArray(data.recurring) ||
      Array.isArray(data.assets);
    if (!hasKnownSection) {
      throw new Error('Backup file does not contain MyMoney ledger sections');
    }

    if (Array.isArray(data.accounts)) safeSet(getProfileEntityKey(id, 'accounts'), data.accounts);
    if (Array.isArray(data.transactions)) safeSet(getProfileEntityKey(id, 'transactions'), data.transactions);
    if (Array.isArray(data.categories)) safeSet(getProfileEntityKey(id, 'categories'), data.categories);
    if (Array.isArray(data.budgets)) safeSet(getProfileEntityKey(id, 'budgets'), data.budgets);
    if (Array.isArray(data.goals)) safeSet(getProfileEntityKey(id, 'goals'), data.goals);
    if (Array.isArray(data.debts)) safeSet(getProfileEntityKey(id, 'debts'), data.debts);
    if (Array.isArray(data.recurring)) safeSet(getProfileEntityKey(id, 'recurring'), data.recurring);
    if (Array.isArray(data.assets)) safeSet(getProfileEntityKey(id, 'assets'), data.assets);
    if (data.profile && typeof data.profile === 'object') {
      const currMeta = SUPPORTED_CURRENCIES[data.profile.currency || 'INR'];
      const mergedProfile: UserProfile = {
        ...data.profile,
        id,
        currencySymbol: data.profile.currencySymbol || currMeta?.symbol || '₹',
        isSampleData: false,
      };
      safeSet(getProfileEntityKey(id, 'profile'), mergedProfile);
      updateRegistryMetaFromProfile(mergedProfile);
    }
    return FinanceStorage.loadProfileState(id);
  },
};
