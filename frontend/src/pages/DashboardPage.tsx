import { useLocation } from 'react-router-dom'
import type { RecommendedStandard } from '../types'
import { RecommendationPanel } from '../components/RecommendationPanel'
import type { RecommendationResponse } from '../api/client'
import { toRecommendedStandard } from '../api/client'

export function DashboardPage() {
  const location = useLocation()
  const recommendation = (location.state as { recommendation?: RecommendationResponse } | null)?.recommendation
  const data: RecommendedStandard[] = recommendation?.results.map(toRecommendedStandard) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Standard recommendations</h1>
        <p className="mt-1 text-slate-400">
          Ranked matches returned by the SIH standards recommendation backend.
        </p>
      </div>
      {data.length ? (
        <RecommendationPanel standards={data} />
      ) : (
        <div className="glass rounded-xl p-8 text-center text-sm text-[#60716a]">
          Submit a tender PDF or paste a specification from the Upload page to view live recommendations.
        </div>
      )}
    </div>
  )
}
