'use client'

import { useState } from 'react'
import { Employee } from '@/hooks/useEmployees'

interface EmployeeManagerProps {
  employees: Employee[]
  onUpdateEmployees: (employees: Employee[]) => void
}

export default function EmployeeManager({ employees, onUpdateEmployees }: EmployeeManagerProps) {

  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    hourlyRate: 0,
    payType: 'hourly',
    vacationRate: 4.0,
    federalTD1: 16129,  // 2025 Federal Basic Personal Amount
    provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
    wsibRate: 2.15,     // Default WSIB rate 2.15%
    active: true,
    startDate: new Date().toISOString().split('T')[0]
  })

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    const employee: Employee = {
      ...newEmployee,
      id: Date.now().toString()
    }
    onUpdateEmployees([...employees, employee])
    setNewEmployee({
      name: '',
      hourlyRate: 0,
      payType: 'hourly',
      vacationRate: 4.0,
      federalTD1: 16129,  // 2025 Federal Basic Personal Amount
      provincialTD1: 12747, // 2025 Ontario Basic Personal Amount
      wsibRate: 2.15,     // Default WSIB rate 2.15%
      active: true,
      startDate: new Date().toISOString().split('T')[0]
    })
    setShowAddForm(false)
  }

  const handleDeleteEmployee = (id: string) => {
    onUpdateEmployees(employees.filter(emp => emp.id !== id))
  }

  const handleToggleActive = (id: string) => {
    onUpdateEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, active: !emp.active } : emp
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee information and payroll settings
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Employee
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.payType}
                  onChange={(e) => setNewEmployee({...newEmployee, payType: e.target.value as 'hourly' | 'salary'})}
                >
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                </select>
              </div>

              {newEmployee.payType === 'hourly' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmployee.hourlyRate}
                    onChange={(e) => setNewEmployee({...newEmployee, hourlyRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Salary
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmployee.salary || 0}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value) || 0})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.vacationRate}
                  onChange={(e) => setNewEmployee({...newEmployee, vacationRate: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WSIB Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.wsibRate}
                  onChange={(e) => setNewEmployee({...newEmployee, wsibRate: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEmployee.startDate}
                  onChange={(e) => setNewEmployee({...newEmployee, startDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Employee
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Pay Type</th>
                <th className="px-6 py-3 text-right font-medium text-gray-900">Rate/Salary</th>
                <th className="px-6 py-3 text-right font-medium text-gray-900">Vacation %</th>
                <th className="px-6 py-3 text-right font-medium text-gray-900">WSIB %</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Start Date</th>
                <th className="px-6 py-3 text-center font-medium text-gray-900">Status</th>
                <th className="px-6 py-3 text-center font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className={!employee.active ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-gray-500 text-xs">ID: {employee.id}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">{employee.payType}</td>
                  <td className="px-6 py-4 text-right">
                    {employee.payType === 'hourly' 
                      ? `$${employee.hourlyRate.toFixed(2)}/hr`
                      : `$${(employee.salary || 0).toLocaleString()}/year`
                    }
                  </td>
                  <td className="px-6 py-4 text-right">{employee.vacationRate}%</td>
                  <td className="px-6 py-4 text-right">{employee.wsibRate}%</td>
                  <td className="px-6 py-4">{employee.startDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(employee.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          employee.active
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {employee.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees</h3>
          <p className="text-gray-500 mb-4">Add your first employee to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      )}
    </div>
  )
}