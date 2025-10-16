import React from 'react'
import { PayrollData } from '@/lib/calculations/types'
import { useCompanySettings } from '@/hooks/useCompanySettings'

interface ProfessionalPaystubProps {
  payrollData: PayrollData
  onExport?: () => void
}

export default function ProfessionalPaystub({ payrollData, onExport }: ProfessionalPaystubProps) {
  const { companySettings, getFormattedAddress } = useCompanySettings()
  
  if (!payrollData.calculations) {
    return <div>No calculation data available</div>
  }

  const calc = payrollData.calculations
  const currentDate = new Date().toLocaleDateString('en-CA')

  const handlePrint = () => {
    // Get the paystub content
    const paystubElement = document.getElementById('paystub-content')
    if (!paystubElement) {
      console.error('Paystub content not found')
      return
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      // Fallback to regular print if popup blocked
      window.print()
      return
    }

    // Get the paystub HTML content
    const paystubHTML = paystubElement.outerHTML

    // Create clean print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paystub - ${calc.employeeName} - ${calc.payDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            background: white; 
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .paystub-container { 
            width: 100%; 
            border: 2px solid black; 
            background: white;
          }
          .company-header { background-color: #f5f5f5; padding: 16px; border-bottom: 2px solid black; }
          .bg-gray-100 { background-color: #f5f5f5 !important; }
          .border-gray-300 { border-color: #d1d5db; }
          .text-2xl { font-size: 1.5rem; font-weight: bold; }
          .text-xl { font-size: 1.25rem; font-weight: bold; }
          .text-lg { font-size: 1.125rem; font-weight: 600; }
          .text-sm { font-size: 0.875rem; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-start { align-items: flex-start; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-8 { gap: 2rem; }
          .gap-4 { gap: 1rem; }
          .p-4 { padding: 1rem; }
          .p-3 { padding: 0.75rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .border { border-width: 1px; }
          .border-2 { border-width: 2px; }
          .border-b { border-bottom-width: 1px; }
          .border-b-2 { border-bottom-width: 2px; }
          .border-black { border-color: black; }
          .border-gray-300 { border-color: #d1d5db; }
          .w-full { width: 100%; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 0.5rem; }
          th { background-color: #f9fafb; font-weight: 600; }
          @page { margin: 0.5in; size: letter portrait; }
        </style>
      </head>
      <body>
        ${paystubHTML}
      </body>
      </html>
    `)

    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handleExportPDF = () => {
    // Use the same print method - user can save as PDF
    handlePrint()
  }

  return (
    <div className="professional-paystub">
      {/* Export Controls - Hidden in print */}
      <div className="no-print mb-4 flex gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Print Paystub
        </button>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📄 Export PDF
        </button>
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            💾 Save to History
          </button>
        )}
      </div>

      {/* Professional Paystub Layout */}
      <div id="paystub-content" className="paystub-container bg-white border-2 border-black print:border-2 print:border-black max-w-4xl mx-auto">
        
        {/* Company Header */}
        <div className="company-header bg-gray-100 p-4 border-b-2 border-black">
          <div className="flex justify-between items-start">
            <div className="company-info">
              <h1 className="text-2xl font-bold text-black">{companySettings.name}</h1>
              <div className="text-sm text-gray-700 mt-1">
                <div>{companySettings.address.street}</div>
                <div>{companySettings.address.city}, {companySettings.address.province} {companySettings.address.postalCode}</div>
                <div>Phone: {companySettings.phone}</div>
                {companySettings.email && (
                  <div>Email: {companySettings.email}</div>
                )}
              </div>
            </div>
            <div className="paystub-info text-right">
              <h2 className="text-xl font-bold text-black">PAY STATEMENT</h2>
              <div className="text-sm text-gray-700 mt-1">
                <div>Pay Date: <span className="font-semibold">{calc.payDate}</span></div>
                <div>Pay Period: <span className="font-semibold">{payrollData.payDate}</span></div>
                <div>Statement Date: <span className="font-semibold">{currentDate}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Information */}
        <div className="employee-section p-4 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div className="employee-details">
              <h3 className="text-lg font-semibold text-black mb-2">EMPLOYEE INFORMATION</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {calc.employeeName}</div>
                <div><span className="font-medium">Employee ID:</span> N/A</div>
                <div><span className="font-medium">Pay Type:</span> {calc.payType.toUpperCase()}</div>
                <div><span className="font-medium">Pay Frequency:</span> {calc.frequency.toUpperCase()}</div>
              </div>
            </div>
            <div className="pay-summary">
              <h3 className="text-lg font-semibold text-black mb-2">PAY SUMMARY</h3>
              <div className="bg-green-50 p-3 rounded border">
                <div className="text-2xl font-bold text-green-800">
                  NET PAY: ${calc.net.toFixed(2)}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Gross Pay: ${calc.gross.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Details */}
        <div className="earnings-section p-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-black mb-3">EARNINGS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Hours/Units</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Current Amount</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">YTD Amount</th>
                </tr>
              </thead>
              <tbody>
                {calc.lines.map((line, index) => (
                  <tr key={index} className="even:bg-gray-25">
                    <td className="border border-gray-300 px-3 py-2">{line.description}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${line.rate?.toFixed(2) || '0.00'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {line.hours?.toFixed(2) || '0.00'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                      ${line.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${line.ytdAmount?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-semibold">
                  <td className="border border-gray-300 px-3 py-2" colSpan={3}>TOTAL EARNINGS</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">${calc.gross.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">${calc.newYtdGross.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions */}
        <div className="deductions-section p-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-black mb-3">DEDUCTIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Statutory Deductions */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Statutory Deductions</h4>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Current</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">CPP Contributions</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdCPP1 + calc.ytdCPP2 + calc.cpp1Emp + calc.cpp2Emp).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">EI Premiums</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${calc.eiEmp.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdEI + calc.eiEmp).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">Income Tax</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${calc.tax.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdTax + calc.tax).toFixed(2)}</td>
                  </tr>

                  <tr className="bg-red-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2">TOTAL DEDUCTIONS</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${(calc.ytdCPP1 + calc.ytdCPP2 + calc.ytdEI + calc.ytdTax + 
                          calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Employer Contributions */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Employer Contributions</h4>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">Current</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">CPP Employer</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.cpp1Er + calc.cpp2Er).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdCPP1 + calc.ytdCPP2 + calc.cpp1Er + calc.cpp2Er).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">EI Employer</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${calc.eiEr.toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">${((calc.ytdEI * 1.4) + calc.eiEr).toFixed(2)}</td>
                  </tr>
                  {calc.wsib > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">WSIB Employer</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">${calc.wsib.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdWSIBPremium + calc.wsib).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-medium">
                    <td className="border border-gray-300 px-3 py-2">CPP + EI SUBTOTAL</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${(calc.cpp1Er + calc.cpp2Er + calc.eiEr).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${((calc.ytdCPP1 + calc.ytdCPP2) + (calc.ytdEI * 1.4) + 
                          calc.cpp1Er + calc.cpp2Er + calc.eiEr).toFixed(2)}
                    </td>
                  </tr>
                  {calc.wsib > 0 && (
                    <tr className="bg-gray-100 font-medium">
                      <td className="border border-gray-300 px-3 py-2">WSIB TOTAL</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">${calc.wsib.toFixed(2)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right">${(calc.ytdWSIBPremium + calc.wsib).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2">TOTAL CONTRIBUTIONS</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${(calc.cpp1Er + calc.cpp2Er + calc.eiEr + calc.wsib).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${((calc.ytdCPP1 + calc.ytdCPP2) + (calc.ytdEI * 1.4) + calc.ytdWSIBPremium + 
                          calc.cpp1Er + calc.cpp2Er + calc.eiEr + calc.wsib).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Net Pay Summary */}
        <div className="net-pay-section p-4 border-b border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pay-calculation">
              <h4 className="font-medium text-gray-800 mb-2">Pay Calculation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Gross Pay:</span>
                  <span className="font-medium">${calc.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="font-medium">-${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold text-lg">
                  <span>Net Pay:</span>
                  <span className="text-green-700">${calc.net.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="vacation-info">
              <h4 className="font-medium text-gray-800 mb-2">Vacation Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Vacation Rate:</span>
                  <span>{calc.vacationRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacation Earned:</span>
                  <span>${calc.vacAccrued?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacation Paid:</span>
                  <span>${calc.vacPaid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Vacation Balance:</span>
                  <span>${(calc.ytdVacAccrued - calc.ytdVacPaid + calc.vacAccrued - calc.vacPaid).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          /* Hide page layout elements */
          .no-print {
            display: none !important;
          }
          
          /* Make paystub full width and clean */
          #paystub-content {
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 2px solid black !important;
            background: white !important;
          }
          
          /* Clean body and page */
          body {
            margin: 0;
            padding: 0;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Page settings */
          @page {
            margin: 0.5in;
            size: letter portrait;
          }
        }
        
        .even\\:bg-gray-25:nth-child(even) {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  )
}