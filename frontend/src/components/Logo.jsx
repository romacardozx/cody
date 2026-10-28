import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import styles from './Logo.module.css'

const REACH = 4.4 // how far the pupil travels from the center, in SVG units (eye radius is 9)
const IDLE_AFTER_MS = 2500

/**
 * Wordmark whose "o" is an eye: the vermillion pupil follows the pointer, looks around on its own
 * when the pointer rests, and blinks now and then. Cody watches you think.
 *
 * Following the pointer stays on even with "reduce motion" (the user causes it and it is small);
 * the automatic looking around and blinking are turned off there.
 */
export function Logo({ className }) {
  const eye = useRef(null)
  const reduceMotion = useReducedMotion()
  const [look, setLook] = useState(null) // null = idle animation

  useEffect(() => {
    let frame = 0
    let idleTimer = 0
    function onMove(event) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = eye.current?.getBoundingClientRect()
        if (!box) return
        const dx = event.clientX - (box.left + box.width / 2)
        const dy = event.clientY - (box.top + box.height / 2)
        const distance = Math.hypot(dx, dy) || 1
        const pull = Math.min(1, distance / 120) // a pointer right on the eye barely moves it
        setLook({ x: (dx / distance) * REACH * pull, y: (dy / distance) * REACH * pull })
      })
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setLook(null), IDLE_AFTER_MS)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      clearTimeout(idleTimer)
    }
  }, [])

  const tracking = look !== null
  const pupilClass = tracking ? styles.pupilTracking : reduceMotion ? undefined : styles.pupilIdle

  return (
    <span className={className ? `${styles.logo} ${className}` : styles.logo} aria-label="Cody">
      <span aria-hidden="true">c</span>
      <svg ref={eye} className={styles.eye} viewBox="0 0 24 24" aria-hidden="true">
        <g className={reduceMotion ? undefined : styles.lid}>
          <circle cx="12" cy="12" r="9" className={styles.white} />
          <g
            className={pupilClass}
            style={tracking ? { transform: `translate(${look.x}px, ${look.y}px)` } : undefined}
          >
            <circle cx="12" cy="12" r="3.4" className={styles.pupil} />
            <circle cx="13.2" cy="10.8" r="1" className={styles.shine} />
          </g>
        </g>
      </svg>
      <span aria-hidden="true">dy</span>
    </span>
  )
}
