import { motion } from 'framer-motion'
import type { ConfidenceLevel } from '../../types'

const colors: Record<ConfidenceLevel, string> = {
  high: 'bg-[#e5f1e8] text-[#28704e] border-[#b9d9c1]',
  medium: 'bg-[#fff3dc] text-[#936523] border-[#ead39d]',
  low: 'bg-[#fbe9e5] text-[#a34d40] border-[#e9bbb2]',
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${colors[level]}`}
    >
      {level} confidence
    </span>
  )
}

export function RelevanceBar({ score }: { score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-[#718078]">
        <span>Relevance</span>
        <span className="font-semibold text-[#0f766e]">{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e3e9e3]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0f766e] to-[#4b9b7d]"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
