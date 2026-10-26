import { useCallback, useState } from 'react'

/** Dark/light theme. index.html applies it before the first paint; this keeps it in sync. */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#100f0d' : '#f4efe4')
      try {
        localStorage.setItem('cody-theme', next)
      } catch {
        // storage blocked: the theme still applies for this visit
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
