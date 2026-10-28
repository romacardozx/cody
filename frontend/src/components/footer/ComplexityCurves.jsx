import { useEffect, useRef, useState } from 'react'
import styles from './ComplexityCurves.module.css'

/*
 * The curves of complexity, faint, like a page of a notebook: O(1), O(log n), O(n),
 * O(n log n) and O(n²) draw themselves once when the footer comes into view, then stay still.
 */

// Drawn at 1:1 (the footer gives it a 460px column), so 14px labels render at 14px
const W = 460
const H = 170
const N = 16 // n goes from 0 to N along the x axis

const CURVES = [
  { label: 'O(1)', f: () => 1 },
  { label: 'O(log n)', f: (n) => Math.log2(n + 1) },
  { label: 'O(n)', f: (n) => n },
  { label: 'O(n log n)', f: (n) => n * Math.log2(n + 1) * 0.42 },
  { label: 'O(n²)', f: (n) => n * n * 0.5, steep: true },
]

const x = (n) => 4 + (n / N) * (W - 110)
const y = (v) => H - 22 - v * 7.4

function pathOf(f) {
  const points = []
  for (let n = 0; n <= N; n += 0.25) {
    const v = f(n)
    if (y(v) < 6) break // off the top: O(n²) leaves the page, which is the point
    points.push(`${x(n).toFixed(1)},${y(v).toFixed(1)}`)
  }
  return { d: `M${points.join('L')}`, end: points.at(-1).split(',').map(Number) }
}

export function ComplexityCurves() {
  const ref = useRef(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setDrawn(true)
      observer.disconnect()
    }, { threshold: 0.4 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <svg ref={ref} className={styles.curves} data-drawn={drawn || undefined} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path className={styles.axis} d={`M4 6V${H - 22}H${W - 100}`} />
      <text className={styles.axisLabel} x={W - 104} y={H - 4} textAnchor="end">n →</text>
      {CURVES.map((curve, i) => {
        const { d, end } = pathOf(curve.f)
        return (
          <g key={curve.label} style={{ '--i': i }}>
            <path className={styles.curve} data-steep={curve.steep || undefined} d={d} pathLength="1" />
            <text className={styles.curveLabel} x={end[0] + 8} y={end[1] + 4}>{curve.label}</text>
          </g>
        )
      })}
    </svg>
  )
}
