import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { GapItem, RiskSeverity } from '../../types'
import { GlassCard } from '../ui/GlassCard'

const severityStyle: Record<RiskSeverity, string> = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
}

const barColor: Record<RiskSeverity, string> = {
  high: '#fb7185',
  medium: '#fbbf24',
  low: '#34d399',
}

interface Props {
  gaps: GapItem[]
}

/** Gap list + animated severity bar chart (Recharts). */
export function GapAnalysis({ gaps }: Props) {
  const chartData = gaps.map((g) => ({
    name: g.area,
    score: g.gapScore,
    severity: g.severity,
  }))

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="mb-4 font-display text-lg font-semibold">Gap severity heatmap</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#0a1228',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={barColor[entry.severity as RiskSeverity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid gap-3 md:grid-cols-2">
        {gaps.map((g, i) => (
          <GlassCard key={g.id} delay={i * 0.04}>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-white">{g.area}</h4>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityStyle[g.severity]}`}
              >
                {g.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{g.description}</p>
            <p className="mt-3 text-xs text-teal-300/90">→ {g.recommendation}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400"
                style={{ width: `${g.gapScore}%` }}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
