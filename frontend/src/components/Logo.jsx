import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import styles from './Logo.module.css'

const REACH = 2.6 // how far the pupil travels inside the eye, in SVG units
const IDLE_AFTER_MS = 2500

/**
 * Wordmark whose "o" is an eye: the vermillion pupil follows the pointer, looks around on its own
 * when the pointer rests, and blinks now and then. Cody watches you think.
 */
export function Logo() {
  const eye = useRef(null)
  const reduceMotion = useReducedMotion()
  const [look, setLook] = useState(null) // null = idle animation

  useEffect(() => {
    if (reduceMotion) return
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
        const pull = Math.min(1, distance / 160) // closer pointer, smaller movement
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
  }, [reduceMotion])

  const pupilStyle = look ? { transform: `translate(${look.x}px, ${look.y}px)` } : undefined

  return (
    <span className={styles.logo} aria-label="Cody">
      <span aria-hidden="true">c</span>
      <svg ref={eye} className={styles.eye} viewBox="0 0 20 20" aria-hidden="true">
        <g className={reduceMotion ? undefined : styles.lid}>
          <circle cx="10" cy="10" r="7" className={styles.white} />
          <g className={look || reduceMotion ? styles.pupilTracking : styles.pupilIdle} style={pupilStyle}>
            <circle cx="10" cy="10" r="3" className={styles.pupil} />
            <circle cx="11.1" cy="8.9" r="0.85" className={styles.shine} />
          </g>
        </g>
      </svg>
      <span aria-hidden="true">dy</span>
    </span>
  )
}
