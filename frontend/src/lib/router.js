import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

// Minimal client-side router: a handful of pages do not justify a routing library.
// The server forwards these routes to index.html (SpaForwardController).

const listeners = new Set()

function notify() {
  listeners.forEach((listener) => listener())
}

/**
 * Runs a page change inside a View Transition when the browser supports it: the old page fades
 * out, the new one in, and elements sharing a view-transition-name (a card title and the page
 * title it opens) morph into each other. flushSync makes React paint the new page inside it.
 */
function withTransition(update) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}

// Back and forward buttons get the same transition
window.addEventListener('popstate', () => withTransition(notify))

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return window.location.pathname + window.location.search + window.location.hash
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  const hash = to.split('#')[1]
  if (to === snapshot()) {
    // Same URL: only an anchor needs work (scroll to it again)
    if (hash) document.getElementById(hash)?.scrollIntoView()
    return
  }
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
  withTransition(() => {
    notify()
    if (!hash && scroll) window.scrollTo({ top: 0, behavior: 'instant' })
  })
  // Anchors: wait for the new page to render, then go there
  if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
}

/** Current pathname and query params; re-renders on navigation. */
export function useLocation() {
  const current = useSyncExternalStore(subscribe, snapshot)
  const url = new URL(current, window.location.origin)
  return { pathname: url.pathname, query: url.searchParams }
}

/** Matches "/algorithms/:code" against a pathname; returns the params or null. */
export function matchPath(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}
