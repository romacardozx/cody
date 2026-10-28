import { useEffect, useRef } from 'react'
import { useCurrentTheme } from '../hooks/useTheme.js'
import { useMotionFocus } from '../lib/motionFocus.js'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import styles from './NeuralField.module.css'

/*
 * A quiet background detail: dots drifting slowly, joined by hairlines when they come close, each
 * one breathing a little. Like a small neural network at rest. It fills its positioned parent,
 * moves only while it is the most visible scene (lib/motionFocus) and holds still with reduced
 * motion. Colors come from the theme tokens.
 */

const LINK = 120 // px: dots closer than this are joined
const SPEED = 9 // px per second, at most

export function NeuralField() {
  const canvas = useRef(null)
  const active = useMotionFocus('footer', canvas)
  const reduce = useReducedMotion()
  const theme = useCurrentTheme()
  const running = useRef(false)
  useEffect(() => {
    running.current = active && !reduce
  }, [active, reduce])

  useEffect(() => {
    const element = canvas.current
    const context = element.getContext('2d')
    const css = getComputedStyle(element)
    const dot = css.getPropertyValue('--field-dot').trim()
    const line = css.getPropertyValue('--field-line').trim()
    let width = 0
    let height = 0
    let nodes = []

    const seed = () => {
      const count = Math.min(70, Math.round((width * height) / 7000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * SPEED,
        vy: (Math.random() - 0.5) * 2 * SPEED,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time) => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > LINK) continue
          context.globalAlpha = (1 - d / LINK) * 0.55
          context.strokeStyle = line
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }
      context.fillStyle = dot
      for (const n of nodes) {
        context.globalAlpha = 0.55 + 0.45 * Math.sin(time / 1400 + n.phase) // breathing
        context.beginPath()
        context.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 2)
      width = element.clientWidth
      height = element.clientHeight
      element.width = Math.round(width * ratio)
      element.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      seed()
      draw(performance.now())
    }
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(element)
    resize()

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!running.current) return
      for (const n of nodes) {
        n.x += n.vx * dt
        n.y += n.vy * dt
        // Bounce softly off the edges
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }
      draw(now)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      sizeObserver.disconnect()
    }
  }, [theme])

  return <canvas ref={canvas} className={styles.field} aria-hidden="true" />
}
