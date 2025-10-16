/**
 * Activity Types for Development Ledger
 * Tracks all development activities for the Canadian Payroll Application
 */

export interface ActivityEntry {
  id: string
  timestamp: string
  type: ActivityType
  title: string
  description: string
  filesAffected: string[]
  impact: Impact
  category: Category
  tags: string[]
  details?: ActivityDetails
}

export type ActivityType = 
  | 'setup'
  | 'feature'
  | 'bugfix'
  | 'refactor'
  | 'config'
  | 'documentation'
  | 'testing'
  | 'optimization'

export type Impact = 'low' | 'medium' | 'high' | 'critical'

export type Category =
  | 'project-setup'
  | 'tax-calculations'
  | 'ui-components'
  | 'data-management'
  | 'employee-management'
  | 'payroll-processing'
  | 'export-functionality'
  | 'storage'
  | 'validation'
  | 'documentation'

export interface ActivityDetails {
  beforeState?: string
  afterState?: string
  reasoning?: string
  alternativesConsidered?: string[]
  testingNotes?: string
  futureConsiderations?: string[]
}

export interface LedgerEntry {
  phase: string
  activities: ActivityEntry[]
  summary: string
  keyAchievements: string[]
  challengesEncountered: string[]
  lessonsLearned: string[]
}