import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Percent,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { DebtLoan, DebtType } from '../../types/finance';
import { formatCurrency, formatDate, toMinorUnits } from '../../utils/currency';
import { DebtModal } from './DebtModal';
import { Modal } from '../common/Modal';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const DebtLoanView: React.FC = () => {
  const { debts, recordDebtPayment, deleteDebt, updateDebt, accounts, profile } = useFinance();

  const [activeTab, setActiveTab] = useState<DebtType>('borrowed');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtLoan | null>(null);

  // Repayment Modal
  const [repaymentTarget, setRepaymentTarget] = useState<DebtLoan | null>(null);
  const [repaymentAmountStr, setRepaymentAmountStr] = useState('');
  const [repaymentAccount, setRepaymentAccount] = useState('');
  const [repaymentNote, setRepaymentNote] = useState('');
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  const displayedDebts = debts.filter((d) => d.type === activeTab && !d.isSettled);
  const settledDebts = debts.filter((d) => d.type === activeTab && d.isSettled);

  const totalBorrowed = debts
    .filter((d) => d.type === 'borrowed' && !d.isSettled)
    .reduce((sum, d) => sum + d.outstandingBalance, 0);

  const totalLent = debts
    .filter((d) => d.type === 'lent' && !d.isSettled)
    .reduce((sum, d) => sum + d.outstandingBalance, 0);

  const handleOpenRepayment = (d: DebtLoan) => {
    setRepaymentTarget(d);
    setRepaymentAmountStr(d.emiAmount ? String(d.emiAmount / 100) : '');
    const activeAcc = accounts.find((a) => !a.isArchived);
    setRepaymentAccount(activeAcc?.id || '');
    setRepaymentNote('');
    setRepaymentError(null);
  };

  const handleConfirmRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentTarget) return;

    const amountMinor = toMinorUnits(repaymentAmountStr);
    if (!repaymentAmountStr || amountMinor <= 0) {
      setRepaymentError('Please enter a valid repayment amount.');
      return;
    }
    if (!repaymentAccount) {
      setRepaymentError('Please select a payment account.');
      return;
    }

    recordDebtPayment(
      repaymentTarget.id,
      amountMinor,
      repaymentAccount,
      repaymentNote || `Repayment for ${repaymentTarget.counterparty}`
    );
    setRepaymentTarget(null);
  };

  const handleEdit = (d: DebtLoan) => {
    setEditingDebt(d);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Debt & Loan Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor liabilities, borrowed sums, peer lending, and EMI schedules
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Loan / Debt</span>
        </motion.button>
      </div>

      {/* Aggregate Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total Borrowed (Liabilities)</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalBorrowed} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reduces overall Net Worth</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Total Lent (Receivables)</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-300 mt-1">
              <AnimatedCounter value={totalLent} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Counted as an asset receivable</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('borrowed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'borrowed'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Money Borrowed ({debts.filter((d) => d.type === 'borrowed' && !d.isSettled).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lent')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'lent'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Money Lent ({debts.filter((d) => d.type === 'lent' && !d.isSettled).length})
        </button>
      </div>

      {/* Debts Grid or Empty State */}
      {displayedDebts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'borrowed' ? 'No active loans or debts borrowed' : 'No active money lent out'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {activeTab === 'borrowed'
              ? 'Record home loans, personal loans, or EMIs here to factor liabilities into your Net Worth.'
              : 'Record money lent to friends or colleagues so you remember to track repayments.'}
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'borrowed' ? 'Record Borrowed Loan' : 'Record Money Lent'}</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedDebts.map((d, index) => {
          const paidOff = d.principalAmount - d.outstandingBalance;
          const progress = Math.min(100, Math.round((paidOff / d.principalAmount) * 100));

          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {d.counterparty}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {d.interestRate > 0 && (
                        <span className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300">
                          <Percent className="w-3 h-3" />
                          {d.interestRate}% APR
                        </span>
                      )}
                      <span>·</span>
                      <span>Principal: {formatCurrency(d.principalAmount, profile.currency, { compact: true })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleEdit(d)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => deleteDebt(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Outstanding amount */}
                <div className="mt-4">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Outstanding Balance</span>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                      d.type === 'borrowed' ? 'text-slate-900 dark:text-white' : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    <AnimatedCounter value={d.outstandingBalance} currency={profile.currency} />
                  </div>
                </div>

                {/* Payoff Progress with motion */}
                <div className="mt-3 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        d.type === 'borrowed' ? 'bg-emerald-600' : 'bg-teal-600'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{progress}% Paid Off</span>
                    {d.emiAmount && (
                      <span className="font-mono">
                        EMI: {formatCurrency(d.emiAmount, profile.currency, { hideDecimals: true })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Due Date & Notes */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {formatDate(d.dueDate, profile.dateFormat)}
                  </span>
                  {d.notes && <span className="truncate max-w-[120px]">{d.notes}</span>}
                </div>
              </div>

              {/* Repay Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => updateDebt(d.id, { isSettled: true, outstandingBalance: 0 })}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Mark Settled
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => handleOpenRepayment(d)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Record Repayment
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Settled Debts */}
      {settledDebts.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Fully Settled / Closed Loans ({settledDebts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settledDebts.map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-80"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.counterparty}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Principal: {formatCurrency(d.principalAmount, profile.currency)} · Fully Paid
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateDebt(d.id, { isSettled: false })}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Reopen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {repaymentTarget && (
        <Modal
          isOpen={Boolean(repaymentTarget)}
          onClose={() => setRepaymentTarget(null)}
          title={`Record Repayment: ${repaymentTarget.counterparty}`}
          subtitle={`Current outstanding: ${formatCurrency(repaymentTarget.outstandingBalance, profile.currency)}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmRepayment} className="space-y-4">
            {repaymentError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-rose-950/50 border border-red-200 dark:border-rose-900 text-red-700 dark:text-rose-300 text-xs font-medium">
                {repaymentError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Repayment Amount ({profile.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="e.g. 25000"
                value={repaymentAmountStr}
                onChange={(e) => setRepaymentAmountStr(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {repaymentTarget.type === 'borrowed' ? 'Paid From Account' : 'Received Into Account'}
              </label>
              <select
                value={repaymentAccount}
                onChange={(e) => setRepaymentAccount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {accounts
                  .filter((a) => !a.isArchived)
                  .map((a) => (
                    <option key={a.id} value={a.id} className="dark:bg-slate-800">
                      {a.name} ({formatCurrency(a.currentBalance, profile.currency, { hideDecimals: true })})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Month 12 EMI payment ref #8491"
                value={repaymentNote}
                onChange={(e) => setRepaymentNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRepaymentTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer"
              >
                Record & Log
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Debt Modal */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
        editDebt={editingDebt}
        defaultType={activeTab}
      />
    </div>
  );
};
