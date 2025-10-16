import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all tables info
    const companies = await prisma.company.findMany();
    const employees = await prisma.employee.findMany();
    const payrollRuns = await prisma.payrollRun.findMany();
    const activityLogs = await prisma.activityLog.findMany();

    return NextResponse.json({
      success: true,
      database: 'Neon PostgreSQL',
      connection: 'Connected successfully',
      tables: {
        companies: {
          count: companies.length,
          data: companies
        },
        employees: {
          count: employees.length,
          data: employees
        },
        payrollRuns: {
          count: payrollRuns.length,
          data: payrollRuns
        },
        activityLogs: {
          count: activityLogs.length,
          data: activityLogs
        }
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}