import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'
import { formatNumber } from './format.js'

/*
 * The words behind the notation, each one short and with its own small drawing: n, an operation,
 * the O and where it comes from, the logarithm (halving until one is left), n² (an n by n grid)
 * and why the worst case is the one that counts.
 */

const LOG_SIZES = [8, 16, 64, 1024]

/** n, n/2, n/4… down to 1: the steps of halving, which is what log₂ n counts. */
function halvings(n) {
  const steps = [n]
  while (steps.at(-1) > 1) steps.push(steps.at(-1) / 2)
  return steps
}

function Logarithm() {
  const [n, setN] = useState(16)
  const steps = halvings(n)
  return (
    <div className={styles.wordVisual}>
      <div className={styles.tabs} role="group" aria-label="Elegí n">
        {LOG_SIZES.map((size) => (
          <button key={size} type="button" className={styles.tab} aria-pressed={size === n} onClick={() => setN(size)}>
            {formatNumber(size)}
          </button>
        ))}
      </div>
      <p className={styles.halvings}>
        {steps.map((value, i) => (
          <span key={i} className={styles.halving}>
            {i > 0 && <span className={styles.halvingArrow}>÷2 →</span>}
            {formatNumber(value)}
          </span>
        ))}
      </p>
      <p className={styles.wordResult}>
        {steps.length - 1} pasos: <span className={lesson.mono}>log₂ {formatNumber(n)} = {steps.length - 1}</span>
      </p>
    </div>
  )
}

function Square() {
  const [n, setN] = useState(4)
  return (
    <div className={styles.wordVisual}>
      <div className={styles.tabs} role="group" aria-label="Elegí n">
        {[3, 4, 6, 8].map((size) => (
          <button key={size} type="button" className={styles.tab} aria-pressed={size === n} onClick={() => setN(size)}>
            {size}
          </button>
        ))}
      </div>
      <div className={styles.grid} style={{ '--n': n }} aria-hidden="true">
        {Array.from({ length: n * n }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <p className={styles.wordResult}>
        <span className={lesson.mono}>{n} × {n} = {n * n}</span>: cada uno con cada uno.
      </p>
    </div>
  )
}

function Row({ term, children, visual }) {
  return (
    <div className={styles.word}>
      <dt className={styles.wordTerm}>{term}</dt>
      <dd className={styles.wordBody}>
        <div className={styles.wordText}>{children}</div>
        {visual}
      </dd>
    </div>
  )
}

export function Words() {
  return (
    <dl className={`${lesson.figure} ${styles.words}`}>
      <Row
        term="n"
        visual={
          <p className={styles.wordVisual}>
            <span className={styles.boxes} aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} />
              ))}
            </span>
            <span className={lesson.mono}>n = 6</span>
          </p>
        }
      >
        <p>
          La <strong>cantidad de datos</strong> que recibe el algoritmo: las cartas del mazo, los números de la lista, las
          ciudades del mapa. Se le dice así para no atarlo a un número: vale para 6 y para 6 millones.
        </p>
      </Row>

      <Row term="Operación">
        <p>
          Un <strong>paso básico</strong>, de los que tardan siempre lo mismo: mirar un elemento, comparar dos, sumar,
          dar vuelta una carta. Big O cuenta estos pasos, no segundos.
        </p>
      </Row>

      <Row term="O( … )">
        <p>
          Se lee «<strong>del orden de</strong>»: O(n) es «crece como n». La O viene de «Ordnung» (orden, en
          alemán): la usaron los matemáticos Paul Bachmann (1894) y Edmund Landau, y Donald Knuth la llevó a los
          algoritmos en los años 70.
        </p>
      </Row>

      <Row term="log n" visual={<Logarithm />}>
        <p>
          <strong>Cuántas veces podés partir n a la mitad hasta que quede 1.</strong> Por eso aparece cuando un algoritmo
          descarta la mitad en cada paso. Crece lentísimo: de mil a un millón pasa de 10 a 20. En Big O no se escribe la
          base: cambiarla solo multiplica por una constante.
        </p>
      </Row>

      <Row term="n²" visual={<Square />}>
        <p>
          <strong>n por n</strong>: aparece cuando cada dato se combina con todos los demás, como buscar cartas repetidas o
          un bucle dentro de otro.
        </p>
      </Row>

      <Row term="Peor caso">
        <p>
          Un mismo algoritmo puede tener suerte: si buscás algo y está primero, terminás enseguida. Big O habla del{' '}
          <strong>peor caso</strong>, que es el que te garantiza cuánto va a tardar, como mucho.
        </p>
      </Row>
    </dl>
  )
}
