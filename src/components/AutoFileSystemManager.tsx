/**
 * Automatic File System Manager Component
 * Seamlessly integrates with payroll app for automatic file operations
 */

import React, { useEffect, useState } from 'react'
import { useAutoFileSystem } from '@/hooks/useAutoFileSystem'

interface AutoFileSystemManagerProps {
  employees: any[]
  payrollHistory: any[]
  onDataLoaded?: (data: { employees: any[]; payrollHistory: any[] }) => void
}

export const AutoFileSystemManager: React.FC<AutoFileSystemManagerProps> = ({
  employees,
  payrollHistory,
  onDataLoaded
}) => {
  const {
    status,
    isLoading,
    error,
    autoSaveEmployees,
    autoSavePayroll,
    autoSaveBackup,
    loadEmployees,
    loadPayrollHistory,
    refreshStatus,
    isInitialized,
    totalFiles
  } = useAutoFileSystem()

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const [saveInterval, setSaveInterval] = useState<NodeJS.Timeout | null>(null)

  // Auto-save every 5 minutes when enabled
  useEffect(() => {
    if (!autoSaveEnabled) {
      if (saveInterval) {
        clearInterval(saveInterval)
        setSaveInterval(null)
      }
      return
    }

    const interval = setInterval(async () => {
      if (employees.length > 0 || payrollHistory.length > 0) {
        try {
          await autoSaveBackup(employees, payrollHistory)
          setLastSaveTime(new Date())
          console.log('🔄 Auto-backup completed')
        } catch (error) {
          console.error('Auto-backup failed:', error)
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    setSaveInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoSaveEnabled, employees, payrollHistory, autoSaveBackup])

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (!autoSaveEnabled) return

    const debounceTimer = setTimeout(async () => {
      if (employees.length > 0) {
        try {
          await autoSaveEmployees(employees)
          console.log('💾 Employees auto-saved (data change)')
        } catch (error) {
          console.error('Failed to auto-save employees:', error)
        }
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(debounceTimer)
  }, [employees, autoSaveEnabled, autoSaveEmployees])

  useEffect(() => {
    if (!autoSaveEnabled) return

    const debounceTimer = setTimeout(async () => {
      if (payrollHistory.length > 0) {
        try {
          await autoSavePayroll(payrollHistory)
          console.log('💾 Payroll auto-saved (data change)')
        } catch (error) {
          console.error('Failed to auto-save payroll:', error)
        }
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(debounceTimer)
  }, [payrollHistory, autoSaveEnabled, autoSavePayroll])

  const handleLoadFromFiles = async () => {
    try {
      const [loadedEmployees, loadedPayroll] = await Promise.all([
        loadEmployees(),
        loadPayrollHistory()
      ])

      if (onDataLoaded) {
        onDataLoaded({
          employees: loadedEmployees,
          payrollHistory: loadedPayroll
        })
      }
    } catch (error) {
      console.error('Failed to load data from files:', error)
    }
  }

  const handleManualBackup = async () => {
    try {
      await autoSaveBackup(employees, payrollHistory)
      setLastSaveTime(new Date())
    } catch (error) {
      console.error('Manual backup failed:', error)
    }
  }

  const getStoragePath = () => {
    if (status?.baseFolder) {
      return status.baseFolder
    }
    return '~/Documents/PayrollData'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <h3 className="text-lg font-semibold">Automatic File System</h3>
        </div>
        <div className="text-sm text-gray-500">
          {totalFiles} files saved
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm font-medium text-gray-700 mb-2">Storage Location</div>
          <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
            {getStoragePath()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isInitialized ? '✅ Folder exists and ready' : '⚠️ Will be created on first save'}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm font-medium text-gray-700 mb-2">Auto-Save Status</div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Auto-save enabled</span>
            </label>
          </div>
          {lastSaveTime && (
            <div className="text-xs text-gray-500 mt-1">
              Last backup: {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {status && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <div className="text-sm font-medium text-gray-700 mb-3">File Status</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(status.folders).map(([folder, info]) => (
              <div key={folder} className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{folder}</div>
                <div className="text-lg font-semibold text-gray-900">{info.fileCount}</div>
                <div className="text-xs text-gray-500">
                  {info.jsonFiles}J • {info.csvFiles}C • {info.htmlFiles}H
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleLoadFromFiles}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Loading...' : 'Load from Files'}
        </button>

        <button
          onClick={handleManualBackup}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Saving...' : 'Manual Backup'}
        </button>

        <button
          onClick={refreshStatus}
          disabled={isLoading}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
        >
          Refresh Status
        </button>

        <button
          onClick={() => {
            if (status?.baseFolder) {
              // This will attempt to open the folder in the file manager
              // Note: This only works in certain environments
              window.open(`file://${status.baseFolder}`, '_blank')
            }
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
        >
          Open Folder
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
        <div className="text-sm">
          <div className="font-medium text-blue-800">How It Works:</div>
          <ul className="mt-2 text-blue-700 space-y-1">
            <li>• Data automatically saves to your Documents/PayrollData folder</li>
            <li>• No manual downloads required - files go directly to your hard drive</li>
            <li>• Auto-backup every 5 minutes when enabled</li>
            <li>• Instant save when data changes (2-second delay)</li>
            <li>• Files saved in JSON, CSV, and HTML formats</li>
          </ul>
        </div>
      </div>
    </div>
  )
}