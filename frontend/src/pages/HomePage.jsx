import { lazy, Suspense, use, useRef } from 'react'
import { getAlgorithms, prefetchVisualizer } from '../api/cody.js'
import { CategoryIndex } from '../components/CategoryIndex.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { CodyTour } from '../components/CodyTour.jsx'
import { useReveal } from '../lib/useReveal.js'
import styles from './HomePage.module.css'

// Three.js is heavy: the 3D scene loads after the page is on screen and never blocks it
const Hero3D = lazy(() => import('../components/Hero3D.jsx'))


export function HomePage() {
  const page = useRef(null)
  useReveal(page)
  return (
    <main ref={page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>Predecí cada paso del algoritmo antes de verlo</h1>
          <p className={styles.lead}>
            Cody corre el algoritmo de verdad, lo frena justo antes de cada decisión y te pregunta qué viene.
            Si acertás, sigue. Si no, te muestra por qué y lo guarda en tu historial para repasarlo.
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

      <section id="algoritmos" className={styles.section}>
        <div className={styles.sectionHead} data-reveal="">
          <h2 className={styles.sectionTitle}>Algoritmos</h2>
          <p className={styles.sectionLead}>De lo básico a lo que combina todo: primero los conceptos y las estructuras, después los algoritmos que las usan.</p>
        </div>
        <ErrorBoundary title="No pudimos cargar el catálogo">
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog />
          </Suspense>
        </ErrorBoundary>
      </section>
      <section id="como-funciona" className={styles.section}>
        <div className={styles.sectionHead} data-reveal="">
          <h2 className={styles.sectionTitle}>Cómo funciona</h2>
          <p className={styles.sectionLead}>Mirar no alcanza: cuanto más hacés con una animación, más aprendés. Cody te sube un escalón.</p>
        </div>
        <CodyTour />
      </section>
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
