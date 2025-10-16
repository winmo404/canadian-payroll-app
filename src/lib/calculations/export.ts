import { PayrollData } from './types'

export interface PayrollExportData {
  runDate: string
  employeeName: string
  payPeriod: string
  payDate: string
  
  // Earnings
  grossPay: number
  regularHours: number
  overtimeHours: number
  regularPay: number
  overtimePay: number
  
  // Deductions
  cpp1Employee: number
  cpp1Employer: number
  cpp2Employee: number
  cpp2Employer: number
  eiEmployee: number
  eiEmployer: number
  incomeTax: number
  wsib: number
  
  // Vacation
  vacationAccrued: number
  vacationPaid: number
  vacationRate: number
  
  // Net pay
  totalDeductions: number
  netPay: number
  
  // YTD totals
  ytdGross: number
  ytdCPP1: number
  ytdCPP2: number
  ytdEI: number
  ytdTax: number
  ytdVacationAccrued: number
  ytdVacationPaid: number
  
  // Tax configuration
  federalTD1: number
  provincialTD1: number
}

/**
 * Convert payroll data to export format
 */
export function preparePayrollExportData(payrollData: PayrollData): PayrollExportData | null {
  if (!payrollData.calculations) return null
  
  const calc = payrollData.calculations
  
  // Find regular and overtime earnings
  const regularEarning = calc.lines.find(line => line.code === 'REG')
  const overtimeEarning = calc.lines.find(line => line.code === 'OT')
  
  return {
    runDate: new Date().toISOString().split('T')[0],
    employeeName: calc.employeeName,
    payPeriod: calc.frequency,
    payDate: calc.payDate,
    
    // Earnings
    grossPay: calc.gross,
    regularHours: regularEarning?.hours || 0,
    overtimeHours: overtimeEarning?.hours || 0,
    regularPay: regularEarning?.amount || 0,
    overtimePay: overtimeEarning?.amount || 0,
    
    // Deductions
    cpp1Employee: calc.cpp1Emp,
    cpp1Employer: calc.cpp1Er,
    cpp2Employee: calc.cpp2Emp,
    cpp2Employer: calc.cpp2Er,
    eiEmployee: calc.eiEmp,
    eiEmployer: calc.eiEr,
    incomeTax: calc.tax,
    wsib: calc.wsib,
    
    // Vacation
    vacationAccrued: calc.vacAccrued,
    vacationPaid: calc.vacPaid,
    vacationRate: calc.vacationRate,
    
    // Net pay
    totalDeductions: calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax + calc.wsib,
    netPay: calc.net,
    
    // YTD totals
    ytdGross: calc.newYtdGross,
    ytdCPP1: calc.newYtdCPP1,
    ytdCPP2: calc.newYtdCPP2,
    ytdEI: calc.newYtdEI,
    ytdTax: calc.newYtdTax,
    ytdVacationAccrued: calc.newYtdVacAccrued,
    ytdVacationPaid: calc.newYtdVacPaid,
    
    // Tax configuration
    federalTD1: calc.federalTD1,
    provincialTD1: calc.provincialTD1
  }
}

/**
 * Export payroll data as CSV
 */
export function exportToCSV(data: PayrollExportData[], filename?: string): void {
  if (data.length === 0) return
  
  // Create CSV headers
  const headers = Object.keys(data[0]).map(key => 
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  )
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      Object.values(row).map(value => {
        // Handle strings with commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    )
  ]
  
  // Create and download file
  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `payroll-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Export payroll data as JSON
 */
export function exportToJSON(data: PayrollExportData[], filename?: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename || `payroll-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Export single payroll run
 */
export function exportSinglePayrollRun(payrollData: PayrollData, format: 'csv' | 'json' = 'csv'): void {
  const exportData = preparePayrollExportData(payrollData)
  if (!exportData) {
    alert('No payroll calculation data to export')
    return
  }
  
  const employeeName = exportData.employeeName.replace(/\s+/g, '-').toLowerCase()
  const filename = `payroll-${employeeName}-${exportData.payDate}`
  
  if (format === 'csv') {
    exportToCSV([exportData], `${filename}.csv`)
  } else {
    exportToJSON([exportData], `${filename}.json`)
  }
}

/**
 * Export multiple payroll runs
 */
export function exportMultiplePayrollRuns(payrollRuns: PayrollData[], format: 'csv' | 'json' = 'csv'): void {
  const exportData = payrollRuns
    .map(preparePayrollExportData)
    .filter((data): data is PayrollExportData => data !== null)
  
  if (exportData.length === 0) {
    alert('No payroll calculation data to export')
    return
  }
  
  const filename = `payroll-batch-export-${new Date().toISOString().split('T')[0]}`
  
  if (format === 'csv') {
    exportToCSV(exportData, `${filename}.csv`)
  } else {
    exportToJSON(exportData, `${filename}.json`)
  }
}

/**
 * Create a summary report of payroll run
 */
export function generatePayrollSummary(payrollData: PayrollData): string {
  const exportData = preparePayrollExportData(payrollData)
  if (!exportData) return 'No payroll data available'
  
  return `
PAYROLL SUMMARY
===============
Employee: ${exportData.employeeName}
Pay Date: ${exportData.payDate}
Pay Period: ${exportData.payPeriod}

EARNINGS:
Regular Hours: ${exportData.regularHours.toFixed(2)} @ $${(exportData.regularPay / (exportData.regularHours || 1)).toFixed(2)} = $${exportData.regularPay.toFixed(2)}
Overtime Hours: ${exportData.overtimeHours.toFixed(2)} @ $${exportData.overtimeHours > 0 ? (exportData.overtimePay / exportData.overtimeHours).toFixed(2) : '0.00'} = $${exportData.overtimePay.toFixed(2)}
Gross Pay: $${exportData.grossPay.toFixed(2)}

DEDUCTIONS:
CPP Tier 1 (Employee): $${exportData.cpp1Employee.toFixed(2)}
CPP Tier 2 (Employee): $${exportData.cpp2Employee.toFixed(2)}
EI (Employee): $${exportData.eiEmployee.toFixed(2)}
Income Tax: $${exportData.incomeTax.toFixed(2)}
WSIB: $${exportData.wsib.toFixed(2)}
Total Deductions: $${exportData.totalDeductions.toFixed(2)}

VACATION:
Vacation Rate: ${exportData.vacationRate}%
Vacation Accrued: $${exportData.vacationAccrued.toFixed(2)}
Vacation Paid: $${exportData.vacationPaid.toFixed(2)}

NET PAY: $${exportData.netPay.toFixed(2)}

YTD TOTALS:
Gross: $${exportData.ytdGross.toFixed(2)}
CPP Tier 1: $${exportData.ytdCPP1.toFixed(2)}
CPP Tier 2: $${exportData.ytdCPP2.toFixed(2)}
EI: $${exportData.ytdEI.toFixed(2)}
Tax: $${exportData.ytdTax.toFixed(2)}
Vacation Accrued: $${exportData.ytdVacationAccrued.toFixed(2)}
Vacation Paid: $${exportData.ytdVacationPaid.toFixed(2)}
`
}