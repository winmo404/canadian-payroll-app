import { NextRequest, NextResponse } from 'next/server';
import { prisma, getDefaultCompany } from '@/lib/db';

export async function GET() {
  try {
    const company = await getDefaultCompany();
    
    const employees = await prisma.employee.findMany({
      where: { companyId: company.id },
      orderBy: { name: 'asc' },
    });
    
    const formattedEmployees = employees.map((employee: any) => ({
      id: employee.id,
      name: employee.name,
      hourlyRate: employee.hourlyRate || 0,
      salary: employee.salary || 0,
      payType: employee.payType,
      vacationRate: employee.vacationRate,
      federalTD1: employee.federalTD1,
      provincialTD1: employee.provincialTD1,
      wsibRate: employee.wsibRate,
      active: employee.active,
      startDate: employee.startDate || '',
    }));
    
    return NextResponse.json(formattedEmployees);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const company = await getDefaultCompany();
    
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        name: data.name,
        hourlyRate: data.hourlyRate,
        salary: data.salary,
        payType: data.payType,
        vacationRate: data.vacationRate,
        federalTD1: data.federalTD1,
        provincialTD1: data.provincialTD1,
        wsibRate: data.wsibRate,
        active: data.active,
        startDate: data.startDate,
      },
    });
    
    const formattedEmployee = {
      id: employee.id,
      name: employee.name,
      hourlyRate: employee.hourlyRate || 0,
      salary: employee.salary || 0,
      payType: employee.payType,
      vacationRate: employee.vacationRate,
      federalTD1: employee.federalTD1,
      provincialTD1: employee.provincialTD1,
      wsibRate: employee.wsibRate,
      active: employee.active,
      startDate: employee.startDate || '',
    };
    
    return NextResponse.json(formattedEmployee);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}