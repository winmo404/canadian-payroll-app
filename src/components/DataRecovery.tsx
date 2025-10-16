import React, { useState } from 'react'
import { getFromStorage, saveToStorage, clearAllStoredData, STORAGE_KEYS } from '@/lib/storage'

interface DataRecoveryProps {
  onDataRestored?: () => void
}

export default function DataRecovery({ onDataRestored }: DataRecoveryProps) {
  const [storageStatus, setStorageStatus] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)

  const checkStorageStatus = () => {
    setIsChecking(true)
    
    // Check what's currently in storage
    const employees = getFromStorage(STORAGE_KEYS.EMPLOYEES, [])
    const payrollHistory = getFromStorage(STORAGE_KEYS.PAYROLL_HISTORY, [])
    const selectedEmployee = getFromStorage(STORAGE_KEYS.SELECTED_EMPLOYEE, '')
    
    const status = `
Storage Status:
- Employees: ${employees.length} records found
- Payroll History: ${payrollHistory.length} records found
- Selected Employee: ${selectedEmployee || 'None'}
- LocalStorage Available: ${typeof window !== 'undefined' && !!localStorage}

Raw Data Preview:
- Employees Key: ${STORAGE_KEYS.EMPLOYEES}
- History Key: ${STORAGE_KEYS.PAYROLL_HISTORY}
    `
    
    setStorageStatus(status)
    setIsChecking(false)
  }

  const initializeDefaultData = () => {
    // Default employees with 2025 TD1 amounts
    const defaultEmployees = [
      {
        id: '1',
        name: 'John Smith',
        hourlyRate: 25.00,
        payType: 'hourly' as const,
        vacationRate: 4.0,
        federalTD1: 16129,  // 2025 Federal Basic Personal Amount
        provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
        active: true,
        startDate: '2024-01-15'
      },
      {
        id: '2', 
        name: 'Jane Doe',
        hourlyRate: 0,
        salary: 75000,
        payType: 'salary' as const,
        vacationRate: 6.0,
        federalTD1: 16129,  // 2025 Federal Basic Personal Amount
        provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
        active: true,
        startDate: '2023-03-01'
      },
      {
        id: '3',
        name: 'Yang Shi',
        hourlyRate: 18.00,
        payType: 'hourly' as const,
        vacationRate: 4.0,
        federalTD1: 16129,  // 2025 Federal Basic Personal Amount
        provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
        active: true,
        startDate: '2024-06-01'
      }
    ]

    // Save default data
    const employeesSaved = saveToStorage(STORAGE_KEYS.EMPLOYEES, defaultEmployees)
    const historySaved = saveToStorage(STORAGE_KEYS.PAYROLL_HISTORY, [])
    const selectedSaved = saveToStorage(STORAGE_KEYS.SELECTED_EMPLOYEE, '1')

    if (employeesSaved && historySaved && selectedSaved) {
      setStorageStatus('✅ Default data initialized successfully!')
      if (onDataRestored) onDataRestored()
    } else {
      setStorageStatus('❌ Failed to initialize default data')
    }
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      const cleared = clearAllStoredData()
      if (cleared) {
        setStorageStatus('🗑️ All data cleared successfully')
      } else {
        setStorageStatus('❌ Failed to clear data')
      }
    }
  }

  const exportData = () => {
    const employees = getFromStorage(STORAGE_KEYS.EMPLOYEES, [])
    const payrollHistory = getFromStorage(STORAGE_KEYS.PAYROLL_HISTORY, [])
    
    const exportData = {
      employees,
      payrollHistory,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-data-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.employees) {
          saveToStorage(STORAGE_KEYS.EMPLOYEES, data.employees)
        }
        if (data.payrollHistory) {
          saveToStorage(STORAGE_KEYS.PAYROLL_HISTORY, data.payrollHistory)
        }
        
        setStorageStatus('✅ Data imported successfully!')
        if (onDataRestored) onDataRestored()
      } catch (error) {
        setStorageStatus(`❌ Import failed: ${error}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🔧 Data Recovery & Management</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={checkStorageStatus}
            disabled={isChecking}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Check Storage Status'}
          </button>
          
          <button 
            onClick={initializeDefaultData}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Initialize Default Data
          </button>
          
          <button 
            onClick={exportData}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Export Backup
          </button>
          
          <label className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer">
            Import Data
            <input 
              type="file" 
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          
          <button 
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Data
          </button>
        </div>
        
        {storageStatus && (
          <div className="p-4 bg-white rounded border">
            <h3 className="font-semibold mb-2">Storage Status:</h3>
            <pre className="text-sm whitespace-pre-wrap text-gray-700">
              {storageStatus}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Troubleshooting Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>If no data is found, use "Initialize Default Data" to restore sample employees</li>
            <li>Check browser console for localStorage errors</li>
            <li>Try clearing data and reinitializing if you see corrupt data</li>
            <li>Export/Import can be used to backup and restore your data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}