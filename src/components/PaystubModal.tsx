/**
 * PaystubModal - Modal component for viewing paystub in professional format
 */

import React from 'react'
import { PayrollData } from '@/lib/calculations/types'

interface PaystubModalProps {
  payroll: PayrollData | null
  isOpen: boolean
  onClose: () => void
}

export const PaystubModal: React.FC<PaystubModalProps> = ({
  payroll,
  isOpen,
  onClose
}) => {
  if (!isOpen || !payroll?.calculations) return null

  const calc = payroll.calculations

  const handlePrint = () => {
    window.print()
  }

  const handleSaveAsHTML = () => {
    const paystubHTML = generatePaystubHTML()
    const blob = new Blob([paystubHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paystub-${calc.employeeName.replace(/\s+/g, '-')}-${calc.payDate}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generatePaystubHTML = () => {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Paystub - ${calc.employeeName} - ${calc.payDate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .paystub { max-width: 800px; margin: 0 auto; border: 2px solid black; }
        .header { background-color: #f5f5f5; padding: 20px; border-bottom: 2px solid black; }
        .company-name { font-size: 24px; font-weight: bold; }
        .net-pay { font-size: 24px; font-weight: bold; color: green; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
        .section { margin: 20px; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="paystub">
        <div class="header">
            <div class="company-name">YOUR COMPANY NAME</div>
            <div>123 Business Street, City, Province, Postal Code</div>
            <div>Phone: (555) 123-4567 | Email: payroll@company.com</div>
            <div style="margin-top: 15px;">
                <strong>Pay Date: ${calc.payDate}</strong> | 
                <strong>Pay Period: ${calc.frequency}</strong>
            </div>
            <div class="net-pay">NET PAY: $${calc.net.toFixed(2)}</div>
        </div>
        
        <div class="section">
            <h3>Employee: ${calc.employeeName}</h3>
            <p>Pay Type: ${calc.payType} | Frequency: ${calc.frequency}</p>
        </div>

        <div class="section">
            <table>
                <thead>
                    <tr>
                        <th>Earnings</th>
                        <th class="text-right">This Period</th>
                        <th class="text-right">Year to Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Gross Pay</td>
                        <td class="text-right">$${calc.gross.toFixed(2)}</td>
                        <td class="text-right">$${calc.newYtdGross.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Vacation Accrued</td>
                        <td class="text-right">$${calc.vacAccrued.toFixed(2)}</td>
                        <td class="text-right">$${calc.ytdVacAccrued.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Vacation Paid</td>
                        <td class="text-right">$${calc.vacPaid.toFixed(2)}</td>
                        <td class="text-right">$${calc.newYtdVacPaid.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <table>
                <thead>
                    <tr>
                        <th>Deductions</th>
                        <th class="text-right">This Period</th>
                        <th class="text-right">Year to Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>CPP Contributions</td>
                        <td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                        <td class="text-right">$${(calc.newYtdCPP1 + calc.newYtdCPP2).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>EI Premiums</td>
                        <td class="text-right">$${calc.eiEmp.toFixed(2)}</td>
                        <td class="text-right">$${calc.newYtdEI.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Income Tax</td>
                        <td class="text-right">$${calc.tax.toFixed(2)}</td>
                        <td class="text-right">$${calc.newYtdTax.toFixed(2)}</td>
                    </tr>

                    <tr style="border-top: 2px solid black; font-weight: bold;">
                        <td>Total Deductions</td>
                        <td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}</td>
                        <td class="text-right">$${(calc.newYtdCPP1 + calc.newYtdCPP2 + calc.newYtdEI + calc.newYtdTax).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <table>
                <thead>
                    <tr>
                        <th>Net Pay Summary</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Gross Pay</td>
                        <td class="text-right">$${calc.gross.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Less: Total Deductions</td>
                        <td class="text-right">($${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)})</td>
                    </tr>
                    <tr style="border-top: 2px solid black; font-weight: bold; font-size: 18px; background-color: #e6ffe6;">
                        <td>NET PAY</td>
                        <td class="text-right">$${calc.net.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <p style="text-align: center; font-size: 12px; color: #666;">
                This is an official payroll statement. Please retain for your records.<br>
                Generated on ${new Date().toLocaleDateString()} by Canadian Payroll System v1.0
            </p>
        </div>
    </div>
</body>
</html>`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          
          {/* Header - No Print */}
          <div className="bg-gray-50 px-6 py-4 border-b no-print">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Paystub - {calc.employeeName}
                </h3>
                <p className="text-sm text-gray-500">
                  Pay Date: {calc.payDate}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleSaveAsHTML}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  💾 Save HTML
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Paystub Content - Printable */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="border-2 border-black">
              {/* Company Header */}
              <div className="bg-gray-100 p-6 border-b-2 border-black">
                <div className="text-2xl font-bold mb-2">YOUR COMPANY NAME</div>
                <div className="text-sm mb-2">123 Business Street, City, Province, Postal Code</div>
                <div className="text-sm mb-4">Phone: (555) 123-4567 | Email: payroll@company.com</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-medium">Pay Date: {calc.payDate}</div>
                    <div className="font-medium">Pay Period: {calc.frequency}</div>
                    <div className="font-medium">Employee: {calc.employeeName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      NET PAY: ${calc.net.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Paystub Body */}
              <div className="p-6">
                {/* Earnings Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Earnings</h3>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">This Period</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Year to Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Gross Pay</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.gross.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.newYtdGross.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Vacation Accrued</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.vacAccrued.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.ytdVacAccrued.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Vacation Paid</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.vacPaid.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.newYtdVacPaid?.toFixed(2) || '0.00'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Deductions</h3>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">This Period</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Year to Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">CPP Contributions</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${(calc.newYtdCPP1 + calc.newYtdCPP2).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">EI Premiums</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.eiEmp.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.newYtdEI.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Income Tax</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.tax.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">${calc.newYtdTax.toFixed(2)}</td>
                      </tr>

                      <tr className="border-t-2 border-black font-bold bg-red-50">
                        <td className="border border-gray-300 px-4 py-2">Total Deductions</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          ${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                          ${(calc.newYtdCPP1 + calc.newYtdCPP2 + calc.newYtdEI + calc.newYtdTax).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Net Pay Summary */}
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>NET PAY:</span>
                    <span className="text-2xl text-green-700">${calc.net.toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>This is an official payroll statement. Please retain for your records.</p>
                  <p>Generated on {new Date().toLocaleDateString()} by Canadian Payroll System v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}