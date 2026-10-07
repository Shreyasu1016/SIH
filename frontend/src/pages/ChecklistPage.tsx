import { useEffect, useState } from 'react'
import checklist from '../data/mock/checklist.json'
import type { ChecklistItem } from '../types'
import { ChecklistGenerator } from '../components/ChecklistGenerator'
import { CardSkeleton } from '../components/ui/Skeleton'

export function ChecklistPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ChecklistItem[]>([])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setData(checklist as ChecklistItem[])
      setLoading(false)
    }, 650)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Compliance checklist</h1>
        <p className="mt-1 text-slate-400">
          Met / Not Met / Partially Met / Requires Verification — click rows to cycle.
        </p>
      </div>
      {loading ? (
        <div className="grid gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <ChecklistGenerator items={data} />
      )}
    </div>
  )
}
