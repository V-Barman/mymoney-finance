/**
 * Currency and exact integer minor-unit (paise/cents) math utilities
 */

export const SUPPORTED_CURRENCIES: Record<string, { symbol: string; name: string; locale: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  USD: { symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar (SGD)', locale: 'en-SG' },
};

/**
 * Convert user decimal input (e.g. 1500.50) to integer minor units (e.g. 150050)
 */
export function toMinorUnits(majorAmount: number | string): number {
  if (typeof majorAmount === 'string') {
    const cleanStr = majorAmount.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanStr);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }
  if (isNaN(majorAmount)) return 0;
  return Math.round(majorAmount * 100);
}

/**
 * Convert integer minor units (e.g. 150050) to major amount decimal (e.g. 1500.5)
 */
export function toMajorUnits(minorAmount: number): number {
  if (isNaN(minorAmount)) return 0;
  return minorAmount / 100;
}

/**
 * Format minor units into human-readable formatted currency string
 * e.g. 15000000 -> ₹1,50,000.00
 */
export function formatCurrency(
  minorUnits: number,
  currencyCode = 'INR',
  options: { compact?: boolean; hideDecimals?: boolean; showSign?: boolean } = {}
): string {
  const meta = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  const major = toMajorUnits(minorUnits);
  const isNegative = major < 0;
  const absMajor = Math.abs(major);

  if (options.compact && absMajor >= 100000) {
    if (currencyCode === 'INR') {
      if (absMajor >= 10000000) {
        return `${isNegative ? '-' : ''}${meta.symbol}${(absMajor / 10000000).toFixed(2)} Cr`;
      }
      return `${isNegative ? '-' : ''}${meta.symbol}${(absMajor / 100000).toFixed(2)} L`;
    } else {
      if (absMajor >= 1000000) {
        return `${isNegative ? '-' : ''}${meta.symbol}${(absMajor / 1000000).toFixed(1)}M`;
      }
      if (absMajor >= 1000) {
        return `${isNegative ? '-' : ''}${meta.symbol}${(absMajor / 1000).toFixed(1)}k`;
      }
    }
  }

  const fractionDigits = options.hideDecimals ? 0 : 2;
  const formattedNumber = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(absMajor);

  let signPrefix = '';
  if (isNegative) {
    signPrefix = '-';
  } else if (options.showSign && minorUnits > 0) {
    signPrefix = '+';
  }

  return `${signPrefix}${meta.symbol}${formattedNumber}`;
}

export function formatDate(dateStr: string, format = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  if (!year || !month || !day) return dateStr;

  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${year}-${month}-${day}`;
}
