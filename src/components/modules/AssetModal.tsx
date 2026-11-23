import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Asset, AssetCategory } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';
import { getTodayLocalIso } from '../../utils/calculations';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAsset?: Asset | null;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  editAsset,
}) => {
  const { addAsset, updateAsset, profile } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('real_estate');
  const [purchaseValueStr, setPurchaseValueStr] = useState('');
  const [currentValueStr, setCurrentValueStr] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editAsset) {
        setName(editAsset.name);
        setCategory(editAsset.category);
        setPurchaseValueStr(String(toMajorUnits(editAsset.purchaseValue)));
        setCurrentValueStr(String(toMajorUnits(editAsset.currentValue)));
        setPurchaseDate(editAsset.purchaseDate);
        setNotes(editAsset.notes || '');
      } else {
        setName('');
        setCategory('real_estate');
        setPurchaseValueStr('');
        setCurrentValueStr('');
        setPurchaseDate(getTodayLocalIso());
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, editAsset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter asset name.');
      return;
    }
    const purchaseMinor = toMinorUnits(purchaseValueStr);
    const currentMinor = currentValueStr ? toMinorUnits(currentValueStr) : purchaseMinor;
    if (purchaseMinor <= 0) {
      setError('Please enter a valid purchase value.');
      return;
    }

    if (editAsset) {
      updateAsset(editAsset.id, {
        name: name.trim(),
        category,
        purchaseValue: purchaseMinor,
        currentValue: currentMinor,
        purchaseDate,
        notes: notes.trim(),
      });
    } else {
      addAsset({
        name: name.trim(),
        category,
        purchaseValue: purchaseMinor,
        currentValue: currentMinor,
        purchaseDate,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editAsset ? 'Edit Capital Asset' : 'Add Capital Asset'}
      subtitle="Track physical, precious metal, and portfolio valuations"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Name</label>
          <input
            type="text"
            required
            placeholder="e.g. 2BHK Apartment, Sovereign Gold Bonds, Mutual Funds"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Class</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="real_estate">Real Estate & Property</option>
              <option value="mutual_funds">Mutual Funds & Equities</option>
              <option value="gold">Gold & Precious Metals</option>
              <option value="fixed_deposit">Fixed Deposits / Bonds</option>
              <option value="vehicle">Vehicles & Automobiles</option>
              <option value="crypto">Cryptocurrency / Digital</option>
              <option value="other">Other High-Value Asset</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Acquisition Date</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purchase Cost ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 5000000"
              value={purchaseValueStr}
              onChange={(e) => {
                setPurchaseValueStr(e.target.value);
                if (!editAsset) setCurrentValueStr(e.target.value);
              }}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Market Valuation ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 6200000"
              value={currentValueStr}
              onChange={(e) => setCurrentValueStr(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
          <input
            type="text"
            placeholder="e.g. Deed registered, current rental yield 3.8%"
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
            {editAsset ? 'Update Valuation' : 'Add Asset'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};
