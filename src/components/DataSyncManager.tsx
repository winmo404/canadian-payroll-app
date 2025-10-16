/**
 * Data Sync Manager Component
 * Provides UI for automatic bidirectional synchronization
 */

import React from 'react'
import { useSimpleDataSync } from '@/hooks/useSimpleDataSync'

interface DataSyncManagerProps {
  employees: any[]
  payrollHistory: any[]
  onDataUpdate: (data: { employees: any[]; payrollHistory: any[] }) => void
}

export const DataSyncManager: React.FC<DataSyncManagerProps> = ({
  employees,
  payrollHistory,
  onDataUpdate
}) => {
  const {
    syncStatus,
    conflicts,
    isLoading,
    statusMessage,
    performSync,
    resolveConflict,
    updateSyncSettings,
    isFileSystemReady
  } = useSimpleDataSync(employees, payrollHistory, onDataUpdate)

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString()
  }

  const getSyncStatusColor = () => {
    if (!syncStatus.isActive) return 'bg-gray-400'
    if (isLoading) return 'bg-yellow-500'
    if (conflicts.length > 0) return 'bg-red-500'
    return 'bg-green-500'
  }

  const getSyncStatusText = () => {
    if (!syncStatus.isActive) return 'Sync Disabled'
    if (isLoading) return 'Syncing...'
    if (conflicts.length > 0) return `${conflicts.length} Conflict(s)`
    return 'In Sync'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${getSyncStatusColor()}`}></div>
          <h3 className="text-lg font-semibold">Data Synchronization</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            syncStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {getSyncStatusText()}
          </span>
          {statusMessage && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {statusMessage}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={performSync}
            disabled={isLoading || !isFileSystemReady}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* File System Status */}
      {!isFileSystemReady && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Setup Required:</strong> Local file system not initialized. Visit the "Auto File System" tab to set up automatic file storage first.
        </div>
      )}

      {/* Sync Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncStatus.isActive}
                onChange={(e) => updateSyncSettings({ isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Enable Automatic Sync</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Automatically syncs every {syncStatus.syncInterval} seconds between website and local files
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sync Interval (seconds)
            </label>
            <select
              value={syncStatus.syncInterval}
              onChange={(e) => updateSyncSettings({ syncInterval: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value={10}>⚡ 10 seconds (Fast)</option>
              <option value={30}>🔄 30 seconds (Recommended)</option>
              <option value={60}>⏰ 1 minute (Balanced)</option>
              <option value={300}>🐢 5 minutes (Slow)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sync Direction
            </label>
            <select
              value={syncStatus.syncDirection}
              onChange={(e) => updateSyncSettings({ 
                syncDirection: e.target.value as 'upload' | 'download' | 'bidirectional' 
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="bidirectional">↕️ Bidirectional (Recommended)</option>
              <option value="upload">📤 Website → Files Only</option>
              <option value="download">📥 Files → Website Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conflict Resolution
            </label>
            <select
              value={syncStatus.conflictResolution}
              onChange={(e) => updateSyncSettings({ 
                conflictResolution: e.target.value as 'local-wins' | 'remote-wins' | 'newest-wins' 
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="newest-wins">🕒 Newest Data Wins (Recommended)</option>
              <option value="local-wins">💻 Website Data Wins</option>
              <option value="remote-wins">📁 File Data Wins</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={syncStatus.autoResolve}
                onChange={(e) => updateSyncSettings({ autoResolve: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Auto-Resolve Conflicts</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Automatically resolve conflicts using the selected resolution method
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm font-medium text-gray-700 mb-2">Sync Status</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Last Sync: {formatTime(syncStatus.lastSync)}</div>
              <div>Employees: {employees.length} records</div>
              <div>Payroll History: {payrollHistory.length} records</div>
              <div>Conflicts: {conflicts.length} pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts Section */}
      {conflicts.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-red-700 mb-4">
            🚨 Data Conflicts Require Resolution
          </h4>
          
          {conflicts.map((conflict: any, index: number) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-red-800">
                    Conflict #{index + 1} - {conflict.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-600">
                    Both website and local files have been modified
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-800 mb-2">💻 Website Data</div>
                  <div className="text-sm text-gray-600">
                    <div>Employees: {conflict.localData.employees.length}</div>
                    <div>Payroll: {conflict.localData.payrollHistory.length}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-800 mb-2">📁 File Data</div>
                  <div className="text-sm text-gray-600">
                    <div>Employees: {conflict.fileData.employees.length}</div>
                    <div>Payroll: {conflict.fileData.payrollHistory.length}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => resolveConflict('local', index)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Keep Website Data
                </button>
                <button
                  onClick={() => resolveConflict('file', index)}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  Keep File Data
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
        <div className="text-sm">
          <div className="font-medium text-blue-800 mb-2">How Sync Works:</div>
          <ul className="text-blue-700 space-y-1">
            <li>• <strong>Automatic:</strong> Syncs every {syncStatus.syncInterval} seconds when enabled</li>
            <li>• <strong>Bidirectional:</strong> Changes flow both ways (website ↔ files)</li>
            <li>• <strong>Smart Conflicts:</strong> Automatically resolves using {syncStatus.conflictResolution.replace('-', ' ')}</li>
            <li>• <strong>Real-Time:</strong> No manual action required</li>
            <li>• <strong>Safe:</strong> Never loses data - conflicts preserved until resolved</li>
            <li>• <strong>Status:</strong> {statusMessage}</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => updateSyncSettings({ 
            isActive: true, 
            syncDirection: 'bidirectional',
            conflictResolution: 'newest-wins',
            autoResolve: true 
          })}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          🚀 Enable Smart Sync
        </button>
        
        <button
          onClick={() => updateSyncSettings({ isActive: false })}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          ⏸️ Pause Sync
        </button>

        <button
          onClick={() => {
            updateSyncSettings({ autoResolve: false })
            alert('Manual conflict resolution enabled. You will be prompted for each conflict.')
          }}
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
        >
          🛡️ Manual Resolution
        </button>
      </div>
    </div>
  )
}