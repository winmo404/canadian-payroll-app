'use client'

import { useState, useCallback, useEffect } from 'react'

export interface CompanyData {
  id: string
  name: string
  email: string
  sessionToken?: string
  sessionExpiry?: string | Date
  createdAt?: string | Date
}

export interface AuthResult {
  success: boolean
  error?: string
  company?: CompanyData
}

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

const STORAGE_KEYS = {
  CURRENT_SESSION: 'current_session'
} as const

export function useMultiCompanyAuth(): UseMultiCompanyAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentCompany: null,
    isLoading: true
  })

  // Check for existing session on hook initialization
  const initializeAuth = useCallback(async () => {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
      
      if (storedSession) {
        const { companyId, sessionToken } = JSON.parse(storedSession)
        
        // Validate session with database
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, sessionToken })
        })
        
        if (response.ok) {
          const { company } = await response.json()
          setAuthState({
            isAuthenticated: true,
            currentCompany: company,
            isLoading: false
          })
          return
        }
      }
    } catch (error) {
      console.error('Session initialization error:', error)
    }
    
    // No valid session found
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('useMultiCompanyAuth: Registration successful, updating state')
        
        // Store session locally for quick access
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
          companyId: result.company.id,
          sessionToken: result.company.sessionToken
        }))
        
        // Update auth state using functional update
        setAuthState(prevState => {
          const newState = {
            isAuthenticated: true,
            currentCompany: result.company,
            isLoading: false
          }
          console.log('useMultiCompanyAuth: Registration state update - prev:', prevState, 'new:', newState)
          return newState
        })
        
        // Force additional update
        setTimeout(() => {
          setAuthState(current => ({ ...current }))
        }, 0)
      }
      
      return result
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
    console.log('useMultiCompanyAuth: Starting login API call')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const result = await response.json()
      console.log('useMultiCompanyAuth: Login API response:', result)
      
      if (result.success) {
        console.log('useMultiCompanyAuth: Login successful, storing session and updating state')
        
        // Store session locally for quick access
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify({
          companyId: result.company.id,
          sessionToken: result.company.sessionToken
        }))
        
        // Update auth state using functional update to ensure it triggers re-render
        setAuthState(prevState => {
          const newState = {
            isAuthenticated: true,
            currentCompany: result.company,
            isLoading: false
          }
          console.log('useMultiCompanyAuth: State update - prev:', prevState, 'new:', newState)
          return newState
        })
        
        // Additional force update to ensure UI responds
        setTimeout(() => {
          console.log('useMultiCompanyAuth: Timeout - forcing additional state update')
          setAuthState(current => ({ ...current }))
        }, 0)
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      if (authState.currentCompany) {
        // Clear session from database
        await fetch('/api/auth/session', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: authState.currentCompany.id })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local session regardless of API call result
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
      setAuthState({
        isAuthenticated: false,
        currentCompany: null,
        isLoading: false
      })
    }
  }, [authState.currentCompany])

  // Check current session
  const checkSession = useCallback((): boolean => {
    return authState.isAuthenticated && authState.currentCompany !== null
  }, [authState.isAuthenticated, authState.currentCompany])

  // Company-specific data management (keeping localStorage for performance)
  const getCompanyStorageKey = useCallback((dataType: string): string => {
    if (!authState.currentCompany) return ''
    return `company_${authState.currentCompany.id}_${dataType}`
  }, [authState.currentCompany])

  const saveEmployeeData = useCallback((employees: any[]) => {
    if (!authState.currentCompany) return
    const key = getCompanyStorageKey('employees')
    localStorage.setItem(key, JSON.stringify(employees))
  }, [authState.currentCompany, getCompanyStorageKey])

  const loadEmployeeData = useCallback((): any[] => {
    if (!authState.currentCompany) return []
    const key = getCompanyStorageKey('employees')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }, [authState.currentCompany, getCompanyStorageKey])

  const saveCompanySettings = useCallback((settings: any) => {
    if (!authState.currentCompany) return
    const key = getCompanyStorageKey('settings')
    localStorage.setItem(key, JSON.stringify(settings))
  }, [authState.currentCompany, getCompanyStorageKey])

  const loadCompanySettings = useCallback((): any => {
    if (!authState.currentCompany) return {}
    const key = getCompanyStorageKey('settings')
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  }, [authState.currentCompany, getCompanyStorageKey])

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