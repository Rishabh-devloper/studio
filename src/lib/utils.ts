// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as Indian Rupees (₹)
 * Examples:
 * - 1000 → ₹1,000.00
 * - 150000 → ₹1,50,000.00
 * - 5000000 → ₹50,00,000.00
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as compact Indian Rupees
 * Examples:
 * - 1000 → ₹1K
 * - 150000 → ₹1.5L
 * - 5000000 → ₹50L
 */
export function formatCurrencyCompact(amount: number) {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return formatCurrency(amount);
}