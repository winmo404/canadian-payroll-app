'use client'

import { useState, useEffect } from 'react'
import { useMultiCompanyAuth } from '@/hooks/useMultiCompanyAuth'
import { validatePassword } from '@/lib/auth/validation'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, authState } = useMultiCompanyAuth()
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Stop loading when authentication succeeds
  useEffect(() => {
    if (authState.isAuthenticated) {
      setIsLoading(false)
    }
  }, [authState.isAuthenticated])
  const [passwordValidation, setPasswordValidation] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')

    // Validate password as user types
    if (field === 'password') {
      const validation = validatePassword(value)
      setPasswordValidation(validation.errors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password strength
    const passwordCheck = validatePassword(formData.password)
    if (!passwordCheck.isValid) {
      setError('Password does not meet requirements')
      return
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const result = await register(
        formData.companyName,
        formData.email,
        formData.password
      )

      if (!result.success) {
        setError(result.error || 'Registration failed')
        setIsLoading(false)
      } else {
        console.log('RegisterForm: Registration successful, forcing immediate page refresh')
        // Force immediate refresh to ensure UI updates
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Register Your Company</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Your Company Inc."
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Business Email Address *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="admin@yourcompany.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Create a strong password"
        />
        
        {/* Password requirements */}
        {formData.password && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600">Password requirements:</p>
            <div className="space-y-1">
              {passwordValidation.length > 0 ? (
                passwordValidation.map((error, index) => (
                  <p key={index} className="text-xs text-red-600">• {error}</p>
                ))
              ) : (
                <p className="text-xs text-green-600">• Password meets all requirements ✓</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Confirm your password"
        />
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || passwordValidation.length > 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </>
        ) : (
          'Create Company Account'
        )}
      </button>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  )
}