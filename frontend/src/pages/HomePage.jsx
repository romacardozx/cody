import { Suspense, use } from 'react'
import { getAlgorithms, prefetchVisualizer } from '../api/cody.js'
import { AlgorithmCard } from '../components/AlgorithmCard.jsx'
import { CategoryCard } from '../components/CategoryCard.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { HeroGraph } from '../components/HeroGraph.jsx'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { FAMILY, FAMILY_ORDER } from '../lib/families.js'
import { USE_CASES } from '../lib/useCases.js'
import { useLocation } from '../lib/router.js'
import styles from './HomePage.module.css'

const STEPS = [
  {
    title: 'Mirá',
    text: 'El algoritmo corre de verdad en Java y la animación muestra cada paso: el estado completo, la línea de pseudocódigo y las variables.',
  },
  {
    title: 'Predecí',
    text: 'En los momentos clave se frena y te pregunta qué pasa ahora. Respondés con un clic en la opción o directamente sobre el grafo.',
  },
  {
    title: 'Entendé',
    text: 'Si acertás, sigue. Si no, te muestra la respuesta y por qué, y todo queda en tu historial para repasarlo. Las palabras técnicas tienen su definición a un clic.',
  },
]

export function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            No mires el algoritmo.
            <br />
            <span className={styles.titleAccent}>Adiviná</span> qué hace.
          </h1>
          <p className={styles.lead}>
            Cody es un visualizador de algoritmos que frena la animación en los momentos clave y te pregunta
            qué pasa ahora. Si acertás, sigue; si no, te explica por qué. Pensarlo es lo que hace que se entienda.
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
              Probar con BFS <Icon name="arrow" size={18} />
            </Link>
            <a href="#como-funciona" className={styles.secondary}>
              Cómo funciona
            </a>
          </div>
        </div>
        <HeroGraph />
      </section>

      <section id="algoritmos" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Algoritmos</h2>
          <p className={styles.sectionLead}>Ordenados por tipo. Elegí una categoría y recorré sus algoritmos prediciendo cada paso.</p>
        </div>
        <ErrorBoundary title="No pudimos cargar el catálogo">
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog />
          </Suspense>
        </ErrorBoundary>
      </section>

      <section id="como-funciona" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Cómo funciona</h2>
          <p className={styles.sectionLead}>Tres verbos, en este orden. El segundo es el que importa.</p>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={`${styles.step} ${i === 1 ? styles.stepKey : ''}`}>
              <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className={styles.access}>
          Pensado con Diseño Universal para el Aprendizaje: el mismo paso se ve como animación, pseudocódigo,
          variables y texto; la velocidad se regula; todo se maneja con teclado
          (<kbd>Espacio</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>1</kbd>–<kbd>9</kbd>) y hay tema claro y oscuro.
        </p>
      </section>
    </main>
  )
}

function Catalog() {
  const algorithms = use(getAlgorithms())
  const { query } = useLocation()
  const text = (query.get('q') ?? '').trim().toLowerCase()

  // Searching: show the matching algorithms directly
  if (text) {
    const found = algorithms.filter((algorithm) => {
      const useCase = USE_CASES[algorithm.code]?.short ?? ''
      const haystack = `${algorithm.name} ${algorithm.code} ${algorithm.description} ${FAMILY[algorithm.family].label} ${useCase}`
      return haystack.toLowerCase().includes(text)
    })
    return (
      <>
        <p className={styles.searching}>
          {found.length === 0 ? 'Ningún algoritmo' : found.length === 1 ? '1 algoritmo' : `${found.length} algoritmos`} para “{query.get('q')}”
        </p>
        {found.length > 0 && (
          <div className={styles.grid}>
            {found.map((algorithm) => (
              <AlgorithmCard key={algorithm.code} algorithm={algorithm} index={algorithms.indexOf(algorithm)} />
            ))}
          </div>
        )}
      </>
    )
  }

  // Otherwise: one card per family, so the catalog can grow and stay ordered
  return (
    <div className={styles.categories}>
      {FAMILY_ORDER.map((family) => {
        const inFamily = algorithms.filter((algorithm) => algorithm.family === family)
        return inFamily.length > 0 && <CategoryCard key={family} family={family} algorithms={inFamily} />
      })}
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Cargando algoritmos">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  )
}
