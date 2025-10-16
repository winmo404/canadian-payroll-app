import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, 'Database connection successful!' as message`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working!',
      timestamp: result.rows[0].current_time,
      serverMessage: result.rows[0].message
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        1: 'Check if POSTGRES_URL is set in environment variables',
        2: 'Verify database is created in Vercel dashboard',
        3: 'Ensure database credentials are correct'
      }
    }, { status: 500 });
  }
}