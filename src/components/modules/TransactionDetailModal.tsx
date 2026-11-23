import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2, Edit3, Calendar, CreditCard, Tag } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/currency';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const { deleteTransaction, openTxModal, accounts, profile } = useFinance();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const fromAcc = accounts.find((a) => a.id === transaction.fromAccountId);
  const toAcc = transaction.toAccountId ? accounts.find((a) => a.id === transaction.toAccountId) : null;

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setShowConfirmDelete(false);
    onClose();
  };

  const handleEdit = () => {
    onClose();
    openTxModal(transaction.type, transaction);
  };

  return (
    <>
      <Modal
        isOpen={Boolean(transaction)}
        onClose={onClose}
        title="Transaction Details"
        subtitle={`Ref ID: ${transaction.id}`}
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Top Amount Banner */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                isIncome
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                  : isTransfer
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400'
              }`}
            >
              {isIncome ? (
                <ArrowDownLeft className="w-6 h-6" />
              ) : isTransfer ? (
                <ArrowLeftRight className="w-6 h-6" />
              ) : (
                <ArrowUpRight className="w-6 h-6" />
              )}
            </div>
            <div
              className={`text-3xl font-extrabold font-mono tabular-nums ${
                isIncome
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isTransfer
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isIncome ? '+' : isTransfer ? '' : '-'}
              {formatCurrency(transaction.amount, profile.currency)}
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 uppercase tracking-wide">
              {transaction.type}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.categoryName || (isTransfer ? 'Internal Transfer' : 'General')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                {isTransfer ? 'From Account' : 'Account'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{fromAcc?.name || 'Account'}</span>
            </div>

            {isTransfer && toAcc && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  To Account
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{toAcc.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date & Time
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatDate(transaction.date, profile.dateFormat)} {transaction.time || ''}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {transaction.paymentMethod.replace('_', ' ')}
              </span>
            </div>

            <div className="py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Description</span>
              <p className="text-slate-900 dark:text-white font-medium">{transaction.description}</p>
            </div>

            {transaction.notes && (
              <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Notes / Reference</span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-750">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Entry</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction? Your account balances and monthly reports will immediately recalculate."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
};
