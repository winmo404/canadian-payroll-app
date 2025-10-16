import { useState, useEffect } from 'react'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage'
import { PayrollData } from '@/lib/calculations/types'

/**
 * Hook for managing payroll history with localStorage persistence
 */
export function usePayrollHistory() {
  const [payrollHistory, setPayrollHistoryState] = useState<PayrollData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load payroll history from localStorage on component mount
  useEffect(() => {
    const storedHistory = getFromStorage<PayrollData[]>(STORAGE_KEYS.PAYROLL_HISTORY, [])
    setPayrollHistoryState(storedHistory)
    setIsLoaded(true)
  }, [])

  // Save payroll history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) { // Only save after initial load
      saveToStorage(STORAGE_KEYS.PAYROLL_HISTORY, payrollHistory)
    }
  }, [payrollHistory, isLoaded])

  const addPayrollRun = (payrollData: PayrollData) => {
    setPayrollHistoryState(prev => [payrollData, ...prev])
  }

  const clearHistory = () => {
    setPayrollHistoryState([])
  }

  const removePayrollRun = (index: number) => {
    setPayrollHistoryState(prev => prev.filter((_, i) => i !== index))
  }

  const getPayrollRunsByEmployee = (employeeName: string) => {
    return payrollHistory.filter(payroll => 
      payroll.employeeName === employeeName || 
      payroll.calculations?.employeeName === employeeName
    )
  }

  const getPayrollRunsByDateRange = (startDate: string, endDate: string) => {
    return payrollHistory.filter(payroll => {
      const payDate = payroll.payDate || payroll.calculations?.payDate
      return payDate && payDate >= startDate && payDate <= endDate
    })
  }

  const getTotalStats = () => {
    return payrollHistory.reduce((stats, payroll) => {
      if (payroll.calculations) {
        stats.totalRuns++
        stats.totalGross += payroll.calculations.gross
        stats.totalNet += payroll.calculations.net
        stats.totalDeductions += (
          payroll.calculations.cpp1Emp + 
          payroll.calculations.cpp2Emp + 
          payroll.calculations.eiEmp + 
          payroll.calculations.tax + 
          payroll.calculations.wsib
        )
      }
      return stats
    }, {
      totalRuns: 0,
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0
    })
  }

  return {
    payrollHistory,
    isLoaded,
    addPayrollRun,
    clearHistory,
    removePayrollRun,
    getPayrollRunsByEmployee,
    getPayrollRunsByDateRange,
    getTotalStats
  }
}