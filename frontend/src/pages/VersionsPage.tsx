import { useEffect, useState } from 'react'
import versions from '../data/mock/versions.json'
import type { VersionEvent } from '../types'
import { VersionTracker } from '../components/VersionTracker'
import { CardSkeleton } from '../components/ui/Skeleton'

export function VersionsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<VersionEvent[]>([])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setData(versions as VersionEvent[])
      setLoading(false)
    }, 700)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Version & status tracker</h1>
        <p className="mt-1 text-slate-400">Timeline of cited standards and successor editions.</p>
      </div>
      {loading ? <CardSkeleton /> : <VersionTracker events={data} />}
    </div>
  )
}
