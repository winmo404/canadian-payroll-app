/**
 * File-based storage system for Canadian Payroll Application
 * Provides options to save data to local hard drive folders
 */

export interface FileStorageOptions {
  format: 'json' | 'csv' | 'backup'
  location: 'downloads' | 'custom'
  autoBackup?: boolean
}

export class FileStorageManager {
  private defaultFolder = 'PayrollData'

  /**
   * Save employee data to local file
   */
  async saveEmployeesToFile(employees: any[], options: FileStorageOptions = { format: 'json', location: 'downloads' }) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `employees-${timestamp}.${options.format}`
    
    let content: string
    let mimeType: string

    if (options.format === 'json') {
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'employees',
        data: employees
      }, null, 2)
      mimeType = 'application/json'
    } else if (options.format === 'csv') {
      content = this.convertEmployeesToCSV(employees)
      mimeType = 'text/csv'
    } else {
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'backup',
        employees: employees,
        metadata: {
          totalEmployees: employees.length,
          activeEmployees: employees.filter(emp => emp.active).length
        }
      }, null, 2)
      mimeType = 'application/json'
    }

    return this.downloadFile(content, filename, mimeType)
  }

  /**
   * Save payroll history to local file
   */
  async savePayrollHistoryToFile(payrollHistory: any[], options: FileStorageOptions = { format: 'json', location: 'downloads' }) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `payroll-history-${timestamp}.${options.format}`
    
    let content: string
    let mimeType: string

    if (options.format === 'json') {
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'payroll-history',
        data: payrollHistory
      }, null, 2)
      mimeType = 'application/json'
    } else if (options.format === 'csv') {
      content = this.convertPayrollToCSV(payrollHistory)
      mimeType = 'text/csv'
    } else {
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        type: 'backup',
        payrollHistory: payrollHistory,
        metadata: {
          totalRuns: payrollHistory.length,
          dateRange: this.getDateRange(payrollHistory)
        }
      }, null, 2)
      mimeType = 'application/json'
    }

    return this.downloadFile(content, filename, mimeType)
  }

  /**
   * Create complete application backup
   */
  async createCompleteBackup(employees: any[], payrollHistory: any[], activityLog?: any[]) {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `payroll-app-backup-${timestamp}.json`
    
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'complete-backup',
      application: 'Canadian Payroll App',
      data: {
        employees,
        payrollHistory,
        activityLog: activityLog || [],
        metadata: {
          totalEmployees: employees.length,
          totalPayrollRuns: payrollHistory.length,
          backupSize: JSON.stringify({ employees, payrollHistory }).length
        }
      }
    }

    const content = JSON.stringify(backup, null, 2)
    return this.downloadFile(content, filename, 'application/json')
  }

  /**
   * Load data from uploaded file
   */
  async loadFromFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(content)
            resolve(data)
          } else if (file.name.endsWith('.csv')) {
            // CSV parsing would need additional implementation
            reject(new Error('CSV import not yet implemented'))
          } else {
            reject(new Error('Unsupported file format'))
          }
        } catch (error) {
          reject(new Error(`Failed to parse file: ${error}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Setup automatic backups (browser-initiated downloads)
   */
  setupAutoBackup(employees: any[], payrollHistory: any[], intervalMinutes: number = 30) {
    return setInterval(() => {
      if (employees.length > 0 || payrollHistory.length > 0) {
        this.createCompleteBackup(employees, payrollHistory)
        console.log('Auto-backup created:', new Date().toISOString())
      }
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * Generate folder structure instructions
   */
  generateFolderStructure(): string {
    return `
# Recommended Local Folder Structure

Create this folder structure on your computer:

📁 PayrollData/
├── 📁 Backups/
│   ├── payroll-app-backup-2025-10-14.json
│   ├── payroll-app-backup-2025-10-13.json
│   └── ...
├── 📁 Employees/
│   ├── employees-2025-10-14.json
│   ├── employees-2025-10-14.csv
│   └── ...
├── 📁 PayrollHistory/
│   ├── payroll-history-2025-10-14.json
│   ├── payroll-history-2025-10-14.csv
│   └── ...
├── 📁 Paystubs/
│   ├── paystub-john-smith-2025-10-14.html
│   ├── paystub-jane-doe-2025-10-14.html
│   └── ...
└── 📁 Reports/
    ├── monthly-summary-2025-10.html
    ├── ytd-report-2025.csv
    └── ...

Windows: C:\\Users\\YourName\\Documents\\PayrollData\\
Mac: /Users/YourName/Documents/PayrollData/
Linux: /home/username/Documents/PayrollData/
    `
  }

  /**
   * Private helper methods
   */
  private downloadFile(content: string, filename: string, mimeType: string): boolean {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Failed to download file:', error)
      return false
    }
  }

  private convertEmployeesToCSV(employees: any[]): string {
    if (employees.length === 0) return 'No employees to export'
    
    const headers = ['ID', 'Name', 'Pay Type', 'Hourly Rate', 'Salary', 'Vacation Rate', 'WSIB Rate', 'Federal TD1', 'Provincial TD1', 'Active', 'Start Date']
    const rows = employees.map(emp => [
      emp.id,
      emp.name,
      emp.payType,
      emp.hourlyRate || 0,
      emp.salary || 0,
      emp.vacationRate,
      emp.wsibRate,
      emp.federalTD1,
      emp.provincialTD1,
      emp.active ? 'Yes' : 'No',
      emp.startDate
    ])
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  private convertPayrollToCSV(payrollHistory: any[]): string {
    if (payrollHistory.length === 0) return 'No payroll history to export'
    
    const headers = ['Employee', 'Pay Date', 'Pay Type', 'Gross Pay', 'CPP', 'EI', 'Tax', 'WSIB', 'Net Pay']
    const rows = payrollHistory.map(payroll => {
      const calc = payroll.calculations
      return [
        calc?.employeeName || payroll.employeeName,
        calc?.payDate || payroll.payDate,
        calc?.payType || payroll.payType,
        calc?.gross?.toFixed(2) || '0.00',
        ((calc?.cpp1Emp || 0) + (calc?.cpp2Emp || 0)).toFixed(2),
        calc?.eiEmp?.toFixed(2) || '0.00',
        calc?.tax?.toFixed(2) || '0.00',
        calc?.wsib?.toFixed(2) || '0.00',
        calc?.net?.toFixed(2) || '0.00'
      ]
    })
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  private getDateRange(payrollHistory: any[]): { start: string; end: string } {
    if (payrollHistory.length === 0) return { start: '', end: '' }
    
    const dates = payrollHistory.map(p => p.calculations?.payDate || p.payDate).filter(Boolean).sort()
    return {
      start: dates[0] || '',
      end: dates[dates.length - 1] || ''
    }
  }
}