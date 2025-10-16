// Income tax estimation for Canadian payroll
// This is a simplified estimator - for production use, consider CRA's official tax calculation tools
import { round2 } from './utils';

/**
 * Estimate federal and provincial income tax for Ontario (2025 tax year)
 * Uses Tax Credit Method - more accurate for payroll withholding
 * 
 * @param grossPay - Gross pay for the period
 * @param payFrequency - Pay frequency to annualize the amount
 * @param federalTD1 - Federal basic personal amount from TD1
 * @param provincialTD1 - Provincial basic personal amount from TD1
 */
export function estimateIncomeTax(
  grossPay: number,
  payFrequency: string,
  federalTD1: number,
  provincialTD1: number
): number {
  // Annualize the gross pay
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const annualizedGross = grossPay * periodsPerYear;
  
  // Calculate federal tax using Tax Credit Method
  const federalTax = calculateFederalTaxCredit(annualizedGross, federalTD1);
  
  // Calculate Ontario provincial tax using Tax Credit Method
  const provincialTax = calculateOntarioTaxCredit(annualizedGross, provincialTD1);
  
  // Convert back to per-period amount
  const totalAnnualTax = federalTax + provincialTax;
  const perPeriodTax = totalAnnualTax / periodsPerYear;
  
  return round2(Math.max(0, perPeriodTax));
}

/**
 * Calculate federal income tax using Tax Credit Method (2025)
 * More accurate for payroll withholding than progressive brackets
 */
function calculateFederalTaxCredit(annualIncome: number, basicPersonalAmount: number): number {
  // Federal tax rate for payroll withholding (2025)
  const federalRate = 0.145; // 14.5% - blended rate for withholding
  
  // Tax Credit Method: (Income × Rate) - (BPA × Rate)
  const taxOnIncome = annualIncome * federalRate;
  const federalTaxCredit = basicPersonalAmount * federalRate;
  const netTax = taxOnIncome - federalTaxCredit;
  
  return Math.max(0, netTax);
}

/**
 * Calculate Ontario provincial tax using Tax Credit Method (2025)
 * More accurate for payroll withholding than progressive brackets
 */
function calculateOntarioTaxCredit(annualIncome: number, basicPersonalAmount: number): number {
  // Ontario tax rate for payroll withholding (2025)
  const ontarioRate = 0.0505; // 5.05% - first bracket rate
  
  // Tax Credit Method: (Income × Rate) - (BPA × Rate)
  const taxOnIncome = annualIncome * ontarioRate;
  const provincialTaxCredit = basicPersonalAmount * ontarioRate;
  const netTax = taxOnIncome - provincialTaxCredit;
  
  return Math.max(0, netTax);
}

/**
 * Get the number of pay periods per year
 */
function getPeriodsPerYear(frequency: string): number {
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
      return 26; // Default to biweekly
  }
}

/**
 * Get default basic personal amounts for 2025
 */
export const BasicPersonalAmounts2025 = {
  federal: 16129,    // 2025 federal basic personal amount
  ontario: 12747,    // 2025 Ontario basic personal amount
} as const;

/**
 * Validate TD1 amounts are reasonable
 */
export function validateTD1Amounts(federal: number, provincial: number): void {
  if (federal < 0 || federal > 50000) {
    throw new Error('Federal TD1 amount must be between $0 and $50,000');
  }
  if (provincial < 0 || provincial > 50000) {
    throw new Error('Provincial TD1 amount must be between $0 and $50,000');
  }
}

/**
 * Estimate tax as a percentage of gross pay (for quick estimates)
 */
export function estimateTaxRate(
  annualSalary: number,
  federalTD1: number = BasicPersonalAmounts2025.federal,
  provincialTD1: number = BasicPersonalAmounts2025.ontario
): number {
  const federalTax = calculateFederalTaxCredit(annualSalary, federalTD1);
  const provincialTax = calculateOntarioTaxCredit(annualSalary, provincialTD1);
  const totalTax = federalTax + provincialTax;
  
  return annualSalary > 0 ? round2((totalTax / annualSalary) * 100) : 0;
}