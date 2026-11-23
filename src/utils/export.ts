import { Account, Transaction } from '../types/finance';
import { formatCurrency, formatDate, toMajorUnits } from './currency';
import { getTodayLocalIso } from './calculations';

/**
 * Downloads a text/csv/json file directly in the browser or native Android APK
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const bridge = (window as unknown as {
    AndroidBridge?: { saveFile?: (name: string, mime: string, data: string) => void };
  }).AndroidBridge;

  if (bridge && typeof bridge.saveFile === 'function') {
    bridge.saveFile(filename, mimeType, content);
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports transactions to standard or Excel-compatible CSV
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  accountsMap: Map<string, string>,
  currency = 'INR',
  isExcel = true
) {
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Category',
    'Account / From',
    'To Account',
    'Payment Method',
    'Amount (Major Units)',
    'Amount (Formatted)',
    'Description',
    'Notes',
  ];

  const rows = transactions.map((t) => {
    const fromAcc = accountsMap.get(t.fromAccountId) || t.fromAccountId;
    const toAcc = t.toAccountId ? accountsMap.get(t.toAccountId) || t.toAccountId : '-';
    const majorAmount = toMajorUnits(t.amount);
    const formatted = formatCurrency(t.amount, currency);

    return [
      `"${t.id}"`,
      `"${formatDate(t.date)}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.categoryName || '-'}"`,
      `"${fromAcc}"`,
      `"${toAcc}"`,
      `"${t.paymentMethod}"`,
      majorAmount.toFixed(2),
      `"${formatted}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvBody = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  // Prepend UTF-8 BOM (\uFEFF) for seamless Microsoft Excel compatibility
  const finalContent = isExcel ? '\uFEFF' + csvBody : csvBody;
  const filename = `MyMoney_Transactions_${getTodayLocalIso()}.csv`;

  downloadFile(finalContent, filename);
}

/**
 * Exports account summary to CSV
 */
export function exportAccountsToCSV(accounts: Account[], currency = 'INR') {
  const headers = [
    'Account ID',
    'Account Name',
    'Type',
    'Institution',
    'Current Balance (Major)',
    'Current Balance (Formatted)',
    'Credit Limit',
    'Status',
  ];

  const rows = accounts.map((a) => {
    const major = toMajorUnits(a.currentBalance);
    const formatted = formatCurrency(a.currentBalance, currency);
    const limit = a.creditLimit ? formatCurrency(a.creditLimit, currency) : '-';
    const status = a.isArchived ? 'Archived' : 'Active';

    return [
      `"${a.id}"`,
      `"${a.name}"`,
      `"${a.type.toUpperCase()}"`,
      `"${a.institution || '-'}"`,
      major.toFixed(2),
      `"${formatted}"`,
      `"${limit}"`,
      `"${status}"`,
    ];
  });

  const csvBody = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const filename = `MyMoney_Accounts_${getTodayLocalIso()}.csv`;
  downloadFile('\uFEFF' + csvBody, filename);
}
