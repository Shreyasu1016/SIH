import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './MagicBento.css'

export default function MagicBento({
  children,
  className = '',
  glowColor = '109, 76, 255',
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  clickEffect = true,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const update = event => {
      const rect = element.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      element.style.setProperty('--magic-x', `${x}%`)
      element.style.setProperty('--magic-y', `${y}%`)
      if (enableTilt) {
        gsap.to(element, {
          rotateX: ((50 - y) / 50) * 2.2,
          rotateY: ((x - 50) / 50) * 2.2,
          duration: 0.35,
          overwrite: true,
          ease: 'power2.out',
        })
      }
    }
    const reset = () => {
      element.style.setProperty('--magic-x', '50%')
      element.style.setProperty('--magic-y', '50%')
      if (enableTilt) gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.45, overwrite: true })
    }
    const click = event => {
      if (!clickEffect) return
      const ripple = document.createElement('span')
      ripple.className = 'magic-ripple'
      const rect = element.getBoundingClientRect()
      ripple.style.left = `${event.clientX - rect.left}px`
      ripple.style.top = `${event.clientY - rect.top}px`
      element.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    }
    element.addEventListener('pointermove', update)
    element.addEventListener('pointerleave', reset)
    element.addEventListener('click', click)
    return () => {
      element.removeEventListener('pointermove', update)
      element.removeEventListener('pointerleave', reset)
      element.removeEventListener('click', click)
      gsap.killTweensOf(element)
    }
  }, [clickEffect, enableTilt])

  return <div
    ref={ref}
    className={`magic-bento ${enableSpotlight ? 'has-spotlight' : ''} ${enableBorderGlow ? 'has-border-glow' : ''} ${className}`.trim()}
    style={{ '--magic-glow': glowColor }}
  >{children}</div>
}
