import React, { useState } from 'react'
import { FileStorageManager as FileStorage, FileStorageOptions } from '@/lib/fileStorage'
import { useEmployees } from '@/hooks/useEmployees'
import { usePayrollHistory } from '@/hooks/usePayrollHistory'

export default function FileStorageManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [autoBackupInterval, setAutoBackupInterval] = useState<NodeJS.Timeout | null>(null)
  
  const { employees } = useEmployees()
  const { payrollHistory } = usePayrollHistory()
  const fileManager = new FileStorage()

  const showMessage = (msg: string, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleSaveEmployees = async (format: 'json' | 'csv') => {
    setIsLoading(true)
    try {
      const success = await fileManager.saveEmployeesToFile(employees, { format, location: 'downloads' })
      if (success) {
        showMessage(`✅ Employees exported as ${format.toUpperCase()} file`)
      } else {
        showMessage('❌ Failed to export employees', true)
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, true)
    }
    setIsLoading(false)
  }

  const handleSavePayrollHistory = async (format: 'json' | 'csv') => {
    setIsLoading(true)
    try {
      const success = await fileManager.savePayrollHistoryToFile(payrollHistory, { format, location: 'downloads' })
      if (success) {
        showMessage(`✅ Payroll history exported as ${format.toUpperCase()} file`)
      } else {
        showMessage('❌ Failed to export payroll history', true)
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, true)
    }
    setIsLoading(false)
  }

  const handleCompleteBackup = async () => {
    setIsLoading(true)
    try {
      const success = await fileManager.createCompleteBackup(employees, payrollHistory)
      if (success) {
        showMessage('✅ Complete backup created successfully')
      } else {
        showMessage('❌ Failed to create backup', true)
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, true)
    }
    setIsLoading(false)
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const data = await fileManager.loadFromFile(file)
      
      // Show preview of what will be imported
      if (data.type === 'employees' || data.employees) {
        const employeeCount = data.data?.length || data.employees?.length || 0
        showMessage(`📁 File loaded: ${employeeCount} employees found. Check console for details.`)
        console.log('Imported employee data:', data)
      } else if (data.type === 'payroll-history' || data.payrollHistory) {
        const historyCount = data.data?.length || data.payrollHistory?.length || 0
        showMessage(`📁 File loaded: ${historyCount} payroll records found. Check console for details.`)
        console.log('Imported payroll data:', data)
      } else if (data.type === 'complete-backup') {
        showMessage(`📁 Backup file loaded. Check console for details.`)
        console.log('Imported backup data:', data)
      }
      
    } catch (error) {
      showMessage(`❌ Import failed: ${error}`, true)
    }
    setIsLoading(false)
    
    // Reset file input
    event.target.value = ''
  }

  const toggleAutoBackup = () => {
    if (autoBackupEnabled) {
      // Disable auto backup
      if (autoBackupInterval) {
        clearInterval(autoBackupInterval)
        setAutoBackupInterval(null)
      }
      setAutoBackupEnabled(false)
      showMessage('🔄 Auto-backup disabled')
    } else {
      // Enable auto backup (every 30 minutes)
      const interval = fileManager.setupAutoBackup(employees, payrollHistory, 30)
      setAutoBackupInterval(interval)
      setAutoBackupEnabled(true)
      showMessage('🔄 Auto-backup enabled (every 30 minutes)')
    }
  }

  const downloadFolderStructure = () => {
    const structure = fileManager.generateFolderStructure()
    const blob = new Blob([structure], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payroll-folder-structure.txt'
    a.click()
    URL.revokeObjectURL(url)
    showMessage('📁 Folder structure guide downloaded')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">💾 File-Based Storage Manager</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium text-blue-800">Current Data</h3>
            <p className="text-sm text-blue-600">
              {employees.length} employees<br/>
              {payrollHistory.length} payroll records
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-medium text-green-800">Storage Type</h3>
            <p className="text-sm text-green-600">
              Browser localStorage<br/>
              + File downloads
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-medium text-purple-800">Auto Backup</h3>
            <p className="text-sm text-purple-600">
              {autoBackupEnabled ? '✅ Enabled (30min)' : '❌ Disabled'}
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">📤 Export to Local Files</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Employee Export */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Employee Data</h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleSaveEmployees('json')}
                  disabled={isLoading || employees.length === 0}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  📄 Export JSON
                </button>
                <button
                  onClick={() => handleSaveEmployees('csv')}
                  disabled={isLoading || employees.length === 0}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  📊 Export CSV
                </button>
              </div>
            </div>

            {/* Payroll History Export */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Payroll History</h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleSavePayrollHistory('json')}
                  disabled={isLoading || payrollHistory.length === 0}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  📄 Export JSON
                </button>
                <button
                  onClick={() => handleSavePayrollHistory('csv')}
                  disabled={isLoading || payrollHistory.length === 0}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  📊 Export CSV
                </button>
              </div>
            </div>

            {/* Complete Backup */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Complete Backup</h4>
              <div className="space-y-1">
                <button
                  onClick={handleCompleteBackup}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  💾 Full Backup
                </button>
                <button
                  onClick={toggleAutoBackup}
                  className={`w-full px-3 py-2 text-white text-sm rounded ${
                    autoBackupEnabled 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {autoBackupEnabled ? '⏹️ Stop Auto' : '🔄 Auto Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">📥 Import from Local Files</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select file to import (JSON format)
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Supported formats:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Employee data exports (JSON)</li>
                <li>Payroll history exports (JSON)</li>
                <li>Complete application backups (JSON)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Folder Structure Guide */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">📁 Recommended Folder Structure</h3>
          
          <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-4">
            <div>📁 PayrollData/</div>
            <div className="ml-4">├── 📁 Backups/</div>
            <div className="ml-4">├── 📁 Employees/</div>
            <div className="ml-4">├── 📁 PayrollHistory/</div>
            <div className="ml-4">├── 📁 Paystubs/</div>
            <div className="ml-4">└── 📁 Reports/</div>
          </div>
          
          <button
            onClick={downloadFolderStructure}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            📄 Download Structure Guide
          </button>
        </div>

        {/* Storage Benefits */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">💡 File Storage Benefits</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ <strong>Permanent Storage:</strong> Data saved to your computer permanently</li>
            <li>✅ <strong>Backup & Restore:</strong> Easy backup and transfer between computers</li>
            <li>✅ <strong>Data Portability:</strong> Move data between different applications</li>
            <li>✅ <strong>Version Control:</strong> Keep multiple versions with timestamps</li>
            <li>✅ <strong>Offline Access:</strong> Access data without internet connection</li>
            <li>✅ <strong>Integration Ready:</strong> CSV/JSON formats work with other software</li>
          </ul>
        </div>
      </div>
    </div>
  )
}