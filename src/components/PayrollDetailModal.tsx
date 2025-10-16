/**
 * PayrollDetailModal - Detailed view modal for payroll records
 */

import React from 'react'
import { PayrollData } from '@/lib/calculations/types'

interface PayrollDetailModalProps {
  payroll: PayrollData | null
  isOpen: boolean
  onClose: () => void
}

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({
  payroll,
  isOpen,
  onClose
}) => {
  if (!isOpen || !payroll?.calculations) return null

  const calc = payroll.calculations

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Payroll Detail - {calc.employeeName}
              </h3>
              <p className="text-sm text-gray-500">
                Pay Date: {calc.payDate} | {calc.frequency} | {calc.payType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Earnings and Summary */}
            <div className="space-y-6">
              
              {/* Earnings Lines */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Earnings Breakdown</h4>
                <div className="space-y-2">
                  {calc.lines && calc.lines.length > 0 ? (
                    calc.lines.map((line, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{line.description}</span>
                          {line.hours && (
                            <span className="text-gray-500 ml-2">
                              ({line.hours} hrs @ ${line.rate?.toFixed(2) || '0.00'})
                            </span>
                          )}
                        </div>
                        <span className="font-mono">${line.amount.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No detailed earnings breakdown available</div>
                  )}
                </div>
              </div>

              {/* Pay Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Pay Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Pay:</span>
                    <span className="font-mono font-medium">${calc.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vacation Accrued:</span>
                    <span className="font-mono">${calc.vacAccrued.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vacation Paid:</span>
                    <span className="font-mono">${calc.vacPaid.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Net Pay:</span>
                    <span className="font-mono text-green-700">${calc.net.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pensionable/Insurable Amounts */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Taxable Amounts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pensionable (CPP):</span>
                    <span className="font-mono">${calc.pensionable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurable (EI):</span>
                    <span className="font-mono">${calc.insurable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WSIB Assessable:</span>
                    <span className="font-mono">${calc.wsibAssessable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Deductions and YTD */}
            <div className="space-y-6">
              
              {/* Deductions Breakdown */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Deductions Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CPP (Employee):</span>
                    <span className="font-mono">${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 pl-4">
                    <span>- CPP1:</span>
                    <span className="font-mono">${calc.cpp1Emp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 pl-4">
                    <span>- CPP2:</span>
                    <span className="font-mono">${calc.cpp2Emp.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>EI (Employee):</span>
                    <span className="font-mono">${calc.eiEmp.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Income Tax:</span>
                    <span className="font-mono">${calc.tax.toFixed(2)}</span>
                  </div>
                  

                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-red-700">
                      ${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employer Contributions */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Employer Contributions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CPP (Employer):</span>
                    <span className="font-mono">${(calc.cpp1Er + calc.cpp2Er).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EI (Employer):</span>
                    <span className="font-mono">${calc.eiEr.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Employer:</span>
                    <span className="font-mono text-purple-700">
                      ${(calc.cpp1Er + calc.cpp2Er + calc.eiEr).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Year-to-Date Summary */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Year-to-Date Totals</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>YTD Gross:</span>
                    <span className="font-mono">${calc.newYtdGross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD CPP:</span>
                    <span className="font-mono">${(calc.newYtdCPP1 + calc.newYtdCPP2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD EI:</span>
                    <span className="font-mono">${calc.newYtdEI.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD Tax:</span>
                    <span className="font-mono">${calc.newYtdTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD WSIB:</span>
                    <span className="font-mono">${calc.newYtdWsib.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD Vacation Accrued:</span>
                    <span className="font-mono">${calc.ytdVacAccrued.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}