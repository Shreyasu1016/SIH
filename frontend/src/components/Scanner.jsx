import './Scanner.css'

export default function Scanner({
  active = true, className = '', color1 = '#c0582b', color2 = '#578875', color3 = '#31564d',
  speed = 5, opacity = 0.19, scale = 1, frequency = 2, ripple = 0.22,
  sweepWidth = 1.6, ...visualTuning
}) {
  if (!active) return null
  return <div
    className={`scanner-field scanner-animation ${className}`}
    aria-hidden="true"
    data-scanner-tuning={Object.keys(visualTuning).length ? 'custom' : undefined}
    style={{
      '--scanner-color-1': color1,
      '--scanner-color-2': color2,
      '--scanner-color-3': color3,
      '--scanner-speed': `${speed}s`,
      '--scanner-scale': scale,
      '--scanner-frequency': frequency,
      '--scanner-ripple': ripple,
      '--scanner-sweep-width': `${sweepWidth * 10}%`,
      opacity,
    }}
  >
    <span className="scanner-grid" />
    <span className="scanner-sweep" />
    <i className="scanner-ring scanner-ring-one" />
    <i className="scanner-ring scanner-ring-two" />
    <b className="scanner-crosshair" />
  </div>
}
