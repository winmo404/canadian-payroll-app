'use client'

import { PayrollData } from '@/lib/calculations/types'

interface PaystubDisplayProps {
  payrollData: PayrollData
}

export default function PaystubDisplay({ payrollData }: PaystubDisplayProps) {
  if (!payrollData.calculations) {
    return <div>No calculation data available</div>
  }

  const calc = payrollData.calculations

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-gray-300 rounded-lg overflow-hidden print:shadow-none print:border-black">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PAY STUB</h1>
            <p className="text-sm text-gray-600">Pay Date: {calc.payDate}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">{calc.employeeName}</h2>
            <p className="text-sm text-gray-600">{calc.frequency.toUpperCase()} • {calc.payType.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Earnings Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">EARNINGS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3">Code</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-right py-2 px-3">Rate</th>
                  <th className="text-right py-2 px-3">Hours</th>
                  <th className="text-right py-2 px-3">This Period</th>
                  <th className="text-right py-2 px-3">YTD Hours</th>
                  <th className="text-right py-2 px-3">YTD Amount</th>
                </tr>
              </thead>
              <tbody>
                {calc.lines.map((line, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-3 font-mono">{line.code}</td>
                    <td className="py-2 px-3">{line.description}</td>
                    <td className="py-2 px-3 text-right">
                      {line.rate ? `$${line.rate.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {line.hours ? line.hours.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      ${line.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {line.ytdHours.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ${line.ytdAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20">
          {/* Deductions */}
          <div className="pr-6 md:pr-12">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">DEDUCTIONS</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium">Description</div>
                <div className="text-right font-medium">This Period</div>
                <div className="text-right font-medium">YTD</div>
              </div>
              
              {calc.cpp1Emp > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                  <div>CPP Tier 1</div>
                  <div className="text-right">${calc.cpp1Emp.toFixed(2)}</div>
                  <div className="text-right">${calc.newYtdCPP1.toFixed(2)}</div>
                </div>
              )}
              
              {calc.cpp2Emp > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                  <div>CPP Tier 2</div>
                  <div className="text-right">${calc.cpp2Emp.toFixed(2)}</div>
                  <div className="text-right">${calc.newYtdCPP2.toFixed(2)}</div>
                </div>
              )}
              
              {calc.eiEmp > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                  <div>Employment Insurance</div>
                  <div className="text-right">${calc.eiEmp.toFixed(2)}</div>
                  <div className="text-right">${calc.newYtdEI.toFixed(2)}</div>
                </div>
              )}
              
              {calc.tax > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                  <div>Income Tax</div>
                  <div className="text-right">${calc.tax.toFixed(2)}</div>
                  <div className="text-right">${calc.newYtdTax.toFixed(2)}</div>
                </div>
              )}


            </div>
          </div>

          {/* Vacation & Summary */}
          <div className="space-y-6 pl-6 md:pl-12">
            {/* Vacation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">VACATION</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Type</div>
                  <div className="text-right font-medium">This Period</div>
                  <div className="text-right font-medium">YTD</div>
                </div>
                
                {calc.vacAccrued > 0 && (
                  <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                    <div>Accrued</div>
                    <div className="text-right">${calc.vacAccrued.toFixed(2)}</div>
                    <div className="text-right">${calc.newYtdVacAccrued.toFixed(2)}</div>
                  </div>
                )}
                
                {calc.vacPaid > 0 && (
                  <div className="grid grid-cols-3 gap-4 text-sm py-1 border-t">
                    <div>Paid</div>
                    <div className="text-right">${calc.vacPaid.toFixed(2)}</div>
                    <div className="text-right">${calc.newYtdVacPaid.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">PAY SUMMARY</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span>Gross Pay:</span>
                  <span className="font-semibold">${calc.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>YTD Gross:</span>
                  <span className="font-semibold text-blue-600">${calc.newYtdGross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Deductions:</span>
                  <span className="font-semibold">
                    ${(calc.cpp1Emp + calc.cpp2Emp + calc.eiEmp + calc.tax).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-300">
                  <span>NET PAY:</span>
                  <span className="text-green-700">${calc.net.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">TAX CONFIGURATION</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Federal TD1:</span> ${calc.federalTD1.toFixed(0)}
            </div>
            <div>
              <span className="font-medium">Provincial TD1:</span> ${calc.provincialTD1.toFixed(0)}
            </div>
            <div>
              <span className="font-medium">Vacation Rate:</span> {calc.vacationRate}%
            </div>
            <div>
              <span className="font-medium">Vacation Mode:</span> {calc.vacationMode.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t text-center text-xs text-gray-500">
        Generated on {new Date().toLocaleDateString()} • Canadian Payroll Calculator 2025
      </div>
    </div>
  )
}