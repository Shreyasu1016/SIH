import type { ReportSummary } from '../../types'
import { GlassCard } from '../ui/GlassCard'

interface Props {
  report: ReportSummary
}

/** Printable-style summary layout for demo / TEC handoff. */
export function ReportViewer({ report }: Props) {
  return (
    <GlassCard className="!bg-white/[0.06] print:bg-white print:text-black">
      <div className="border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300">NormAI · Analysis Report</p>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">{report.tenderTitle}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Analyzed {new Date(report.analyzedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Standards', value: report.standardsCount },
          { label: 'Avg relevance', value: `${report.avgRelevance}%` },
          { label: 'High-risk gaps', value: report.highRiskGaps },
          { label: 'Checklist done', value: `${report.checklistCompletion}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-navy-900/50 p-4 text-center">
            <div className="font-display text-2xl font-bold text-gradient">{s.value}</div>
            <div className="mt-1 text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold text-white">Highlights</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {report.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-teal-400">•</span>
                {h}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-white">Recommended next steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-300">
            {report.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        SIH Problem Statement 26108 — frontend demo report (mock data).
      </p>
    </GlassCard>
  )
}
