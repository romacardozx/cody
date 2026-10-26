import { prefetchVisualizer } from '../api/cody.js'
import { FAMILY } from '../lib/families.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import styles from './CategoryCard.module.css'

/** One family of algorithms on the home page: icon beside the text, and how many are ready. */
export function CategoryCard({ family, algorithms }) {
  const data = FAMILY[family]
  const available = algorithms.filter((a) => a.available)
  const warm = () => available.forEach(prefetchVisualizer)
  return (
    <Link to={`/categories/${data.slug}`} className={styles.card} onMouseEnter={warm} onFocus={warm}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={data.icon} size={30} />
      </span>
      <span className={styles.body}>
        <span className={styles.title} style={{ viewTransitionName: `category-${data.slug}` }}>{data.label}</span>
        <span className={styles.description}>{data.description}</span>
        <span className={styles.meta}>
          {algorithms.map((a) => a.name.replace(/ \(.*\)$/, '')).join(' · ')}
        </span>
        <span className={styles.count}>
          {algorithms.length} {algorithms.length === 1 ? 'algoritmo' : 'algoritmos'}
          {' · '}
          {available.length === 0 ? 'próximamente' : `${available.length} para predecir`}
        </span>
      </span>
      <Icon name="arrow" size={20} className={styles.arrow} />
    </Link>
  )
}
