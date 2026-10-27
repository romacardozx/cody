import { lazy, Suspense, use, useEffect, useRef } from 'react'
import { getAlgorithms, prefetchVisualizer } from '../api/cody.js'
import { CategoryIndex } from '../components/CategoryIndex.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { CodyTour } from '../components/CodyTour.jsx'
import { useCurrentTheme } from '../hooks/useTheme.js'
import { useReveal } from '../lib/useReveal.js'
import styles from './HomePage.module.css'

// Three.js is heavy: the 3D scene loads after the page is on screen and never blocks it
const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

/**
 * As the page scrolls, the hero panel grows from an inset rounded card to the full width: the
 * sign that you are leaving its sector. Written as a CSS variable, so no React render per frame.
 */
function useHeroExpansion(panel) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.55))
      panel.current?.style.setProperty('--hero-p', progress.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [panel])
}

export function HomePage() {
  const page = useRef(null)
  const heroPanel = useRef(null)
  useReveal(page)
  useHeroExpansion(heroPanel)
  // "Cómo funciona" sits on a band in the opposite theme: a change of sector you cannot miss
  const bandTheme = useCurrentTheme() === 'dark' ? 'light' : 'dark'
  return (
    <main ref={page}>
      <div ref={heroPanel} className={styles.heroPanel}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>Predecí cada paso del algoritmo antes de verlo</h1>
            <p className={styles.lead}>
              Cody corre el algoritmo de verdad, lo frena justo antes de cada decisión y te pregunta qué viene. Si
              acertás, sigue. Si no, te muestra por qué y lo guarda en tu historial para repasarlo.
            </p>
            <div className={styles.actions}>
              <Link
                to="/algorithms/BFS"
                className={styles.primary}
                onMouseEnter={() => {
                  prefetchVisualizer({ code: 'BFS', scenarioType: 'GRAPH' })
                  import('./VisualizerPage.jsx')
                }}
              >
                Empezar con BFS <Icon name="arrow" size={18} />
              </Link>
              <Link to="/#como-funciona" className={styles.secondary}>
                Cómo funciona
              </Link>
            </div>
          </div>
          <Suspense fallback={<div className={styles.heroPlaceholder} aria-hidden="true" />}>
            <Hero3D />
          </Suspense>
        </section>
      </div>

      <section id="algoritmos" className={styles.section}>
        <div className={styles.sectionHead} data-reveal="">
          <h2 className={styles.sectionTitle}>Algoritmos</h2>
          <p className={styles.sectionLead}>De lo básico a lo que combina todo.</p>
        </div>
        <ErrorBoundary title="No pudimos cargar el catálogo">
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog />
          </Suspense>
        </ErrorBoundary>
      </section>

      <div className={styles.band} data-theme={bandTheme}>
        <section id="como-funciona" className={styles.section}>
          <div className={styles.sectionHead} data-reveal="">
            <h2 className={styles.sectionTitle}>Cómo funciona</h2>
            <p className={styles.sectionLead}>
              Mirar no alcanza: cuanto más hacés con una animación, más aprendés. Cody te sube un escalón.
            </p>
          </div>
          <CodyTour />
        </section>
      </div>
    </main>
  )
}

function Catalog() {
  // One row per family, so the catalog can grow and stay ordered
  return <CategoryIndex algorithms={use(getAlgorithms())} />
}

function CatalogSkeleton() {
  return (
    <div className={styles.skeletons} aria-busy="true" aria-label="Cargando algoritmos">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  )
}
