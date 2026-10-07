interface ScannerProps {
  active?: boolean
  className?: string
  color1?: string
  color2?: string
  color3?: string
  speed?: number
  opacity?: number
  [key: string]: unknown
}

export default function Scanner({
  active = true,
  className = '',
  color1 = '#c0582b',
  color2 = '#578875',
  color3 = '#31564d',
  speed = 5,
  opacity = 0.19,
  ...visualTuning
}: ScannerProps) {
  if (!active) return null
  return (
    <div
      className={`scanner-field ${className}`}
      aria-hidden="true"
      data-scanner-tuning={Object.keys(visualTuning).length ? 'custom' : undefined}
      style={{
        '--scanner-color-1': color1,
        '--scanner-color-2': color2,
        '--scanner-color-3': color3,
        '--scanner-speed': `${speed}s`,
        opacity,
      } as React.CSSProperties}
    >
      <span />
      <i />
      <b />
    </div>
  )
}
