import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Check if companies table exists and what data is in it
    const result = await sql`
      SELECT id, name, address_street, address_city, created_at, updated_at 
      FROM companies 
      ORDER BY id
    `;
    
    const count = await sql`SELECT COUNT(*) as total FROM companies`;
    
    return NextResponse.json({
      success: true,
      totalCompanies: count.rows[0].total,
      companies: result.rows,
      message: 'Company data retrieved successfully'
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}