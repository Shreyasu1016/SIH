/** Shared domain types used by the frontend and the backend recommendation adapter. */

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ChecklistStatus =
  | 'met'
  | 'not_met'
  | 'partially_met'
  | 'requires_verification'

export type RiskSeverity = 'high' | 'medium' | 'low'

export interface RecommendedStandard {
  id: string
  code: string
  title: string
  body: string
  category: string
  relevanceScore: number
  confidence: ConfidenceLevel
  why: string[]
  matchedClauses: string[]
}

export interface VersionEvent {
  id: string
  version: string
  date: string
  status: 'current' | 'superseded' | 'draft'
  notes: string
  newerAvailable?: boolean
}

export interface ChecklistItem {
  id: string
  clause: string
  requirement: string
  status: ChecklistStatus
  standardRef: string
}

export interface GapItem {
  id: string
  area: string
  description: string
  severity: RiskSeverity
  gapScore: number
  recommendation: string
}

export interface ReportSummary {
  tenderTitle: string
  analyzedAt: string
  standardsCount: number
  avgRelevance: number
  highRiskGaps: number
  checklistCompletion: number
  highlights: string[]
  nextSteps: string[]
}
