import { prefetchVisualizer } from '../api/cody.js'
import { FAMILY } from '../lib/families.js'
import { hasLesson, isPlayable } from '../lib/lessons.js'
import { USE_CASES } from '../lib/useCases.js'
import { Link } from './Link.jsx'
import { Icon } from './Icon.jsx'
import styles from './AlgorithmCard.module.css'

export function AlgorithmCard({ algorithm, index }) {
  const family = FAMILY[algorithm.family]
  const body = (
    <>
      <div className={styles.top}>
        <span className={styles.family}>
          <Icon name={family.icon} size={15} />
          {family.label}
        </span>
        <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className={styles.name} style={{ viewTransitionName: `algorithm-${algorithm.code}` }}>{algorithm.name}</h3>
      <p className={styles.description}>{algorithm.description}</p>
      {USE_CASES[algorithm.code] && (
        <p className={styles.useCase}>
          <span className={styles.useCaseLabel}>Se usa en</span> {USE_CASES[algorithm.code].short}
        </p>
      )}
      <div className={styles.footer}>
        {/* Concepts like Big O have no cost of their own: the catalog stores "—" and it is not shown */}
        {algorithm.timeComplexity !== '—' && (
          <span className={styles.complexity} title="Complejidad temporal">
            <span className={styles.metric}>tiempo</span> {algorithm.timeComplexity}
          </span>
        )}
        {algorithm.spaceComplexity !== '—' && (
          <span className={styles.complexity} title="Espacio extra">
            <span className={styles.metric}>espacio</span> {algorithm.spaceComplexity}
          </span>
        )}
        {isPlayable(algorithm) ? (
          <span className={styles.cta}>
            {hasLesson(algorithm.code) ? 'Explorar' : 'Predecir'} <Icon name="arrow" size={16} />
          </span>
        ) : (
          <span className={styles.soon}>
            Próximamente · ver dónde se usa <Icon name="arrow" size={15} />
          </span>
        )}
      </div>
    </>
  )

  // Not implemented yet: still links to its page, which shows the real-world use case
  if (!isPlayable(algorithm)) {
    return (
      <Link to={`/algorithms/${algorithm.code}`} className={`${styles.card} ${styles.disabled}`}>
        {body}
      </Link>
    )
  }

  const warm = () => algorithm.available && prefetchVisualizer(algorithm)
  // Also download the visualizer code, so the click opens it at once
  const warmAll = () => {
    warm()
    import('../pages/VisualizerPage.jsx')
  }
  return (
    <Link
      to={`/algorithms/${algorithm.code}`}
      className={styles.card}
      onMouseEnter={warmAll}
      onFocus={warmAll}
      onTouchStart={warmAll}
    >
      {body}
    </Link>
  )
}
