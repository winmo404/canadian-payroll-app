/**
 * Automatic File System for Canadian Payroll Application
 * Saves data directly to local hard drive folders without downloads
 */

import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export interface AutoFileSystemConfig {
  baseFolder: string
  autoSave: boolean
  backupInterval: number // minutes
  maxBackups: number
}

export class AutoFileSystem {
  private config: AutoFileSystemConfig
  private saveQueue: Array<{ type: string; data: any; timestamp: Date }> = []
  private autoSaveInterval: NodeJS.Timeout | null = null

  constructor(config?: Partial<AutoFileSystemConfig>) {
    // Default configuration
    this.config = {
      baseFolder: path.join(os.homedir(), 'Documents', 'PayrollData'),
      autoSave: true,
      backupInterval: 5, // Auto-save every 5 minutes
      maxBackups: 50,
      ...config
    }

    if (this.config.autoSave) {
      this.startAutoSave()
    }
  }

  /**
   * Initialize folder structure
   */
  async initialize(): Promise<void> {
    const folders = [
      this.config.baseFolder,
      path.join(this.config.baseFolder, 'Employees'),
      path.join(this.config.baseFolder, 'PayrollHistory'),
      path.join(this.config.baseFolder, 'Backups'),
      path.join(this.config.baseFolder, 'Paystubs'),
      path.join(this.config.baseFolder, 'Reports'),
      path.join(this.config.baseFolder, 'ActivityLogs')
    ]

    try {
      for (const folder of folders) {
        await fs.mkdir(folder, { recursive: true })
      }
      
      // Create README file
      await this.createReadmeFile()
      
      console.log('✅ PayrollData folder structure created at:', this.config.baseFolder)
      return Promise.resolve()
    } catch (error) {
      console.error('❌ Failed to initialize folders:', error)
      throw error
    }
  }

  /**
   * Auto-save employees data
   */
  async saveEmployees(employees: any[], force = false): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `employees-${timestamp}.json`
    const filepath = path.join(this.config.baseFolder, 'Employees', filename)

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'employees',
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.active).length,
      data: employees
    }

    if (force || this.config.autoSave) {
      await fs.writeFile(filepath, JSON.stringify(data, null, 2))
      
      // Also save as CSV
      const csvPath = filepath.replace('.json', '.csv')
      await fs.writeFile(csvPath, this.convertEmployeesToCSV(employees))
      
      console.log('💾 Employees auto-saved to:', filepath)
    } else {
      this.addToQueue('employees', data)
    }

    return filepath
  }

  /**
   * Auto-save payroll history
   */
  async savePayrollHistory(payrollHistory: any[], force = false): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `payroll-history-${timestamp}.json`
    const filepath = path.join(this.config.baseFolder, 'PayrollHistory', filename)

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'payroll-history',
      totalRuns: payrollHistory.length,
      dateRange: this.getDateRange(payrollHistory),
      data: payrollHistory
    }

    if (force || this.config.autoSave) {
      await fs.writeFile(filepath, JSON.stringify(data, null, 2))
      
      // Also save as CSV
      const csvPath = filepath.replace('.json', '.csv')
      await fs.writeFile(csvPath, this.convertPayrollToCSV(payrollHistory))
      
      console.log('💾 Payroll history auto-saved to:', filepath)
    } else {
      this.addToQueue('payroll-history', data)
    }

    return filepath
  }

  /**
   * Auto-save complete backup
   */
  async saveCompleteBackup(employees: any[], payrollHistory: any[], activityLog?: any[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `complete-backup-${timestamp}.json`
    const filepath = path.join(this.config.baseFolder, 'Backups', filename)

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

    await fs.writeFile(filepath, JSON.stringify(backup, null, 2))
    
    // Clean up old backups
    await this.cleanupOldBackups()
    
    console.log('💾 Complete backup auto-saved to:', filepath)
    return filepath
  }

  /**
   * Auto-save individual paystub
   */
  async savePaystub(payrollData: any): Promise<string> {
    if (!payrollData.calculations) return ''

    const calc = payrollData.calculations
    const employeeName = calc.employeeName.replace(/\s+/g, '-').toLowerCase()
    const timestamp = calc.payDate
    const filename = `paystub-${employeeName}-${timestamp}.html`
    const filepath = path.join(this.config.baseFolder, 'Paystubs', filename)

    const htmlContent = this.generatePaystubHTML(payrollData)
    await fs.writeFile(filepath, htmlContent)
    
    console.log('💾 Paystub auto-saved to:', filepath)
    return filepath
  }

  /**
   * Auto-save activity log
   */
  async saveActivityLog(activities: any[]): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `activity-log-${timestamp}.json`
    const filepath = path.join(this.config.baseFolder, 'ActivityLogs', filename)

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'activity-log',
      totalActivities: activities.length,
      data: activities
    }

    await fs.writeFile(filepath, JSON.stringify(data, null, 2))
    console.log('💾 Activity log auto-saved to:', filepath)
    return filepath
  }

  /**
   * Load employees from file
   */
  async loadEmployees(): Promise<any[]> {
    try {
      const employeesDir = path.join(this.config.baseFolder, 'Employees')
      const files = await fs.readdir(employeesDir)
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse()
      
      if (jsonFiles.length === 0) return []
      
      const latestFile = path.join(employeesDir, jsonFiles[0])
      const content = await fs.readFile(latestFile, 'utf8')
      const data = JSON.parse(content)
      
      console.log('📁 Employees loaded from:', latestFile)
      return data.data || []
    } catch (error) {
      console.warn('⚠️ Could not load employees from file:', error)
      return []
    }
  }

  /**
   * Load payroll history from file
   */
  async loadPayrollHistory(): Promise<any[]> {
    try {
      const historyDir = path.join(this.config.baseFolder, 'PayrollHistory')
      const files = await fs.readdir(historyDir)
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse()
      
      if (jsonFiles.length === 0) return []
      
      const latestFile = path.join(historyDir, jsonFiles[0])
      const content = await fs.readFile(latestFile, 'utf8')
      const data = JSON.parse(content)
      
      console.log('📁 Payroll history loaded from:', latestFile)
      return data.data || []
    } catch (error) {
      console.warn('⚠️ Could not load payroll history from file:', error)
      return []
    }
  }

  /**
   * Get folder status and file counts
   */
  async getStorageStatus(): Promise<any> {
    try {
      const folders = ['Employees', 'PayrollHistory', 'Backups', 'Paystubs', 'Reports', 'ActivityLogs']
      const status: any = {
        baseFolder: this.config.baseFolder,
        exists: false,
        folders: {}
      }

      try {
        await fs.access(this.config.baseFolder)
        status.exists = true
      } catch {
        status.exists = false
        return status
      }

      for (const folder of folders) {
        const folderPath = path.join(this.config.baseFolder, folder)
        try {
          const files = await fs.readdir(folderPath)
          status.folders[folder] = {
            exists: true,
            fileCount: files.length,
            jsonFiles: files.filter(f => f.endsWith('.json')).length,
            csvFiles: files.filter(f => f.endsWith('.csv')).length,
            htmlFiles: files.filter(f => f.endsWith('.html')).length
          }
        } catch {
          status.folders[folder] = { exists: false, fileCount: 0 }
        }
      }

      return status
    } catch (error) {
      console.error('Failed to get storage status:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Private helper methods
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }

    this.autoSaveInterval = setInterval(async () => {
      await this.processQueue()
    }, this.config.backupInterval * 60 * 1000)

    console.log(`🔄 Auto-save started (every ${this.config.backupInterval} minutes)`)
  }

  private addToQueue(type: string, data: any): void {
    this.saveQueue.push({ type, data, timestamp: new Date() })
  }

  private async processQueue(): Promise<void> {
    if (this.saveQueue.length === 0) return

    console.log(`🔄 Processing ${this.saveQueue.length} queued saves...`)
    
    for (const item of this.saveQueue) {
      try {
        const timestamp = item.timestamp.toISOString().split('T')[0]
        const filename = `${item.type}-${timestamp}.json`
        const filepath = path.join(
          this.config.baseFolder, 
          item.type === 'employees' ? 'Employees' : 'PayrollHistory', 
          filename
        )
        
        await fs.writeFile(filepath, JSON.stringify(item.data, null, 2))
      } catch (error) {
        console.error('Failed to process queue item:', error)
      }
    }

    this.saveQueue = []
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupsDir = path.join(this.config.baseFolder, 'Backups')
      const files = await fs.readdir(backupsDir)
      const backupFiles = files.filter(f => f.startsWith('complete-backup-')).sort().reverse()

      if (backupFiles.length > this.config.maxBackups) {
        const filesToDelete = backupFiles.slice(this.config.maxBackups)
        for (const file of filesToDelete) {
          await fs.unlink(path.join(backupsDir, file))
        }
        console.log(`🧹 Cleaned up ${filesToDelete.length} old backup files`)
      }
    } catch (error) {
      console.warn('Failed to cleanup old backups:', error)
    }
  }

  private async createReadmeFile(): Promise<void> {
    const readmeContent = `# Canadian Payroll Application Data

This folder contains all your payroll application data, automatically saved and organized.

## Folder Structure:
- **Employees/**: Employee data files (JSON & CSV)
- **PayrollHistory/**: Payroll calculation records
- **Backups/**: Complete application backups
- **Paystubs/**: Individual employee paystubs (HTML)
- **Reports/**: Summary reports and exports
- **ActivityLogs/**: Development and usage activity logs

## Auto-Save Information:
- Data is automatically saved every ${this.config.backupInterval} minutes
- Files are timestamped for version control
- Maximum ${this.config.maxBackups} backup files are retained
- CSV files are created for spreadsheet compatibility

## File Formats:
- **JSON**: Complete data with metadata
- **CSV**: Spreadsheet-compatible format
- **HTML**: Printable paystub format

Generated by Canadian Payroll Application v1.0
Last updated: ${new Date().toISOString()}
`

    const readmePath = path.join(this.config.baseFolder, 'README.md')
    await fs.writeFile(readmePath, readmeContent)
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
      emp.wsibRate || 0,
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

  private generatePaystubHTML(payrollData: any): string {
    const calc = payrollData.calculations
    return `<!DOCTYPE html>
<html>
<head>
    <title>Paystub - ${calc.employeeName} - ${calc.payDate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .paystub { max-width: 800px; margin: 0 auto; border: 2px solid black; }
        .header { background-color: #f5f5f5; padding: 20px; border-bottom: 2px solid black; }
        .company-name { font-size: 24px; font-weight: bold; }
        .net-pay { font-size: 24px; font-weight: bold; color: green; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <div class="paystub">
        <div class="header">
            <div class="company-name">YOUR COMPANY NAME</div>
            <div>Pay Date: ${calc.payDate}</div>
            <div class="net-pay">NET PAY: $${calc.net.toFixed(2)}</div>
        </div>
        <h3>Employee: ${calc.employeeName}</h3>
        <table>
            <tr><th>Gross Pay</th><td class="text-right">$${calc.gross.toFixed(2)}</td></tr>
            <tr><th>CPP</th><td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td></tr>
            <tr><th>EI</th><td class="text-right">$${calc.eiEmp.toFixed(2)}</td></tr>
            <tr><th>Income Tax</th><td class="text-right">$${calc.tax.toFixed(2)}</td></tr>
            <tr><th>WSIB</th><td class="text-right">$${calc.wsib.toFixed(2)}</td></tr>
            <tr><th>Net Pay</th><td class="text-right">$${calc.net.toFixed(2)}</td></tr>
        </table>
    </div>
</body>
</html>`
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }
}