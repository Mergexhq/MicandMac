// src/utils/money.ts — Indian Rupee formatting

export function formatMoney(cents: number, symbol = '₹'): string {
  const amount = cents / 100;
  return symbol + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyWithCurrency(cents: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function getSavingsPercent(price: number, compareAtPrice: number): number {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
