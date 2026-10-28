import { use, useState } from 'react'
import { getAlgorithms } from '../../api/cody.js'
import { Link } from '../../components/Link.jsx'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'
import { formatDuration, formatNumber, OPS_PER_SECOND } from './format.js'

/*
 * "Which one fits?": how much data you have and how long you can wait decide which orders are
 * usable, and with them which algorithms of the catalog. Names come from the catalog itself.
 */

const SIZES = [
  { n: 30, label: 'un aula' },
  { n: 5_000, label: 'una facultad' },
  { n: 1_000_000, label: 'una ciudad' },
  { n: 45_000_000, label: 'el padrón del país' },
]

const BUDGETS = [
  { seconds: 0.1, label: 'al instante' },
  { seconds: 1, label: '1 segundo' },
  { seconds: 60, label: '1 minuto' },
  { seconds: 8 * 3600, label: 'una noche' },
]

const ORDERS = [
  { order: 'O(log n)', ops: (n) => Math.log2(n), codes: ['BINARY_SEARCH'] },
  { order: 'O(n)', ops: (n) => n, codes: ['LINEAR_SEARCH', 'BFS'] },
  { order: 'O(n log n)', ops: (n) => n * Math.log2(n), codes: ['MERGE_SORT', 'QUICK_SORT'] },
  { order: 'O(n²)', ops: (n) => n * n, codes: ['BUBBLE_SORT', 'INSERTION_SORT', 'SELECTION_SORT'] },
  { order: 'O(2ⁿ)', ops: (n) => 2 ** n, codes: [], example: 'probar todas las combinaciones' },
]

function Choices({ label, items, value, onChange, describe }) {
  return (
    <div className={styles.choice}>
      <span className={styles.choiceLabel}>{label}</span>
      <div className={styles.tabs} role="group" aria-label={label}>
        {items.map((item, i) => (
          <button key={item.label} type="button" className={styles.tab} aria-pressed={i === value} onClick={() => onChange(i)}>
            {item.label}
            {describe && <span className={styles.tabSub}>{describe(item)}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Chooser() {
  const catalog = use(getAlgorithms())
  const nameOf = (code) => catalog.find((a) => a.code === code)?.name.replace(/ \(.*\)$/, '') ?? code
  const [sizeIndex, setSizeIndex] = useState(2)
  const [budgetIndex, setBudgetIndex] = useState(1)
  const { n } = SIZES[sizeIndex]
  const budget = BUDGETS[budgetIndex].seconds

  return (
    <div className={lesson.figure}>
      <Choices label="Datos" items={SIZES} value={sizeIndex} onChange={setSizeIndex} describe={(s) => formatNumber(s.n)} />
      <Choices label="Tiempo" items={BUDGETS} value={budgetIndex} onChange={setBudgetIndex} />

      <ul className={styles.fits}>
        {ORDERS.map((row) => {
          const seconds = row.ops(n) / OPS_PER_SECOND
          const fits = seconds <= budget
          return (
            <li key={row.order} className={styles.fit} data-fits={fits}>
              <span className={styles.fitMark} aria-hidden="true">{fits ? '✓' : '✗'}</span>
              <span className={styles.fitOrder}>{row.order}</span>
              <span className={styles.fitWho}>
                {row.codes.length
                  ? row.codes.map((code, i) => (
                      <span key={code}>
                        {i > 0 && ' · '}
                        <Link to={`/algorithms/${code}`} className={styles.fitLink}>{nameOf(code)}</Link>
                      </span>
                    ))
                  : row.example}
              </span>
              <span className={styles.fitTime}>
                <span className="visually-hidden">{fits ? 'Alcanza: ' : 'No alcanza: '}</span>
                {formatDuration(seconds)}
              </span>
            </li>
          )
        })}
      </ul>
      <p className={lesson.caption}>En una computadora que hace 100 millones de operaciones por segundo.</p>
    </div>
  )
}
