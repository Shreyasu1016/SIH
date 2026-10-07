import { useRef, type ReactNode } from 'react'

interface MagicBentoProps {
  children: ReactNode
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  spotlightRadius?: number
  particleCount?: number
  glowColor?: string
  className?: string
}

export default function MagicBento({
  children,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = '132, 0, 255',
  className = '',
}: MagicBentoProps) {
  const ref = useRef<HTMLDivElement>(null)

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const rotateX = ((y / bounds.height) - 0.5) * -5
    const rotateY = ((x / bounds.width) - 0.5) * 5
    element.style.setProperty('--bento-x', `${x}px`)
    element.style.setProperty('--bento-y', `${y}px`)
    element.style.setProperty('--bento-radius', `${spotlightRadius}px`)
    if (enableTilt) element.style.setProperty('--bento-transform', `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
    if (enableMagnetism) {
      element.style.setProperty('--bento-shift-x', `${(x / bounds.width - 0.5) * 5}px`)
      element.style.setProperty('--bento-shift-y', `${(y / bounds.height - 0.5) * 5}px`)
    }
  }

  const resetPointer = () => {
    const element = ref.current
    if (!element) return
    element.style.setProperty('--bento-transform', 'perspective(700px) rotateX(0deg) rotateY(0deg)')
    element.style.setProperty('--bento-shift-x', '0px')
    element.style.setProperty('--bento-shift-y', '0px')
  }

  return (
    <div
      ref={ref}
      className={`magic-bento ${enableSpotlight ? 'magic-bento-spotlight' : ''} ${enableBorderGlow ? 'magic-bento-border' : ''} ${clickEffect ? 'magic-bento-click' : ''} ${className}`}
      style={{ '--bento-glow': glowColor, '--bento-particles': particleCount, '--bento-hide-text': textAutoHide ? 1 : 0 } as React.CSSProperties}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      {enableStars && <span className="magic-bento-stars" aria-hidden="true" />}
      {children}
    </div>
  )
}
