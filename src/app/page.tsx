'use client'

import { useState, useEffect } from 'react'
import PayrollForm from '@/components/PayrollForm'
import EmployeeManager from '@/components/EmployeeManager'
import CompanySettingsManager from '@/components/CompanySettingsManager'
import PayrollHistory from '@/components/PayrollHistory'
import { PayrollEditModal } from '@/components/PayrollEditModal'
import StorageManager from '@/components/StorageManager'
import { YTDDebug } from '@/components/YTDDebug'
import { TaxComparison } from '@/components/TaxComparison'
import { TD1Migration } from '@/components/TD1Migration'
import { ActivityLedger } from '@/components/ActivityLedger'
import DataRecovery from '@/components/DataRecovery'
import ProfessionalPaystub from '@/components/ProfessionalPaystub'
import PaystubExport from '@/components/PaystubExport'
import FileStorageManager from '@/components/FileStorageManager'
import { AutoFileSystemManager } from '@/components/AutoFileSystemManager'
import { DataSyncManager } from '@/components/DataSyncManager'
import { PayrollData, EarningsLine } from '@/lib/calculations/types'
import { calculatePayroll } from '@/lib/calculations/payroll'
import { exportSinglePayrollRun, generatePayrollSummary } from '@/lib/calculations/export'
import { calculateEmployeeYTD } from '@/lib/calculations/ytd'
import { useEmployeesDB } from '@/hooks/useEmployeesDB'
import { usePayrollHistory } from '@/hooks/usePayrollHistory'
import { useSelectedEmployee } from '@/hooks/useSelectedEmployee'
import { useAutoFileSystem } from '@/hooks/useAutoFileSystem'

export default function HomePage() {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null)
  const [activeTab, setActiveTab] = useState('payroll')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<PayrollData | null>(null)
  
  // Use database hooks
  const { employees, isLoading: employeesLoading, fetchEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeById, getActiveEmployees } = useEmployeesDB()
  
  // Create updateEmployees wrapper for compatibility with existing components
  const updateEmployees = async (newEmployees: any[]) => {
    // This function updates employees in batch - for database, we'd need to handle each individually
    // For now, just refresh the employees list from database
    await fetchEmployees()
  }
  const { payrollHistory, addPayrollRun, clearHistory } = usePayrollHistory()
  const { selectedEmployeeId, setSelectedEmployeeId } = useSelectedEmployee('1')
  const { autoSavePaystub } = useAutoFileSystem()

  // Auto-select first employee if none is selected and employees are available
  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, selectedEmployeeId, setSelectedEmployeeId])

  const handleDataUpdate = (data: { employees: any[]; payrollHistory: any[] }) => {
    updateEmployees(data.employees)
    // Note: payrollHistory updates would need additional integration with usePayrollHistory hook
    // For now, we'll focus on employee data synchronization
    console.log('Data updated from sync:', data)
  }

  const handleViewPayrollDetail = (payroll: any) => {
    console.log('Viewing payroll detail:', payroll)
  }

  const handleViewPaystub = (payroll: any) => {
    // Recalculate the payroll with correct YTD logic up to this specific payroll's date
    const selectedEmployee = employees.find(emp => emp.name === payroll.employeeName)
    if (selectedEmployee && payroll.calculations?.lines) {
      console.log('🔍 Recalculating historical payroll for correct YTD display up to', payroll.payDate)
      
      const payrollDate = new Date(payroll.payDate)
      
      // Get payroll history up to (but not including) this payroll's date
      // Only include payrolls that are chronologically before this one
      const filteredHistory = payrollHistory.filter(p => {
        const isSameEmployee = p.employeeName === payroll.employeeName
        const pDate = new Date(p.payDate)
        const isBeforeThisPayroll = pDate < payrollDate
        const isSameYear = pDate.getFullYear() === payrollDate.getFullYear()
        
        return isSameEmployee && isBeforeThisPayroll && isSameYear && p.calculations
      })
      
      console.log('🔍 Filtered history for YTD calculation:', {
        targetDate: payroll.payDate,
        filteredRecords: filteredHistory.length,
        dates: filteredHistory.map(p => p.payDate)
      })
      
      // Calculate YTD up to (but not including) this payroll's date
      const employeeYTD = calculateEmployeeYTD(
        payroll.employeeName,
        filteredHistory,
        payrollDate.getFullYear()
      )
      
      // Use the original earnings lines from the stored payroll
      const originalEarnings = payroll.calculations.lines.map((line: any) => ({
        code: line.code,
        description: line.description,
        rate: line.rate,
        hours: line.hours,
        amount: line.amount,
        ytdHours: 0, // Will be recalculated to show YTD up to this date
        ytdAmount: 0 // Will be recalculated to show YTD up to this date
      }))
      
      // Recalculate with current logic using YTD up to this point
      const taxRates = { wsibRate: selectedEmployee.wsibRate }
      const recalculatedResult = calculatePayroll(payroll, originalEarnings, employeeYTD, taxRates, filteredHistory)
      
      // Use recalculated data for display
      const updatedPayrollData = {
        ...payroll,
        calculations: recalculatedResult
      }
      
      setPayrollData(updatedPayrollData)
    } else {
      // Fallback to stored data if employee not found
      setPayrollData(payroll)
    }
    
    setActiveTab('paystub')
  }

  const handleEditPayroll = (payroll: PayrollData) => {
    setEditingPayroll(payroll)
    setEditModalOpen(true)
  }

  const handleSaveEditedPayroll = (updatedPayroll: PayrollData, updatedEarnings: EarningsLine[]) => {
    // Find the employee for tax rates
    const selectedEmployee = getEmployeeById(selectedEmployeeId)
    if (!selectedEmployee) return
    
    // Calculate YTD before this payroll (excluding this one from history)
    const filteredHistory = payrollHistory.filter(p => 
      !(p.employeeName === updatedPayroll.employeeName && 
        p.payDate === updatedPayroll.payDate)
    )
    
    const employeeYTD = calculateEmployeeYTD(
      updatedPayroll.employeeName, 
      filteredHistory, 
      new Date().getFullYear()
    )
    
    // Pass employee-specific tax rates
    const taxRates = {
      wsibRate: selectedEmployee.wsibRate
    }
    
    // Recalculate with updated data
    const result = calculatePayroll(updatedPayroll, updatedEarnings, employeeYTD, taxRates, filteredHistory)
    const newPayrollData = { ...updatedPayroll, calculations: result }
    
    // Update in history - remove old entry and add new one
    const updatedHistory = payrollHistory.map(p => 
      (p.employeeName === updatedPayroll.employeeName && p.payDate === updatedPayroll.payDate) 
        ? newPayrollData 
        : p
    )
    
    // Update the history
    clearHistory()
    updatedHistory.forEach(payroll => addPayrollRun(payroll))
    
    // Update current payroll data if it matches
    if (payrollData && 
        payrollData.employeeName === updatedPayroll.employeeName && 
        payrollData.payDate === updatedPayroll.payDate) {
      setPayrollData(newPayrollData)
    }
    
    setEditModalOpen(false)
    setEditingPayroll(null)
  }

  const handleCalculate = (data: PayrollData, earnings: EarningsLine[]) => {
    const selectedEmployee = getEmployeeById(selectedEmployeeId)
    if (!selectedEmployee) return
    
    // Calculate actual YTD from this employee's payroll history
    const employeeYTD = calculateEmployeeYTD(
      selectedEmployee.name, 
      payrollHistory, 
      new Date().getFullYear()
    )
    
    // Pass employee-specific tax rates including WSIB
    const taxRates = {
      wsibRate: selectedEmployee.wsibRate // Use employee's WSIB rate
    }
    
    const result = calculatePayroll(data, earnings, employeeYTD, taxRates, payrollHistory)
    const newPayrollData = { ...data, calculations: result }
    setPayrollData(newPayrollData)
    
    // Add to history using persistent hook
    addPayrollRun(newPayrollData)
    
    // Automatically save paystub to local hard drive
    try {
      autoSavePaystub(newPayrollData)
      console.log('✅ Paystub automatically saved to local drive')
    } catch (error) {
      console.error('Failed to auto-save paystub:', error)
    }
  }

  const tabs = [
    { id: 'payroll', label: 'Calculate Payroll', icon: '💰' },
    { id: 'employees', label: 'Manage Employees', icon: '👥' },
    { id: 'company-settings', label: 'Company Settings', icon: '🏢' },
    { id: 'history', label: 'Payroll History', icon: '📈' },
    { id: 'paystub', label: 'Professional Paystub', icon: '📄' },
  ]

  return (
    <div className="space-y-6">
      {/* Storage Status */}
      <StorageManager />

      {/* TD1 Migration Notice */}
      <TD1Migration 
        employees={employees}
        onUpdateEmployees={updateEmployees}
      />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <PayrollForm 
                onCalculate={handleCalculate} 
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onSelectEmployee={setSelectedEmployeeId}
              />
              
              {/* YTD Debug Information */}
              {selectedEmployeeId && (
                <YTDDebug 
                  employeeName={getEmployeeById(selectedEmployeeId)?.name || ''}
                  payrollHistory={payrollHistory}
                />
              )}
              {payrollData?.calculations && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Calculation Summary</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportSinglePayrollRun(payrollData, 'csv')}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        📊 Export CSV
                      </button>
                      <button
                        onClick={() => exportSinglePayrollRun(payrollData, 'json')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        📄 Export JSON
                      </button>
                      <button
                        onClick={() => {
                          const summary = generatePayrollSummary(payrollData)
                          navigator.clipboard.writeText(summary).then(() => {
                            alert('Payroll summary copied to clipboard!')
                          })
                        }}
                        className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        📋 Copy Summary
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800">Net Pay</h4>
                      <p className="text-2xl font-bold text-green-900">
                        ${payrollData.calculations.net.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800">Total Deductions</h4>
                      <p className="text-2xl font-bold text-blue-900">
                        ${(payrollData.calculations.cpp1Emp + payrollData.calculations.cpp2Emp + 
                           payrollData.calculations.eiEmp + payrollData.calculations.tax).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800">Gross Pay</h4>
                      <p className="text-2xl font-bold text-purple-900">
                        ${payrollData.calculations.gross.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && (
            <EmployeeManager />
          )}

          {activeTab === 'company-settings' && (
            <CompanySettingsManager />
          )}

          {activeTab === 'history' && (
            <PayrollHistory 
              payrollHistory={payrollHistory}
              onClearHistory={clearHistory}
              onViewDetail={handleViewPayrollDetail}
              onViewPaystub={handleViewPaystub}
              onEditPayroll={handleEditPayroll}
            />
          )}

          {activeTab === 'paystub' && payrollData?.calculations && (
            <ProfessionalPaystub 
              payrollData={payrollData}
              onExport={() => {
                addPayrollRun(payrollData)
                alert('Paystub saved to payroll history!')
              }}
            />
          )}

          {activeTab === 'paystub' && !payrollData?.calculations && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Professional Paystub Available
              </h3>
              <p className="text-gray-500">
                Calculate payroll first to generate a professional paystub with print/export functionality
              </p>
            </div>
          )}



          {activeTab === 'paystub-export' && (
            <PaystubExport 
              payrollHistory={payrollHistory}
              onClearHistory={clearHistory}
            />
          )}

          {activeTab === 'file-storage' && (
            <FileStorageManager />
          )}

          {activeTab === 'auto-file-system' && (
            <AutoFileSystemManager 
              employees={employees}
              payrollHistory={payrollHistory}
              onDataLoaded={handleDataUpdate}
            />
          )}

          {activeTab === 'data-sync' && (
            <DataSyncManager 
              employees={employees}
              payrollHistory={payrollHistory}
              onDataUpdate={handleDataUpdate}
            />
          )}

          {activeTab === 'data-recovery' && (
            <DataRecovery onDataRestored={() => window.location.reload()} />
          )}

          {activeTab === 'tax-debug' && (
            <TaxComparison />
          )}

          {activeTab === 'activity-ledger' && (
            <ActivityLedger />
          )}
        </div>
      </div>
      
      {/* Edit Payroll Modal */}
      <PayrollEditModal
        payroll={editingPayroll}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingPayroll(null)
        }}
        onSave={handleSaveEditedPayroll}
      />
    </div>
  )
}