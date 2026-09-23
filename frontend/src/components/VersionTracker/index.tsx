import { motion } from 'framer-motion'
import { AlertTriangle, Circle } from 'lucide-react'
import type { VersionEvent } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { GlassCard } from '../ui/GlassCard'

interface Props {
  events: VersionEvent[]
}

/** Vertical timeline of standard versions with newer-version alert. */
export function VersionTracker({ events }: Props) {
  const { t } = useLanguage()
  const hasNewer = events.some((e) => e.newerAvailable)

  return (
    <div className="space-y-4">
      {hasNewer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-200"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t.common.newerVersion}</p>
            <p className="text-sm text-amber-200/80">
              A draft amendment or successor edition was detected for a cited standard.
            </p>
          </div>
        </motion.div>
      )}

      <GlassCard>
        <ol className="relative space-y-0 border-l border-white/10 ml-3">
          {events.map((ev, i) => (
            <li key={ev.id} className="relative pb-8 pl-8 last:pb-0">
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  ev.status === 'current'
                    ? 'border-teal-400 bg-teal-400/30'
                    : ev.status === 'draft'
                      ? 'border-violet-400 bg-violet-400/30'
                      : 'border-slate-500 bg-slate-700'
                }`}
              >
                <Circle className="h-1.5 w-1.5 fill-current text-white" />
              </motion.span>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{ev.version}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ev.status === 'current'
                      ? 'bg-teal-500/20 text-teal-300'
                      : ev.status === 'draft'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {ev.status}
                </span>
                {ev.newerAvailable && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                    update
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{ev.date}</p>
              <p className="mt-2 text-sm text-slate-300">{ev.notes}</p>
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  )
}
