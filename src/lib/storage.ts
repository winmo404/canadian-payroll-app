// LocalStorage utility for persisting payroll application data

export interface StorageKeys {
  EMPLOYEES: 'payroll_employees'
  PAYROLL_HISTORY: 'payroll_history'
  SELECTED_EMPLOYEE: 'selected_employee_id'
  APP_SETTINGS: 'payroll_settings'
  COMPANY_SETTINGS: 'company_settings'
}

export const STORAGE_KEYS: StorageKeys = {
  EMPLOYEES: 'payroll_employees',
  PAYROLL_HISTORY: 'payroll_history',
  SELECTED_EMPLOYEE: 'selected_employee_id',
  APP_SETTINGS: 'payroll_settings',
  COMPANY_SETTINGS: 'company_settings'
}

/**
 * Check if localStorage is available (handles SSR)
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Safely get data from localStorage with error handling
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Safely save data to localStorage with error handling
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Error saving to localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Error removing from localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Clear all payroll application data from localStorage
 */
export function clearAllStoredData(): boolean {
  if (!isLocalStorageAvailable()) return false
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.warn('Error clearing stored data:', error)
    return false
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number
  available: boolean
  keys: string[]
} {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: false, keys: [] }
  }
  
  try {
    let used = 0
    const keys = Object.values(STORAGE_KEYS).filter(key => {
      const item = localStorage.getItem(key)
      if (item) {
        used += item.length
        return true
      }
      return false
    })
    
    return { used, available: true, keys }
  } catch {
    return { used: 0, available: false, keys: [] }
  }
}

/**
 * Export all data for backup
 */
export function exportAllStoredData(): Record<string, any> | null {
  if (!isLocalStorageAvailable()) return null
  
  try {
    const data: Record<string, any> = {}
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key)
      if (item) {
        data[name] = JSON.parse(item)
      }
    })
    return data
  } catch (error) {
    console.warn('Error exporting stored data:', error)
    return null
  }
}

/**
 * Import data from backup
 */
export function importStoredData(data: Record<string, any>): boolean {
  if (!isLocalStorageAvailable()) return false
  
  try {
    Object.entries(data).forEach(([name, value]) => {
      const storageKey = STORAGE_KEYS[name as keyof StorageKeys]
      if (storageKey && value !== undefined) {
        localStorage.setItem(storageKey, JSON.stringify(value))
      }
    })
    return true
  } catch (error) {
    console.warn('Error importing stored data:', error)
    return false
  }
}