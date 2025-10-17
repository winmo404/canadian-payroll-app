'use client'

import { useState, useEffect } from 'react'
import { useMultiCompanyAuth } from '@/hooks/useMultiCompanyAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { authState, logout } = useMultiCompanyAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Debug logging
  console.log('AuthWrapper render - authState:', authState)

  if (authState.isLoading) {
    console.log('AuthWrapper: Showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    console.log('AuthWrapper: Showing auth forms, mode:', authMode)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    )
  }

  console.log('AuthWrapper: User authenticated, showing main app')

  // Render children with company header
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {authState.currentCompany?.name || 'Canadian Payroll'}
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                ({authState.currentCompany?.email})
              </span>
            </div>
            
            <CompanyMenu logout={logout} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

// Company menu with logout
function CompanyMenu({ logout }: { logout: () => void }) {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  )
}