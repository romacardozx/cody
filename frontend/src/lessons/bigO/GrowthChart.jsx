import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * From counting to a graph: the tasks of the deck drawn as curves, n from 1 to 16 cards. Slide n
 * and read each task's count; O(n²) leaves the chart on its way up.
 */

const W = 560
const H = 260
const PAD = { left: 36, right: 140, top: 12, bottom: 30 }
const N_MAX = 16
const Y_MAX = 40 // the chart shows counts up to here; n² goes past it

const CURVES = [
  { order: 'O(1)', task: 'la de arriba', f: () => 1 },
  { order: 'O(log n)', task: 'buscar en ordenado', f: (n) => Math.log2(n) },
  { order: 'O(n)', task: 'contar los oros', f: (n) => n },
  { order: 'O(n²)', task: 'repetidas', f: (n) => n * n, steep: true },
]

const x = (n) => PAD.left + ((n - 1) / (N_MAX - 1)) * (W - PAD.left - PAD.right)
const y = (v) => H - PAD.bottom - (Math.min(v, Y_MAX) / Y_MAX) * (H - PAD.top - PAD.bottom)

function path(f) {
  const points = []
  for (let n = 1; n <= N_MAX; n += 0.1) {
    points.push(`${x(n).toFixed(1)},${y(f(n)).toFixed(1)}`)
    if (f(n) > Y_MAX) break // off the top: n² leaves the chart
  }
  return `M${points.join('L')}`
}

const round = (v) => (Number.isInteger(v) ? v : v.toFixed(1).replace('.', ','))

export function GrowthChart() {
  const [n, setN] = useState(8)
  return (
    <div className={lesson.figure}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label={`Operaciones de cada tarea con n = ${n}`}>
        <path className={styles.chartAxis} d={`M${PAD.left} ${PAD.top}V${H - PAD.bottom}H${W - PAD.right}`} />
        <text className={styles.chartTick} x={PAD.left} y={H - 8}>1</text>
        <text className={styles.chartTick} x={W - PAD.right} y={H - 8} textAnchor="end">n = 16</text>
        <line className={styles.chartMarker} x1={x(n)} x2={x(n)} y1={PAD.top} y2={H - PAD.bottom} />
        {CURVES.map((curve) => {
          const value = curve.f(n)
          const end = curve.f(N_MAX)
          return (
            <g key={curve.order} data-steep={curve.steep || undefined} className={styles.chartCurve}>
              <path d={path(curve.f)} />
              {value <= Y_MAX && <circle cx={x(n)} cy={y(value)} r="4.5" />}
              <text
                className={styles.chartLabel}
                x={end > Y_MAX ? x(Math.sqrt(Y_MAX)) + 8 : W - PAD.right + 8}
                y={end > Y_MAX ? PAD.top + 10 : y(end) + 4}
              >
                {curve.order} {curve.task}
              </text>
            </g>
          )
        })}
      </svg>

      <label className={lesson.sliderRow}>
        <span className={styles.sliderName}>Cartas</span>
        <input type="range" className={lesson.slider} min={1} max={N_MAX} value={n} onChange={(e) => setN(Number(e.target.value))} />
        <span className={lesson.sliderValue}>n = {n}</span>
      </label>

      <dl className={styles.readout}>
        {CURVES.map((curve) => (
          <div key={curve.order} data-steep={curve.steep || undefined}>
            <dt className={lesson.mono}>{curve.order}</dt>
            <dd>{round(curve.f(n))}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
