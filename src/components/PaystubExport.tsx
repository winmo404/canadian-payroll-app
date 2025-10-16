import React from 'react'
import { PayrollData } from '@/lib/calculations/types'
import ProfessionalPaystub from './ProfessionalPaystub'

interface PaystubExportProps {
  payrollHistory: PayrollData[]
  onClearHistory?: () => void
}

export default function PaystubExport({ payrollHistory, onClearHistory }: PaystubExportProps) {
  const [selectedPaystub, setSelectedPaystub] = React.useState<PayrollData | null>(null)
  const [exportFormat, setExportFormat] = React.useState<'pdf' | 'html' | 'print'>('print')

  const handleExportPaystub = (payrollData: PayrollData, format: 'pdf' | 'html' | 'print') => {
    if (format === 'print') {
      setSelectedPaystub(payrollData)
      setTimeout(() => {
        window.print()
      }, 100)
    } else if (format === 'html') {
      exportAsHTML(payrollData)
    } else if (format === 'pdf') {
      // For now, use print to PDF
      setSelectedPaystub(payrollData)
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }

  const exportAsHTML = (payrollData: PayrollData) => {
    if (!payrollData.calculations) return

    const calc = payrollData.calculations
    const currentDate = new Date().toLocaleDateString('en-CA')

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Paystub - ${calc.employeeName} - ${calc.payDate}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .paystub { max-width: 800px; margin: 0 auto; border: 2px solid black; }
        .header { background-color: #f5f5f5; padding: 20px; border-bottom: 2px solid black; }
        .company-name { font-size: 24px; font-weight: bold; }
        .employee-info { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .section { padding: 20px; border-bottom: 1px solid #ccc; }
        .section h3 { margin-top: 0; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
        .net-pay { font-size: 24px; font-weight: bold; color: green; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="paystub">
        <div class="header">
            <div class="company-name">YOUR COMPANY NAME</div>
            <div>123 Business Street, Toronto, ON M5V 3A8</div>
            <div>Phone: (416) 555-0123</div>
            <div style="float: right; text-align: right;">
                <h2>PAY STATEMENT</h2>
                <div>Pay Date: ${calc.payDate}</div>
                <div>Statement Date: ${currentDate}</div>
            </div>
            <div style="clear: both;"></div>
        </div>
        
        <div class="employee-info">
            <div>
                <h3>EMPLOYEE INFORMATION</h3>
                <div>Name: ${calc.employeeName}</div>
                <div>Pay Type: ${calc.payType.toUpperCase()}</div>
                <div>Pay Frequency: ${calc.frequency.toUpperCase()}</div>
            </div>
            <div>
                <h3>PAY SUMMARY</h3>
                <div class="net-pay">NET PAY: $${calc.net.toFixed(2)}</div>
                <div>Gross Pay: $${calc.gross.toFixed(2)}</div>
            </div>
        </div>

        <div class="section">
            <h3>EARNINGS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Hours</th>
                        <th class="text-right">Current Amount</th>
                        <th class="text-right">YTD Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${calc.lines.map(line => `
                        <tr>
                            <td>${line.description}</td>
                            <td class="text-right">$${(line.rate || 0).toFixed(2)}</td>
                            <td class="text-right">${(line.hours || 0).toFixed(2)}</td>
                            <td class="text-right">$${line.amount.toFixed(2)}</td>
                            <td class="text-right">$${(line.ytdAmount || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background-color: #e6f3ff; font-weight: bold;">
                        <td colspan="3">TOTAL EARNINGS</td>
                        <td class="text-right">$${calc.gross.toFixed(2)}</td>
                        <td class="text-right">$${calc.ytdGross.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>DEDUCTIONS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Current</th>
                        <th class="text-right">YTD</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>CPP Contributions</td>
                        <td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                        <td class="text-right">$${(calc.ytdCPP1 + calc.ytdCPP2 + calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>EI Premiums</td>
                        <td class="text-right">$${calc.eiEmp.toFixed(2)}</td>
                        <td class="text-right">$${(calc.ytdEI + calc.eiEmp).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Income Tax</td>
                        <td class="text-right">$${calc.tax.toFixed(2)}</td>
                        <td class="text-right">$${(calc.ytdTax + calc.tax).toFixed(2)}</td>
                    </tr>
                    <tr style="background-color: #ffe6e6; font-weight: bold;">
                        <td>TOTAL DEDUCTIONS</td>
                        <td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}</td>
                        <td class="text-right">$${(calc.ytdCPP1 + calc.ytdCPP2 + calc.ytdEI + calc.ytdTax + calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <strong>IMPORTANT:</strong> This is an official pay statement. Retain for your records.<br>
            Generated: ${currentDate} | Canadian Payroll App v1.0
        </div>
    </div>
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paystub-${calc.employeeName.replace(/\s+/g, '-')}-${calc.payDate}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAllPaystubs = () => {
    if (payrollHistory.length === 0) {
      alert('No paystubs to export')
      return
    }

    // Create a summary report
    const summaryHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Payroll Summary Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h1>Payroll Summary Report</h1>
    <p>Generated: ${new Date().toLocaleDateString('en-CA')}</p>
    
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Pay Date</th>
                <th>Pay Type</th>
                <th class="text-right">Gross Pay</th>
                <th class="text-right">CPP</th>
                <th class="text-right">EI</th>
                <th class="text-right">Tax</th>
                <th class="text-right">Net Pay</th>
            </tr>
        </thead>
        <tbody>
            ${payrollHistory.map(payroll => {
              const calc = payroll.calculations
              if (!calc) return ''
              return `
                <tr>
                    <td>${calc.employeeName}</td>
                    <td>${calc.payDate}</td>
                    <td>${calc.payType}</td>
                    <td class="text-right">$${calc.gross.toFixed(2)}</td>
                    <td class="text-right">$${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                    <td class="text-right">$${calc.eiEmp.toFixed(2)}</td>
                    <td class="text-right">$${calc.tax.toFixed(2)}</td>
                    <td class="text-right">$${calc.net.toFixed(2)}</td>
                </tr>
              `
            }).join('')}
        </tbody>
    </table>
</body>
</html>
    `

    const blob = new Blob([summaryHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-summary-${new Date().toISOString().split('T')[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (selectedPaystub) {
    return (
      <div>
        <div className="no-print mb-4">
          <button
            onClick={() => setSelectedPaystub(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to List
          </button>
        </div>
        <ProfessionalPaystub payrollData={selectedPaystub} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">📋 Paystub Export Center</h2>
        
        <div className="mb-4 flex gap-2">
          <button
            onClick={exportAllPaystubs}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            📊 Export Summary Report
          </button>
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {payrollHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Paystubs Available</h3>
            <p className="text-gray-500">
              Calculate some payroll first to see paystubs here for export
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Paystubs ({payrollHistory.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Employee</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Pay Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Gross</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Net</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHistory.map((payroll, index) => {
                    const calc = payroll.calculations
                    if (!calc) return null
                    return (
                      <tr key={index} className="even:bg-gray-25">
                        <td className="border border-gray-300 px-3 py-2">{calc.employeeName}</td>
                        <td className="border border-gray-300 px-3 py-2">{calc.payDate}</td>
                        <td className="border border-gray-300 px-3 py-2">{calc.payType}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">${calc.gross.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">${calc.net.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleExportPaystub(payroll, 'print')}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              title="Print/PDF"
                            >
                              🖨️
                            </button>
                            <button
                              onClick={() => handleExportPaystub(payroll, 'html')}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              title="Export HTML"
                            >
                              📄
                            </button>
                            <button
                              onClick={() => setSelectedPaystub(payroll)}
                              className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                              title="View Full"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}