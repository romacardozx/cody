import { Suspense, use } from 'react'
import { getAlgorithms } from '../api/cody.js'
import { AlgorithmCard } from '../components/AlgorithmCard.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { FamilyGlyph } from '../components/CategoryIndex.jsx'
import { countLabel, FAMILY, familyBySlug, readyLabel } from '../lib/families.js'
import { isPlayable } from '../lib/lessons.js'
import styles from './CategoryPage.module.css'

/** Every algorithm of one family, so the catalog can grow and stay ordered. */
export default function CategoryPage({ slug }) {
  const family = familyBySlug(slug)
  if (!family) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>No existe esa categoría.</h1>
        <Link to="/" className={styles.back}><Icon name="back" size={16} /> Volver a las categorías</Link>
      </main>
    )
  }
  const data = FAMILY[family]
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Ubicación">
        <Link to="/#algoritmos" className={styles.back}><Icon name="back" size={16} /> Categorías</Link>
      </nav>
      <header className={styles.head}>
        <span className={styles.icon}><FamilyGlyph family={family} /></span>
        <div>
          <h1 className={styles.title} style={{ viewTransitionName: `category-${data.slug}` }}>{data.label}</h1>
          <p className={styles.lead}>{data.description}</p>
        </div>
      </header>
      <ErrorBoundary title="No pudimos cargar los algoritmos">
        <Suspense fallback={<div className={styles.grid} aria-busy="true"><div className={styles.skeleton} /><div className={styles.skeleton} /></div>}>
          <FamilyAlgorithms family={family} />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}

function FamilyAlgorithms({ family }) {
  const all = use(getAlgorithms())
  const algorithms = all.filter((a) => a.family === family)
  if (algorithms.length === 0) {
    return <p className={styles.empty}>Todavía no hay algoritmos en esta categoría.</p>
  }
  const ready = algorithms.filter(isPlayable).length
  return (
    <>
      <h2 className={styles.count}>
        {countLabel(family, algorithms.length)}
        {ready > 0 && <span className={styles.ready}> · {readyLabel(family, ready)}</span>}
      </h2>
      <div className={styles.grid}>
        {algorithms.map((algorithm) => (
          <AlgorithmCard key={algorithm.code} algorithm={algorithm} index={all.indexOf(algorithm)} />
        ))}
      </div>
    </>
  )
}
