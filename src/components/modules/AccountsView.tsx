import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Landmark,
  Wallet,
  Coins,
  Archive,
  Edit2,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Account } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { AccountModal } from './AccountModal';
import { exportAccountsToCSV } from '../../utils/export';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const AccountsView: React.FC = () => {
  const { accounts, archiveAccount, profile, openTxModal, setCurrentTab } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const archivedAccounts = accounts.filter((a) => a.isArchived);

  // Totals
  const totalLiquidAssets = activeAccounts
    .filter((a) => a.type !== 'credit_card' && a.currentBalance > 0)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalCreditDebt = activeAccounts
    .filter((a) => a.type === 'credit_card' && a.currentBalance < 0)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    exportAccountsToCSV(accounts, profile.currency);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return Landmark;
      case 'savings':
        return Wallet;
      case 'wallet':
        return Wallet;
      case 'cash':
        return Coins;
      case 'credit_card':
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Account Wallets & Cards</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time balance monitoring computed from all debits and credits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </motion.button>
        </div>
      </div>

      {/* Aggregate Balance Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between shadow-xs"
        >
          <div>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Liquid Cash & Bank</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-emerald-950 dark:text-emerald-100 mt-1">
              <AnimatedCounter value={totalLiquidAssets} currency={profile.currency} />
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
        >
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Credit Card Outstanding</div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
              <AnimatedCounter value={totalCreditDebt} currency={profile.currency} />
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Active Accounts Grid or Empty State */}
      {activeAccounts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No active accounts yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add your bank accounts, cash wallet, UPI wallet, or credit cards to track real-time balances.
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Account</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeAccounts.map((acc, index) => {
          const Icon = getAccountIcon(acc.type);
          const isCreditCard = acc.type === 'credit_card';
          const usedCredit = isCreditCard && acc.currentBalance < 0 ? Math.abs(acc.currentBalance) : 0;
          const limit = acc.creditLimit || 0;
          const creditUtilization = limit > 0 ? Math.min(100, Math.round((usedCredit / limit) * 100)) : 0;

          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{acc.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                        {acc.institution || acc.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      title="Edit Account"
                      onClick={() => handleEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      title="Archive Account"
                      onClick={() => archiveAccount(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Account Number / Mask */}
                {acc.accountNumberMasked && (
                  <div className="mt-3 text-xs font-mono text-slate-400 dark:text-slate-500 tracking-wider">
                    {acc.accountNumberMasked}
                  </div>
                )}

                {/* Balance Amount with AnimatedCounter */}
                <div className="mt-4">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {isCreditCard ? 'Outstanding Bill' : 'Current Balance'}
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                      isCreditCard
                        ? acc.currentBalance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                        : acc.currentBalance >= 0
                        ? 'text-slate-900 dark:text-white'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <AnimatedCounter value={acc.currentBalance} currency={profile.currency} />
                  </div>
                </div>

                {/* Credit Card Utilization Bar with motion */}
                {isCreditCard && limit > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Limit: {formatCurrency(limit, profile.currency, { compact: true })}</span>
                      <span className="font-mono">{creditUtilization}% utilized</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${creditUtilization}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          creditUtilization > 75
                            ? 'bg-rose-500'
                            : creditUtilization > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Transaction Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => openTxModal('expense', null, undefined, acc.id)}
                  className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Log Spend</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('transactions')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  Ledger History
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Archived Accounts Toggle & List */}
      {archivedAccounts.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-3 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>
              {showArchived ? 'Hide' : 'Show'} Archived Accounts ({archivedAccounts.length})
            </span>
          </button>

          {showArchived && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {archivedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between opacity-75"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{acc.name}</div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      Balance: {formatCurrency(acc.currentBalance, profile.currency)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => archiveAccount(acc.id)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />
    </div>
  );
};
