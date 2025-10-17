import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/crypto'
import { validateEmail, validatePassword } from '@/lib/auth/validation'

export async function POST(request: NextRequest) {
  try {
    const { companyName, email, password } = await request.json()

    // Validate inputs
    if (!companyName?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Company name is required' 
      }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: passwordValidation.errors.join(', ') 
      }, { status: 400 })
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingCompany) {
      return NextResponse.json({ 
        success: false, 
        error: 'A company is already registered with this email address' 
      }, { status: 409 })
    }

    // Hash password
    const { hash, salt } = await hashPassword(password)

    // Create session token and expiry (30 days)
    const sessionToken = crypto.randomUUID()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Create new company
    const newCompany = await prisma.company.create({
      data: {
        name: companyName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        sessionToken,
        sessionExpiry,
        // Default address fields (can be updated later)
        addressStreet: '',
        addressCity: '',
        addressProvince: 'ON',
        postalCode: ''
      },
      select: {
        id: true,
        name: true,
        email: true,
        sessionToken: true,
        sessionExpiry: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      company: newCompany 
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    }, { status: 500 })
  }
}