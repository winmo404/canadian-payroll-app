/**
 * TD1 Migration Component
 * Helps users update existing employees to 2025 TD1 amounts
 */

import React from 'react'
import { Employee } from '@/hooks/useEmployees'

interface TD1MigrationProps {
  employees: Employee[]
  onUpdateEmployees: (employees: Employee[]) => void
}

export function TD1Migration({ employees, onUpdateEmployees }: TD1MigrationProps) {
  const employeesWithOldTD1 = employees.filter(emp => 
    emp.federalTD1 === 15705 || emp.provincialTD1 === 11865
  )

  if (employeesWithOldTD1.length === 0) {
    return null // No employees need updating
  }

  const updateAllTo2025TD1 = () => {
    const updatedEmployees = employees.map(employee => ({
      ...employee,
      federalTD1: employee.federalTD1 === 15705 ? 16129 : employee.federalTD1,
      provincialTD1: employee.provincialTD1 === 11865 ? 12747 : employee.provincialTD1
    }))
    
    onUpdateEmployees(updatedEmployees)
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="text-2xl">⚠️</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-orange-800">
            TD1 Update Available
          </h3>
          <p className="text-sm text-orange-700 mt-1">
            {employeesWithOldTD1.length} employee(s) are using 2024 TD1 amounts. 
            Update them to 2025 values for accurate tax calculations.
          </p>
          
          <div className="mt-3 space-y-2">
            <div className="text-sm text-orange-700">
              <strong>Employees to update:</strong>
              <ul className="list-disc list-inside mt-1">
                {employeesWithOldTD1.map(emp => (
                  <li key={emp.id}>
                    {emp.name} - Federal: ${emp.federalTD1.toLocaleString()}, Provincial: ${emp.provincialTD1.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-sm text-orange-700">
              <strong>New 2025 TD1 amounts:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Federal: $16,129 (was $15,705)</li>
                <li>Ontario Provincial: $12,747 (was $11,865)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={updateAllTo2025TD1}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Update All to 2025 TD1
            </button>
            <span className="text-xs text-orange-600 flex items-center">
              This will update TD1 amounts for better tax accuracy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}