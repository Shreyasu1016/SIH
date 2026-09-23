import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

/** Subtle particle/network canvas that drifts and gently follows the mouse. */
export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let nodes: Node[] = []
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const COUNT = 48

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      nodes = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }))
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Soft gradient mesh wash
      const g = ctx.createRadialGradient(
        width * mouse.current.x,
        height * mouse.current.y,
        0,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.8,
      )
      g.addColorStop(0, 'rgba(59, 130, 246, 0.12)')
      g.addColorStop(0.45, 'rgba(20, 184, 166, 0.06)')
      g.addColorStop(1, 'rgba(139, 92, 246, 0.05)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      const mx = mouse.current.x * width
      const my = mouse.current.y * height

      if (!reduceMotion) {
        for (const n of nodes) {
          n.vx += (mx - n.x) * 0.000015
          n.vy += (my - n.y) * 0.000015
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            ctx.strokeStyle = `rgba(125, 211, 252, ${0.18 * (1 - dist / 140)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(165, 243, 252, 0.55)'
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    if (!reduceMotion) window.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
