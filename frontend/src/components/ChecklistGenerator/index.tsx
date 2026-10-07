import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  XCircle,
} from 'lucide-react'
import type { ChecklistItem, ChecklistStatus } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { GlassCard } from '../ui/GlassCard'

const meta: Record<
  ChecklistStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  met: { label: 'Met', icon: CheckCircle2, className: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30' },
  not_met: { label: 'Not Met', icon: XCircle, className: 'text-rose-300 bg-rose-500/15 border-rose-400/30' },
  partially_met: {
    label: 'Partially Met',
    icon: CircleDashed,
    className: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
  },
  requires_verification: {
    label: 'Requires Verification',
    icon: HelpCircle,
    className: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
  },
}

interface Props {
  items: ChecklistItem[]
}

/** Interactive compliance checklist with mock export buttons. */
export function ChecklistGenerator({ items: initial }: Props) {
  const { t } = useLanguage()
  const [items, setItems] = useState(initial)
  const [toast, setToast] = useState<string | null>(null)

  const counts = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc[i.status] += 1
        return acc
      },
      { met: 0, not_met: 0, partially_met: 0, requires_verification: 0 } as Record<ChecklistStatus, number>,
    )
  }, [items])

  const cycleStatus = (id: string) => {
    const order: ChecklistStatus[] = ['met', 'partially_met', 'not_met', 'requires_verification']
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const next = order[(order.indexOf(item.status) + 1) % order.length]
        return { ...item, status: next }
      }),
    )
  }

  const mockExport = (kind: string) => {
    setToast(`${kind} export queued (UI demo only)`)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(meta) as ChecklistStatus[]).map((k) => (
            <span key={k} className={`rounded-full border px-2.5 py-1 ${meta[k].className}`}>
              {meta[k].label}: {counts[k]}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => mockExport('PDF')}
            className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
          >
            <FileText className="h-4 w-4 text-sky-300" />
            {t.common.exportPdf}
          </button>
          <button
            type="button"
            onClick={() => mockExport('Excel')}
            className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
          >
            <FileSpreadsheet className="h-4 w-4 text-teal-300" />
            {t.common.exportExcel}
          </button>
        </div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200"
        >
          <CircleAlert className="mr-2 inline h-4 w-4" />
          {toast}
        </motion.div>
      )}

      <div className="grid gap-3">
        {items.map((item, i) => {
          const m = meta[item.status]
          const Icon = m.icon
          return (
            <GlassCard key={item.id} delay={i * 0.03} className="!p-4">
              <button
                type="button"
                onClick={() => cycleStatus(item.id)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className={`mt-0.5 rounded-lg border p-1.5 ${m.className}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{item.clause}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${m.className}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-100">{item.requirement}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.standardRef}</p>
                </div>
              </button>
            </GlassCard>
          )
        })}
      </div>
      <p className="text-center text-xs text-slate-500">Click a row to cycle status (demo).</p>
    </div>
  )
}
