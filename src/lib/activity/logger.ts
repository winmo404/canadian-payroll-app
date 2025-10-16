/**
 * Activity Logger for Canadian Payroll Application Development
 * Comprehensive logging of all development activities
 */

import { ActivityEntry, LedgerEntry } from './types'

export class ActivityLogger {
  private activities: ActivityEntry[] = []
  
  /**
   * Log a new development activity
   */
  logActivity(activity: Omit<ActivityEntry, 'id' | 'timestamp'>): ActivityEntry {
    const entry: ActivityEntry = {
      ...activity,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    }
    
    this.activities.push(entry)
    return entry
  }

  /**
   * Get all activities
   */
  getAllActivities(): ActivityEntry[] {
    return [...this.activities]
  }

  /**
   * Get activities by category
   */
  getActivitiesByCategory(category: string): ActivityEntry[] {
    return this.activities.filter(activity => activity.category === category)
  }

  /**
   * Get activities by phase/date range
   */
  getActivitiesByPhase(startDate: string, endDate?: string): ActivityEntry[] {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    return this.activities.filter(activity => {
      const activityDate = new Date(activity.timestamp)
      return activityDate >= start && activityDate <= end
    })
  }

  /**
   * Generate activity summary report
   */
  generateSummaryReport(): {
    totalActivities: number
    byType: Record<string, number>
    byCategory: Record<string, number>
    byImpact: Record<string, number>
    recentActivities: ActivityEntry[]
  } {
    const byType: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    const byImpact: Record<string, number> = {}

    this.activities.forEach(activity => {
      byType[activity.type] = (byType[activity.type] || 0) + 1
      byCategory[activity.category] = (byCategory[activity.category] || 0) + 1
      byImpact[activity.impact] = (byImpact[activity.impact] || 0) + 1
    })

    const recentActivities = this.activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return {
      totalActivities: this.activities.length,
      byType,
      byCategory,
      byImpact,
      recentActivities
    }
  }

  /**
   * Export activities as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      projectName: "Canadian Payroll Application",
      activities: this.activities,
      summary: this.generateSummaryReport()
    }, null, 2)
  }

  /**
   * Import activities from JSON
   */
  importFromJSON(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      if (data.activities && Array.isArray(data.activities)) {
        this.activities = data.activities
      }
    } catch (error) {
      console.error('Failed to import activities:', error)
    }
  }

  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Development history of Canadian Payroll Application
export const developmentHistory: LedgerEntry[] = [
  {
    phase: "Initial Setup & Architecture",
    activities: [],
    summary: "Established Next.js 14 project with TypeScript, configured development environment, and set up core project structure",
    keyAchievements: [
      "Next.js 14 with App Router configured",
      "TypeScript setup for type safety",
      "Project structure established",
      "Development environment configured"
    ],
    challengesEncountered: [
      "Tailwind CSS configuration conflicts",
      "Next.js configuration warnings"
    ],
    lessonsLearned: [
      "Next.js 15 has breaking changes with typedRoutes",
      "Custom CSS can be more reliable than Tailwind for complex layouts"
    ]
  },
  {
    phase: "Tax Calculation Engine",
    activities: [],
    summary: "Built comprehensive Canadian tax calculation system with 2025 rates for CPP, EI, WSIB, vacation, and income tax",
    keyAchievements: [
      "Accurate 2025 CPP calculations (5.95% rate, $71,300 YMPE)",
      "Proper EI calculations (1.64% rate, $65,700 MIE)",
      "WSIB premium calculations",
      "Vacation accrual and payment logic",
      "Income tax calculation with Tax Credit Method"
    ],
    challengesEncountered: [
      "Progressive tax brackets vs Tax Credit Method accuracy",
      "Ensuring compliance with CRA requirements",
      "Handling edge cases in calculations"
    ],
    lessonsLearned: [
      "Tax Credit Method (14.5%/5.05%) more accurate for payroll withholding",
      "Modular calculation design enables easy testing and maintenance"
    ]
  },
  {
    phase: "User Interface Development",
    activities: [],
    summary: "Created responsive React components for payroll processing, employee management, and data display",
    keyAchievements: [
      "PayrollForm with dynamic employee selection",
      "PaystubDisplay with detailed breakdown",
      "EmployeeManager for CRUD operations",
      "PayrollHistory with filtering and search",
      "Export functionality (CSV, JSON, text)"
    ],
    challengesEncountered: [
      "CSS styling conflicts with Tailwind",
      "Form state management complexity",
      "Responsive design challenges"
    ],
    lessonsLearned: [
      "Custom CSS provides better control for complex forms",
      "React hooks pattern works well for form management"
    ]
  },
  {
    phase: "Data Management & Persistence",
    activities: [],
    summary: "Implemented localStorage-based data persistence with custom hooks for employees and payroll history",
    keyAchievements: [
      "useEmployees hook with persistence",
      "usePayrollHistory hook with CRUD operations",
      "useSelectedEmployee for state management",
      "StorageManager for data backup/restore",
      "Automatic data migration for TD1 updates"
    ],
    challengesEncountered: [
      "localStorage size limitations",
      "Data migration strategies",
      "State synchronization between components"
    ],
    lessonsLearned: [
      "Custom hooks provide clean separation of concerns",
      "Automatic migration prevents data inconsistencies"
    ]
  },
  {
    phase: "YTD Calculation & Employee Separation",
    activities: [],
    summary: "Fixed YTD calculations to be employee-specific rather than mixed across all employees",
    keyAchievements: [
      "Employee-specific YTD calculations",
      "YTD debugging component for transparency",
      "Proper payroll history filtering by employee and year",
      "Accurate T4 preparation support"
    ],
    challengesEncountered: [
      "Initial YTD calculations mixed employee data",
      "Complex filtering logic for employee-specific history"
    ],
    lessonsLearned: [
      "YTD must be calculated per employee for tax compliance",
      "Debugging components help identify calculation issues"
    ]
  },
  {
    phase: "Tax Method Optimization",
    activities: [],
    summary: "Updated income tax calculations from progressive brackets to Tax Credit Method for better payroll accuracy",
    keyAchievements: [
      "Tax Credit Method implementation (14.5% federal, 5.05% provincial)",
      "Comparison tool showing different calculation methods",
      "Updated 2025 TD1 amounts ($16,129 federal, $12,747 Ontario)",
      "Automatic TD1 migration for existing employees"
    ],
    challengesEncountered: [
      "Choosing between progressive brackets vs tax credit method",
      "Updating existing employee data with new TD1 amounts"
    ],
    lessonsLearned: [
      "Tax Credit Method aligns better with CRA payroll tables",
      "Data migration strategies important for production apps"
    ]
  }
]

// Global activity logger instance
export const activityLogger = new ActivityLogger()