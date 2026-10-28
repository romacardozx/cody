import { useEffect, useState } from 'react'

/*
 * One moving scene at a time. Each animated scene (the 3D hero, Cody's tour) reports how much of
 * it is on screen; only the most visible one plays, the others hold still. On a tall monitor two
 * scenes can share the screen, and two loops at once is what makes a page feel overloaded.
 */

const MIN_RATIO = 0.2 // below this much on screen, a scene never plays
const TIE = 0.15 // scenes this close in visibility count as equally visible
const ratios = new Map() // id -> { ratio, top }
const listeners = new Set()
let active = null

function pick() {
  let most = 0
  for (const { ratio } of ratios.values()) most = Math.max(most, ratio)
  // Among the (about) equally visible ones, the lowest on the page wins: it is the one just
  // scrolled to. At the bottom of the home page that is the footer, not the tour above it
  let best = null
  let bestTop = -Infinity
  for (const [id, { ratio, top }] of ratios) {
    if (ratio <= MIN_RATIO || ratio < most - TIE) continue
    if (top > bestTop) [best, bestTop] = [id, top]
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
        ratios.set(id, { ratio: entry.intersectionRatio, top: entry.boundingClientRect.top })
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
