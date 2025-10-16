/**
 * Tax Comparison Component
 * Shows detailed breakdown of income tax calculations
 */

import React, { useState } from 'react'
import { getTaxBreakdown, compareTaxScenarios } from '@/lib/calculations/tax-debug'

export function TaxComparison() {
  const [grossPay, setGrossPay] = useState(1485)
  const [payFrequency, setPayFrequency] = useState('biweekly')
  
  const scenarios = compareTaxScenarios(grossPay, payFrequency)
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-blue-800 mb-4">
        🔍 Tax Calculation Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            Gross Pay per Period:
          </label>
          <input
            type="number"
            value={grossPay}
            onChange={(e) => setGrossPay(Number(e.target.value))}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            Pay Frequency:
          </label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="semimonthly">Semi-monthly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div key={index} className="bg-white rounded-lg border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-800 mb-3">{scenario.name}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-600">
                  <strong>Federal TD1:</strong> ${scenario.federalTD1.toLocaleString()}
                </p>
                <p className="text-blue-600">
                  <strong>Provincial TD1:</strong> ${scenario.provincialTD1.toLocaleString()}
                </p>
                <p className="text-blue-600">
                  <strong>Annualized Gross:</strong> ${scenario.breakdown.annualizedGross.toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-green-600">
                  <strong>Federal Taxable:</strong> ${scenario.breakdown.federalTaxableIncome.toLocaleString()}
                </p>
                <p className="text-green-600">
                  <strong>Provincial Taxable:</strong> ${scenario.breakdown.provincialTaxableIncome.toLocaleString()}
                </p>
                <p className="text-green-600">
                  <strong>Effective Rate:</strong> {scenario.breakdown.effectiveTaxRate.toFixed(2)}%
                </p>
              </div>
              
              <div>
                <p className="text-red-600">
                  <strong>Federal Tax/Year:</strong> ${scenario.breakdown.federalTaxAnnual.toFixed(2)}
                </p>
                <p className="text-red-600">
                  <strong>Provincial Tax/Year:</strong> ${scenario.breakdown.provincialTaxAnnual.toFixed(2)}
                </p>
                <p className="text-red-600 font-semibold text-lg">
                  <strong>Tax per Period:</strong> ${scenario.breakdown.taxPerPeriod.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Common Differences from Previous Apps:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Updated 2025 Tax Brackets:</strong> Federal and provincial rates may have changed</li>
          <li>• <strong>TD1 Basic Amounts:</strong> 2025 federal ($16,129) vs 2024 ($15,705)</li>
          <li>• <strong>Calculation Method:</strong> This uses progressive tax brackets vs flat rate estimates</li>
          <li>• <strong>Provincial Focus:</strong> Optimized for Ontario (other provinces have different rates)</li>
          <li>• <strong>Accuracy:</strong> More precise calculation vs simplified approximations</li>
        </ul>
      </div>
    </div>
  )
}