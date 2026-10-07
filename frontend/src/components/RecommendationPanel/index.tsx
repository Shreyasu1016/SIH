import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, BookOpen } from 'lucide-react'
import type { RecommendedStandard } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { GlassCard } from '../ui/GlassCard'
import { ConfidenceBadge, RelevanceBar } from '../ui/ScoreWidgets'

interface Props {
  standards: RecommendedStandard[]
}

/** Recommendation cards with expandable "why this standard" accordion. */
export function RecommendationPanel({ standards }: Props) {
  const { t } = useLanguage()
  const [openId, setOpenId] = useState<string | null>(standards[0]?.id ?? null)

  return (
    <div className="grid gap-4">
      {standards.map((std, i) => {
        const open = openId === std.id
        return (
          <GlassCard key={std.id} delay={i * 0.05}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-sky-500/15 px-2 py-0.5 font-mono text-xs text-sky-300">
                    {std.code}
                  </span>
                  <span className="text-xs text-slate-500">{std.body}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">{std.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{std.category}</p>
              </div>
              <ConfidenceBadge level={std.confidence} />
            </div>

            <div className="mt-4">
              <RelevanceBar score={std.relevanceScore} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {std.matchedClauses.map((c) => (
                <span key={c} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                  {c}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpenId(open ? null : std.id)}
              className="mt-4 flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-teal-200 hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t.common.why}
              </span>
              <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-3 text-sm text-slate-300">
                    {std.why.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                        {line}
                      </li>
                    ))}
                  </div>
                </motion.ul>
              )}
            </AnimatePresence>
          </GlassCard>
        )
      })}
    </div>
  )
}
