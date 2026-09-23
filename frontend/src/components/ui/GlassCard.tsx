import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

/** Frosted glass panel with fade + slide-up entrance. */
export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay, ease: 'easeOut' }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className={`glass rounded-xl p-5 transition-shadow hover:shadow-[0_22px_50px_rgba(24,37,34,0.11)] md:p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
