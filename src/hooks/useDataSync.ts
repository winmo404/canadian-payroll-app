/**
 * Automatic Data Synchronization System
 * Keeps website data and local files perfectly synchronized
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAutoFileSystem } from '@/hooks/useAutoFileSystem'

export interface SyncStatus {
  isActive: boolean
  lastSync: Date | null
  syncDirection: 'upload' | 'download' | 'bidirectional'
  conflictResolution: 'local-wins' | 'remote-wins' | 'newest-wins'
  autoResolve: boolean
}

export const useDataSync = (
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

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: true,
    lastSync: null,
    syncDirection: 'bidirectional',
    conflictResolution: 'newest-wins',
    autoResolve: true
  })

  const [conflicts, setConflicts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastLocalHashRef = useRef<string>('')
  const lastFileHashRef = useRef<string>('')

  // Generate hash for data comparison
  const generateDataHash = useCallback((data: any): string => {
    return btoa(JSON.stringify(data)).slice(0, 16)
  }, [])

  // Detect data changes
  const detectChanges = useCallback(() => {
    const currentLocalHash = generateDataHash({ employees, payrollHistory })
    const hasLocalChanges = currentLocalHash !== lastLocalHashRef.current
    
    return {
      hasLocalChanges,
      currentLocalHash
    }
  }, [employees, payrollHistory, generateDataHash])

  // Load and compare file data
  const loadFileData = useCallback(async () => {
    try {
      const [fileEmployees, filePayroll] = await Promise.all([
        loadEmployees(),
        loadPayrollHistory()
      ])

      const fileData = { employees: fileEmployees, payrollHistory: filePayroll }
      const fileHash = generateDataHash(fileData)

      return {
        fileData,
        fileHash,
        hasFileChanges: fileHash !== lastFileHashRef.current
      }
    } catch (error) {
      console.warn('Failed to load file data for sync:', error)
      return {
        fileData: { employees: [], payrollHistory: [] },
        fileHash: '',
        hasFileChanges: false
      }
    }
  }, [loadEmployees, loadPayrollHistory, generateDataHash])

  // Resolve data conflicts
  const resolveConflicts = useCallback((localData: any, fileData: any): any => {
    switch (syncStatus.conflictResolution) {
      case 'local-wins':
        return localData
      
      case 'remote-wins':
        return fileData
      
      case 'newest-wins':
      default:
        // Compare timestamps and use newest data
        const localTimestamp = new Date(localStorage.getItem('payroll-last-updated') || 0).getTime()
        const fileTimestamp = Math.max(
          ...fileData.employees.map((emp: any) => new Date(emp.lastModified || 0).getTime()),
          ...fileData.payrollHistory.map((pay: any) => new Date(pay.timestamp || 0).getTime())
        )
        
        if (localTimestamp > fileTimestamp) {
          console.log('🔄 Sync: Local data is newer, keeping local')
          return localData
        } else {
          console.log('🔄 Sync: File data is newer, using file data')
          return fileData
        }
    }
  }, [syncStatus.conflictResolution])

  // Perform bidirectional sync
  const performSync = useCallback(async () => {
    if (!syncStatus.isActive || isLoading) return

    try {
      setIsLoading(true)
      
      const { hasLocalChanges, currentLocalHash } = detectChanges()
      const { fileData, fileHash, hasFileChanges } = await loadFileData()

      // No changes detected
      if (!hasLocalChanges && !hasFileChanges) {
        setSyncStatus(prev => ({ ...prev, lastSync: new Date() }))
        return
      }

      const localData = { employees, payrollHistory }

      // Handle conflicts
      if (hasLocalChanges && hasFileChanges) {
        console.log('⚠️ Sync conflict detected - both local and file data changed')
        
        if (syncStatus.autoResolve) {
          const resolvedData = resolveConflicts(localData, fileData)
          
          // Update both local and file with resolved data
          onDataUpdate(resolvedData)
          await autoSaveEmployees(resolvedData.employees)
          await autoSavePayroll(resolvedData.payrollHistory)
          
          console.log('✅ Sync conflict auto-resolved')
        } else {
          setConflicts([{ localData, fileData, timestamp: new Date() }])
          return
        }
      }
      // Local changes only - upload to files
      else if (hasLocalChanges && !hasFileChanges) {
        await autoSaveEmployees(employees)
        await autoSavePayroll(payrollHistory)
        console.log('📤 Sync: Local changes uploaded to files')
      }
      // File changes only - download to local
      else if (!hasLocalChanges && hasFileChanges) {
        onDataUpdate(fileData)
        console.log('📥 Sync: File changes downloaded to local')
      }

      // Update sync status
      lastLocalHashRef.current = currentLocalHash
      lastFileHashRef.current = fileHash
      setSyncStatus(prev => ({ ...prev, lastSync: new Date() }))
      
      // Update localStorage timestamp
      localStorage.setItem('payroll-last-updated', new Date().toISOString())

    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [
    syncStatus.isActive,
    syncStatus.autoResolve,
    isLoading,
    detectChanges,
    loadFileData,
    resolveConflicts,
    employees,
    payrollHistory,
    onDataUpdate,
    autoSaveEmployees,
    autoSavePayroll
  ])

  // Start automatic sync interval
  useEffect(() => {
    if (!syncStatus.isActive) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
      return
    }

    // Initial sync
    performSync()

    // Set up interval sync (every 30 seconds)
    syncIntervalRef.current = setInterval(performSync, 30000)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncStatus.isActive, performSync])

  // Manual sync trigger
  const triggerManualSync = useCallback(async () => {
    await performSync()
  }, [performSync])

  // Resolve manual conflicts
  const resolveManualConflict = useCallback(async (resolution: 'local' | 'file', conflictIndex: number) => {
    const conflict = conflicts[conflictIndex]
    if (!conflict) return

    const resolvedData = resolution === 'local' ? conflict.localData : conflict.fileData
    
    // Update both local and file
    onDataUpdate(resolvedData)
    await autoSaveEmployees(resolvedData.employees)
    await autoSavePayroll(resolvedData.payrollHistory)
    
    // Remove resolved conflict
    setConflicts(prev => prev.filter((_, i) => i !== conflictIndex))
    
    console.log(`✅ Manual conflict resolved: ${resolution} data kept`)
  }, [conflicts, onDataUpdate, autoSaveEmployees, autoSavePayroll])

  // Update sync settings
  const updateSyncSettings = useCallback((newSettings: Partial<SyncStatus>) => {
    setSyncStatus(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    syncStatus,
    conflicts,
    isLoading,
    performSync: triggerManualSync,
    resolveConflict: resolveManualConflict,
    updateSyncSettings,
    isFileSystemReady: status?.exists || false
  }
}