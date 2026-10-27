import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/*
 * Smooth page scroll with Lenis. Off when the user asks for reduced motion: then the browser's
 * own instant scroll is used and every helper below falls back to it.
 */

let lenis = null

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Anchor links go through the router (navigate), which calls scrollToElement
  lenis = new Lenis({ autoRaf: true })
}

/** Glides to an element. Both paths honor scroll-padding-top (base.css), which clears the header. */
export function scrollToElement(element) {
  if (!element) return
  if (lenis) {
    lenis.resize() // the page may have just changed height (new route)
    lenis.scrollTo(element)
  }
  else element.scrollIntoView()
}

/** Glides to an absolute scroll position, in pixels from the top of the page. */
export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y)
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Jumps to the top at once (used on page changes, where gliding would look wrong). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}
