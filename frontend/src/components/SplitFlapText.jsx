import { useEffect, useState } from 'react'

export default function SplitFlapText({
  text = '', words, flipDuration = 500, stagger = 70, cycleDelay = 0, charset = '',
  flipsPerChar = 1, tileColor, textColor, tileRadius, gap, fontSize, loop = true,
  padTo = 0, className = '',
}) {
  const frames = words?.length ? words : [text]
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (frames.length < 2 || !loop) return undefined
    const timer = setInterval(() => setFrame(value => (value + 1) % frames.length), Math.max(900, cycleDelay || 2400))
    return () => clearInterval(timer)
  }, [text, words, cycleDelay, frames.length, loop])
  const value = frames[frame] || text
  const padded = padTo > 0 ? value.padEnd(padTo) : value
  return <span className={`split-flap-text ${className}`} data-charset={charset || undefined} data-flips-per-char={flipsPerChar} style={{
    '--flip-duration': `${flipDuration}ms`, '--stagger': `${stagger}ms`,
    '--tile-color': tileColor, '--text-color': textColor, '--tile-radius': tileRadius,
    '--tile-gap': gap, '--flap-font-size': fontSize,
    backgroundColor: tileColor,
    color: textColor,
    borderRadius: tileRadius,
    padding: gap ? `4px ${gap}px` : undefined,
    fontSize,
  }}>{padded}</span>
}
