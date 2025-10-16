// EI (Employment Insurance) calculations for 2025
import { EIResult } from './types';
import { round2 } from './utils';

/**
 * Calculate EI contributions for current pay period
 * Based on your existing logic with 2025 rates and thresholds
 * 
 * @param currentInsurable - Insurable earnings for this pay period
 * @param ytdInsurable - Year-to-date insurable earnings before this period
 * @param ytdEI - Year-to-date EI contributions before this period
 * @param eiRate - EI employee rate (1.64% for 2025)
 * @param eiMult - EI employer multiplier (1.4 for 2025)
 * @param mie - Maximum Insurable Earnings ($65,700 for 2025)
 */
export function computeEI(
  currentInsurable: number,
  ytdInsurable: number,
  ytdEI: number,
  eiRate: number,
  eiMult: number,
  mie: number
): EIResult {
  const rate = eiRate / 100;
  let insurableThis = 0;
  let eiEmp = 0;

  // Check if we haven't exceeded the Maximum Insurable Earnings
  if (ytdInsurable < mie) {
    const remaining = mie - ytdInsurable;
    insurableThis = Math.min(currentInsurable, remaining);
    
    if (insurableThis > 0) {
      eiEmp = round2(insurableThis * rate);
    }
  }

  // Employer pays 1.4 times the employee rate
  const eiEr = round2(eiEmp * eiMult);

  // Calculate new YTD EI
  const newYtdEI = ytdEI + eiEmp;

  return {
    eiEmp,
    eiEr,
    insurableThis,
    newYtdEI,
  };
}

/**
 * Get maximum annual EI contributions for 2025
 */
export function getMaxEIContributions(): { employee: number; employer: number } {
  const mie = 65700; // 2025 Maximum Insurable Earnings
  const rate = 0.0164; // 2025 EI rate
  const multiplier = 1.4; // Employer multiplier
  
  const employee = round2(mie * rate);
  const employer = round2(employee * multiplier);
  
  return { employee, employer };
}

/**
 * Check if EI contributions have reached the annual maximum
 */
export function hasReachedEIMax(ytdEI: number): boolean {
  const maxContribution = getMaxEIContributions().employee;
  return ytdEI >= maxContribution;
}

/**
 * Calculate remaining EI contribution room for the year
 */
export function getRemainingEIRoom(ytdEI: number): number {
  const maxContribution = getMaxEIContributions().employee;
  return Math.max(0, maxContribution - ytdEI);
}