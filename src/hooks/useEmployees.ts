import { useState, useEffect } from 'react'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage'

// Employee interface
export interface Employee {
  id: string
  name: string
  hourlyRate: number
  salary?: number
  payType: 'hourly' | 'salary'
  vacationRate: number
  federalTD1: number
  provincialTD1: number
  wsibRate: number // WSIB rate as percentage (e.g., 2.15 for 2.15%)
  active: boolean
  startDate: string
}

// Default employees for initial setup
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'John Smith',
    hourlyRate: 25.00,
    payType: 'hourly',
    vacationRate: 4.0,
    federalTD1: 16129,  // 2025 Federal Basic Personal Amount
    provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
    wsibRate: 2.15, // Default WSIB rate 2.15%
    active: true,
    startDate: '2024-01-15'
  },
  {
    id: '2', 
    name: 'Jane Doe',
    hourlyRate: 0,
    salary: 75000,
    payType: 'salary',
    vacationRate: 6.0,
    federalTD1: 16129,  // 2025 Federal Basic Personal Amount
    provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
    wsibRate: 2.15, // Default WSIB rate 2.15%
    active: true,
    startDate: '2023-03-01'
  },
  {
    id: '3',
    name: 'Yang Shi',
    hourlyRate: 18.00,
    payType: 'hourly',
    vacationRate: 4.0,
    federalTD1: 16129,  // 2025 Federal Basic Personal Amount
    provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
    wsibRate: 2.15, // Default WSIB rate 2.15%
    active: true,
    startDate: '2025-01-01'
  }
]

/**
 * Hook for managing employees with localStorage persistence
 */
export function useEmployees() {
  const [employees, setEmployeesState] = useState<Employee[]>(DEFAULT_EMPLOYEES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load employees from localStorage on component mount
  useEffect(() => {
    const storedEmployees = getFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES)
    
    // Migrate existing employees to include missing fields and update to 2025 values
    const migratedEmployees = storedEmployees.map(employee => ({
      ...employee,
      // Update to 2025 TD1 if still using 2024 values
      federalTD1: employee.federalTD1 === 15705 ? 16129 : employee.federalTD1,
      provincialTD1: employee.provincialTD1 === 11865 ? 12747 : employee.provincialTD1,
      // Add WSIB rate if missing (new field)
      wsibRate: employee.wsibRate ?? 2.15
    }))
    
    setEmployeesState(migratedEmployees)
    setIsLoaded(true)
  }, [])

  // Save employees to localStorage whenever employees change
  useEffect(() => {
    if (isLoaded) { // Only save after initial load to prevent overwriting with empty array
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees)
    }
  }, [employees, isLoaded])

  const updateEmployees = (newEmployees: Employee[]) => {
    setEmployeesState(newEmployees)
  }

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString()
    }
    setEmployeesState(prev => [...prev, newEmployee])
    return newEmployee
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployeesState(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    )
  }

  const deleteEmployee = (id: string) => {
    setEmployeesState(prev => prev.filter(emp => emp.id !== id))
  }

  const toggleEmployeeStatus = (id: string) => {
    setEmployeesState(prev => 
      prev.map(emp => emp.id === id ? { ...emp, active: !emp.active } : emp)
    )
  }

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.active)
  }

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id)
  }

  return {
    employees,
    isLoaded,
    updateEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getActiveEmployees,
    getEmployeeById
  }
}