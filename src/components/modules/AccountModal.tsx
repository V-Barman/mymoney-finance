import React, { useEffect, useState } from 'react';
import { Account, AccountType } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { toMajorUnits, toMinorUnits } from '../../utils/currency';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  editAccount,
}) => {
  const { addAccount, updateAccount, profile } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('0');
  const [institution, setInstitution] = useState('');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [creditLimitStr, setCreditLimitStr] = useState('');
  const [color, setColor] = useState('#047857');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editAccount) {
        setName(editAccount.name);
        setType(editAccount.type);
        setOpeningBalanceStr(String(toMajorUnits(editAccount.openingBalance)));
        setInstitution(editAccount.institution || '');
        setAccountNumberMasked(editAccount.accountNumberMasked || '');
        setCreditLimitStr(editAccount.creditLimit ? String(toMajorUnits(editAccount.creditLimit)) : '');
        setColor(editAccount.color);
      } else {
        setName('');
        setType('bank');
        setOpeningBalanceStr('0');
        setInstitution('');
        setAccountNumberMasked('');
        setCreditLimitStr('');
        setColor('#047857');
      }
      setError(null);
    }
  }, [isOpen, editAccount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an account name.');
      return;
    }

    const openingBalanceMinor = toMinorUnits(openingBalanceStr || '0');
    const creditLimitMinor = creditLimitStr ? toMinorUnits(creditLimitStr) : undefined;

    if (editAccount) {
      updateAccount(editAccount.id, {
        name: name.trim(),
        type,
        openingBalance: openingBalanceMinor,
        institution: institution.trim(),
        accountNumberMasked: accountNumberMasked.trim(),
        creditLimit: creditLimitMinor,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        openingBalance: openingBalanceMinor,
        currency: profile.currency,
        institution: institution.trim(),
        accountNumberMasked: accountNumberMasked.trim(),
        creditLimit: creditLimitMinor,
        color,
      });
    }

    onClose();
  };

  const accountColors = [
    '#047857', // Emerald
    '#059669', // Emerald light
    '#0d9488', // Teal
    '#0284c7', // Sky
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#d97706', // Amber
    '#dc2626', // Red
    '#1e293b', // Slate
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editAccount ? 'Edit Account' : 'Add Financial Account'}
      subtitle="Connect or create an isolated financial wallet"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/50 border border-red-200 dark:border-rose-900 text-xs text-red-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
          <input
            type="text"
            required
            placeholder="e.g. HDFC Salary, Emergency Cash, Paytm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="bank" className="dark:bg-slate-800">Bank Checking / Salary</option>
              <option value="savings" className="dark:bg-slate-800">High Yield Savings</option>
              <option value="wallet" className="dark:bg-slate-800">Digital UPI Wallet</option>
              <option value="cash" className="dark:bg-slate-800">Cash In Hand</option>
              <option value="credit_card" className="dark:bg-slate-800">Credit Card</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Institution / Provider
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank, ICICI, Paytm"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Opening Balance ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={openingBalanceStr}
              onChange={(e) => setOpeningBalanceStr(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">For Credit Cards, enter negative for existing bill</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Masked Card / A/C #
            </label>
            <input
              type="text"
              placeholder="e.g. •••• 4821 or UPI ID"
              value={accountNumberMasked}
              onChange={(e) => setAccountNumberMasked(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {type === 'credit_card' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Credit Limit ({profile.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 200000"
              value={creditLimitStr}
              onChange={(e) => setCreditLimitStr(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        )}

        {/* Color Palette Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Card Accent Color
          </label>
          <div className="flex items-center gap-2">
            {accountColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-600' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            {editAccount ? 'Update Account' : 'Save Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
