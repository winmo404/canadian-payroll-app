# Multi-Company Authentication System - Implementation Guide

## 🎯 Overview
This document covers the complete transformation from single-user to multi-company authentication system that needs to be implemented in the online version.

## 🏗️ Architecture Changes

### Before (Single User)
- Single company data in localStorage
- No authentication
- Global employee management
- Shared data across sessions

### After (Multi-Company)
- Company-based user accounts with secure authentication
- Password hashing with PBKDF2
- Company-specific data isolation
- File system storage with company folders
- Session management with JWT-like tokens

## 📁 New Files to Create

### 1. Authentication Types
**File**: `src/lib/auth/types.ts`
```typescript
export interface CompanyUser {
  id: string
  email: string
  companyName: string
  passwordHash: string
  salt: string
  createdAt: string
  lastLogin?: string
}

export interface AuthSession {
  token: string
  companyId: string
  email: string
  companyName: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationData extends LoginCredentials {
  companyName: string
}

export interface AuthResponse {
  success: boolean
  session?: AuthSession
  error?: string
}
```

### 2. Authentication Utilities
**File**: `src/lib/auth/utils.ts`
```typescript
import crypto from 'crypto'

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex')
  return { hash, salt: actualSalt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: newHash } = hashPassword(password, salt)
  return hash === newHash
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex') + Date.now().toString()
}

export function normalizeCompanyId(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character')
  
  return { valid: errors.length === 0, errors }
}
```

### 3. Authentication Providers
**File**: `src/lib/auth/providers.ts`
```typescript
import { CompanyUser, AuthSession } from './types'
import { hashPassword, verifyPassword, generateSessionToken } from './utils'

export class FileSystemAuthProvider {
  private authDataPath = process.env.AUTH_DATA_PATH || './data/auth'
  
  async saveUser(user: CompanyUser): Promise<void> {
    // Implementation for saving user to file system
  }
  
  async getUser(email: string): Promise<CompanyUser | null> {
    // Implementation for retrieving user from file system
  }
  
  async saveSession(session: AuthSession): Promise<void> {
    // Implementation for saving session
  }
  
  async getSession(token: string): Promise<AuthSession | null> {
    // Implementation for retrieving session
  }
}
```

### 4. Authentication API Route
**File**: `src/app/api/auth/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword, generateSessionToken, normalizeCompanyId, validatePassword } from '@/lib/auth/utils'
import { CompanyUser, AuthSession, RegistrationData, LoginCredentials } from '@/lib/auth/types'
import fs from 'fs/promises'
import path from 'path'

const AUTH_DATA_PATH = path.join(process.cwd(), 'data', 'auth')
const SESSIONS_PATH = path.join(AUTH_DATA_PATH, 'sessions.json')
const USERS_PATH = path.join(AUTH_DATA_PATH, 'users.json')

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()
    
    switch (action) {
      case 'register':
        return handleRegistration(data as RegistrationData)
      case 'login':
        return handleLogin(data as LoginCredentials)
      case 'logout':
        return handleLogout(data.token)
      case 'validate':
        return handleValidation(data.token)
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

async function handleRegistration(data: RegistrationData): Promise<NextResponse> {
  // Validate password strength
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    return NextResponse.json({ 
      success: false, 
      error: `Password requirements not met: ${passwordValidation.errors.join(', ')}` 
    }, { status: 400 })
  }

  // Check if user already exists
  const existingUser = await getUser(data.email)
  if (existingUser) {
    return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 })
  }

  // Create new user
  const { hash, salt } = hashPassword(data.password)
  const companyId = normalizeCompanyId(data.companyName)
  
  const user: CompanyUser = {
    id: companyId,
    email: data.email,
    companyName: data.companyName,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  }

  await saveUser(user)
  
  // Create company data folder
  const companyDataPath = path.join(process.cwd(), 'data', 'companies', companyId)
  await fs.mkdir(companyDataPath, { recursive: true })
  
  // Create session
  const session = await createSession(user)
  
  return NextResponse.json({ success: true, session })
}

async function handleLogin(data: LoginCredentials): Promise<NextResponse> {
  const user = await getUser(data.email)
  if (!user) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  if (!verifyPassword(data.password, user.passwordHash, user.salt)) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  }

  // Update last login
  user.lastLogin = new Date().toISOString()
  await saveUser(user)

  const session = await createSession(user)
  return NextResponse.json({ success: true, session })
}

async function createSession(user: CompanyUser): Promise<AuthSession> {
  const session: AuthSession = {
    token: generateSessionToken(),
    companyId: user.id,
    email: user.email,
    companyName: user.companyName,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  }
  
  await saveSession(session)
  return session
}

// Helper functions for file operations
async function getUser(email: string): Promise<CompanyUser | null> {
  try {
    const users = await loadUsers()
    return users.find(u => u.email === email) || null
  } catch {
    return null
  }
}

async function saveUser(user: CompanyUser): Promise<void> {
  const users = await loadUsers()
  const index = users.findIndex(u => u.email === user.email)
  
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  
  await fs.mkdir(AUTH_DATA_PATH, { recursive: true })
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2))
}

async function loadUsers(): Promise<CompanyUser[]> {
  try {
    const data = await fs.readFile(USERS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveSession(session: AuthSession): Promise<void> {
  const sessions = await loadSessions()
  // Remove expired sessions and existing session for this user
  const activeSessions = sessions.filter(s => 
    new Date(s.expiresAt) > new Date() && s.email !== session.email
  )
  
  activeSessions.push(session)
  
  await fs.mkdir(AUTH_DATA_PATH, { recursive: true })
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(activeSessions, null, 2))
}

async function loadSessions(): Promise<AuthSession[]> {
  try {
    const data = await fs.readFile(SESSIONS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}
```

## 🔗 Authentication Hooks

### 5. Company Authentication Hook
**File**: `src/hooks/useCompanyAuth.tsx`
```typescript
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthSession } from '@/lib/auth/types'

interface CompanyAuthContextType {
  currentCompany: AuthSession | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, companyName: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const CompanyAuthContext = createContext<CompanyAuthContextType | null>(null)

export function CompanyAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async () => {
    try {
      const token = localStorage.getItem('payroll_session_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', token })
      })

      if (response.ok) {
        const { session } = await response.json()
        setCurrentCompany(session)
      } else {
        localStorage.removeItem('payroll_session_token')
      }
    } catch (error) {
      console.error('Session validation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      })

      const result = await response.json()
      
      if (result.success && result.session) {
        localStorage.setItem('payroll_session_token', result.session.token)
        setCurrentCompany(result.session)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, companyName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, companyName })
      })

      const result = await response.json()
      
      if (result.success && result.session) {
        localStorage.setItem('payroll_session_token', result.session.token)
        setCurrentCompany(result.session)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('payroll_session_token')
      if (token) {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', token })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('payroll_session_token')
      setCurrentCompany(null)
    }
  }

  return (
    <CompanyAuthContext.Provider value={{
      currentCompany,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </CompanyAuthContext.Provider>
  )
}

export function useCompanyAuth() {
  const context = useContext(CompanyAuthContext)
  if (!context) {
    throw new Error('useCompanyAuth must be used within a CompanyAuthProvider')
  }
  return context
}
```

### 6. Login/Registration Component
**File**: `src/components/auth/LoginForm.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useCompanyAuth } from '@/hooks/useCompanyAuth'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register } = useCompanyAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let success = false
      
      if (isLogin) {
        success = await login(email, password)
      } else {
        success = await register(email, password, companyName)
      }

      if (!success) {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-center text-gray-600 mt-2">
            {isLogin ? 'Access your payroll system' : 'Set up your company payroll'}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 🔄 Updated Root Layout

### 7. Update Root Layout
**File**: `src/app/layout.tsx`
```typescript
import { CompanyAuthProvider } from '@/hooks/useCompanyAuth'
import { AuthWrapper } from '@/components/auth/AuthWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CompanyAuthProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </CompanyAuthProvider>
      </body>
    </html>
  )
}
```

## 📊 Data Storage Changes

### 8. Company-Aware Hooks
Create company-specific data hooks that isolate data by company:

- `src/hooks/useCompanyEmployees.tsx`
- `src/hooks/useCompanyPayrollHistory.tsx` 
- `src/hooks/useCompanySelectedEmployee.tsx`

These hooks should use the `currentCompany.companyId` to store/retrieve data in company-specific storage.

## 🔐 Security Features

### Password Requirements:
- Minimum 8 characters
- Uppercase and lowercase letters
- Numbers and special characters
- PBKDF2 hashing with 10,000 iterations

### Session Management:
- 30-day session expiration
- Automatic session validation
- Secure token generation
- Session cleanup on logout

### Data Isolation:
- Company-specific file storage
- No data leakage between companies
- Secure company ID generation

## 📋 Implementation Checklist

### Phase 1: Authentication System
- [ ] Create auth types, utils, and providers
- [ ] Implement auth API route
- [ ] Create authentication hooks
- [ ] Build login/registration UI

### Phase 2: Data Isolation  
- [ ] Update all data hooks to be company-aware
- [ ] Implement company-specific storage
- [ ] Update existing components to use new hooks

### Phase 3: Integration
- [ ] Update root layout with auth providers
- [ ] Update AuthWrapper to handle authentication
- [ ] Test complete authentication flow

### Phase 4: Security Testing
- [ ] Test password validation
- [ ] Verify data isolation between companies
- [ ] Test session management
- [ ] Security audit

This multi-company system provides enterprise-grade security and complete data isolation while maintaining ease of use for individual companies.