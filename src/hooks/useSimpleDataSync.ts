/**
 * Simplified Data Sync Hook (without file watching)
 * Provides automatic bidirectional synchronization via polling
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAutoFileSystem } from '@/hooks/useAutoFileSystem'

export interface SimpleSyncStatus {
  isActive: boolean
  lastSync: Date | null
  syncDirection: 'upload' | 'download' | 'bidirectional'
  conflictResolution: 'local-wins' | 'remote-wins' | 'newest-wins'
  autoResolve: boolean
  syncInterval: number // seconds
}

export const useSimpleDataSync = (
  employees: any[],
  payrollHistory: any[],
  onDataUpdate: (data: { employees: any[]; payrollHistory: any[] }) => void
) => {
  const {
    autoSaveEmployees,
    autoSavePayroll,
    loadEmployees,
    loadPayrollHistory,
    status
  } = useAutoFileSystem()

  const [syncStatus, setSyncStatus] = useState<SimpleSyncStatus>({
    isActive: true,
    lastSync: null,
    syncDirection: 'bidirectional',
    conflictResolution: 'newest-wins',
    autoResolve: true,
    syncInterval: 30 // 30 seconds
  })

  const [conflicts, setConflicts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('Ready')
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastLocalDataRef = useRef<string>('')
  const lastFileDataRef = useRef<string>('')

  // Generate hash for data comparison
  const generateHash = useCallback((data: any): string => {
    try {
      return btoa(JSON.stringify(data)).slice(0, 16)
    } catch {
      return 'invalid'
    }
  }, [])

  // Check for local data changes
  const hasLocalChanges = useCallback(() => {
    const currentHash = generateHash({ employees, payrollHistory })
    const changed = currentHash !== lastLocalDataRef.current
    if (changed) {
      lastLocalDataRef.current = currentHash
    }
    return changed
  }, [employees, payrollHistory, generateHash])

  // Load and check file data
  const checkFileData = useCallback(async () => {
    try {
      const [fileEmployees, filePayroll] = await Promise.all([
        loadEmployees(),
        loadPayrollHistory()
      ])

      const fileData = { employees: fileEmployees, payrollHistory: filePayroll }
      const currentFileHash = generateHash(fileData)
      const fileChanged = currentFileHash !== lastFileDataRef.current

      if (fileChanged) {
        lastFileDataRef.current = currentFileHash
      }

      return {
        fileData,
        hasFileChanges: fileChanged
      }
    } catch (error) {
      console.warn('Failed to check file data:', error)
      return {
        fileData: { employees: [], payrollHistory: [] },
        hasFileChanges: false
      }
    }
  }, [loadEmployees, loadPayrollHistory, generateHash])

  // Resolve conflicts automatically
  const autoResolveConflict = useCallback((localData: any, fileData: any) => {
    switch (syncStatus.conflictResolution) {
      case 'local-wins':
        return { resolved: localData, winner: 'local' }
      
      case 'remote-wins':
        return { resolved: fileData, winner: 'file' }
      
      case 'newest-wins':
      default:
        // Use localStorage timestamp vs file modification time
        const localTime = localStorage.getItem('payroll-last-updated')
        const localTimestamp = localTime ? new Date(localTime).getTime() : 0
        
        // Estimate file age from data (this is simplified)
        const fileTimestamp = Date.now() - (5 * 60 * 1000) // Assume file is 5 min old
        
        if (localTimestamp > fileTimestamp) {
          return { resolved: localData, winner: 'local' }
        } else {
          return { resolved: fileData, winner: 'file' }
        }
    }
  }, [syncStatus.conflictResolution])

  // Perform sync operation
  const performSync = useCallback(async () => {
    if (!syncStatus.isActive || isLoading) return

    try {
      setIsLoading(true)
      setStatusMessage('Checking for changes...')

      const localChanged = hasLocalChanges()
      const { fileData, hasFileChanges } = await checkFileData()

      // No changes detected
      if (!localChanged && !hasFileChanges) {
        setStatusMessage('No changes detected')
        setSyncStatus(prev => ({ ...prev, lastSync: new Date() }))
        return
      }

      const localData = { employees, payrollHistory }

      // Both changed - potential conflict
      if (localChanged && hasFileChanges) {
        setStatusMessage('Conflict detected...')
        
        if (syncStatus.autoResolve) {
          const { resolved, winner } = autoResolveConflict(localData, fileData)
          
          // Apply resolved data
          if (winner === 'file') {
            onDataUpdate(resolved)
            setStatusMessage('File data applied (auto-resolved)')
          } else {
            await autoSaveEmployees(resolved.employees)
            await autoSavePayroll(resolved.payrollHistory)
            setStatusMessage('Local data saved (auto-resolved)')
          }
        } else {
          // Manual resolution required
          setConflicts(prev => [...prev, { 
            localData, 
            fileData, 
            timestamp: new Date() 
          }])
          setStatusMessage('Manual resolution required')
          return
        }
      }
      // Only local changed - upload
      else if (localChanged && !hasFileChanges) {
        if (syncStatus.syncDirection !== 'download') {
          setStatusMessage('Uploading to files...')
          await autoSaveEmployees(employees)
          await autoSavePayroll(payrollHistory)
          setStatusMessage('Local changes uploaded')
        }
      }
      // Only file changed - download
      else if (!localChanged && hasFileChanges) {
        if (syncStatus.syncDirection !== 'upload') {
          setStatusMessage('Downloading from files...')
          onDataUpdate(fileData)
          setStatusMessage('File changes downloaded')
        }
      }

      setSyncStatus(prev => ({ ...prev, lastSync: new Date() }))
      localStorage.setItem('payroll-last-updated', new Date().toISOString())

    } catch (error) {
      console.error('Sync failed:', error)
      setStatusMessage('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage('Ready')
      }, 3000)
    }
  }, [
    syncStatus.isActive,
    syncStatus.syncDirection,
    syncStatus.autoResolve,
    isLoading,
    hasLocalChanges,
    checkFileData,
    employees,
    payrollHistory,
    autoResolveConflict,
    onDataUpdate,
    autoSaveEmployees,
    autoSavePayroll
  ])

  // Set up automatic sync interval
  useEffect(() => {
    if (!syncStatus.isActive) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
      return
    }

    // Initial sync after 2 seconds
    const initialTimer = setTimeout(performSync, 2000)

    // Regular sync interval
    syncIntervalRef.current = setInterval(performSync, syncStatus.syncInterval * 1000)

    return () => {
      clearTimeout(initialTimer)
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncStatus.isActive, syncStatus.syncInterval, performSync])

  // Manual sync trigger
  const triggerManualSync = useCallback(async () => {
    await performSync()
  }, [performSync])

  // Resolve manual conflicts
  const resolveManualConflict = useCallback(async (resolution: 'local' | 'file', conflictIndex: number) => {
    const conflict = conflicts[conflictIndex]
    if (!conflict) return

    try {
      setIsLoading(true)
      const resolvedData = resolution === 'local' ? conflict.localData : conflict.fileData
      
      // Apply resolution
      onDataUpdate(resolvedData)
      await autoSaveEmployees(resolvedData.employees)
      await autoSavePayroll(resolvedData.payrollHistory)
      
      // Remove resolved conflict
      setConflicts(prev => prev.filter((_, i) => i !== conflictIndex))
      setStatusMessage(`Conflict resolved: ${resolution} data kept`)
      
    } catch (error) {
      setStatusMessage('Failed to resolve conflict')
      console.error('Conflict resolution failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [conflicts, onDataUpdate, autoSaveEmployees, autoSavePayroll])

  // Update sync settings
  const updateSyncSettings = useCallback((newSettings: Partial<SimpleSyncStatus>) => {
    setSyncStatus(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    syncStatus,
    conflicts,
    isLoading,
    statusMessage,
    performSync: triggerManualSync,
    resolveConflict: resolveManualConflict,
    updateSyncSettings,
    isFileSystemReady: status?.exists || false
  }
}