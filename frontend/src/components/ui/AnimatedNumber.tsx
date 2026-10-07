import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  className?: string
  duration?: number
}

export function AnimatedNumber({ value, suffix = '', className = '', duration = 1.1 }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    const startedAt = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, reduceMotion, value])

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {displayValue.toLocaleString()}{suffix}
    </motion.span>
  )
}