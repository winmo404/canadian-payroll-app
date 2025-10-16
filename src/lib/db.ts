import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma

// Helper function to get or create a default company
export async function getDefaultCompany() {
  try {
    let company = await prisma.company.findFirst()
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'YOUR COMPANY NAME',
          addressStreet: '123 Business Street',
          addressCity: 'Toronto',
          addressProvince: 'ON',
          postalCode: 'M5V 3A8',
          phone: '(416) 555-0123',
          email: 'payroll@yourcompany.com',
          website: 'www.yourcompany.com',
          taxRates: {
            cppRate: 5.95,
            cppEmployerRate: 5.95,
            cpp2Rate: 4.00,
            eiRate: 1.64,
            eiEmployerMultiplier: 1.4,
            wsibRate: 2.15,
            cppMaxPensionable: 71300,
            cppExemption: 3500,
            cppMaxPensionable2: 81200,
            eiMaxInsurable: 65700,
            wsibMaxAssessable: 100000,
            federalTD1: 16129,
            provincialTD1: 12747
          }
        }
      })
    }
    
    return company
  } catch (error) {
    console.error('Error getting default company:', error)
    throw error
  }
}