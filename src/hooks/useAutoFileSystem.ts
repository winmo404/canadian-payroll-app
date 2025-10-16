/**
 * React Hook for Automatic File System Operations
 * Provides seamless file saving without manual downloads
 */

import { useCallback, useEffect, useState } from 'react'

export interface AutoFileSystemStatus {
  baseFolder: string
  exists: boolean
  folders: Record<string, {
    exists: boolean
    fileCount: number
    jsonFiles: number
    csvFiles: number
    htmlFiles: number
  }>
}

export const useAutoFileSystem = () => {
  const [status, setStatus] = useState<AutoFileSystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-save employees
  const autoSaveEmployees = useCallback(async (employees: any[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-employees',
          data: { employees }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Employees auto-saved:', result.filepath)
        await refreshStatus()
        return result.filepath
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to auto-save employees'
      setError(errorMessage)
      console.error('❌ Auto-save employees failed:', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-save payroll history
  const autoSavePayroll = useCallback(async (payrollHistory: any[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-payroll',
          data: { payrollHistory }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Payroll auto-saved:', result.filepath)
        await refreshStatus()
        return result.filepath
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to auto-save payroll'
      setError(errorMessage)
      console.error('❌ Auto-save payroll failed:', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-save complete backup
  const autoSaveBackup = useCallback(async (employees: any[], payrollHistory: any[], activityLog?: any[]) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-backup',
          data: { employees, payrollHistory, activityLog }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Backup auto-saved:', result.filepath)
        await refreshStatus()
        return result.filepath
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to auto-save backup'
      setError(errorMessage)
      console.error('❌ Auto-save backup failed:', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-save individual paystub
  const autoSavePaystub = useCallback(async (payrollData: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-paystub',
          data: { payrollData }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Paystub auto-saved:', result.filepath)
        await refreshStatus()
        return result.filepath
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to auto-save paystub'
      setError(errorMessage)
      console.error('❌ Auto-save paystub failed:', errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load employees from files
  const loadEmployees = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load-employees',
          data: {}
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Employees loaded from file:', result.message)
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load employees'
      setError(errorMessage)
      console.error('❌ Load employees failed:', errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load payroll history from files
  const loadPayrollHistory = useCallback(async (): Promise<any[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auto-file-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load-payroll',
          data: {}
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Payroll loaded from file:', result.message)
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payroll history'
      setError(errorMessage)
      console.error('❌ Load payroll failed:', errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh storage status
  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auto-file-system')
      const result = await response.json()
      
      if (result.success) {
        setStatus(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get storage status'
      setError(errorMessage)
      console.error('❌ Status refresh failed:', errorMessage)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    // Status
    status,
    isLoading,
    error,
    
    // Actions
    autoSaveEmployees,
    autoSavePayroll,
    autoSaveBackup,
    autoSavePaystub,
    loadEmployees,
    loadPayrollHistory,
    refreshStatus,
    
    // Helper properties
    isInitialized: status?.exists || false,
    totalFiles: status ? Object.values(status.folders).reduce((sum, folder) => sum + folder.fileCount, 0) : 0
  }
}