export default function LatticeLoader({
  status = 'working', label = 'Working', doneLabel = 'Complete', errorLabel = 'Unable to complete',
  pattern = 'lattice', grid, shape = 'square', doneColor = '#398b68', errorColor = '#a13d2e',
  cellSize, gap, fontSize, step, idleOpacity = 1, glow = false, showTimer = false,
}) {
  const message = status === 'done' ? doneLabel : status === 'error' ? errorLabel : label
  return <div className={`lattice-loader lattice-${status}`} role="status" data-pattern={pattern} data-grid={grid} data-shape={shape} style={{
    '--done-color': doneColor, '--error-color': errorColor, '--cell-size': cellSize,
    '--loader-gap': gap, '--loader-font-size': fontSize, '--loader-step': step,
    '--idle-opacity': idleOpacity, '--loader-glow': glow ? '1' : '0',
  }}><div className="lattice" /><span>{message}</span>{showTimer && status === 'working' && <small>LIVE</small>}</div>
}
