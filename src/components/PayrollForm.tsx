'use client'

import { useState, useEffect } from 'react'
import { PayrollData, EarningsLine } from '@/lib/calculations/types'
import { Employee } from '@/hooks/useEmployees'

interface PayrollFormProps {
  onCalculate: (data: PayrollData, earnings: EarningsLine[]) => void
  employees: Employee[]
  selectedEmployeeId: string
  onSelectEmployee: (id: string) => void
}

export default function PayrollForm({ onCalculate, employees, selectedEmployeeId, onSelectEmployee }: PayrollFormProps) {
  const [formData, setFormData] = useState<PayrollData>({
    employeeName: '',
    payDate: new Date().toISOString().split('T')[0],
    frequency: 'biweekly',
    payType: 'hourly',
    vacationMode: 'accrue', // Always accrue vacation
    vacationRate: 4.0,
    federalTD1: 16129,  // 2025 Federal Basic Personal Amount
    provincialTD1: 12747 // 2025 Ontario Basic Personal Amount
  })

  const [earnings, setEarnings] = useState<EarningsLine[]>([
    { code: 'REG', description: 'Regular Hours', rate: null, hours: null, amount: 0, ytdHours: 0, ytdAmount: 0 },
    { code: 'OT', description: 'Overtime Hours', rate: null, hours: null, amount: 0, ytdHours: 0, ytdAmount: 0 },
    { code: 'VAC', description: 'Paid Vacation Hours', rate: null, hours: null, amount: 0, ytdHours: 0, ytdAmount: 0 }
  ])

  // Update form data when employee selection changes
  useEffect(() => {
    const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)
    if (selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        employeeName: selectedEmployee.name,
        payType: selectedEmployee.payType,
        vacationRate: selectedEmployee.vacationRate,
        federalTD1: selectedEmployee.federalTD1,
        provincialTD1: selectedEmployee.provincialTD1
      }))
      
      // Update earnings rates based on employee
      setEarnings(prev => prev.map(earning => ({
        ...earning,
        rate: earning.code === 'REG' 
          ? selectedEmployee.hourlyRate 
          : earning.code === 'OT' 
          ? selectedEmployee.hourlyRate * 1.5 
          : earning.code === 'VAC'
          ? selectedEmployee.hourlyRate
          : earning.rate
      })))
    }
  }, [selectedEmployeeId, employees])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Calculate earnings amounts based on hours and rates
    const calculatedEarnings = earnings.map(earning => ({
      ...earning,
      amount: (earning.rate || 0) * (earning.hours || 0)
    })).filter(earning => earning.amount > 0) // Only include earnings with amounts
    
    onCalculate(formData, calculatedEarnings)
  }

  const handleChange = (field: keyof PayrollData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEarningChange = (index: number, field: keyof EarningsLine, value: any) => {
    setEarnings(prev => prev.map((earning, i) => 
      i === index ? { ...earning, [field]: value } : earning
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Employee Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedEmployeeId}
              onChange={(e) => onSelectEmployee(e.target.value)}
            >
              <option value="">Choose an employee...</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.payType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Date
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.payDate}
              onChange={(e) => handleChange('payDate', e.target.value)}
            />
          </div>
        </div>

        {/* Pay Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Pay Configuration</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Frequency
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value as PayrollData['frequency'])}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="semimonthly">Semi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.payType}
              onChange={(e) => handleChange('payType', e.target.value as PayrollData['payType'])}
            >
              <option value="hourly">Hourly</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        </div>

        {/* Tax Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Tax Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vacation Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.vacationRate}
              onChange={(e) => handleChange('vacationRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Federal TD1 Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="15705"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.federalTD1 || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  handleChange('federalTD1', isNaN(value) ? 0 : value);
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">2025 Federal Basic Personal Amount: $15,705</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincial TD1 Amount (Ontario)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="11865"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.provincialTD1 || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  handleChange('provincialTD1', isNaN(value) ? 0 : value);
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">2025 Ontario Basic Personal Amount: $11,865</p>
          </div>

          {/* Employee Tax Rates Info */}
          {selectedEmployeeId && (
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Employee Tax Rates</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>WSIB Rate: {employees.find(emp => emp.id === selectedEmployeeId)?.wsibRate || 0}%</div>
                <div>Vacation Rate: {employees.find(emp => emp.id === selectedEmployeeId)?.vacationRate || 0}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hours & Earnings Entry */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hours & Earnings</h3>
        {!selectedEmployeeId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-700">
              Please select an employee above to enable hours entry and see current rates.
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Code</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Hours</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning, index) => (
                  <tr key={earning.code}>
                    <td className="border border-gray-300 px-3 py-2 font-mono text-sm">
                      {earning.code}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {earning.description}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      <span className="text-sm text-gray-600">
                        ${(earning.rate || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="120"
                        disabled={!selectedEmployeeId}
                        className={`w-full px-2 py-1 text-right border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${!selectedEmployeeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={earning.hours || ''}
                        onChange={(e) => handleEarningChange(index, 'hours', parseFloat(e.target.value) || null)}
                        placeholder="0"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      <span className="text-sm font-semibold">
                        ${((earning.rate || 0) * (earning.hours || 0)).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">
                    Total Gross:
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    ${earnings.reduce((total, earning) => 
                      total + ((earning.rate || 0) * (earning.hours || 0)), 0
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter hours worked for each earning type. Rates are automatically set based on the selected employee.
          </p>
        </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Calculate Payroll
        </button>
      </div>
    </form>
  )
}