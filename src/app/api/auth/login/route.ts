import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/crypto'
import { validateEmail } from '@/lib/auth/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required' 
      }, { status: 400 })
    }

    // Find company by email
    const company = await prisma.company.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        passwordSalt: true,
        createdAt: true
      }
    })

    if (!company || !company.passwordHash || !company.passwordSalt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, company.passwordHash, company.passwordSalt)
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Create new session (30 days)
    const sessionToken = crypto.randomUUID()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Update company with new session
    await prisma.company.update({
      where: { id: company.id },
      data: {
        sessionToken,
        sessionExpiry
      }
    })

    // Return company info with session
    return NextResponse.json({ 
      success: true, 
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        sessionToken,
        sessionExpiry,
        createdAt: company.createdAt
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    }, { status: 500 })
  }
}