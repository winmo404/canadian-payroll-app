// Types for Canadian payroll calculations based on your existing system

export interface CompanySettings {
  name: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  website?: string;
  businessNumber?: string; // Canadian Business Number
  wsibAccount?: string; // WSIB Account Number
  cppNumber?: string; // CPP Business Number
  eiNumber?: string; // EI Business Number
  
  // Tax Rate Configuration
  taxRates?: {
    cppRate: number; // CPP employee rate (%)
    cppEmployerRate: number; // CPP employer rate (%)
    cpp2Rate: number; // CPP2 rate (%)
    eiRate: number; // EI employee rate (%)
    eiEmployerMultiplier: number; // EI employer multiplier
    wsibRate: number; // Default WSIB rate (%)
    
    // Maximums and thresholds
    cppMaxPensionable: number; // CPP maximum pensionable earnings
    cppExemption: number; // CPP exemption amount
    cppMaxPensionable2: number; // CPP2 maximum pensionable earnings
    eiMaxInsurable: number; // EI maximum insurable earnings
    wsibMaxAssessable: number; // WSIB maximum assessable earnings
    
    // TD1 amounts
    federalTD1: number; // Federal basic personal amount
    provincialTD1: number; // Provincial basic personal amount (Ontario)
  };
}

export interface PayrollData {
  employeeName: string;
  payDate: string;
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  payType: 'hourly' | 'salary';
  vacationMode: 'pay' | 'accrue';
  vacationRate: number;
  vacationAmount?: number; // Amount of vacation pay when vacationMode is 'pay'
  federalTD1: number;
  provincialTD1: number;
  calculations?: PayrollCalculationResult;
}

export interface EarningsLine {
  code: string;
  description: string;
  rate?: number | null;
  hours?: number | null;
  amount: number;
  ytdHours: number;
  ytdAmount: number;
}

export interface CPPResult {
  cpp1Emp: number;
  cpp1Er: number;
  cpp2Emp: number;
  cpp2Er: number;
  pensionable1This: number;
  pensionable2This: number;
  newYtdCPP1: number;
  newYtdCPP2: number;
}

export interface EIResult {
  eiEmp: number;
  eiEr: number;
  insurableThis: number;
  newYtdEI: number;
}

export interface WSIBResult {
  premium: number;
  assessableThis: number;
  newYtdWSIB: number;
}

export interface PayrollCalculationResult {
  // Employee and pay period info
  employeeName: string;
  payDate: string;
  frequency: string;
  payType: string;
  vacationMode: string;
  
  // Earnings breakdown
  lines: EarningsLine[];
  gross: number;
  pensionable: number;
  insurable: number;
  wsibAssessable: number;
  
  // Deductions
  cpp1Emp: number;
  cpp1Er: number;
  cpp2Emp: number;
  cpp2Er: number;
  eiEmp: number;
  eiEr: number;
  wsib: number;
  tax: number;
  
  // Net pay and vacation
  net: number;
  vacAccrued: number;
  vacPaid: number;
  
  // YTD values (before this period)
  ytdGross: number;
  ytdPensionable: number;
  ytdInsurable: number;
  ytdWsib: number;
  ytdWSIBPremium: number;
  ytdCPP1: number;
  ytdCPP2: number;
  ytdEI: number;
  ytdTax: number;
  ytdVacAccrued: number;
  ytdVacPaid: number;
  
  // Original YTD vacation accrued (for paystub display)
  originalYtdVacAccrued: number;
  
  // New YTD values (after this period)
  newYtdGross: number;
  newYtdPensionable: number;
  newYtdInsurable: number;
  newYtdWsib: number;
  newYtdCPP1: number;
  newYtdCPP2: number;
  newYtdEI: number;
  newYtdTax: number;
  newYtdVacPaid: number;
  newYtdVacAccrued: number;
  
  // Tax configuration
  federalTD1: number;
  provincialTD1: number;
  cppRateVal: number;
  cpp2RateVal: number;
  cppExempt: number;
  ympe: number;
  yampe: number;
  eiRateVal: number;
  eiMult: number;
  mie: number;
  wsibRateVal: number;
  wsibCap: number;
  vacationRate: number;
}

export interface TaxRates2025 {
  cpp: {
    rate: number; // 5.95%
    rate2: number; // 4.00% 
    exemption: number; // $3,500
    ympe: number; // $71,300
    yampe: number; // $81,200
  };
  ei: {
    rate: number; // 1.64%
    multiplier: number; // 1.4
    mie: number; // $65,700
  };
  wsib: {
    rate: number; // Configurable by employer
    cap: number; // $100,000
  };
}