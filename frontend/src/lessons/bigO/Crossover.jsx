import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'
import { formatNumber } from './format.js'

/*
 * Why Big O drops constants: 100·n against n². With small n the "worse" one wins; slide past 100
 * and the order takes over for good. Big O describes that trend, for large n.
 */

const linear = (n) => 100 * n
const square = (n) => n * n

export function Crossover() {
  const [n, setN] = useState(30)
  const a = linear(n)
  const b = square(n)
  const top = Math.max(a, b)
  const verdict =
    a === b
      ? `Con n = 100 empatan: los dos hacen ${formatNumber(a)} operaciones.`
      : b < a
        ? `Con n = ${n}, n² hace menos operaciones. Con datos chicos, la constante 100 pesa más que el orden.`
        : `Con n = ${n}, 100·n ya hace menos operaciones, y la diferencia solo crece. Esto es lo que mide Big O.`

  return (
    <div className={lesson.figure}>
      <label className={lesson.sliderRow}>
        <span className={styles.sliderName}>n</span>
        <input
          type="range"
          className={lesson.slider}
          min={1}
          max={250}
          value={n}
          onChange={(event) => setN(Number(event.target.value))}
        />
        <span className={lesson.sliderValue}>n = {n}</span>
      </label>
      <div className={styles.race}>
        {[
          { label: '100·n', sub: 'O(n)', ops: a, winner: a < b },
          { label: 'n²', sub: 'O(n²)', ops: b, winner: b < a, steep: true },
        ].map((row) => (
          <div key={row.label} className={styles.raceRow} data-winner={row.winner || undefined}>
            <span className={styles.raceLabel}>
              {row.label} <span className={styles.raceSub}>{row.sub}</span>
            </span>
            <span className={styles.raceTrack}>
              <span className={styles.raceBar} data-steep={row.steep || undefined} style={{ width: `${(row.ops / top) * 100}%` }} />
            </span>
            <span className={styles.ops}>{formatNumber(row.ops)}</span>
          </div>
        ))}
      </div>
      <p className={styles.verdict} aria-live="polite">
        {verdict}
      </p>
    </div>
  )
}
