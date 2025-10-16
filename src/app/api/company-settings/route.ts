import { NextRequest, NextResponse } from 'next/server';
import { prisma, getDefaultCompany } from '@/lib/db';

export async function GET() {
  try {
    const company = await getDefaultCompany();
    
    const companySettings = {
      name: company.name,
      address: {
        street: company.addressStreet,
        city: company.addressCity,
        province: company.addressProvince,
        postalCode: company.postalCode,
      },
      phone: company.phone,
      email: company.email,
      website: company.website,
      businessNumber: company.businessNumber,
      wsibAccount: company.wsibAccount,
      cppNumber: company.cppNumber,
      eiNumber: company.eiNumber,
      taxRates: company.taxRates,
    };
    
    return NextResponse.json(companySettings);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get or create the default company
    const existingCompany = await getDefaultCompany();
    
    const updatedCompany = await prisma.company.update({
      where: { id: existingCompany.id },
      data: {
        name: data.name,
        addressStreet: data.address.street,
        addressCity: data.address.city,
        addressProvince: data.address.province,
        postalCode: data.address.postalCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        businessNumber: data.businessNumber,
        wsibAccount: data.wsibAccount,
        cppNumber: data.cppNumber,
        eiNumber: data.eiNumber,
        taxRates: data.taxRates,
      },
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}