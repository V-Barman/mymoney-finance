import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { PaymentMethod, TransactionType } from '../../types/finance';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';

export const TransactionModal: React.FC = () => {
  const {
    isTxModalOpen,
    closeTxModal,
    txModalType,
    txModalEditItem,
    txModalDefaultDate,
    txModalDefaultAccountId,
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    profile,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(txModalType);
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('net_banking');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state on modal open or edit item changes
  useEffect(() => {
    if (isTxModalOpen) {
      setIsSubmitting(false);
      setIsSuccess(false);
      if (txModalEditItem) {
        setType(txModalEditItem.type);
        setAmountStr(String(toMajorUnits(txModalEditItem.amount)));
        setCategoryId(txModalEditItem.categoryId || '');
        setFromAccountId(txModalEditItem.fromAccountId);
        setToAccountId(txModalEditItem.toAccountId || '');
        setDate(txModalEditItem.date);
        setTime(txModalEditItem.time || '12:00');
        setPaymentMethod(txModalEditItem.paymentMethod);
        setDescription(txModalEditItem.description);
        setNotes(txModalEditItem.notes || '');
      } else {
        setType(txModalType);
        setAmountStr('');
        // Pick sensible defaults
        const defaultFromAcc =
          (txModalDefaultAccountId && accounts.some((a) => a.id === txModalDefaultAccountId)
            ? txModalDefaultAccountId
            : accounts.find((a) => !a.isArchived)?.id) || '';
        const defaultToAcc = accounts.find((a) => a.id !== defaultFromAcc && !a.isArchived)?.id || '';
        setFromAccountId(defaultFromAcc);
        setToAccountId(defaultToAcc);

        const filteredCats = categories.filter((c) => c.type === (txModalType === 'income' ? 'income' : 'expense'));
        setCategoryId(filteredCats[0]?.id || '');

        const now = new Date();
        setDate(txModalDefaultDate || getTodayLocalIso());
        setTime(now.toTimeString().slice(0, 5));
        setPaymentMethod(txModalType === 'expense' ? 'upi' : 'net_banking');
        setDescription('');
        setNotes('');
      }
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxModalOpen, txModalType, txModalEditItem, txModalDefaultDate, txModalDefaultAccountId]);

  if (!isTxModalOpen) return null;

  const filteredCategories = categories.filter((c) => (type === 'income' ? c.type === 'income' : c.type === 'expense'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountMinor = toMinorUnits(amountStr);
    if (!amountStr || amountMinor <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!fromAccountId) {
      setError('Please select an account.');
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        setError('Please select a destination account for transfer.');
        return;
      }
      if (fromAccountId === toAccountId) {
        setError('Source and Destination accounts must be different.');
        return;
      }
    } else {
      if (!categoryId) {
        setError('Please select a category.');
        return;
      }
    }

    if (!description.trim()) {
      setError('Please enter a brief description.');
      return;
    }

    setIsSubmitting(true);

    const matchedCat = categories.find((c) => c.id === categoryId);

    // Save actual transaction
    if (txModalEditItem) {
      updateTransaction(txModalEditItem.id, {
        type,
        amount: amountMinor,
        categoryId: type === 'transfer' ? '' : categoryId,
        categoryName: type === 'transfer' ? 'Internal Transfer' : matchedCat?.name || 'Other',
        fromAccountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        paymentMethod,
        description: description.trim(),
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        type,
        amount: amountMinor,
        categoryId: type === 'transfer' ? '' : categoryId,
        categoryName: type === 'transfer' ? 'Internal Transfer' : matchedCat?.name || 'Other',
        fromAccountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        time,
        paymentMethod,
        description: description.trim(),
        notes: notes.trim(),
      });
    }

    // Brief animated checkmark confirmation
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      closeTxModal();
    }, 400);
  };

  const quickIncrements = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'].includes(profile.currency)
    ? [5, 20, 50, 100]
    : [50, 100, 500, 1000];

  const handleQuickAddAmount = (delta: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = Math.round((current + delta) * 100) / 100;
    setAmountStr(String(next));
  };

  return (
    <Modal
      isOpen={isTxModalOpen}
      onClose={closeTxModal}
      title={txModalEditItem ? 'Edit Transaction' : 'Record Transaction'}
      subtitle="Accurate double-entry financial ledger entry"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Animated Error notification banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800 text-xs text-red-700 dark:text-rose-300 font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Type Segmented Toggle with animated pill */}
        <div className="relative flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const expenseCats = categories.filter((c) => c.type === 'expense');
              if (expenseCats.length > 0) setCategoryId(expenseCats[0].id);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              type === 'expense'
                ? 'text-rose-700 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {type === 'expense' && (
              <motion.div
                layoutId="tx-type-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <ArrowUpRight className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10">Expense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              const incomeCats = categories.filter((c) => c.type === 'income');
              if (incomeCats.length > 0) setCategoryId(incomeCats[0].id);
            }}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              type === 'income'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {type === 'income' && (
              <motion.div
                layoutId="tx-type-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <ArrowDownLeft className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10">Income</span>
          </button>

          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors ${
              type === 'transfer'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {type === 'transfer' && (
              <motion.div
                layoutId="tx-type-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <ArrowLeftRight className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10">Transfer</span>
          </button>
        </div>

        {/* Amount Input + Quick Amount Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Amount ({profile.currencySymbol})
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-base font-bold text-slate-400 dark:text-slate-500">
              {profile.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              autoFocus
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="w-full min-h-[46px] pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickIncrements.map((amt) => (
              <motion.button
                key={amt}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -1 }}
                type="button"
                onClick={() => handleQuickAddAmount(amt)}
                className="px-2.5 py-1.5 min-h-[32px] text-[11px] font-bold font-mono tabular-nums rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/70 dark:border-slate-700 transition-colors cursor-pointer"
              >
                +{profile.currencySymbol}{amt.toLocaleString()}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Account Selector(s) */}
        {type === 'transfer' ? (
          <div className="space-y-2">
            {accounts.filter((a) => !a.isArchived).length < 2 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                You currently have only 1 active account. Add another account (e.g., Bank, Savings, or UPI) to transfer funds between them.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  From Account (Source)
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {accounts
                    .filter((a) => !a.isArchived || a.id === fromAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution || acc.type})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  To Account (Destination)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {accounts
                    .filter((a) => !a.isArchived || a.id === toAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution || acc.type})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'income' ? 'Deposit Into Account' : 'Paid From Account'}
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {accounts
                  .filter((a) => !a.isArchived || a.id === fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution || acc.type})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Date & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="upi">UPI / QR Code</option>
              <option value="card">Debit / Credit Card</option>
              <option value="net_banking">Net Banking / IMPS / NEFT</option>
              <option value="cash">Cash In Hand</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Payee
          </label>
          <input
            type="text"
            required
            placeholder={
              type === 'income'
                ? 'e.g. Monthly Salary or Client payment'
                : type === 'expense'
                ? 'e.g. Supermarket Grocery run'
                : 'e.g. Transfer to high yield vault'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Invoice #204, split with Rohan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={closeTxModal}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isSubmitting || isSuccess}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-emerald-700/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSuccess ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <span>Recorded!</span>
              </>
            ) : txModalEditItem ? (
              'Save Changes'
            ) : (
              'Record Transaction'
            )}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
