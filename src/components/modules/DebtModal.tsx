import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DebtLoan, DebtType } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';
import { toLocalIsoDate } from '../../utils/calculations';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDebt?: DebtLoan | null;
  defaultType?: DebtType;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  editDebt,
  defaultType = 'borrowed',
}) => {
  const { addDebt, updateDebt, profile } = useFinance();

  const [type, setType] = useState<DebtType>(defaultType);
  const [counterparty, setCounterparty] = useState('');
  const [principalStr, setPrincipalStr] = useState('');
  const [outstandingStr, setOutstandingStr] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [dueDate, setDueDate] = useState('');
  const [emiStr, setEmiStr] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editDebt) {
        setType(editDebt.type);
        setCounterparty(editDebt.counterparty);
        setPrincipalStr(String(toMajorUnits(editDebt.principalAmount)));
        setOutstandingStr(String(toMajorUnits(editDebt.outstandingBalance)));
        setInterestRate(String(editDebt.interestRate));
        setDueDate(editDebt.dueDate);
        setEmiStr(editDebt.emiAmount ? String(toMajorUnits(editDebt.emiAmount)) : '');
        setNotes(editDebt.notes || '');
      } else {
        setType(defaultType);
        setCounterparty('');
        setPrincipalStr('');
        setOutstandingStr('');
        setInterestRate(defaultType === 'borrowed' ? '8.5' : '0');
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        setDueDate(toLocalIsoDate(now));
        setEmiStr('');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, editDebt, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterparty.trim()) {
      setError('Please enter the lender/borrower name.');
      return;
    }
    const principalMinor = toMinorUnits(principalStr);
    const outstandingMinor = outstandingStr ? toMinorUnits(outstandingStr) : principalMinor;
    if (principalMinor <= 0) {
      setError('Please enter a valid principal amount.');
      return;
    }

    const emiMinor = emiStr ? toMinorUnits(emiStr) : undefined;
    const rateNum = parseFloat(interestRate) || 0;

    if (editDebt) {
      updateDebt(editDebt.id, {
        type,
        counterparty: counterparty.trim(),
        principalAmount: principalMinor,
        outstandingBalance: outstandingMinor,
        interestRate: rateNum,
        dueDate,
        emiAmount: emiMinor,
        notes: notes.trim(),
      });
    } else {
      addDebt({
        type,
        counterparty: counterparty.trim(),
        principalAmount: principalMinor,
        outstandingBalance: outstandingMinor,
        interestRate: rateNum,
        dueDate,
        emiAmount: emiMinor,
        notes: notes.trim(),
        isSettled: false,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editDebt ? 'Edit Debt / Loan' : 'Record Loan or Borrowing'}
      subtitle="Track liabilities, receivables, and EMI schedules"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('borrowed')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'borrowed'
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            I Borrowed (Liability)
          </button>
          <button
            type="button"
            onClick={() => setType('lent')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'lent'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            I Lent (Receivable Asset)
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {type === 'borrowed' ? 'Lender Name / Financial Institution' : 'Borrower / Friend Name'}
          </label>
          <input
            type="text"
            required
            placeholder={type === 'borrowed' ? 'e.g. SBI Home Loan or HDFC' : 'e.g. Rohan Verma'}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Principal Amount ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 500000"
              value={principalStr}
              onChange={(e) => {
                setPrincipalStr(e.target.value);
                if (!editDebt) setOutstandingStr(e.target.value);
              }}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Outstanding ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 450000"
              value={outstandingStr}
              onChange={(e) => setOutstandingStr(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Interest (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Next Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly EMI ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 15000"
              value={emiStr}
              onChange={(e) => setEmiStr(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Loan Terms
          </label>
          <input
            type="text"
            placeholder="e.g. 20-year term, loan account #4892"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
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
            {editDebt ? 'Update' : 'Record'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
