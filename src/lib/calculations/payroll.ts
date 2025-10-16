// Main payroll calculation engine
// This integrates all the individual calculation modules
import { 
  PayrollData, 
  EarningsLine, 
  PayrollCalculationResult,
  type TaxRates2025 as TaxRatesType
} from './types';
import { round2, parseNumericInput, getPeriodsPerYear } from './utils';
import { computeCPP, getCPPExemption } from './cpp';
import { computeEI } from './ei';
import { computeWSIB } from './wsib';
import { calculateVacation } from './vacation';
import { estimateIncomeTax } from './tax';
import { calculateEarningsYTD, type YTDData } from './ytd';

/**
 * 2025 Canadian tax rates and thresholds
 */
export const TaxRates2025: TaxRatesType = {
  cpp: {
    rate: 5.95,
    rate2: 4.00,
    exemption: 3500,
    ympe: 71300,
    yampe: 81200,
  },
  ei: {
    rate: 1.64,
    multiplier: 1.4,
    mie: 65700,
  },
  wsib: {
    rate: 2.15, // Default WSIB rate 2.15% (employer-specific, can be overridden)
    cap: 100000,
  },
};

/**
 * Calculate complete payroll for an employee
 * This is the main function that orchestrates all payroll calculations
 */
export function calculatePayroll(
  payrollData: PayrollData,
  earningsLines: EarningsLine[],
  ytdData: YTDData,
  taxRates: {
    cppRate?: number;
    cpp2Rate?: number;
    eiRate?: number;
    wsibRate?: number;
  } = {},
  payrollHistory: PayrollData[] = []
): PayrollCalculationResult {
  
  // Store original YTD vacation accrued for paystub display
  const originalYtdVacAccrued = ytdData.vacAccrued;
  
  // Use provided tax rates or defaults
  const cppRateVal = taxRates.cppRate ?? TaxRates2025.cpp.rate;
  const cpp2RateVal = taxRates.cpp2Rate ?? TaxRates2025.cpp.rate2;
  const eiRateVal = taxRates.eiRate ?? TaxRates2025.ei.rate;
  const wsibRateVal = taxRates.wsibRate ?? TaxRates2025.wsib.rate;
  
  // Calculate per-period CPP exemption
  const perExempt = getCPPExemption(payrollData.frequency);
  
  // Calculate earnings YTD values for this employee
  // Use the same employee identification logic as the main YTD calculation
  const employeeName = payrollData.employeeName;
  const earningsYTD = calculateEarningsYTD(
    employeeName,
    payrollHistory,
    new Date().getFullYear()
  );
  
  // First, ensure all earnings lines have calculated amounts
  const earningsWithAmounts = earningsLines.map(line => {
    let amount = line.amount;
    if ((!amount || amount === 0) && line.rate && line.hours) {
      amount = round2(line.rate * line.hours);
    }
    return { ...line, amount };
  });
  
  // Update earnings lines with YTD values (current YTD only, not historical)
  const earningsLinesWithYTD = earningsWithAmounts.map(line => {
    // For YTD, we want to show the total including this period
    // Historical YTD + current period = current YTD
    const historicalYtdHours = earningsYTD[line.code]?.ytdHours || 0;
    const historicalYtdAmount = earningsYTD[line.code]?.ytdAmount || 0;
    const currentHours = line.hours || 0;
    const currentAmount = line.amount || 0;
    
    const updatedLine = {
      ...line,
      ytdHours: historicalYtdHours + currentHours,
      ytdAmount: historicalYtdAmount + currentAmount
    };
    
    return updatedLine;
  });

  // Process earnings lines and calculate totals
  const { 
    processedLines, 
    gross, 
    pensionable, 
    insurable, 
    wsibAssessable,
    baseForVacation 
  } = processEarningsLines(earningsLinesWithYTD, payrollData.vacationMode);

  // Update the processed lines to ensure YTD values are preserved from earningsLinesWithYTD
  const finalProcessedLines = processedLines.map((processedLine, index) => ({
    ...processedLine,
    ytdHours: earningsLinesWithYTD[index].ytdHours,
    ytdAmount: earningsLinesWithYTD[index].ytdAmount
  }));
  
  // Calculate vacation (always accrue at specified rate)
  const vacationResult = calculateVacation(
    baseForVacation,
    payrollData.vacationRate,
    payrollData.vacationMode
  );
  
  // Add vacation to appropriate totals (only if paying, not if accruing)
  const finalGross = gross + vacationResult.vacAmountToAdd;
  const finalPensionable = pensionable + vacationResult.vacAmountToAdd;
  const finalInsurable = insurable + vacationResult.vacAmountToAdd;
  const finalWsibAssessable = wsibAssessable + vacationResult.vacAmountToAdd;
  
  // Calculate CPP contributions
  const cppResult = computeCPP(
    finalPensionable,
    ytdData.pensionable,
    ytdData.cpp1,
    ytdData.cpp2,
    cppRateVal,
    cpp2RateVal,
    perExempt,
    TaxRates2025.cpp.ympe,
    TaxRates2025.cpp.yampe
  );
  
  // Calculate EI contributions
  const eiResult = computeEI(
    finalInsurable,
    ytdData.insurable,
    ytdData.ei,
    eiRateVal,
    TaxRates2025.ei.multiplier,
    TaxRates2025.ei.mie
  );
  
  // Calculate WSIB premium
  const wsibResult = computeWSIB(
    finalWsibAssessable,
    ytdData.wsibAssessable,
    wsibRateVal,
    TaxRates2025.wsib.cap
  );
  
  // Calculate income tax
  const incomeTax = estimateIncomeTax(
    finalGross,
    payrollData.frequency,
    payrollData.federalTD1,
    payrollData.provincialTD1
  );
  
  // Calculate net pay
  const totalDeductions = incomeTax + cppResult.cpp1Emp + cppResult.cpp2Emp + eiResult.eiEmp;
  const netPay = round2(finalGross - totalDeductions);
  
  // Calculate new YTD values
  const newYtdGross = ytdData.gross + finalGross;
  const newYtdPensionable = ytdData.pensionable + finalPensionable;
  const newYtdInsurable = ytdData.insurable + finalInsurable;
  const newYtdWsib = ytdData.wsibAssessable + finalWsibAssessable;
  const newYtdTax = ytdData.tax + incomeTax;
  
  let newYtdVacPaid = ytdData.vacPaid;
  let newYtdVacAccrued = ytdData.vacAccrued;
  
  // Always accrue vacation based on non-vacation earnings
  newYtdVacAccrued += vacationResult.vacationAccrued;
  
  // Track VAC (Paid Vacation Hours) earnings as vacation paid
  const vacEarningsAmount = finalProcessedLines
    .filter(line => line.code === 'VAC')
    .reduce((total, line) => total + (line.amount || 0), 0);
  
  if (vacEarningsAmount > 0) {
    newYtdVacPaid += vacEarningsAmount;
  }
  
  return {
    // Employee and pay period info
    employeeName: payrollData.employeeName,
    payDate: payrollData.payDate,
    frequency: payrollData.frequency,
    payType: payrollData.payType,
    vacationMode: payrollData.vacationMode,
    
    // Earnings breakdown
    lines: finalProcessedLines,
    gross: finalGross,
    pensionable: finalPensionable,
    insurable: finalInsurable,
    wsibAssessable: finalWsibAssessable,
    
    // Deductions
    cpp1Emp: cppResult.cpp1Emp,
    cpp1Er: cppResult.cpp1Er,
    cpp2Emp: cppResult.cpp2Emp,
    cpp2Er: cppResult.cpp2Er,
    eiEmp: eiResult.eiEmp,
    eiEr: eiResult.eiEr,
    wsib: wsibResult.premium,
    tax: incomeTax,
    
    // Net pay and vacation
    net: netPay,
    vacAccrued: vacationResult.vacationAccrued,
    vacPaid: vacEarningsAmount, // Show VAC earnings as vacation paid this period
    
    // YTD values (before this period)
    ytdGross: ytdData.gross,
    ytdPensionable: ytdData.pensionable,
    ytdInsurable: ytdData.insurable,
    ytdWsib: ytdData.wsibAssessable,
    ytdWSIBPremium: ytdData.wsibPremium,
    ytdCPP1: ytdData.cpp1,
    ytdCPP2: ytdData.cpp2,
    ytdEI: ytdData.ei,
    ytdTax: ytdData.tax,
    ytdVacAccrued: ytdData.vacAccrued,
    ytdVacPaid: ytdData.vacPaid,
    
    // Original YTD vacation accrued (for paystub display)
    originalYtdVacAccrued,
    
    // New YTD values (after this period)
    newYtdGross,
    newYtdPensionable,
    newYtdInsurable,
    newYtdWsib: wsibResult.newYtdWSIB,
    newYtdCPP1: cppResult.newYtdCPP1,
    newYtdCPP2: cppResult.newYtdCPP2,
    newYtdEI: eiResult.newYtdEI,
    newYtdTax,
    newYtdVacPaid,
    newYtdVacAccrued,
    
    // Tax configuration
    federalTD1: payrollData.federalTD1,
    provincialTD1: payrollData.provincialTD1,
    cppRateVal,
    cpp2RateVal,
    cppExempt: TaxRates2025.cpp.exemption,
    ympe: TaxRates2025.cpp.ympe,
    yampe: TaxRates2025.cpp.yampe,
    eiRateVal,
    eiMult: TaxRates2025.ei.multiplier,
    mie: TaxRates2025.ei.mie,
    wsibRateVal,
    wsibCap: TaxRates2025.wsib.cap,
    vacationRate: payrollData.vacationRate,
  };
}

/**
 * Process earnings lines and calculate totals
 * Includes the fixed logic to prevent vacation accrual bug
 */
function processEarningsLines(
  lines: EarningsLine[],
  vacationMode: string
): {
  processedLines: EarningsLine[];
  gross: number;
  pensionable: number;
  insurable: number;
  wsibAssessable: number;
  baseForVacation: number;
} {
  let gross = 0;
  let pensionable = 0;
  let insurable = 0;
  let wsibAssessable = 0;
  let baseForVacation = 0;
  
  const processedLines = lines.map(line => {
    // Calculate amount if not provided but rate and hours are available
    let amount = line.amount;
    if ((!amount || amount === 0) && line.rate && line.hours) {
      amount = round2(line.rate * line.hours);
    }
    
    // VAC (Paid Vacation Hours) should always calculate normally
    // The amount will be included in gross and other totals
    
    const processedLine: EarningsLine = {
      ...line,
      amount,
      // Preserve YTD values that were calculated earlier
      ytdHours: line.ytdHours || 0,
      ytdAmount: line.ytdAmount || 0
    };
    
    // Determine what totals to include this line in
    const includeInGross = line.code !== 'BANKHRS';
    const includeInPensionable = line.code !== 'BANKHRS';
    const includeInInsurable = line.code !== 'BANKHRS';
    // VAC (Paid Vacation Hours) should NOT be included in vacation base calculation
    // as we don't want to accrue vacation on vacation pay
    const includeInVacationBase = line.code !== 'VAC' && line.code !== 'BANKHRS';
    
    // Add to totals (VAC is automatically excluded in accrual mode due to amount being 0)
    if (includeInGross) {
      gross += amount;
    }
    if (includeInPensionable) {
      pensionable += amount;
    }
    if (includeInInsurable) {
      insurable += amount;
    }
    if (includeInVacationBase) {
      baseForVacation += amount;
    }
    
    // WSIB assessable includes everything except VAC and BANKHRS
    if (line.code !== 'VAC' && line.code !== 'BANKHRS') {
      wsibAssessable += amount;
    }
    
    return processedLine;
  });
  
  return {
    processedLines,
    gross: round2(gross),
    pensionable: round2(pensionable),
    insurable: round2(insurable),
    wsibAssessable: round2(wsibAssessable),
    baseForVacation: round2(baseForVacation),
  };
}