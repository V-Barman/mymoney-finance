import React, { useEffect, useMemo, useState } from 'react';
import { Budget } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget | null;
  defaultCategoryId?: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editBudget,
  defaultCategoryId,
}) => {
  const { budgets, categories, addBudget, updateBudget, selectedMonth, profile } = useFinance();

  const [categoryId, setCategoryId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  useEffect(() => {
    if (isOpen) {
      if (editBudget) {
        setCategoryId(editBudget.categoryId);
        setAmountStr(String(toMajorUnits(editBudget.amount)));
        setAlertThreshold(String(Math.round((editBudget.alertThreshold || 0.8) * 100)));
      } else {
        setCategoryId(defaultCategoryId || expenseCategories[0]?.id || '');
        setAmountStr('');
        setAlertThreshold('80');
      }
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editBudget, defaultCategoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = toMinorUnits(amountStr);
    if (!amountStr || amountMinor <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    const matchedCat = categories.find((c) => c.id === categoryId);
    const thresholdFraction = Math.max(0.1, Math.min(1.0, (parseFloat(alertThreshold) || 80) / 100));

    if (editBudget) {
      updateBudget(editBudget.id, {
        categoryId,
        categoryName: matchedCat?.name || 'Category',
        amount: amountMinor,
        alertThreshold: thresholdFraction,
      });
    } else {
      const existing = budgets.find((b) => b.categoryId === categoryId);
      if (existing) {
        updateBudget(existing.id, {
          categoryName: matchedCat?.name || existing.categoryName,
          amount: amountMinor,
          month: selectedMonth,
          alertThreshold: thresholdFraction,
        });
      } else {
        addBudget({
          categoryId,
          categoryName: matchedCat?.name || 'Category',
          amount: amountMinor,
          month: selectedMonth,
          alertThreshold: thresholdFraction,
        });
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editBudget ? 'Adjust Budget Limit' : 'Set Category Budget'}
      subtitle={`Monthly limit for ${selectedMonth}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-rose-950/50 border border-red-200 dark:border-rose-900 text-red-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Expense Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={Boolean(editBudget)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
          >
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Monthly Spending Limit ({profile.currencySymbol})
          </label>
          <input
            type="number"
            step="any"
            required
            placeholder="e.g. 25000"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Alert Warning Threshold ({alertThreshold}%)
          </label>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            <span>50%</span>
            <span>80% (Recommended)</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {editBudget ? 'Update Limit' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
