'use client'

import { useState, useCallback, useEffect } from 'react'
import { hashPassword, verifyPassword } from '../lib/auth/crypto'
import { validateEmail, validatePassword } from '../lib/auth/validation'
import {
  CompanyData,
  AuthResult,
  getAllCompanies,
  saveCompany,
  findCompanyByEmail,
  findCompanyById,
  generateCompanyId,
  saveSession,
  getCurrentSession,
  clearSession,
  validateSession,
  saveCompanyData,
  loadCompanyData,
  clearCompanyData
} from '../lib/auth/storage'

export interface AuthState {
  isAuthenticated: boolean
  currentCompany: CompanyData | null
  isLoading: boolean
}

export interface UseMultiCompanyAuthReturn {
  authState: AuthState
  register: (companyName: string, email: string, password: string) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => void
  checkSession: () => boolean
  saveEmployeeData: (employees: any[]) => void
  loadEmployeeData: () => any[]
  saveCompanySettings: (settings: any) => void
  loadCompanySettings: () => any
}

export function useMultiCompanyAuth(): UseMultiCompanyAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentCompany: null,
    isLoading: true
  })

  // Check for existing session on hook initialization
  const initializeAuth = useCallback(() => {
    const session = getCurrentSession()
    
    if (session) {
      const company = findCompanyById(session.companyId)
      
      if (company && validateSession(session.companyId, session.sessionToken)) {
        setAuthState({
          isAuthenticated: true,
          currentCompany: company,
          isLoading: false
        })
        return
      }
    }
    
    // No valid session found
    setAuthState({
      isAuthenticated: false,
      currentCompany: null,
      isLoading: false
    })
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Register new company
  const register = useCallback(async (
    companyName: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      // Validate inputs
      if (!companyName.trim()) {
        return { success: false, error: 'Company name is required' }
      }
      
      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }
      
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') }
      }

      // Check if company already exists
      const existingCompany = findCompanyByEmail(email)
      if (existingCompany) {
        return { success: false, error: 'A company is already registered with this email address' }
      }

      // Hash password
      const { hash, salt } = await hashPassword(password)

      // Create new company
      const newCompany: CompanyData = {
        id: generateCompanyId(),
        companyName: companyName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: Date.now()
      }

      // Save company
      saveCompany(newCompany)

      // Create session
      const sessionToken = crypto.randomUUID()
      saveSession(newCompany, sessionToken)

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        currentCompany: newCompany,
        isLoading: false
      })

      return { success: true, company: newCompany }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }, [])

  // Login existing company
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      // Validate inputs
      if (!validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' }
      }
      
      if (!password) {
        return { success: false, error: 'Password is required' }
      }

      // Find company
      const company = findCompanyByEmail(email)
      if (!company) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password
      const isValid = await verifyPassword(password, company.passwordHash, company.passwordSalt)
      if (!isValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Create new session
      const sessionToken = crypto.randomUUID()
      saveSession(company, sessionToken)

      // Update auth state
      setAuthState({
        isAuthenticated: true,
        currentCompany: company,
        isLoading: false
      })

      return { success: true, company }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    clearSession()
    setAuthState({
      isAuthenticated: false,
      currentCompany: null,
      isLoading: false
    })
  }, [])

  // Check current session
  const checkSession = useCallback((): boolean => {
    const session = getCurrentSession()
    
    if (!session) return false
    
    const company = findCompanyById(session.companyId)
    if (!company) return false
    
    const isValid = validateSession(session.companyId, session.sessionToken)
    
    if (!isValid) {
      logout()
      return false
    }
    
    return true
  }, [logout])

  // Company-specific data management
  const saveEmployeeData = useCallback((employees: any[]) => {
    if (!authState.currentCompany) {
      throw new Error('No company authenticated')
    }
    saveCompanyData(authState.currentCompany.id, 'employees', employees)
  }, [authState.currentCompany])

  const loadEmployeeData = useCallback((): any[] => {
    if (!authState.currentCompany) {
      return []
    }
    return loadCompanyData(authState.currentCompany.id, 'employees', [])
  }, [authState.currentCompany])

  const saveCompanySettings = useCallback((settings: any) => {
    if (!authState.currentCompany) {
      throw new Error('No company authenticated')
    }
    saveCompanyData(authState.currentCompany.id, 'settings', settings)
  }, [authState.currentCompany])

  const loadCompanySettings = useCallback((): any => {
    if (!authState.currentCompany) {
      return {}
    }
    return loadCompanyData(authState.currentCompany.id, 'settings', {})
  }, [authState.currentCompany])

  return {
    authState,
    register,
    login,
    logout,
    checkSession,
    saveEmployeeData,
    loadEmployeeData,
    saveCompanySettings,
    loadCompanySettings
  }
}