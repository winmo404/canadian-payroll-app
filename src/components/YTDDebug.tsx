/**
 * YTD Debug Component - Display employee YTD calculation details
 */

import React from 'react'
import { calculateEmployeeYTD, getEmployeePayrollSummary } from '@/lib/calculations/ytd'
import { PayrollData } from '@/lib/calculations/types'

interface YTDDebugProps {
  employeeName: string
  payrollHistory: PayrollData[]
}

export function YTDDebug({ employeeName, payrollHistory }: YTDDebugProps) {
  const currentYear = new Date().getFullYear()
  const ytdData = calculateEmployeeYTD(employeeName, payrollHistory, currentYear)
  const summary = getEmployeePayrollSummary(employeeName, payrollHistory, currentYear)
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        🔍 YTD Debug for {employeeName}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-yellow-700 mb-2">Payroll History Summary:</h4>
          <ul className="text-sm text-yellow-600">
            <li>Total payroll runs: {summary.totalRuns}</li>
            {summary.dateRange && (
              <>
                <li>Date range: {summary.dateRange.earliest} to {summary.dateRange.latest}</li>
              </>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-yellow-700 mb-2">YTD Calculations:</h4>
          <ul className="text-sm text-yellow-600">
            <li>Gross: ${ytdData.gross.toFixed(2)}</li>
            <li>CPP: ${ytdData.cpp1.toFixed(2)}</li>
            <li>EI: ${ytdData.ei.toFixed(2)}</li>
            <li>Tax: ${ytdData.tax.toFixed(2)}</li>
            <li>Vacation Accrued: ${ytdData.vacAccrued.toFixed(2)}</li>
          </ul>
        </div>
      </div>
      
      {summary.totalRuns === 0 && (
        <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
          <p className="text-sm text-yellow-700">
            ⚠️ No payroll history found for this employee in {currentYear}. YTD will start at $0.00.
          </p>
        </div>
      )}
    </div>
  )
}