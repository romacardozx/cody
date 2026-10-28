import styles from './BigO.module.css'
import { formatNumber, OPS_PER_SECOND } from './format.js'

/*
 * The summary: the orders as a ladder, from the one that grows least to the one that grows most,
 * each with a daily example and how much data fits in one second. A cheat sheet to come back to.
 */

const STEPS = [
  { order: 'O(1)', example: 'abrir un contacto de la agenda', inOneSecond: 'cualquier cantidad' },
  { order: 'O(log n)', example: 'buscar en el diccionario', inOneSecond: 'cualquier cantidad' },
  { order: 'O(n)', example: 'pasar lista', ops: (n) => n },
  { order: 'O(n log n)', example: 'ordenar con merge sort', ops: (n) => n * Math.log2(n) },
  { order: 'O(n²)', example: 'un torneo todos contra todos', ops: (n) => n * n },
  { order: 'O(2ⁿ)', example: 'probar todas las combinaciones', ops: (n) => 2 ** n },
]

/** Largest n whose operations fit in one second (doubling, then halving the gap). */
function largestInOneSecond(ops) {
  let low = 1
  let high = 2
  while (ops(high) <= OPS_PER_SECOND) high *= 2
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2)
    if (ops(middle) <= OPS_PER_SECOND) low = middle
    else high = middle
  }
  return low
}

/** Rounded the way people say big numbers: 10.000, 4 millones. */
function roughly(n) {
  if (n >= 1e6) return `${formatNumber(Math.round(n / 1e6))} millones`
  if (n >= 1e4) return formatNumber(Math.round(n / 1000) * 1000)
  return formatNumber(n)
}

export function Ladder() {
  return (
    <ol className={styles.ladder}>
      {STEPS.map((step, i) => (
        <li key={step.order} className={styles.ladderStep} style={{ '--step': i }}>
          <span className={styles.ladderOrder}>{step.order}</span>
          <span className={styles.ladderExample}>{step.example}</span>
          <span className={styles.ladderFit}>
            {step.inOneSecond ?? `hasta ${roughly(largestInOneSecond(step.ops))}`}
            <span className={styles.ladderFitSub}> en 1 s</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
