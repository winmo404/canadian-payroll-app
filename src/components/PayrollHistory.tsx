'use client'

import React, { useState, useMemo } from 'react'
import { PayrollData } from '@/lib/calculations/types'
import { exportMultiplePayrollRuns, exportSinglePayrollRun, generatePayrollSummary } from '@/lib/calculations/export'
import { PayrollDetailModal } from './PayrollDetailModal'
import { PaystubModal } from './PaystubModal'

interface PayrollHistoryProps {
  payrollHistory: PayrollData[]
  onClearHistory: () => void
  onViewDetail?: (payroll: PayrollData) => void
  onViewPaystub?: (payroll: PayrollData) => void
  onEditPayroll?: (payroll: PayrollData) => void
}

export default function PayrollHistory({ payrollHistory, onClearHistory, onViewDetail, onViewPaystub, onEditPayroll }: PayrollHistoryProps) {
  const [searchEmployee, setSearchEmployee] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'employee' | 'gross' | 'net'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [paystubModalOpen, setPaystubModalOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollData | null>(null)

  // Filter and sort payroll history
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = payrollHistory.filter(payroll => {
      const employeeName = (payroll.calculations?.employeeName || payroll.employeeName || '').toLowerCase()
      const payDate = payroll.calculations?.payDate || payroll.payDate || ''
      
      const matchesEmployee = !searchEmployee || employeeName.includes(searchEmployee.toLowerCase())
      const matchesDateFrom = !filterDateFrom || payDate >= filterDateFrom
      const matchesDateTo = !filterDateTo || payDate <= filterDateTo
      
      return matchesEmployee && matchesDateFrom && matchesDateTo
    })

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'employee':
          aValue = (a.calculations?.employeeName || a.employeeName || '').toLowerCase()
          bValue = (b.calculations?.employeeName || b.employeeName || '').toLowerCase()
          break
        case 'gross':
          aValue = a.calculations?.gross || 0
          bValue = b.calculations?.gross || 0
          break
        case 'net':
          aValue = a.calculations?.net || 0
          bValue = b.calculations?.net || 0
          break
        case 'date':
        default:
          aValue = a.calculations?.payDate || a.payDate || ''
          bValue = b.calculations?.payDate || b.payDate || ''
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [payrollHistory, searchEmployee, filterDateFrom, filterDateTo, sortBy, sortOrder])

  const handleSort = (column: 'date' | 'employee' | 'gross' | 'net') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      // Default to ascending for date (chronological), descending for others
      setSortOrder(column === 'date' ? 'asc' : 'desc')
    }
  }

  const getSortIcon = (column: 'date' | 'employee' | 'gross' | 'net') => {
    if (sortBy !== column) return '↕️'
    return sortOrder === 'asc' ? '↗️' : '↘️'
  }

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const handleViewDetail = (payroll: PayrollData) => {
    setSelectedPayroll(payroll)
    setDetailModalOpen(true)
    if (onViewDetail) onViewDetail(payroll)
  }

  const handleViewPaystub = (payroll: PayrollData) => {
    setSelectedPayroll(payroll)
    setPaystubModalOpen(true)
    if (onViewPaystub) onViewPaystub(payroll)
  }

  const handleEditPayroll = (payroll: PayrollData) => {
    if (onEditPayroll) onEditPayroll(payroll)
  }
  if (payrollHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Payroll History
        </h3>
        <p className="text-gray-500">
          Payroll calculations will appear here after you process them
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll History</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedHistory.length} of {payrollHistory.length} payroll run{payrollHistory.length !== 1 ? 's' : ''} 
            {filteredAndSortedHistory.length !== payrollHistory.length && ' (filtered)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportMultiplePayrollRuns(filteredAndSortedHistory, 'csv')}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => exportMultiplePayrollRuns(filteredAndSortedHistory, 'json')}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            📄 Export JSON
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all payroll history?')) {
                onClearHistory()
              }
            }}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            🗑️ Clear History
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Employee
            </label>
            <input
              type="text"
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              placeholder="Type employee name..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchEmployee('')
                setFilterDateFrom('')
                setFilterDateTo('')
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payroll history list */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('employee')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Employee</span>
                    <span className="text-xs">{getSortIcon('employee')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Pay Date</span>
                    <span className="text-xs">{getSortIcon('date')}</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('gross')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Gross Pay</span>
                    <span className="text-xs">{getSortIcon('gross')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-900">Deductions</th>
                <th 
                  className="px-6 py-3 text-right font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('net')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Net Pay</span>
                    <span className="text-xs">{getSortIcon('net')}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedHistory.map((payroll, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRowExpansion(index)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {expandedRows.has(index) ? '▼' : '▶️'}
                        </button>
                        <div>
                          <div className="font-medium text-gray-900">
                            {payroll.calculations?.employeeName || payroll.employeeName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {payroll.calculations?.frequency || payroll.frequency}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payroll.calculations?.payDate || payroll.payDate}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      ${payroll.calculations?.gross.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      ${payroll.calculations ? (
                        payroll.calculations.cpp1Emp + 
                        payroll.calculations.cpp2Emp + 
                        payroll.calculations.eiEmp + 
                        payroll.calculations.tax
                      ).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-green-700">
                      ${payroll.calculations?.net.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {/* Edit button */}
                        <button
                          onClick={() => handleEditPayroll(payroll)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          title="Edit Payroll"
                        >
                          ✏️ Edit
                        </button>
                        
                        {/* View buttons */}
                        <button
                          onClick={() => handleViewDetail(payroll)}
                          className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                          title="View Detail"
                        >
                          👁️ Detail
                        </button>
                        <button
                          onClick={() => handleViewPaystub(payroll)}
                          className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded hover:bg-cyan-200"
                          title="View Paystub"
                        >
                          📄 Paystub
                        </button>
                        
                        {/* Export buttons */}
                        <button
                          onClick={() => exportSinglePayrollRun(payroll, 'csv')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                          title="Export CSV"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => exportSinglePayrollRun(payroll, 'json')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          title="Export JSON"
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => {
                            const summary = generatePayrollSummary(payroll)
                            navigator.clipboard.writeText(summary).then(() => {
                              alert('Payroll summary copied to clipboard!')
                            })
                          }}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                          title="Copy Summary"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {expandedRows.has(index) && payroll.calculations && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Earnings Breakdown */}
                          <div className="bg-white p-4 rounded border">
                            <h4 className="font-medium text-gray-900 mb-2">Earnings Breakdown</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Pay Type:</span>
                                <span>{payroll.calculations.payType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Frequency:</span>
                                <span>{payroll.calculations.frequency}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vacation Paid:</span>
                                <span>${payroll.calculations.vacPaid?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t pt-1">
                                <span>Gross Total:</span>
                                <span>${payroll.calculations.gross.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Deductions Breakdown */}
                          <div className="bg-white p-4 rounded border">
                            <h4 className="font-medium text-gray-900 mb-2">Deductions Breakdown</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>CPP:</span>
                                <span>${(payroll.calculations.cpp1Emp + payroll.calculations.cpp2Emp).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>EI:</span>
                                <span>${payroll.calculations.eiEmp.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Income Tax:</span>
                                <span>${payroll.calculations.tax.toFixed(2)}</span>
                              </div>

                              <div className="flex justify-between font-medium border-t pt-1">
                                <span>Total Deductions:</span>
                                <span>${(
                                  payroll.calculations.cpp1Emp + 
                                  payroll.calculations.cpp2Emp + 
                                  payroll.calculations.eiEmp + 
                                  payroll.calculations.tax
                                ).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* YTD Information */}
                          <div className="bg-white p-4 rounded border">
                            <h4 className="font-medium text-gray-900 mb-2">Year-to-Date</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>YTD Gross:</span>
                                <span>${payroll.calculations.newYtdGross?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>YTD CPP:</span>
                                <span>${(payroll.calculations.newYtdCPP1 + payroll.calculations.newYtdCPP2)?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>YTD EI:</span>
                                <span>${payroll.calculations.newYtdEI?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>YTD Tax:</span>
                                <span>${payroll.calculations.newYtdTax?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t pt-1">
                                <span>YTD Net:</span>
                                <span>${(payroll.calculations.newYtdGross - payroll.calculations.newYtdCPP1 - payroll.calculations.newYtdCPP2 - payroll.calculations.newYtdEI - payroll.calculations.newYtdTax)?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Summary Statistics 
          {filteredAndSortedHistory.length !== payrollHistory.length && (
            <span className="text-sm text-gray-500 font-normal">(Filtered View)</span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredAndSortedHistory.length}
            </div>
            <div className="text-sm text-gray-600">
              {filteredAndSortedHistory.length !== payrollHistory.length 
                ? `Filtered Runs (${payrollHistory.length} total)` 
                : 'Total Runs'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${filteredAndSortedHistory.reduce((total, payroll) => 
                total + (payroll.calculations?.gross || 0), 0
              ).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Gross</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${filteredAndSortedHistory.reduce((total, payroll) => 
                total + (payroll.calculations ? (
                  payroll.calculations.cpp1Emp + 
                  payroll.calculations.cpp2Emp + 
                  payroll.calculations.eiEmp + 
                  payroll.calculations.tax
                ) : 0), 0
              ).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Deductions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${filteredAndSortedHistory.reduce((total, payroll) => 
                total + (payroll.calculations?.net || 0), 0
              ).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Net</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PayrollDetailModal 
        payroll={selectedPayroll}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedPayroll(null)
        }}
      />

      <PaystubModal 
        payroll={selectedPayroll}
        isOpen={paystubModalOpen}
        onClose={() => {
          setPaystubModalOpen(false)
          setSelectedPayroll(null)
        }}
      />
    </div>
  )
}