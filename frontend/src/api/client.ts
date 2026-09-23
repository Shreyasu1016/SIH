export interface BackendHealth {
  status: string
  service: string
  timestamp: string
  database: {
    status: string
    dialect?: string
    database?: string
    error?: string
  }
}

export interface BackendRecommendation {
  is_number: string
  title: string
  similarity_score: number
  explanation?: string
  confidence?: number
  certification_flag?: boolean
  version_info?: {
    latest_version?: string
    reaffirmation_year?: number
    amendments?: Array<{
      amendment_no: string
      date?: string
      summary?: string
      latest_amendment?: boolean
    }>
  }
  certifications?: Array<{
    certification_type: string
    mandatory: boolean
    scheme_reference?: string
  }>
  allied_standards?: Record<string, Array<{
    is_number: string
    title: string
    relation_type: string
  }>>
}

export interface RecommendationResponse {
  query: string
  language?: string
  explanation_source?: 'groq' | 'ollama' | 'rule_based'
  results: BackendRecommendation[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.detail || `Backend request failed (${response.status})`)
  }
  return payload as T
}

export async function getHealth(): Promise<BackendHealth> {
  return parseResponse(await fetch(`${API_BASE_URL}/health`))
}

export async function recommendText(query: string, topK = 5): Promise<RecommendationResponse> {
  return parseResponse(await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  }))
}

export async function recommendDocument(file: File, topK = 5): Promise<RecommendationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('top_k', String(topK))
  return parseResponse(await fetch(`${API_BASE_URL}/api/recommend-from-document?top_k=${topK}`, {
    method: 'POST',
    body: formData,
  }))
}

export function toRecommendedStandard(item: BackendRecommendation): import('../types').RecommendedStandard {
  const confidence = item.confidence ?? item.similarity_score
  return {
    id: item.is_number,
    code: item.is_number,
    title: item.title,
    body: 'BIS',
    category: 'Standards catalogue',
    relevanceScore: Math.max(0, Math.min(100, item.similarity_score * 100)),
    confidence: confidence >= 0.75 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
    why: [item.explanation || 'Matched by semantic similarity in the BIS standards catalogue.'],
    matchedClauses: item.certifications?.map((cert) => cert.certification_type) || [],
  }
}

export { API_BASE_URL }
