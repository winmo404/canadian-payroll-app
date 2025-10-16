// Vacation pay calculations
import { round2 } from './utils';

/**
 * Calculate vacation pay or accrual based on mode
 * This includes the FIXED logic to prevent the vacation accrual bug
 * 
 * @param baseEarnings - Base earnings for vacation calculation (excludes vacation itself)
 * @param vacationRate - Vacation rate as percentage (e.g., 4 for 4%)
 * @param vacationMode - 'pay' to pay out vacation, 'accrue' to track as liability
 * @param currentVacAmount - Current amount entered in VAC line (if any)
 */
export interface VacationResult {
  vacationPaid: number;
  vacationAccrued: number;
  vacAmountToAdd: number; // Amount to add to gross (0 in accrual mode)
}

export function calculateVacation(
  baseEarnings: number,
  vacationRate: number,
  vacationMode: 'pay' | 'accrue',
  currentVacAmount: number = 0
): VacationResult {
  const vacationCalculated = round2(baseEarnings * (vacationRate / 100));
  
  if (vacationMode === 'pay') {
    // Pay vacation: use entered amount or calculated amount
    const vacationPaid = currentVacAmount > 0 ? currentVacAmount : vacationCalculated;
    
    return {
      vacationPaid,
      vacationAccrued: 0,
      vacAmountToAdd: vacationPaid, // Add to gross pay
    };
  } else {
    // Accrue vacation: track as liability, do NOT add to gross
    return {
      vacationPaid: 0,
      vacationAccrued: vacationCalculated,
      vacAmountToAdd: 0, // CRITICAL: Don't add to gross in accrual mode
    };
  }
}

/**
 * Calculate vacation entitlement based on years of service (Ontario standards)
 * This is for informational purposes - actual rates should be set by employer policy
 */
export function getVacationEntitlement(yearsOfService: number): {
  rate: number;
  weeks: number;
  description: string;
} {
  if (yearsOfService < 1) {
    return {
      rate: 4,
      weeks: 2,
      description: 'Less than 1 year: 4% or 2 weeks',
    };
  } else if (yearsOfService < 5) {
    return {
      rate: 4,
      weeks: 2,
      description: '1-4 years: 4% or 2 weeks',
    };
  } else {
    return {
      rate: 6,
      weeks: 3,
      description: '5+ years: 6% or 3 weeks',
    };
  }
}

/**
 * Validate vacation rate is within reasonable bounds
 */
export function validateVacationRate(rate: number): void {
  if (rate < 0 || rate > 15) {
    throw new Error('Vacation rate must be between 0% and 15%');
  }
}

/**
 * Calculate vacation hours based on hourly employees
 */
export function calculateVacationHours(
  regularHours: number,
  vacationRate: number
): number {
  return round2(regularHours * (vacationRate / 100));
}