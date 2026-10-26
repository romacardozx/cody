import { useEffect, useRef } from 'react'

/**
 * Global keyboard shortcuts. Ignored while typing in a field. `bindings` maps a KeyboardEvent.key
 * (or "mod+k" for Ctrl/Cmd+K) to a handler.
 */
export function useHotkeys(bindings) {
  const latest = useRef(bindings)
  useEffect(() => {
    latest.current = bindings
  })

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target
      const typing = target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      const mod = event.ctrlKey || event.metaKey
      const key = mod ? `mod+${event.key.toLowerCase()}` : event.key
      if (typing && !mod) return
      if (event.altKey) return
      const handler = latest.current[key]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
