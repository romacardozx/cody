import { prefetchVisualizer } from '../api/cody.js'
import { FAMILY } from '../lib/families.js'
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
      <h3 className={styles.name}>{algorithm.name}</h3>
      <p className={styles.description}>{algorithm.description}</p>
      <div className={styles.footer}>
        <span className={styles.complexity} title="Complejidad temporal">
          <span className={styles.metric}>tiempo</span> {algorithm.timeComplexity}
        </span>
        <span className={styles.complexity} title="Espacio extra">
          <span className={styles.metric}>espacio</span> {algorithm.spaceComplexity}
        </span>
        {algorithm.available ? (
          <span className={styles.cta}>
            Predecir <Icon name="arrow" size={16} />
          </span>
        ) : (
          <span className={styles.soon}>
            <Icon name="lock" size={14} /> Próximamente
          </span>
        )}
      </div>
    </>
  )

  if (!algorithm.available) {
    return (
      <article className={`${styles.card} ${styles.disabled}`} aria-disabled="true">
        {body}
      </article>
    )
  }

  const warm = () => prefetchVisualizer(algorithm)
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
