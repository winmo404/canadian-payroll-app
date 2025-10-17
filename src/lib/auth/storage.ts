/**
 * Multi-Company Storage System
 * Isolates data between different companies using unique company IDs
 */

export interface CompanyData {
  id: string
  companyName: string
  email: string
  passwordHash: string
  passwordSalt: string
  sessionToken?: string
  sessionExpiry?: number
  createdAt: number
}

export interface AuthResult {
  success: boolean
  error?: string
  company?: CompanyData
}

const STORAGE_KEYS = {
  COMPANIES: 'multi_company_data',
  CURRENT_SESSION: 'current_session'
} as const

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

// Get all registered companies
export function getAllCompanies(): CompanyData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading companies:', error)
    return []
  }
}

// Save company data
export function saveCompany(company: CompanyData): void {
  try {
    const companies = getAllCompanies()
    const existingIndex = companies.findIndex(c => c.id === company.id)
    
    if (existingIndex >= 0) {
      companies[existingIndex] = company
    } else {
      companies.push(company)
    }
    
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies))
  } catch (error) {
    console.error('Error saving company:', error)
    throw new Error('Failed to save company data')
  }
}

// Find company by email
export function findCompanyByEmail(email: string): CompanyData | null {
  const companies = getAllCompanies()
  return companies.find(c => c.email.toLowerCase() === email.toLowerCase()) || null
}

// Find company by ID
export function findCompanyById(id: string): CompanyData | null {
  const companies = getAllCompanies()
  return companies.find(c => c.id === id) || null
}

// Generate unique company ID
export function generateCompanyId(): string {
  return 'company_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Session management
export function saveSession(company: CompanyData, sessionToken: string): void {
  const sessionData = {
    companyId: company.id,
    sessionToken,
    expiresAt: Date.now() + SESSION_DURATION
  }
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData))
  
  // Update company record with session info
  const updatedCompany = {
    ...company,
    sessionToken,
    sessionExpiry: sessionData.expiresAt
  }
  saveCompany(updatedCompany)
}

// Get current session
export function getCurrentSession(): { companyId: string; sessionToken: string; expiresAt: number } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
    if (!stored) return null
    
    const session = JSON.parse(stored)
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      clearSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error loading session:', error)
    return null
  }
}

// Clear current session
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
}

// Validate session token
export function validateSession(companyId: string, sessionToken: string): boolean {
  const company = findCompanyById(companyId)
  if (!company) return false
  
  const currentSession = getCurrentSession()
  if (!currentSession) return false
  
  return (
    currentSession.companyId === companyId &&
    currentSession.sessionToken === sessionToken &&
    company.sessionToken === sessionToken &&
    (company.sessionExpiry || 0) > Date.now()
  )
}

// Get company-specific storage key
export function getCompanyStorageKey(companyId: string, dataType: string): string {
  return `company_${companyId}_${dataType}`
}

// Company-specific data storage
export function saveCompanyData<T>(companyId: string, dataType: string, data: T): void {
  try {
    const key = getCompanyStorageKey(companyId, dataType)
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${dataType} for company ${companyId}:`, error)
    throw new Error(`Failed to save ${dataType}`)
  }
}

// Company-specific data loading
export function loadCompanyData<T>(companyId: string, dataType: string, defaultValue: T): T {
  try {
    const key = getCompanyStorageKey(companyId, dataType)
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Error loading ${dataType} for company ${companyId}:`, error)
    return defaultValue
  }
}

// Clear all data for a company
export function clearCompanyData(companyId: string): void {
  const keys = Object.keys(localStorage)
  const companyKeys = keys.filter(key => key.startsWith(`company_${companyId}_`))
  
  companyKeys.forEach(key => localStorage.removeItem(key))
}