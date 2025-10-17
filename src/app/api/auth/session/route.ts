import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { companyId, sessionToken } = await request.json()

    if (!companyId || !sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing company ID or session token' 
      }, { status: 400 })
    }

    // Find company with valid session
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        sessionToken: true,
        sessionExpiry: true,
        createdAt: true
      }
    })

    // Validate session
    if (!company || 
        company.sessionToken !== sessionToken || 
        !company.sessionExpiry || 
        company.sessionExpiry < new Date()) {
      
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired session' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        sessionToken: company.sessionToken,
        sessionExpiry: company.sessionExpiry,
        createdAt: company.createdAt
      }
    })

  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Session validation failed' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing company ID' 
      }, { status: 400 })
    }

    // Clear session
    await prisma.company.update({
      where: { id: companyId },
      data: {
        sessionToken: null,
        sessionExpiry: null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Logout failed' 
    }, { status: 500 })
  }
}