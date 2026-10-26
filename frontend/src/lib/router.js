import { useSyncExternalStore } from 'react'

// Minimal client-side router: two pages do not justify a routing library.
// The server forwards these routes to index.html (SpaForwardController).

const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

function snapshot() {
  return window.location.pathname + window.location.search + window.location.hash
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  if (to === snapshot()) return
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
  listeners.forEach((listener) => listener())
  const hash = to.split('#')[1]
  if (hash) {
    // Wait for the new page to render, then go to the anchor
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
  } else if (scroll) {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
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
