/**
 * YTD (Year-to-Date) calculation utilities
 * Calculates accurate YTD values per employee from payroll history
 */

import { PayrollData, EarningsLine } from './types'

export interface YTDData {
  gross: number
  pensionable: number
  insurable: number
  wsibAssessable: number
  wsibPremium: number
  cpp1: number
  cpp2: number
  ei: number
  tax: number
  vacAccrued: number
  vacPaid: number
}

/**
 * Calculate YTD values for earnings lines for a specific employee
 */
export function calculateEarningsYTD(
  employeeName: string,
  payrollHistory: PayrollData[],
  currentYear: number = new Date().getFullYear()
): { [earningsCode: string]: { ytdHours: number; ytdAmount: number } } {
  const earningsYTD: { [earningsCode: string]: { ytdHours: number; ytdAmount: number } } = {}
  
  // Filter payroll history for this specific employee and current year
  const employeePayrolls = payrollHistory.filter(payroll => {
    const payrollEmployeeName = payroll.employeeName || payroll.calculations?.employeeName
    const payDate = payroll.payDate || payroll.calculations?.payDate
    
    if (!payrollEmployeeName || !payDate) return false
    
    const isSameEmployee = payrollEmployeeName.toLowerCase().trim() === employeeName.toLowerCase().trim()
    const payrollYear = new Date(payDate).getFullYear()
    const isCurrentYear = payrollYear === currentYear
    
    return isSameEmployee && isCurrentYear && payroll.calculations
  })
  
  // Sort payroll records by date chronologically (earliest first)
  .sort((a, b) => {
    const dateA = new Date(a.payDate || a.calculations?.payDate || '')
    const dateB = new Date(b.payDate || b.calculations?.payDate || '')
    return dateA.getTime() - dateB.getTime()
  })

  // Sum up earnings by code from this employee's payroll runs
  employeePayrolls.forEach(payroll => {
    if (payroll.calculations?.lines) {
      payroll.calculations.lines.forEach(line => {
        if (!earningsYTD[line.code]) {
          earningsYTD[line.code] = { ytdHours: 0, ytdAmount: 0 }
        }
        earningsYTD[line.code].ytdHours += line.hours || 0
        earningsYTD[line.code].ytdAmount += line.amount || 0
      })
    }
  })

  return earningsYTD
}

/**
 * Calculate YTD values for a specific employee from payroll history
 * Only includes payroll runs for the same employee in the current calendar year
 */
export function calculateEmployeeYTD(
  employeeName: string, 
  payrollHistory: PayrollData[],
  currentYear: number = new Date().getFullYear()
): YTDData {
  
  const ytdData: YTDData = {
    gross: 0,
    pensionable: 0,
    insurable: 0,
    wsibAssessable: 0,
    wsibPremium: 0,
    cpp1: 0,
    cpp2: 0,
    ei: 0,
    tax: 0,
    vacAccrued: 0,
    vacPaid: 0
  }

  // Filter payroll history for this specific employee and current year
  const employeePayrolls = payrollHistory.filter(payroll => {
    const payrollEmployeeName = payroll.employeeName || payroll.calculations?.employeeName
    const payDate = payroll.payDate || payroll.calculations?.payDate
    
    if (!payrollEmployeeName || !payDate) return false
    
    // Check if it's the same employee (case-insensitive)
    const isSameEmployee = payrollEmployeeName.toLowerCase().trim() === employeeName.toLowerCase().trim()
    
    // Check if it's from the current calendar year
    const payrollYear = new Date(payDate).getFullYear()
    const isCurrentYear = payrollYear === currentYear
    
    return isSameEmployee && isCurrentYear && payroll.calculations
  })
  
  // Sort payroll records by date chronologically (earliest first)
  .sort((a, b) => {
    const dateA = new Date(a.payDate || a.calculations?.payDate || '')
    const dateB = new Date(b.payDate || b.calculations?.payDate || '')
    return dateA.getTime() - dateB.getTime()
  })

  // Sum up all the values from this employee's payroll runs (now in chronological order)
  employeePayrolls.forEach(payroll => {
    if (payroll.calculations) {
      const calc = payroll.calculations
      
      ytdData.gross += calc.gross || 0
      ytdData.pensionable += calc.pensionable || 0
      ytdData.insurable += calc.insurable || 0
      ytdData.wsibAssessable += calc.wsibAssessable || 0
      ytdData.wsibPremium += calc.wsib || 0
      ytdData.cpp1 += calc.cpp1Emp || 0
      ytdData.cpp2 += calc.cpp2Emp || 0
      ytdData.ei += calc.eiEmp || 0
      ytdData.tax += calc.tax || 0
      ytdData.vacAccrued += calc.vacAccrued || 0
      ytdData.vacPaid += calc.vacPaid || 0
    }
  })

  return ytdData
}

/**
 * Get summary of payroll runs for an employee in current year
 */
export function getEmployeePayrollSummary(
  employeeName: string,
  payrollHistory: PayrollData[],
  currentYear: number = new Date().getFullYear()
) {
  const employeePayrolls = payrollHistory.filter(payroll => {
    const payrollEmployeeName = payroll.employeeName || payroll.calculations?.employeeName
    const payDate = payroll.payDate || payroll.calculations?.payDate
    
    if (!payrollEmployeeName || !payDate) return false
    
    const isSameEmployee = payrollEmployeeName.toLowerCase().trim() === employeeName.toLowerCase().trim()
    const payrollYear = new Date(payDate).getFullYear()
    const isCurrentYear = payrollYear === currentYear
    
    return isSameEmployee && isCurrentYear && payroll.calculations
  })
  
  // Sort payroll records by date chronologically (earliest first)
  .sort((a, b) => {
    const dateA = new Date(a.payDate || a.calculations?.payDate || '')
    const dateB = new Date(b.payDate || b.calculations?.payDate || '')
    return dateA.getTime() - dateB.getTime()
  })

  return {
    totalRuns: employeePayrolls.length,
    payrolls: employeePayrolls,
    dateRange: employeePayrolls.length > 0 ? {
      earliest: employeePayrolls.reduce((earliest, p) => {
        const date = p.payDate || p.calculations?.payDate
        return date && date < earliest ? date : earliest
      }, employeePayrolls[0].payDate || employeePayrolls[0].calculations?.payDate || ''),
      latest: employeePayrolls.reduce((latest, p) => {
        const date = p.payDate || p.calculations?.payDate
        return date && date > latest ? date : latest
      }, '')
    } : null
  }
}

/**
 * Round to 2 decimal places for currency values
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}