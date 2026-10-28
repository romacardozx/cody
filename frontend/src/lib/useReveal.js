import { useEffect } from 'react'

/**
 * Elements marked with `data-reveal` inside `root` enter once, when they scroll into view: they
 * rise, sharpen and fade in (styles in base.css). Those that enter together are staggered among
 * themselves; one that enters alone does not wait. Then they stay.
 *
 * Visible by default: only elements still below the fold when they appear get hidden first, so
 * nothing on screen blinks and the page reads fine without JavaScript. Watches the subtree, so
 * content that arrives later (the catalog, after the API answers) is revealed too. Off with
 * reduced motion.
 */
export function useReveal(root) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.style.setProperty('--reveal-i', order++)
          entry.target.dataset.reveal = 'shown'
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    const scan = () => {
      // "pending" too: an earlier run (StrictMode mounts effects twice) may have hidden it already
      root.current?.querySelectorAll('[data-reveal=""], [data-reveal="pending"]').forEach((element) => {
        if (element.dataset.reveal === '') {
          if (element.getBoundingClientRect().top < window.innerHeight * 0.88) return // on screen
          element.dataset.reveal = 'pending'
        }
        observer.observe(element) // observing twice is a no-op
      })
    }
    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(root.current, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [root])
}
