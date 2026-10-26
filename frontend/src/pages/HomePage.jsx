import { Suspense, use, useState } from 'react'
import { getAlgorithms, prefetchVisualizer } from '../api/cody.js'
import { AlgorithmCard } from '../components/AlgorithmCard.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { HeroGraph } from '../components/HeroGraph.jsx'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { FAMILY } from '../lib/families.js'
import { useLocation } from '../lib/router.js'
import styles from './HomePage.module.css'

const FILTERS = [{ value: 'ALL', label: 'Todos' }, ...Object.entries(FAMILY).map(([value, f]) => ({ value, label: f.label }))]

const STEPS = [
  {
    icon: 'eye',
    title: 'Mirá',
    text: 'El algoritmo corre de verdad en Java y la animación muestra cada paso: el estado completo, la línea de pseudocódigo y las variables.',
  },
  {
    icon: 'question',
    title: 'Predecí',
    text: 'En los momentos clave se frena y te pregunta qué pasa ahora. Respondés con un clic en la opción o directamente sobre el grafo.',
  },
  {
    icon: 'spark',
    title: 'Entendé',
    text: 'Si acertás, sigue. Si no, te muestra la respuesta y por qué. La respuesta correcta nunca viaja antes de que contestes.',
  },
]

export function HomePage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Visualizador de algoritmos · ECyT-UNSAM</p>
          <h1 className={styles.title}>
            No mires el algoritmo.
            <br />
            <span className={styles.titleAccent}>Adiviná</span> qué hace.
          </h1>
          <p className={styles.lead}>
            Cody frena la animación en los momentos clave y te pregunta qué pasa ahora. Si acertás, sigue;
            si no, te explica por qué. Pensarlo es lo que hace que se entienda.
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
          <p className={styles.sectionLead}>Elegí uno y recorrelo prediciendo. Se suman más a medida que el equipo los implementa.</p>
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
              <span className={styles.stepIcon}><Icon name={step.icon} size={22} /></span>
              <h3 className={styles.stepTitle}>
                <span className={styles.stepNumber}>{i + 1}</span> {step.title}
              </h3>
              <p className={styles.stepText}>{step.text}</p>
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
  const [family, setFamily] = useState('ALL')
  const text = (query.get('q') ?? '').trim().toLowerCase()

  const visible = algorithms.filter((algorithm) => {
    const matchesFamily = family === 'ALL' || algorithm.family === family
    const haystack = `${algorithm.name} ${algorithm.code} ${algorithm.description} ${FAMILY[algorithm.family].label}`.toLowerCase()
    return matchesFamily && (!text || haystack.includes(text))
  })

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filtrar por familia">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={styles.chip}
            aria-pressed={family === filter.value}
            onClick={() => setFamily(filter.value)}
          >
            {filter.label}
          </button>
        ))}
        {text && <span className={styles.searching}>Buscando “{query.get('q')}”</span>}
      </div>
      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((algorithm) => (
            <AlgorithmCard key={algorithm.code} algorithm={algorithm} index={algorithms.indexOf(algorithm)} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Ningún algoritmo coincide con la búsqueda.</p>
      )}
    </>
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
