/**
 * Activity Ledger Hook
 * Manages activity logging with persistence
 */

import { useState, useEffect } from 'react'
import { ActivityEntry, LedgerEntry } from '@/lib/activity/types'
import { activityLogger, developmentHistory } from '@/lib/activity/logger'
import { getFromStorage, saveToStorage } from '@/lib/storage'

const STORAGE_KEY = 'payroll_activity_ledger'

export function useActivityLedger() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load activities from storage on mount
  useEffect(() => {
    const storedActivities = getFromStorage<ActivityEntry[]>(STORAGE_KEY, [])
    
    // Import stored activities into logger
    if (storedActivities.length > 0) {
      activityLogger.importFromJSON(JSON.stringify({ activities: storedActivities }))
    }
    
    setActivities(activityLogger.getAllActivities())
    setIsLoaded(true)
  }, [])

  // Save activities to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEY, activities)
    }
  }, [activities, isLoaded])

  const logActivity = (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    const newActivity = activityLogger.logActivity(activity)
    setActivities(activityLogger.getAllActivities())
    return newActivity
  }

  const getActivitiesByCategory = (category: string) => {
    return activityLogger.getActivitiesByCategory(category)
  }

  const getActivitiesByPhase = (startDate: string, endDate?: string) => {
    return activityLogger.getActivitiesByPhase(startDate, endDate)
  }

  const getSummaryReport = () => {
    return activityLogger.generateSummaryReport()
  }

  const exportActivities = () => {
    return activityLogger.exportAsJSON()
  }

  const clearActivities = () => {
    setActivities([])
    saveToStorage(STORAGE_KEY, [])
  }

  const getDevelopmentHistory = (): LedgerEntry[] => {
    return developmentHistory
  }

  return {
    activities,
    isLoaded,
    logActivity,
    getActivitiesByCategory,
    getActivitiesByPhase,
    getSummaryReport,
    exportActivities,
    clearActivities,
    getDevelopmentHistory
  }
}