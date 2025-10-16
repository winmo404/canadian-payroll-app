import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { id: employeeId } = await params;
    
    const result = await sql`
      UPDATE employees 
      SET 
        name = ${data.name},
        hourly_rate = ${data.hourlyRate},
        salary = ${data.salary},
        pay_type = ${data.payType},
        vacation_rate = ${data.vacationRate},
        federal_td1 = ${data.federalTD1},
        provincial_td1 = ${data.provincialTD1},
        wsib_rate = ${data.wsibRate},
        active = ${data.active},
        start_date = ${data.startDate},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${employeeId}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    const employee = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      hourlyRate: parseFloat(result.rows[0].hourly_rate || '0'),
      salary: parseFloat(result.rows[0].salary || '0'),
      payType: result.rows[0].pay_type,
      vacationRate: parseFloat(result.rows[0].vacation_rate),
      federalTD1: result.rows[0].federal_td1,
      provincialTD1: result.rows[0].provincial_td1,
      wsibRate: parseFloat(result.rows[0].wsib_rate),
      active: result.rows[0].active,
      startDate: result.rows[0].start_date,
    };
    
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    
    const result = await sql`
      DELETE FROM employees WHERE id = ${employeeId} RETURNING *
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}