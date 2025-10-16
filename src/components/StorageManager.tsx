'use client'

import { useState, useEffect } from 'react'
import { 
  getStorageInfo, 
  clearAllStoredData, 
  exportAllStoredData, 
  importStoredData 
} from '@/lib/storage'

export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: false,
    keys: [] as string[]
  })

  const updateStorageInfo = () => {
    setStorageInfo(getStorageInfo())
  }

  useEffect(() => {
    updateStorageInfo()
    // Update storage info periodically
    const interval = setInterval(updateStorageInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClearAll = () => {
    if (confirm('⚠️ This will permanently delete ALL stored data (employees, payroll history, etc.). Are you sure?')) {
      clearAllStoredData()
      updateStorageInfo()
      alert('All stored data has been cleared.')
      // Refresh the page to reset the application state
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const data = exportAllStoredData()
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payroll-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      alert('Data exported successfully!')
    } else {
      alert('No data available to export.')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (importStoredData(data)) {
          alert('Data imported successfully! Refreshing page...')
          window.location.reload()
        } else {
          alert('Failed to import data. Please check the file format.')
        }
      } catch (error) {
        alert('Invalid file format. Please select a valid backup file.')
      }
    }
    reader.readAsText(file)
  }

  if (!storageInfo.available) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-600 text-lg mr-2">⚠️</div>
          <div>
            <h3 className="font-medium text-yellow-800">Storage Unavailable</h3>
            <p className="text-sm text-yellow-700 mt-1">
              LocalStorage is not available. Data will not be saved between sessions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-green-600 text-lg mr-2">💾</div>
          <div>
            <h3 className="font-medium text-green-800">Data Storage Active</h3>
            <p className="text-sm text-green-700 mt-1">
              {storageInfo.used > 0 
                ? `${Math.round(storageInfo.used / 1024)}KB stored • ${storageInfo.keys.length} data types`
                : 'Ready to store your data automatically'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
            title="Export all data as backup file"
          >
            📁 Export
          </button>
          
          <label className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors cursor-pointer">
            📥 Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            title="Clear all stored data"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {storageInfo.keys.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-600">
            <span className="font-medium">Stored:</span> {storageInfo.keys.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}