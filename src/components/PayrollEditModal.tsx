/**
 * PayrollEditModal - Modal for editing existing payroll records
 */

import React, { useState, useEffect } from 'react'
import { PayrollData, EarningsLine } from '@/lib/calculations/types'

interface PayrollEditModalProps {
  payroll: PayrollData | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPayroll: PayrollData, updatedEarnings: EarningsLine[]) => void
}

export const PayrollEditModal: React.FC<PayrollEditModalProps> = ({
  payroll,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<PayrollData>({
    employeeName: '',
    payDate: '',
    frequency: 'biweekly' as const,
    payType: 'hourly' as const,
    vacationMode: 'accrue' as const,
    vacationRate: 0,
    federalTD1: 0,
    provincialTD1: 0,
  })
  
  const [earningsLines, setEarningsLines] = useState<EarningsLine[]>([])

  // Initialize form data when payroll changes
  useEffect(() => {
    if (payroll && isOpen) {
      setFormData({
        employeeName: payroll.employeeName,
        payDate: payroll.payDate,
        frequency: payroll.frequency,
        payType: payroll.payType,
        vacationMode: payroll.vacationMode,
        vacationRate: payroll.vacationRate,
        federalTD1: payroll.federalTD1,
        provincialTD1: payroll.provincialTD1,
      })
      
      // Initialize earnings lines from calculations if available
      if (payroll.calculations?.lines) {
        setEarningsLines([...payroll.calculations.lines])
      } else {
        // Default earnings line for new entry
        setEarningsLines([{
          code: 'REG',
          description: 'Regular Hours',
          rate: payroll.payType === 'hourly' ? 25.00 : null,
          hours: payroll.payType === 'hourly' ? 40 : null,
          amount: payroll.payType === 'salary' ? 2000 : 1000,
          ytdHours: 0,
          ytdAmount: 0,
        }])
      }
    }
  }, [payroll, isOpen])

  const handleInputChange = (field: keyof PayrollData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEarningsChange = (index: number, field: keyof EarningsLine, value: any) => {
    setEarningsLines(prev => prev.map((line, i) => {
      if (i === index) {
        const updated = { ...line, [field]: value }
        
        // Auto-calculate amount for hourly pay
        if (formData.payType === 'hourly' && (field === 'rate' || field === 'hours')) {
          const rate = field === 'rate' ? parseFloat(value) || 0 : updated.rate || 0
          const hours = field === 'hours' ? parseFloat(value) || 0 : updated.hours || 0
          updated.amount = rate * hours
        }
        
        return updated
      }
      return line
    }))
  }

  const addEarningsLine = () => {
    setEarningsLines(prev => [...prev, {
      code: 'OVT',
      description: 'Overtime',
      rate: formData.payType === 'hourly' ? 37.50 : null,
      hours: formData.payType === 'hourly' ? 0 : null,
      amount: 0,
      ytdHours: 0,
      ytdAmount: 0,
    }])
  }

  const removeEarningsLine = (index: number) => {
    if (earningsLines.length > 1) {
      setEarningsLines(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    onSave(formData, earningsLines)
    onClose()
  }

  if (!isOpen || !payroll) return null

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
                Edit Payroll - {formData.employeeName}
              </h3>
              <p className="text-sm text-gray-500">
                Modify payroll details and earnings
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              ✕
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Employee Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Employee Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Date
                  </label>
                  <input
                    type="date"
                    value={formData.payDate}
                    onChange={(e) => handleInputChange('payDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="semimonthly">Semi-monthly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Type
                  </label>
                  <select
                    value={formData.payType}
                    onChange={(e) => handleInputChange('payType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vacation Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.vacationRate}
                    onChange={(e) => handleInputChange('vacationRate', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vacation Mode
                  </label>
                  <select
                    value={formData.vacationMode}
                    onChange={(e) => handleInputChange('vacationMode', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="accrue">Accrue</option>
                    <option value="pay">Pay Out</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Deductions */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Tax Deductions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Federal TD1 Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.federalTD1}
                    onChange={(e) => handleInputChange('federalTD1', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincial TD1 Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.provincialTD1}
                    onChange={(e) => handleInputChange('provincialTD1', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Earnings Lines */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Earnings</h4>
                <button
                  onClick={addEarningsLine}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Line
                </button>
              </div>
              
              <div className="space-y-3">
                {earningsLines.map((line, index) => (
                  <div key={index} className="border border-gray-200 p-3 rounded bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          value={line.code}
                          onChange={(e) => handleEarningsChange(index, 'code', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleEarningsChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      
                      {formData.payType === 'hourly' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Rate
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={line.rate || ''}
                              onChange={(e) => handleEarningsChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Hours
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={line.hours || ''}
                              onChange={(e) => handleEarningsChange(index, 'hours', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </>
                      )}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.amount}
                          onChange={(e) => handleEarningsChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          disabled={formData.payType === 'hourly'}
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={() => removeEarningsLine(index)}
                          disabled={earningsLines.length <= 1}
                          className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}