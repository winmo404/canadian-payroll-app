/**
 * Tax Calculation Comparison Tool
 * This helps debug and understand income tax calculations
 */

import { estimateIncomeTax, BasicPersonalAmounts2025, estimateTaxRate } from './tax'

export interface TaxBreakdown {
  grossPay: number
  annualizedGross: number
  federalTD1: number
  provincialTD1: number
  federalTaxableIncome: number
  provincialTaxableIncome: number
  federalTaxAnnual: number
  provincialTaxAnnual: number
  totalTaxAnnual: number
  taxPerPeriod: number
  effectiveTaxRate: number
}

/**
 * Get detailed tax calculation breakdown
 */
export function getTaxBreakdown(
  grossPay: number,
  payFrequency: string,
  federalTD1: number,
  provincialTD1: number
): TaxBreakdown {
  const periodsPerYear = getPeriodsPerYear(payFrequency)
  const annualizedGross = grossPay * periodsPerYear
  
  // Federal calculation
  const federalTaxableIncome = Math.max(0, annualizedGross - federalTD1)
  const federalTaxAnnual = calculateFederalTax(annualizedGross, federalTD1)
  
  // Provincial calculation  
  const provincialTaxableIncome = Math.max(0, annualizedGross - provincialTD1)
  const provincialTaxAnnual = calculateOntarioTax(annualizedGross, provincialTD1)
  
  const totalTaxAnnual = federalTaxAnnual + provincialTaxAnnual
  const taxPerPeriod = totalTaxAnnual / periodsPerYear
  const effectiveTaxRate = annualizedGross > 0 ? (totalTaxAnnual / annualizedGross) * 100 : 0
  
  return {
    grossPay,
    annualizedGross,
    federalTD1,
    provincialTD1,
    federalTaxableIncome,
    provincialTaxableIncome,
    federalTaxAnnual,
    provincialTaxAnnual,
    totalTaxAnnual,
    taxPerPeriod,
    effectiveTaxRate
  }
}

/**
 * Compare tax calculations with different TD1 amounts
 */
export function compareTaxScenarios(
  grossPay: number,
  payFrequency: string
) {
  const scenarios = [
    {
      name: "2025 TD1 (Updated)",
      federalTD1: BasicPersonalAmounts2025.federal, // 16129
      provincialTD1: BasicPersonalAmounts2025.ontario // 12747
    },
    {
      name: "2024 TD1 (Previous)",
      federalTD1: 15705, // 2024 amount
      provincialTD1: 11865 // 2024 amount  
    },
    {
      name: "Zero TD1 (Maximum Tax)",
      federalTD1: 0,
      provincialTD1: 0
    }
  ]
  
  return scenarios.map(scenario => ({
    ...scenario,
    breakdown: getTaxBreakdown(grossPay, payFrequency, scenario.federalTD1, scenario.provincialTD1)
  }))
}

// Helper functions (duplicated from tax.ts for this analysis)
function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly': return 52
    case 'biweekly': return 26  
    case 'semimonthly': return 24
    case 'monthly': return 12
    default: return 26
  }
}

function calculateFederalTax(annualIncome: number, basicPersonalAmount: number): number {
  // Use Tax Credit Method for consistency
  const federalRate = 0.145 // 14.5% for payroll withholding
  const taxOnIncome = annualIncome * federalRate
  const federalTaxCredit = basicPersonalAmount * federalRate
  return Math.max(0, taxOnIncome - federalTaxCredit)
}

function calculateOntarioTax(annualIncome: number, basicPersonalAmount: number): number {
  // Use Tax Credit Method for consistency
  const ontarioRate = 0.0505 // 5.05% for payroll withholding
  const taxOnIncome = annualIncome * ontarioRate
  const provincialTaxCredit = basicPersonalAmount * ontarioRate
  return Math.max(0, taxOnIncome - provincialTaxCredit)
}