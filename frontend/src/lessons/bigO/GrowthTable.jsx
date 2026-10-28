import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * Slide n and watch each order grow: the operations it needs and how long that takes on a
 * computer doing 100 million operations per second. Bars use a log scale (each tenth of the width
 * is ×10), or O(n²) would hide every other row.
 */

const SIZES = [10, 100, 1_000, 10_000, 100_000, 1_000_000]
const OPS_PER_SECOND = 1e8
const MAX_LOG = 12 // log10 of the largest count shown: O(n²) with n = 1.000.000

const ORDERS = [
  { label: 'O(1)', ops: () => 1, example: 'leer un elemento por su posición' },
  { label: 'O(log n)', ops: (n) => Math.ceil(Math.log2(n)), example: 'búsqueda binaria' },
  { label: 'O(n)', ops: (n) => n, example: 'recorrer una lista' },
  { label: 'O(n log n)', ops: (n) => Math.round(n * Math.log2(n)), example: 'merge sort' },
  { label: 'O(n²)', ops: (n) => n * n, example: 'comparar todos con todos', steep: true },
]

const number = new Intl.NumberFormat('es-AR')

/** Seconds as a person would say them. */
function duration(seconds) {
  if (seconds < 0.001) return 'al instante'
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`
  if (seconds < 60) return `${seconds.toFixed(1).replace('.', ',')} s`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1).replace('.', ',')} h`
  return `${Math.round(seconds / 86400)} días`
}

export function GrowthTable() {
  const [index, setIndex] = useState(2)
  const n = SIZES[index]

  return (
    <div className={lesson.figure}>
      <label className={lesson.sliderRow}>
        <span className={styles.sliderName}>Tamaño de los datos</span>
        <input
          type="range"
          className={lesson.slider}
          min={0}
          max={SIZES.length - 1}
          step={1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          aria-valuetext={`n = ${number.format(n)}`}
        />
        <span className={lesson.sliderValue}>n = {number.format(n)}</span>
      </label>

      <table className={styles.growth}>
        <thead>
          <tr>
            <th scope="col">Orden</th>
            <th scope="col">Operaciones</th>
            <th scope="col">Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((order) => {
            const ops = order.ops(n)
            const width = Math.max(1.5, (Math.log10(ops + 1) / MAX_LOG) * 100)
            return (
              <tr key={order.label} data-steep={order.steep || undefined}>
                <th scope="row">
                  <span className={styles.order}>{order.label}</span>
                  <span className={styles.example}>{order.example}</span>
                </th>
                <td>
                  <span className={styles.bar} style={{ width: `${width}%` }} />
                  <span className={styles.ops}>{number.format(ops)}</span>
                </td>
                <td className={styles.time}>{duration(ops / OPS_PER_SECOND)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={lesson.caption}>
        En una computadora que hace 100 millones de operaciones por segundo. Barras en escala logarítmica: cada décimo
        del ancho es diez veces más.
      </p>
    </div>
  )
}
