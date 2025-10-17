/**
 * Secure Password Hashing for Browser Environment
 * Using a combination approach with built-in crypto
 */

// Generate random salt
export function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Simple but secure password hashing using built-in crypto
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || generateSalt()
  
  // Combine password and salt
  const combined = password + actualSalt
  const encoder = new TextEncoder()
  const data = encoder.encode(combined)
  
  // Use SHA-256 multiple times for security
  let hash = await crypto.subtle.digest('SHA-256', data)
  
  // Perform multiple iterations for security (simple PBKDF2 alternative)
  for (let i = 0; i < 10000; i++) {
    const nextData = new Uint8Array([...new Uint8Array(hash), ...encoder.encode(actualSalt)])
    hash = await crypto.subtle.digest('SHA-256', nextData)
  }
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hash))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return { hash: hashHex, salt: actualSalt }
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const { hash: computedHash } = await hashPassword(password, salt)
    return computedHash === hash
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Generate secure session token
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32) // 256 bits
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}