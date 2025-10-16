import React, { useState } from 'react'
import { useCompanySettingsDB } from '@/hooks/useCompanySettingsDB'
import { CompanySettings } from '@/lib/calculations/types'

// Default company settings for fallback
const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'YOUR COMPANY NAME',
  address: {
    street: '123 Business Street',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V 3A8'
  },
  phone: '(416) 555-0123',
  email: 'payroll@yourcompany.com',
  website: 'www.yourcompany.com',
  businessNumber: '',
  wsibAccount: '',
  cppNumber: '',
  eiNumber: '',
  
  taxRates: {
    cppRate: 5.95,
    cppEmployerRate: 5.95,
    cpp2Rate: 4.00,
    eiRate: 1.64,
    eiEmployerMultiplier: 1.4,
    wsibRate: 2.15,
    
    cppMaxPensionable: 71300,
    cppExemption: 3500,
    cppMaxPensionable2: 81200,
    eiMaxInsurable: 65700,
    wsibMaxAssessable: 100000,
    
    federalTD1: 16129,
    provincialTD1: 12747
  }
}

export default function CompanySettingsManager() {
  const {
    companySettings: dbCompanySettings,
    updateCompanySettings,
    isLoading,
  } = useCompanySettingsDB()
  
  // Use database settings or fallback to defaults
  const companySettings = dbCompanySettings || DEFAULT_COMPANY_SETTINGS

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<CompanySettings>(companySettings)
  const [message, setMessage] = useState<string>('')

  // Update form data when company settings change
  React.useEffect(() => {
    setFormData(companySettings)
  }, [companySettings])

  // Utility functions
  const resetToDefaults = async () => {
    const success = await updateCompanySettings(DEFAULT_COMPANY_SETTINGS)
    if (success) {
      setFormData(DEFAULT_COMPANY_SETTINGS)
    }
    return success
  }

  const isDefaultSettings = () => {
    return companySettings.name === DEFAULT_COMPANY_SETTINGS.name
  }

  const getFormattedAddress = () => {
    const { street, city, province, postalCode } = companySettings.address
    return `${street}, ${city}, ${province} ${postalCode}`
  }

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else if (field.startsWith('taxRates.')) {
      const taxRateField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        taxRates: {
          ...prev.taxRates!,
          [taxRateField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    const success = await updateCompanySettings(formData)
    if (success) {
      setMessage('✅ Company settings saved successfully!')
      setIsEditing(false)
    } else {
      setMessage('❌ Error saving company settings')
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCancel = () => {
    setFormData(companySettings)
    setIsEditing(false)
    setMessage('')
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to default company settings? This will remove all your custom company information.')) {
      const success = await resetToDefaults()
      if (success) {
        setIsEditing(false)
        setMessage('✅ Company settings reset to defaults')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ Error resetting company settings')
        setTimeout(() => setMessage(''), 3000)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Company Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure your company information for paystubs and reports
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit Settings
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset to Defaults
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Configuration Status Alert */}
      {isDefaultSettings() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Company Information Not Configured
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Your company information is still set to default values. Please update your company details to ensure professional paystubs and accurate business information.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Information Display/Edit */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        
        {!isEditing ? (
          // Display Mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {companySettings.name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {companySettings.phone}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {companySettings.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {companySettings.website || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Address</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                {getFormattedAddress()}
              </p>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Company Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(416) 555-0123"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="payroll@yourcompany.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="www.yourcompany.com"
                />
              </div>
            </div>
            
            {/* Address Fields */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Business Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Business Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Toronto"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={formData.address.province}
                      onChange={(e) => handleInputChange('address.province', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Province</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NU">Nunavut</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value.toUpperCase())}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="M5V 3A8"
                      pattern="[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Government Numbers (Optional) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Government Account Numbers (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">
          These numbers can be included on reports but are not required for basic payroll calculations.
        </p>
        
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Number</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                {companySettings.businessNumber || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WSIB Account</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                {companySettings.wsibAccount || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CPP Number</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                {companySettings.cppNumber || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">EI Number</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                {companySettings.eiNumber || 'Not specified'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Number
              </label>
              <input
                type="text"
                value={formData.businessNumber || ''}
                onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456789RP0001"
                pattern="[0-9]{9}RP[0-9]{4}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WSIB Account
              </label>
              <input
                type="text"
                value={formData.wsibAccount || ''}
                onChange={(e) => handleInputChange('wsibAccount', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WSIB account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPP Number
              </label>
              <input
                type="text"
                value={formData.cppNumber || ''}
                onChange={(e) => handleInputChange('cppNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CPP business number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EI Number
              </label>
              <input
                type="text"
                value={formData.eiNumber || ''}
                onChange={(e) => handleInputChange('eiNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="EI business number"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tax Rate Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Canadian Tax Rates & Thresholds</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure tax rates and thresholds for payroll calculations. These values should match current CRA guidelines.
        </p>
        
        {!isEditing ? (
          // Display Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CPP Rates</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee:</span>
                    <span>{companySettings.taxRates?.cppRate || 5.95}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employer:</span>
                    <span>{companySettings.taxRates?.cppEmployerRate || 5.95}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPP2 Rate:</span>
                    <span>{companySettings.taxRates?.cpp2Rate || 4.00}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">EI Rates</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee:</span>
                    <span>{companySettings.taxRates?.eiRate || 1.64}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employer:</span>
                    <span>{((companySettings.taxRates?.eiRate || 1.64) * (companySettings.taxRates?.eiEmployerMultiplier || 1.4)).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">WSIB & TD1</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">WSIB Rate:</span>
                    <span>{companySettings.taxRates?.wsibRate || 2.15}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Federal TD1:</span>
                    <span>${(companySettings.taxRates?.federalTD1 || 16129).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ontario TD1:</span>
                    <span>${(companySettings.taxRates?.provincialTD1 || 12747).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CPP Maximums</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pensionable:</span>
                    <span>${(companySettings.taxRates?.cppMaxPensionable || 71300).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPP2 Max:</span>
                    <span>${(companySettings.taxRates?.cppMaxPensionable2 || 81200).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exemption:</span>
                    <span>${(companySettings.taxRates?.cppExemption || 3500).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">EI Maximums</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurable:</span>
                    <span>${(companySettings.taxRates?.eiMaxInsurable || 65700).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Premium:</span>
                    <span>${Math.round((companySettings.taxRates?.eiMaxInsurable || 65700) * (companySettings.taxRates?.eiRate || 1.64) / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">WSIB Maximum</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Assessable:</span>
                    <span>${(companySettings.taxRates?.wsibMaxAssessable || 100000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP Employee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.taxRates?.cppRate || 5.95}
                  onChange={(e) => handleInputChange('taxRates.cppRate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP Employer Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.taxRates?.cppEmployerRate || 5.95}
                  onChange={(e) => handleInputChange('taxRates.cppEmployerRate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP2 Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.taxRates?.cpp2Rate || 4.00}
                  onChange={(e) => handleInputChange('taxRates.cpp2Rate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EI Employee Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.taxRates?.eiRate || 1.64}
                  onChange={(e) => handleInputChange('taxRates.eiRate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EI Employer Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="3"
                  value={formData.taxRates?.eiEmployerMultiplier || 1.4}
                  onChange={(e) => handleInputChange('taxRates.eiEmployerMultiplier', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  max="20"
                  value={formData.taxRates?.wsibRate || 2.15}
                  onChange={(e) => handleInputChange('taxRates.wsibRate', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP Max Pensionable ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.taxRates?.cppMaxPensionable || 71300}
                  onChange={(e) => handleInputChange('taxRates.cppMaxPensionable', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP2 Max Pensionable ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.taxRates?.cppMaxPensionable2 || 81200}
                  onChange={(e) => handleInputChange('taxRates.cppMaxPensionable2', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPP Exemption ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.taxRates?.cppExemption || 3500}
                  onChange={(e) => handleInputChange('taxRates.cppExemption', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EI Max Insurable ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.taxRates?.eiMaxInsurable || 65700}
                  onChange={(e) => handleInputChange('taxRates.eiMaxInsurable', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WSIB Max Assessable ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.taxRates?.wsibMaxAssessable || 100000}
                  onChange={(e) => handleInputChange('taxRates.wsibMaxAssessable', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Federal TD1 Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.taxRates?.federalTD1 || 16129}
                  onChange={(e) => handleInputChange('taxRates.federalTD1', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ontario TD1 Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.taxRates?.provincialTD1 || 12747}
                  onChange={(e) => handleInputChange('taxRates.provincialTD1', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}