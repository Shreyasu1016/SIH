import { useEffect, useState } from 'react'
import report from '../data/mock/report.json'
import type { ReportSummary } from '../types'
import { ReportViewer } from '../components/ReportViewer'
import { CardSkeleton } from '../components/ui/Skeleton'

export function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportSummary | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setData(report as ReportSummary)
      setLoading(false)
    }, 600)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Report summary</h1>
        <p className="mt-1 text-slate-400">Printable-style overview for demo and evaluation handoff.</p>
      </div>
      {loading || !data ? <CardSkeleton /> : <ReportViewer report={data} />}
    </div>
  )
}
