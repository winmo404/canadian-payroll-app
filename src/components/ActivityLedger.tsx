/**
 * Activity Ledger Component
 * Displays development history and activity logs
 */

import React, { useState } from 'react'
import { useActivityLedger } from '@/hooks/useActivityLedger'
import { ActivityEntry, LedgerEntry } from '@/lib/activity/types'

export function ActivityLedger() {
  const { 
    activities, 
    getDevelopmentHistory, 
    getSummaryReport, 
    exportActivities,
    logActivity 
  } = useActivityLedger()
  
  const [activeTab, setActiveTab] = useState<'history' | 'activities' | 'summary'>('history')
  const developmentHistory = getDevelopmentHistory()
  const summaryReport = getSummaryReport()

  const handleExport = () => {
    const exportData = exportActivities()
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-app-activity-log-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const logCurrentSession = () => {
    logActivity({
      type: 'documentation',
      title: 'Activity Ledger Created',
      description: 'Created comprehensive activity logging system to track development progress and decisions',
      filesAffected: [
        'src/lib/activity/types.ts',
        'src/lib/activity/logger.ts',
        'src/hooks/useActivityLedger.ts',
        'src/components/ActivityLedger.tsx'
      ],
      impact: 'medium',
      category: 'documentation',
      tags: ['logging', 'documentation', 'development-tools'],
      details: {
        reasoning: 'Need comprehensive tracking of development decisions for future reference',
        futureConsiderations: [
          'Add search and filtering capabilities',
          'Integrate with version control',
          'Add performance metrics tracking'
        ]
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Development Activity Ledger</h2>
            <p className="text-gray-600">Canadian Payroll Application Development History</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={logCurrentSession}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              📝 Log Current Session
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              📊 Export Log
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'history', label: 'Development History', icon: '📚' },
              { id: 'activities', label: 'Recent Activities', icon: '🔄' },
              { id: 'summary', label: 'Summary Report', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Development History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {developmentHistory.map((phase, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{phase.phase}</h3>
              <p className="text-gray-600 mb-4">{phase.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✅ Key Achievements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {phase.keyAchievements.map((achievement, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-orange-700 mb-2">⚠️ Challenges</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {phase.challengesEncountered.map((challenge, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">💡 Lessons Learned</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {phase.lessonsLearned.map((lesson, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activities */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Development Activities</h3>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities logged yet</p>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 20).map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${getImpactColor(activity.impact)}`}>
                      {activity.impact}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {activity.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {activity.category}
                    </span>
                  </div>
                  {activity.filesAffected.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Files: {activity.filesAffected.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Report */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium text-gray-900 mb-2">Total Activities</h3>
            <p className="text-3xl font-bold text-blue-600">{summaryReport.totalActivities}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium text-gray-900 mb-2">By Type</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(summaryReport.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium text-gray-900 mb-2">By Impact</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(summaryReport.byImpact).map(([impact, count]) => (
                <div key={impact} className="flex justify-between">
                  <span className="capitalize">{impact}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium text-gray-900 mb-2">Project Status</h3>
            <div className="text-sm space-y-1">
              <div className="text-green-600 font-medium">✅ Tax Engine Complete</div>
              <div className="text-green-600 font-medium">✅ UI Components Ready</div>
              <div className="text-green-600 font-medium">✅ Data Persistence Active</div>
              <div className="text-blue-600 font-medium">🔄 Documentation Complete</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getImpactColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'bg-red-100 text-red-700'
    case 'high': return 'bg-orange-100 text-orange-700'
    case 'medium': return 'bg-yellow-100 text-yellow-700'
    case 'low': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}