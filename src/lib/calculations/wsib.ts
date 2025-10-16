// WSIB (Workplace Safety and Insurance Board) calculations
import { WSIBResult } from './types';
import { round2 } from './utils';

/**
 * Calculate WSIB premiums for current pay period
 * WSIB rates are set by the employer and vary by industry
 * 
 * @param currentAssessable - Assessable earnings for this pay period
 * @param ytdAssessable - Year-to-date assessable earnings before this period
 * @param wsibRate - WSIB rate as percentage (employer-specific)
 * @param wsibCap - Annual maximum assessable earnings ($100,000 default)
 */
export function computeWSIB(
  currentAssessable: number,
  ytdAssessable: number,
  wsibRate: number,
  wsibCap: number = 100000
): WSIBResult {
  const rate = wsibRate / 100;
  let assessableThis = 0;
  let premium = 0;

  // Check if we haven't exceeded the annual cap
  if (ytdAssessable < wsibCap) {
    const remaining = wsibCap - ytdAssessable;
    assessableThis = Math.min(currentAssessable, remaining);
    
    if (assessableThis > 0) {
      premium = round2(assessableThis * rate);
    }
  }

  // Calculate new YTD assessable amount
  const newYtdWSIB = ytdAssessable + assessableThis;

  return {
    premium,
    assessableThis,
    newYtdWSIB,
  };
}

/**
 * Common WSIB rates by industry (for reference only)
 * Actual rates should be obtained from WSIB and may vary
 */
export const WSIBRatesByIndustry = {
  // These are example rates - use actual WSIB rates for your industry
  office: 0.17,           // Office and clerical workers
  retail: 0.35,           // Retail trade
  restaurants: 0.84,      // Restaurants and food service
  construction: 2.5,      // Construction (varies significantly)
  manufacturing: 1.2,     // Manufacturing (varies by type)
  healthcare: 0.6,        // Healthcare services
  education: 0.2,         // Educational services
  transport: 1.8,         // Transportation
} as const;

/**
 * Validate WSIB rate is within reasonable bounds
 */
export function validateWSIBRate(rate: number): void {
  if (rate < 0 || rate > 10) {
    throw new Error('WSIB rate must be between 0% and 10%');
  }
}

/**
 * Calculate annual maximum WSIB premium based on rate and cap
 */
export function getMaxWSIBPremium(wsibRate: number, wsibCap: number = 100000): number {
  return round2(wsibCap * (wsibRate / 100));
}

/**
 * Check if WSIB assessable earnings have reached the annual cap
 */
export function hasReachedWSIBCap(ytdAssessable: number, wsibCap: number = 100000): boolean {
  return ytdAssessable >= wsibCap;
}