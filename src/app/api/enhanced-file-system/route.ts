/**
 * Enhanced API endpoint with file system watching for real-time sync
 * Detects changes in local files and notifies the application
 */

import { NextRequest, NextResponse } from 'next/server'
import { AutoFileSystem } from '@/lib/autoFileSystem'
import fs from 'fs/promises'
import path from 'path'
import * as chokidar from 'chokidar'

const autoFS = new AutoFileSystem({
  autoSave: true,
  backupInterval: 1, // 1 minute for sync
  maxBackups: 100
})

// File system watcher instance
let fileWatcher: chokidar.FSWatcher | null = null
let lastFileChange: Date | null = null

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    // Initialize folder structure on first use
    await autoFS.initialize()

    switch (action) {
      case 'start-sync':
        return await startFileSystemSync()

      case 'stop-sync':
        return await stopFileSystemSync()

      case 'get-sync-status':
        return NextResponse.json({
          success: true,
          data: {
            isWatching: fileWatcher !== null,
            lastFileChange: lastFileChange?.toISOString() || null,
            watchedPath: path.join(process.env.HOME || '', 'Documents', 'PayrollData')
          }
        })

      case 'sync-check':
        return await performSyncCheck(data.localHashes)

      case 'force-sync-from-files':
        const employees = await autoFS.loadEmployees()
        const payrollHistory = await autoFS.loadPayrollHistory()
        return NextResponse.json({
          success: true,
          data: { employees, payrollHistory },
          message: 'Data loaded from files'
        })

      case 'force-sync-to-files':
        await autoFS.saveEmployees(data.employees, true)
        await autoFS.savePayrollHistory(data.payrollHistory, true)
        return NextResponse.json({
          success: true,
          message: 'Data saved to files'
        })

      case 'get-file-timestamps':
        return await getFileTimestamps()

      // Original auto file system actions
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

      case 'load-employees':
        const employeesData = await autoFS.loadEmployees()
        return NextResponse.json({ 
          success: true, 
          data: employeesData,
          message: `Loaded ${employeesData.length} employees from file`
        })

      case 'load-payroll':
        const payrollData = await autoFS.loadPayrollHistory()
        return NextResponse.json({ 
          success: true, 
          data: payrollData,
          message: `Loaded ${payrollData.length} payroll records from file`
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
    console.error('Enhanced file system API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function startFileSystemSync() {
  try {
    if (fileWatcher) {
      fileWatcher.close()
    }

    const watchPath = path.join(process.env.HOME || '', 'Documents', 'PayrollData')
    
    // Initialize watcher
    fileWatcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    })

    fileWatcher
      .on('change', (filePath: string) => {
        lastFileChange = new Date()
        console.log('📁 File changed:', filePath)
      })
      .on('add', (filePath: string) => {
        lastFileChange = new Date()
        console.log('📁 File added:', filePath)
      })
      .on('unlink', (filePath: string) => {
        lastFileChange = new Date()
        console.log('📁 File removed:', filePath)
      })
      .on('error', (error: unknown) => {
        console.error('📁 File watcher error:', error)
      })

    console.log('🔄 File system sync started, watching:', watchPath)

    return NextResponse.json({
      success: true,
      message: 'File system sync started',
      watchPath
    })

  } catch (error) {
    console.error('Failed to start file system sync:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start sync'
    }, { status: 500 })
  }
}

async function stopFileSystemSync() {
  try {
    if (fileWatcher) {
      await fileWatcher.close()
      fileWatcher = null
      console.log('🔄 File system sync stopped')
    }

    return NextResponse.json({
      success: true,
      message: 'File system sync stopped'
    })

  } catch (error) {
    console.error('Failed to stop file system sync:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop sync'
    }, { status: 500 })
  }
}

async function performSyncCheck(localHashes: { employees: string; payrollHistory: string }) {
  try {
    const status = await autoFS.getStorageStatus()
    if (!status.exists) {
      return NextResponse.json({
        success: true,
        data: {
          hasChanges: false,
          fileHashes: { employees: '', payrollHistory: '' },
          lastFileChange: lastFileChange?.toISOString() || null
        }
      })
    }

    // Calculate file hashes
    const employees = await autoFS.loadEmployees()
    const payrollHistory = await autoFS.loadPayrollHistory()
    
    const fileHashes = {
      employees: btoa(JSON.stringify(employees)).slice(0, 16),
      payrollHistory: btoa(JSON.stringify(payrollHistory)).slice(0, 16)
    }

    const hasChanges = (
      localHashes.employees !== fileHashes.employees ||
      localHashes.payrollHistory !== fileHashes.payrollHistory
    )

    return NextResponse.json({
      success: true,
      data: {
        hasChanges,
        fileHashes,
        lastFileChange: lastFileChange?.toISOString() || null,
        fileData: hasChanges ? { employees, payrollHistory } : null
      }
    })

  } catch (error) {
    console.error('Sync check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync check failed'
    }, { status: 500 })
  }
}

async function getFileTimestamps() {
  try {
    const basePath = path.join(process.env.HOME || '', 'Documents', 'PayrollData')
    const employeesPath = path.join(basePath, 'Employees')
    const payrollPath = path.join(basePath, 'PayrollHistory')

    const timestamps: any = {}

    try {
      const employeeFiles = await fs.readdir(employeesPath)
      const latestEmployeeFile = employeeFiles
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()[0]
      
      if (latestEmployeeFile) {
        const stats = await fs.stat(path.join(employeesPath, latestEmployeeFile))
        timestamps.employees = stats.mtime.toISOString()
      }
    } catch (error) {
      timestamps.employees = null
    }

    try {
      const payrollFiles = await fs.readdir(payrollPath)
      const latestPayrollFile = payrollFiles
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()[0]
      
      if (latestPayrollFile) {
        const stats = await fs.stat(path.join(payrollPath, latestPayrollFile))
        timestamps.payrollHistory = stats.mtime.toISOString()
      }
    } catch (error) {
      timestamps.payrollHistory = null
    }

    return NextResponse.json({
      success: true,
      data: timestamps
    })

  } catch (error) {
    console.error('Failed to get file timestamps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get timestamps'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await autoFS.initialize()
    const status = await autoFS.getStorageStatus()
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...status,
        syncStatus: {
          isWatching: fileWatcher !== null,
          lastFileChange: lastFileChange?.toISOString() || null
        }
      },
      message: 'Enhanced storage status retrieved successfully'
    })
  } catch (error) {
    console.error('Get enhanced storage status error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}