import { useEffect, useState } from 'react'

/*
 * One moving scene at a time. Each animated scene (the 3D hero, Cody's tour) reports how much of
 * it is on screen; only the most visible one plays, the others hold still. On a tall monitor two
 * scenes can share the screen, and two loops at once is what makes a page feel overloaded.
 */

const MIN_RATIO = 0.2 // below this much on screen, a scene never plays
const ratios = new Map()
const listeners = new Set()
let active = null

function pick() {
  let best = null
  let bestRatio = MIN_RATIO
  for (const [id, ratio] of ratios) {
    if (ratio > bestRatio) [best, bestRatio] = [id, ratio]
  }
  if (best === active) return
  active = best
  listeners.forEach((listener) => listener(active))
}

const THRESHOLDS = Array.from({ length: 11 }, (_, i) => i / 10)

/**
 * Whether the scene `id` (whose element is `ref`) is the one allowed to move right now.
 *
 * @param {string} id a name for the scene
 * @param {{ current: Element | null }} ref the scene's element
 * @returns {boolean} true while it is the most visible scene
 */
export function useMotionFocus(id, ref) {
  const [isActive, setActive] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const listener = (current) => setActive(current === id)
    listeners.add(listener)
    const observer = new IntersectionObserver(
      ([entry]) => {
        ratios.set(id, entry.intersectionRatio)
        pick()
      },
      { threshold: THRESHOLDS },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      listeners.delete(listener)
      ratios.delete(id)
      pick()
    }
  }, [id, ref])
  return isActive
}
