import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Category } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: Category | null;
  defaultType?: 'income' | 'expense';
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  editCategory,
  defaultType = 'expense',
}) => {
  const { categories, addCategory, updateCategory } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [color, setColor] = useState('#059669');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setName(editCategory.name);
        setType(editCategory.type);
        setColor(editCategory.color);
      } else {
        setName('');
        setType(defaultType);
        setColor('#059669');
      }
      setError(null);
    }
  }, [isOpen, editCategory, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name.');
      return;
    }

    const duplicate = categories.some(
      (c) =>
        c.type === type &&
        c.name.trim().toLowerCase() === trimmed.toLowerCase() &&
        c.id !== editCategory?.id
    );
    if (duplicate) {
      setError(`A ${type} category named "${trimmed}" already exists.`);
      return;
    }

    if (editCategory) {
      updateCategory(editCategory.id, {
        name: trimmed,
        type,
        color,
      });
    } else {
      addCategory({
        name: trimmed,
        type,
        color,
        icon: 'Tag',
        isDefault: false,
      });
    }

    onClose();
  };

  const colors = [
    '#059669', // Emerald
    '#047857', // Deep Emerald
    '#0d9488', // Teal
    '#0284c7', // Sky
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#e11d48', // Rose
    '#ea580c', // Orange
    '#d97706', // Amber
    '#475569', // Slate
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editCategory ? 'Edit Category' : 'Create Category'}
      subtitle="Organize your cashflow and budget items"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Type</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Pet Care, Software Tools, Gym"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Color Accent</label>
          <div className="flex flex-wrap gap-2">
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
            {editCategory ? 'Update' : 'Create'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
