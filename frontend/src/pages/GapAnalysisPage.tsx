import { useEffect, useState } from 'react'
import gaps from '../data/mock/gaps.json'
import type { GapItem } from '../types'
import { GapAnalysis } from '../components/GapAnalysis'
import { CardSkeleton } from '../components/ui/Skeleton'

export function GapAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GapItem[]>([])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setData(gaps as GapItem[])
      setLoading(false)
    }, 750)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Gap analysis</h1>
        <p className="mt-1 text-slate-400">Risk-tagged gaps between tender specs and recommended standards.</p>
      </div>
      {loading ? <CardSkeleton /> : <GapAnalysis gaps={data} />}
    </div>
  )
}
