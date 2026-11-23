import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types/finance';
import { CategoryModal } from './CategoryModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const CategoriesView: React.FC = () => {
  const { categories, deleteCategory, transactions } = useFinance();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const displayedCategories = categories.filter((c) => c.type === activeTab);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Categories Architecture</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classify and tag income sources and spending channels
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
          <span>New Category</span>
        </motion.button>
      </div>

      {/* Type Tabs */}
      <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('expense')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'expense'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Expense ({categories.filter((c) => c.type === 'expense').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('income')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Income ({categories.filter((c) => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCategories.map((cat, index) => {
          const usageCount = transactions.filter((t) => t.categoryId === cat.id).length;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{cat.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {usageCount} {usageCount === 1 ? 'transaction' : 'transactions'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleEdit(cat)}
                  title="Edit Category"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </motion.button>
                {!cat.isDefault && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setCategoryToDelete(cat)}
                    title="Delete Category"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        editCategory={editingCategory}
        defaultType={activeTab}
      />

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Delete Custom Category?"
        message={`Delete "${categoryToDelete?.name || ''}"? Past transactions keep their recorded label, and any linked category budget cap will be removed.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
          }
          setCategoryToDelete(null);
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
