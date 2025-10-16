// Utility functions for payroll calculations

/**
 * Round a number to 2 decimal places (currency precision)
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Format a number as Canadian currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA').format(d);
}

/**
 * Calculate the number of pay periods per year based on frequency
 */
export function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'semimonthly':
      return 24;
    case 'monthly':
      return 12;
    default:
      return 52; // Default to weekly
  }
}

/**
 * Validate that a numeric value is within expected range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}

/**
 * Parse a string to number, returning 0 if invalid
 */
export function parseNumericInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Check if a value is a valid positive number
 */
export function isValidPositiveNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= 0;
}

/**
 * Calculate percentage of a base amount
 */
export function calculatePercentage(base: number, rate: number): number {
  return round2(base * (rate / 100));
}