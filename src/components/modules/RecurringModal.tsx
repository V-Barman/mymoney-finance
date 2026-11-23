import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RecurringFrequency, RecurringPayment } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecurring?: RecurringPayment | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  editRecurring,
}) => {
  const { addRecurring, updateRecurring, accounts, categories, profile } = useFinance();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [autoRemind, setAutoRemind] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => (type === 'income' ? c.type === 'income' : c.type === 'expense'));

  useEffect(() => {
    if (isOpen) {
      if (editRecurring) {
        setTitle(editRecurring.title);
        setType(editRecurring.type);
        setAmountStr(String(toMajorUnits(editRecurring.amount)));
        setCategoryId(editRecurring.categoryId);
        setAccountId(editRecurring.accountId);
        setFrequency(editRecurring.frequency);
        setNextDueDate(editRecurring.nextDueDate);
        setAutoRemind(editRecurring.autoRemind);
        setNotes(editRecurring.notes || '');
      } else {
        setTitle('');
        setType('expense');
        setAmountStr('');
        const expCats = categories.filter((c) => c.type === 'expense');
        setCategoryId(expCats[0]?.id || '');
        const activeAcc = accounts.find((a) => !a.isArchived);
        setAccountId(activeAcc?.id || '');
        setFrequency('monthly');
        setNextDueDate(getTodayLocalIso());
        setAutoRemind(true);
        setNotes('');
      }
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editRecurring]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = toMinorUnits(amountStr);
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!amountStr || amountMinor <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!accountId) {
      setError('Please select an account.');
      return;
    }
    if (!nextDueDate) {
      setError('Please select a next due date.');
      return;
    }

    if (editRecurring) {
      updateRecurring(editRecurring.id, {
        title: title.trim(),
        type,
        amount: amountMinor,
        categoryId,
        accountId,
        frequency,
        nextDueDate,
        autoRemind,
        notes: notes.trim(),
      });
    } else {
      addRecurring({
        title: title.trim(),
        type,
        amount: amountMinor,
        categoryId,
        accountId,
        frequency,
        nextDueDate,
        autoRemind,
        status: 'active',
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRecurring ? 'Edit Recurring Rule' : 'Schedule Recurring Payment'}
      subtitle="Automate rent, subscriptions, utility bills and salary"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const expCat = categories.find((c) => c.type === 'expense');
              if (expCat) setCategoryId(expCat.id);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recurring Bill / Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              const incCat = categories.find((c) => c.type === 'income');
              if (incCat) setCategoryId(incCat.id);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recurring Income
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Apartment Rent, Netflix, Internet Bill"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize cursor-pointer"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'income' ? 'Deposit Into Account' : 'Debit From Account'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              {accounts
                .filter((a) => !a.isArchived || a.id === accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Due Date</label>
          <input
            type="date"
            required
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="remindCheckbox"
            checked={autoRemind}
            onChange={(e) => setAutoRemind(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
          />
          <label htmlFor="remindCheckbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            Show reminder in Dashboard & Financial Calendar
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer"
          >
            {editRecurring ? 'Update' : 'Schedule'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
