import { useState, useEffect } from 'react'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage'

/**
 * Hook for managing selected employee with localStorage persistence
 */
export function useSelectedEmployee(defaultEmployeeId: string = '') {
  const [selectedEmployeeId, setSelectedEmployeeIdState] = useState<string>(defaultEmployeeId)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load selected employee from localStorage on component mount
  useEffect(() => {
    const storedSelectedId = getFromStorage<string>(STORAGE_KEYS.SELECTED_EMPLOYEE, defaultEmployeeId)
    setSelectedEmployeeIdState(storedSelectedId)
    setIsLoaded(true)
  }, [defaultEmployeeId])

  // Save selected employee to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && selectedEmployeeId) { // Only save if loaded and not empty
      saveToStorage(STORAGE_KEYS.SELECTED_EMPLOYEE, selectedEmployeeId)
    }
  }, [selectedEmployeeId, isLoaded])

  const setSelectedEmployeeId = (employeeId: string) => {
    setSelectedEmployeeIdState(employeeId)
  }

  const clearSelectedEmployee = () => {
    setSelectedEmployeeIdState('')
  }

  return {
    selectedEmployeeId,
    isLoaded,
    setSelectedEmployeeId,
    clearSelectedEmployee
  }
}