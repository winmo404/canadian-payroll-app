/**
 * API endpoint for automatic file system operations
 * Handles server-side file saving without manual downloads
 */

import { NextRequest, NextResponse } from 'next/server'
import { AutoFileSystem } from '@/lib/autoFileSystem'

const autoFS = new AutoFileSystem({
  autoSave: true,
  backupInterval: 5, // 5 minutes
  maxBackups: 50
})

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    // Initialize folder structure on first use
    await autoFS.initialize()

    switch (action) {
      case 'save-employees':
        const employeePath = await autoFS.saveEmployees(data.employees, true)
        return NextResponse.json({ 
          success: true, 
          message: 'Employees auto-saved successfully',
          filepath: employeePath 
        })

      case 'save-payroll':
        const payrollPath = await autoFS.savePayrollHistory(data.payrollHistory, true)
        return NextResponse.json({ 
          success: true, 
          message: 'Payroll history auto-saved successfully',
          filepath: payrollPath 
        })

      case 'save-backup':
        const backupPath = await autoFS.saveCompleteBackup(
          data.employees, 
          data.payrollHistory, 
          data.activityLog
        )
        return NextResponse.json({ 
          success: true, 
          message: 'Complete backup auto-saved successfully',
          filepath: backupPath 
        })

      case 'save-paystub':
        const paystubPath = await autoFS.savePaystub(data.payrollData)
        return NextResponse.json({ 
          success: true, 
          message: 'Paystub auto-saved successfully',
          filepath: paystubPath 
        })

      case 'save-activity-log':
        const logPath = await autoFS.saveActivityLog(data.activities)
        return NextResponse.json({ 
          success: true, 
          message: 'Activity log auto-saved successfully',
          filepath: logPath 
        })

      case 'load-employees':
        const employees = await autoFS.loadEmployees()
        return NextResponse.json({ 
          success: true, 
          data: employees,
          message: `Loaded ${employees.length} employees from file`
        })

      case 'load-payroll':
        const payrollHistory = await autoFS.loadPayrollHistory()
        return NextResponse.json({ 
          success: true, 
          data: payrollHistory,
          message: `Loaded ${payrollHistory.length} payroll records from file`
        })

      case 'get-status':
        const status = await autoFS.getStorageStatus()
        return NextResponse.json({ 
          success: true, 
          data: status
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Auto file system error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await autoFS.initialize()
    const status = await autoFS.getStorageStatus()
    
    return NextResponse.json({ 
      success: true, 
      data: status,
      message: 'Storage status retrieved successfully'
    })
  } catch (error) {
    console.error('Get storage status error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}