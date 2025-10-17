'use client'

import { useState, useEffect } from 'react'
import { useMultiCompanyAuth } from './useMultiCompanyAuth'
import { Employee, defaultEmployee } from '@/types/employee'

export function useCompanyEmployees() {
  const { authState, loadEmployeeData, saveEmployeeData } = useMultiCompanyAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load employees when company changes or on mount
  useEffect(() => {
    if (authState.currentCompany) {
      const companyEmployees = loadEmployeeData()
      setEmployees(companyEmployees)
    } else {
      setEmployees([])
    }
    setIsLoading(false)
  }, [authState.currentCompany, loadEmployeeData])

  const fetchEmployees = async () => {
    if (authState.currentCompany) {
      const companyEmployees = loadEmployeeData()
      setEmployees(companyEmployees)
    }
  }

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    if (!authState.currentCompany) return

    const newEmployee: Employee = {
      ...defaultEmployee,
      ...employee,
      id: Date.now().toString() // Simple ID generation
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    saveEmployeeData(updatedEmployees)
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    if (!authState.currentCompany) return

    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    )
    setEmployees(updatedEmployees)
    saveEmployeeData(updatedEmployees)
  }

  const deleteEmployee = async (id: string) => {
    if (!authState.currentCompany) return

    const updatedEmployees = employees.filter(emp => emp.id !== id)
    setEmployees(updatedEmployees)
    saveEmployeeData(updatedEmployees)
  }

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id)
  }

  const getActiveEmployees = (): Employee[] => {
    return employees.filter(emp => emp.active !== false)
  }

  return {
    employees,
    isLoading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getActiveEmployees
  }
}