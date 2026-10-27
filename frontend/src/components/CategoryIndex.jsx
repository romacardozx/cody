import { prefetchVisualizer } from '../api/cody.js'
import { countLabel, FAMILY, FAMILY_ORDER } from '../lib/families.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import styles from './CategoryIndex.module.css'

/*
 * The catalog as the table of contents of an algorithms book: one row per family, separated by
 * hairlines, with a small line drawing of what the family does. Hovering (or focusing) a row
 * plays its drawing: the bars sort, the search halves, the graph is walked, a plate is pushed.
 */

// Bar heights and where each one ends up once sorted (index of its slot)
const BARS = [
  { h: 22, sorted: 2 },
  { h: 10, sorted: 0 },
  { h: 30, sorted: 4 },
  { h: 16, sorted: 1 },
  { h: 26, sorted: 3 },
]

/** A small line drawing of what a family does; animated by the hover of its index row. */
export function FamilyGlyph({ family }) {
  switch (family) {
    case 'CONCEPT':
      return (
        <svg viewBox="0 0 64 48" className={styles.glyph} data-family={family} aria-hidden="true">
          <path className={styles.axis} d="M8 6v36h50" />
          <path className={`${styles.curve} ${styles.steep}`} d="M8 42c18 0 26-6 34-34" pathLength="1" />
          <path className={`${styles.curve} ${styles.flat}`} d="M8 42c6-12 14-16 48-18" pathLength="1" />
        </svg>
      )
    case 'SORTING':
      return (
        <svg viewBox="0 0 64 48" className={styles.glyph} data-family={family} aria-hidden="true">
          {BARS.map((bar, i) => (
            <rect
              key={i}
              className={styles.sortBar}
              x="6"
              y={42 - bar.h}
              width="8"
              height={bar.h}
              rx="1.5"
              style={{ '--from': `${i * 11}px`, '--to': `${bar.sorted * 11}px`, '--delay': `${i * 40}ms` }}
            />
          ))}
        </svg>
      )
    case 'SEARCHING':
      return (
        <svg viewBox="0 0 64 48" className={styles.glyph} data-family={family} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} className={`${styles.cell} ${i < 4 ? styles.leftHalf : ''}`} x={4 + i * 8.2} y="20" width="6.4" height="10" rx="1.5" />
          ))}
          <path className={styles.marker} d="M0 0l-4 -6h8z" />
        </svg>
      )
    case 'GRAPH':
      return (
        <svg viewBox="0 0 64 48" className={styles.glyph} data-family={family} aria-hidden="true">
          <path className={styles.axis} d="M12 24L30 10M12 24L30 38M30 10L50 24M30 38L50 24" />
          {[[12, 24], [30, 10], [30, 38], [50, 24]].map(([x, y], i) => (
            <circle key={i} className={styles.node} cx={x} cy={y} r="5" style={{ '--delay': `${[0, 160, 160, 320][i]}ms` }} />
          ))}
        </svg>
      )
    case 'DATA_STRUCTURE':
      return (
        <svg viewBox="0 0 64 48" className={styles.glyph} data-family={family} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <rect key={i} className={styles.plate} x="14" y={38 - i * 8} width="36" height="6" rx="1.5" />
          ))}
          <rect className={`${styles.plate} ${styles.pushed}`} x="14" y="14" width="36" height="6" rx="1.5" />
        </svg>
      )
    default:
      return <Icon name={FAMILY[family]?.icon ?? 'spark'} size={36} className={styles.glyph} />
  }
}

export function CategoryIndex({ algorithms }) {
  return (
    <ul className={styles.index}>
      {FAMILY_ORDER.map((family) => {
        const inFamily = algorithms.filter((algorithm) => algorithm.family === family)
        if (inFamily.length === 0) return null
        const data = FAMILY[family]
        const available = inFamily.filter((a) => a.available)
        const warm = () => available.forEach(prefetchVisualizer)
        return (
          <li key={family} data-reveal="">
            <Link to={`/categories/${data.slug}`} className={styles.row} onMouseEnter={warm} onFocus={warm}>
              <FamilyGlyph family={family} />
              <span className={styles.lead}>
                <span className={styles.name} style={{ viewTransitionName: `category-${data.slug}` }}>{data.label}</span>
                <span className={styles.description}>{data.short}</span>
              </span>
              <span className={styles.members}>
                {inFamily.map((a) => (
                  <span key={a.code} className={styles.member} data-available={a.available || undefined}>
                    {a.name.replace(/ \(.*\)$/, '')}
                  </span>
                ))}
              </span>
              <span className={styles.meta}>
                <span className={styles.count}>{countLabel(family, inFamily.length)}</span>
                {available.length > 0 && <span className={styles.status}>{available.length} para predecir</span>}
                <Icon name="arrow" size={20} className={styles.arrow} />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
