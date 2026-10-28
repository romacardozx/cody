import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'
import { formatNumber } from './format.js'

/*
 * When is one better than the other: looking up students in a 50.000-name roll. One search: go
 * through the list, O(n). Many searches: sort once, O(n log n), then binary search, O(log n),
 * each. Slide how many searches and watch where the decision flips.
 */

const N = 50_000
const LOG = Math.log2(N)
const direct = (k) => k * N
const sortFirst = (k) => N * LOG + k * LOG

export function SortOrSearch() {
  const [k, setK] = useState(3)
  const a = direct(k)
  const b = sortFirst(k)
  const top = Math.max(a, b)
  const flip = Math.ceil((N * LOG) / (N - LOG))
  const rows = [
    { label: 'Buscar directo', detail: `${k} × ${formatNumber(N)}`, ops: a, wins: a < b },
    { label: 'Ordenar y buscar con binaria', detail: `ordenar + ${k} × ${Math.round(LOG)}`, ops: b, wins: b < a },
  ]

  return (
    <div className={lesson.figure}>
      <label className={lesson.sliderRow}>
        <span className={styles.sliderName}>Búsquedas</span>
        <input type="range" className={lesson.slider} min={1} max={60} value={k} onChange={(e) => setK(Number(e.target.value))} />
        <span className={lesson.sliderValue}>{k}</span>
      </label>
      <div className={styles.race}>
        {rows.map((row) => (
          <div key={row.label} className={styles.raceRow} data-winner={row.wins || undefined}>
            <span className={styles.raceLabel}>
              {row.label}
              <span className={styles.raceSub}>{row.detail}</span>
            </span>
            <span className={styles.raceTrack}>
              <span className={styles.raceBar} style={{ width: `${(row.ops / top) * 100}%` }} />
            </span>
            <span className={styles.ops}>{formatNumber(row.ops)}</span>
          </div>
        ))}
      </div>
      <p className={styles.verdict} aria-live="polite">
        {k < flip
          ? `Con ${k} ${k === 1 ? 'búsqueda' : 'búsquedas'}, buscar directo es más barato: ordenar no se llega a pagar.`
          : `Desde ${flip} búsquedas, ordenar una vez sale más barato: cada búsqueda después cuesta 16 pasos, no 50.000.`}
      </p>
      <p className={lesson.daily}>
        <span className={lesson.dailyTag}>En el día a día</span>
        Así funcionan los índices de una base de datos: se ordenan una vez para que miles de búsquedas sean rápidas.
      </p>
    </div>
  )
}
