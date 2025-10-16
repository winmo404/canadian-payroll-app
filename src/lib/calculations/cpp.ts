// CPP (Canada Pension Plan) calculations for 2025
import { CPPResult } from './types';
import { round2 } from './utils';

/**
 * Calculate CPP contributions for current pay period
 * Based on your existing logic with 2025 rates and thresholds
 * 
 * @param currentPensionable - Pensionable earnings for this pay period
 * @param ytdPensionable - Year-to-date pensionable earnings before this period
 * @param ytdCPP1 - Year-to-date CPP Tier 1 contributions before this period
 * @param ytdCPP2 - Year-to-date CPP Tier 2 contributions before this period
 * @param cppRate - CPP Tier 1 rate (5.95% for 2025)
 * @param cpp2Rate - CPP Tier 2 rate (4.00% for 2025)
 * @param perExempt - Per-period basic exemption (annual $3,500 / periods per year)
 * @param ympe - Yearly Maximum Pensionable Earnings ($71,300 for 2025)
 * @param yampe - Year's Additional Maximum Pensionable Earnings ($81,200 for 2025)
 */
export function computeCPP(
  currentPensionable: number,
  ytdPensionable: number,
  ytdCPP1: number,
  ytdCPP2: number,
  cppRate: number,
  cpp2Rate: number,
  perExempt: number,
  ympe: number,
  yampe: number
): CPPResult {
  const rate1 = cppRate / 100;
  const rate2 = cpp2Rate / 100;
  
  let pensionable1This = 0;
  let pensionable2This = 0;
  let cpp1Emp = 0;
  let cpp2Emp = 0;

  // Calculate CPP Tier 1 (up to YMPE)
  if (ytdPensionable < ympe) {
    const remaining1 = ympe - ytdPensionable;
    pensionable1This = Math.min(currentPensionable, remaining1);
    
    // Apply per-period exemption to Tier 1 only
    if (pensionable1This > perExempt) {
      const subject1 = pensionable1This - perExempt;
      cpp1Emp = round2(subject1 * rate1);
    }
  }

  // Calculate CPP Tier 2 (between YMPE and YAMPE)
  const totalAfterTier1 = ytdPensionable + pensionable1This;
  if (totalAfterTier1 > ympe && yampe > ympe) {
    const remainingPensionable = currentPensionable - pensionable1This;
    if (remainingPensionable > 0) {
      const remaining2 = yampe - totalAfterTier1;
      pensionable2This = Math.min(remainingPensionable, remaining2);
      
      if (pensionable2This > 0) {
        cpp2Emp = round2(pensionable2This * rate2);
      }
    }
  }

  // Employer contributions match employee contributions
  const cpp1Er = cpp1Emp;
  const cpp2Er = cpp2Emp;

  // Calculate new YTD values
  const newYtdCPP1 = ytdCPP1 + cpp1Emp;
  const newYtdCPP2 = ytdCPP2 + cpp2Emp;

  return {
    cpp1Emp,
    cpp1Er,
    cpp2Emp,
    cpp2Er,
    pensionable1This,
    pensionable2This,
    newYtdCPP1,
    newYtdCPP2,
  };
}

/**
 * Get the CPP basic exemption amount for a specific pay frequency
 */
export function getCPPExemption(frequency: string): number {
  const annualExemption = 3500; // 2025 CPP basic exemption
  
  switch (frequency) {
    case 'weekly':
      return round2(annualExemption / 52);
    case 'biweekly':
      return round2(annualExemption / 26);
    case 'semimonthly':
      return round2(annualExemption / 24);
    case 'monthly':
      return round2(annualExemption / 12);
    default:
      return round2(annualExemption / 52); // Default to weekly
  }
}

/**
 * Calculate maximum annual CPP contributions for 2025
 */
export function getMaxCPPContributions(): { tier1: number; tier2: number; total: number } {
  const exemption = 3500;
  const ympe = 71300;
  const yampe = 81200;
  const rate1 = 0.0595;
  const rate2 = 0.04;
  
  const maxTier1 = (ympe - exemption) * rate1;
  const maxTier2 = (yampe - ympe) * rate2;
  const total = maxTier1 + maxTier2;
  
  return {
    tier1: round2(maxTier1),
    tier2: round2(maxTier2),
    total: round2(total),
  };
}