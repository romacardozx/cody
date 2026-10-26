/**
 * Plays a list of events in order. Each event has `ms` (how long it holds the screen) and an
 * optional `apply()`; `skipAll()` applies everything at once for the still, reduced-motion view.
 */
export function createTimeline(events) {
  let index = -1
  let elapsed = 0

  const advance = () => {
    index += 1
    if (index < events.length) events[index].apply?.()
  }

  return {
    update(dt) {
      if (index === -1) advance()
      if (index >= events.length) return true
      elapsed += dt * 1000
      while (index < events.length && elapsed >= events[index].ms) {
        elapsed -= events[index].ms
        advance()
      }
      return index >= events.length
    },
    current() {
      return events[index] ?? null
    },
    skipAll() {
      while (index < events.length) advance()
    },
  }
}

/** Exponential smoothing factor for a given time step: frame-rate independent easing. */
export function ease(dt, speed = 9) {
  return 1 - Math.exp(-dt * speed)
}
