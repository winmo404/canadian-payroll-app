// Employee interface compatible with existing components
export interface Employee {
  id: string
  companyId?: string
  name: string
  hourlyRate: number  // Required to match existing interface
  salary?: number
  payType: 'hourly' | 'salary'
  vacationRate: number
  federalTD1: number
  provincialTD1: number
  wsibRate: number
  active: boolean
  startDate: string  // Required to match existing interface
  
  // Additional employee details (optional)
  email?: string
  phone?: string
  address?: string
  sin?: string
  dateOfBirth?: string
  hireDate?: string
  jobTitle?: string
  department?: string
  
  createdAt?: string
  updatedAt?: string
}

// Default employee values
export const defaultEmployee: Omit<Employee, 'id' | 'name'> = {
  hourlyRate: 25.0,  // Default hourly rate
  salary: 0,
  payType: 'hourly',
  vacationRate: 4.0,
  federalTD1: 16129,  // 2025 Federal Basic Personal Amount
  provincialTD1: 12747,  // 2025 Ontario Basic Personal Amount
  wsibRate: 2.15,  // Default WSIB rate
  active: true,
  startDate: new Date().toISOString().split('T')[0]  // Today's date as default
}