export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  // Minimum length
  if (password.length < 8) {
    errors.push('At least 8 characters long')
  }

  // Maximum length (practical limit)
  if (password.length > 128) {
    errors.push('Maximum 128 characters')
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter (A-Z)')
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter (a-z)')
  }

  // Number
  if (!/\d/.test(password)) {
    errors.push('At least one number (0-9)')
  }

  // Special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateCompanyName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100
}