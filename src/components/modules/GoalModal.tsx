import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SavingsGoal } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';
import { toLocalIsoDate } from '../../utils/calculations';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: SavingsGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editGoal }) => {
  const { addGoal, updateGoal, accounts, profile } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [color, setColor] = useState('#059669');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editGoal) {
        setTitle(editGoal.title);
        setTargetAmountStr(String(toMajorUnits(editGoal.targetAmount)));
        setTargetDate(editGoal.targetDate);
        setCategory(editGoal.category);
        setColor(editGoal.color);
        setLinkedAccountId(editGoal.linkedAccountId || '');
        setNotes(editGoal.notes || '');
      } else {
        setTitle('');
        setTargetAmountStr('');
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setTargetDate(toLocalIsoDate(nextYear));
        setCategory('Emergency Fund');
        setColor('#059669');
        const activeAcc = accounts.find((a) => !a.isArchived);
        setLinkedAccountId(activeAcc?.id || '');
        setNotes('');
      }
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editGoal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMinor = toMinorUnits(targetAmountStr);
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return;
    }
    if (!targetAmountStr || targetMinor <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target deadline.');
      return;
    }

    if (editGoal) {
      updateGoal(editGoal.id, {
        title: title.trim(),
        targetAmount: targetMinor,
        targetDate,
        category,
        color,
        linkedAccountId,
        notes: notes.trim(),
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: targetMinor,
        targetDate,
        category,
        icon: 'Target',
        color,
        linkedAccountId,
        notes: notes.trim(),
        isCompleted: false,
      });
    }

    onClose();
  };

  const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#e11d48', '#0d9488'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Define a measurable milestone and track contributions"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Dream House Downpayment, Japan Trip"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Amount ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 500000"
              value={targetAmountStr}
              onChange={(e) => setTargetAmountStr(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="Emergency Fund">Emergency Safety Net</option>
              <option value="Travel">Vacation & Travel</option>
              <option value="Vehicle">Vehicle Purchase</option>
              <option value="Housing">Home & Property</option>
              <option value="Gadgets">Electronics & Tech</option>
              <option value="Education">Education & Courses</option>
              <option value="Retirement">Long-Term Wealth</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Linked Vault / Account
            </label>
            <select
              value={linkedAccountId}
              onChange={(e) => setLinkedAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              {accounts
                .filter((a) => !a.isArchived || a.id === linkedAccountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Color Accent</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-600 dark:ring-offset-slate-900' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Strategy
          </label>
          <input
            type="text"
            placeholder="e.g. Deposit ₹15,000 monthly after salary"
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
            {editGoal ? 'Update Goal' : 'Save Goal'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
