import { useState, useEffect } from 'react'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage'
import { CompanySettings } from '@/lib/calculations/types'

// Default company settings
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
  
  // Canadian tax rates and thresholds
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

export function useCompanySettings() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load company settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = getFromStorage(STORAGE_KEYS.COMPANY_SETTINGS, DEFAULT_COMPANY_SETTINGS)
      
      // Migrate existing settings to include tax rates if missing
      const migratedSettings: CompanySettings = {
        ...stored,
        taxRates: stored.taxRates || DEFAULT_COMPANY_SETTINGS.taxRates
      }
      
      setCompanySettings(migratedSettings)
      
      // Save migrated settings back to storage if they were updated
      if (!stored.taxRates) {
        saveToStorage(STORAGE_KEYS.COMPANY_SETTINGS, migratedSettings)
      }
    } catch (error) {
      console.error('Error loading company settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save company settings to localStorage
  const updateCompanySettings = (newSettings: CompanySettings) => {
    try {
      setCompanySettings(newSettings)
      saveToStorage(STORAGE_KEYS.COMPANY_SETTINGS, newSettings)
      return true
    } catch (error) {
      console.error('Error saving company settings:', error)
      return false
    }
  }

  // Reset to default settings
  const resetToDefaults = () => {
    setCompanySettings(DEFAULT_COMPANY_SETTINGS)
    saveToStorage(STORAGE_KEYS.COMPANY_SETTINGS, DEFAULT_COMPANY_SETTINGS)
  }

  // Format company address as single string
  const getFormattedAddress = () => {
    const { street, city, province, postalCode } = companySettings.address
    return `${street}, ${city}, ${province} ${postalCode}`
  }

  // Check if company settings are still default (not configured)
  const isDefaultSettings = () => {
    return companySettings.name === DEFAULT_COMPANY_SETTINGS.name
  }

  return {
    companySettings,
    updateCompanySettings,
    resetToDefaults,
    getFormattedAddress,
    isDefaultSettings,
    isLoading
  }
}