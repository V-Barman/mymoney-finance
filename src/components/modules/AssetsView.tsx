import React, { useState } from 'react';
import {
  Gem,
  Plus,
  Home,
  TrendingUp,
  Coins,
  Car,
  FileText,
  Edit2,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFinance } from '../../context/FinanceContext';
import { Asset, AssetCategory } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/currency';
import { AssetModal } from './AssetModal';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const AssetsView: React.FC = () => {
  const { assets, deleteAsset, profile } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalPurchaseValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
  const totalGainLoss = totalCurrentValue - totalPurchaseValue;
  const totalRoi = totalPurchaseValue > 0 ? Math.round((totalGainLoss / totalPurchaseValue) * 100) : 0;

  const handleEdit = (a: Asset) => {
    setEditingAsset(a);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'real_estate':
        return Home;
      case 'gold':
        return Coins;
      case 'mutual_funds':
      case 'stocks':
        return TrendingUp;
      case 'vehicle':
        return Car;
      default:
        return Gem;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Assets & Capital Portfolio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physical holdings, mutual fund portfolios, real estate, and bullion
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
          <span>Add Asset</span>
        </motion.button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Asset Valuation</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedCounter value={totalCurrentValue} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{assets.length} registered capital holdings</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Gem className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Original Investment Cost</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-1">
              <AnimatedCounter value={totalPurchaseValue} currency={profile.currency} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Historical acquisition cost</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unrealized Capital Gain</span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                totalGainLoss >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <AnimatedCounter value={totalGainLoss} currency={profile.currency} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">
                +{totalRoi}% ROI
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Appreciation</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Assets Grid or Empty State */}
      {assets.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No capital holdings or assets added yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track mutual funds, gold, fixed deposits, real estate, or vehicles to calculate true Net Worth & ROI.
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Asset</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assets.map((asset, index) => {
          const Icon = getCategoryIcon(asset.category);
          const gainLoss = asset.currentValue - asset.purchaseValue;
          const roi =
            asset.purchaseValue > 0 ? Math.round((gainLoss / asset.purchaseValue) * 100) : 0;

          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{asset.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                        {asset.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleEdit(asset)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => deleteAsset(asset.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Current Valuation with AnimatedCounter */}
                <div className="mt-5">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Market Valuation</span>
                  <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-white mt-0.5">
                    <AnimatedCounter value={asset.currentValue} currency={profile.currency} />
                  </div>
                </div>

                {/* Gain / ROI and Purchase cost */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Acquisition Cost:</span>
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                      {formatCurrency(asset.purchaseValue, profile.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Capital Appreciation:</span>
                    <div className="flex items-center gap-1.5 font-mono tabular-nums font-bold">
                      <span className={gainLoss >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {gainLoss >= 0 ? '+' : ''}
                        {formatCurrency(gainLoss, profile.currency, { compact: true })}
                      </span>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                        ({roi >= 0 ? '+' : ''}
                        {roi}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes & Date footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Acquired: {formatDate(asset.purchaseDate, profile.dateFormat)}</span>
                {asset.notes && <span className="truncate max-w-[130px]">{asset.notes}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        editAsset={editingAsset}
      />
    </div>
  );
};
