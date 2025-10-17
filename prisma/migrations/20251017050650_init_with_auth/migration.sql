-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressStreet" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressProvince" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "businessNumber" TEXT,
    "wsibAccount" TEXT,
    "cppNumber" TEXT,
    "eiNumber" TEXT,
    "passwordHash" TEXT,
    "passwordSalt" TEXT,
    "sessionToken" TEXT,
    "sessionExpiry" TIMESTAMP(3),
    "taxRates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION,
    "salary" DOUBLE PRECISION,
    "payType" TEXT NOT NULL DEFAULT 'hourly',
    "vacationRate" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "federalTD1" DOUBLE PRECISION NOT NULL DEFAULT 16129,
    "provincialTD1" DOUBLE PRECISION NOT NULL DEFAULT 12747,
    "wsibRate" DOUBLE PRECISION NOT NULL DEFAULT 2.15,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "sin" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "hireDate" TIMESTAMP(3),
    "jobTitle" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "payPeriodStart" TIMESTAMP(3) NOT NULL,
    "payPeriodEnd" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalGrossPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNetPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTaxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frequency" TEXT NOT NULL DEFAULT 'biweekly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_entries" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "calculationData" JSONB NOT NULL,
    "grossPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTaxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpp1Emp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpp2Emp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eiEmp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "federalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "provincialTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wsib" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdGross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdCpp1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdCpp2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdEi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdWsib" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
