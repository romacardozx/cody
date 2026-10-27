import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import styles from './WatchVsPredict.module.css'

/*
 * "Cómo funciona" as an argument instead of a list of steps: the same BFS animation twice. On the
 * left it runs by itself, start to end, over and over. On the right it stops right before a
 * decision and waits for the visitor, who can answer here and see the feedback, like in Cody.
 */

const NODES = { A: [34, 80], B: [118, 34], C: [118, 126], D: [206, 80], E: [292, 80] }
const EDGES = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']]

// BFS from A, one frame per step: the state of each node and the queue after it
const FRAMES = [
  { A: 'frontier', queue: ['A'] },
  { A: 'current', queue: [] },
  { A: 'visited', B: 'frontier', C: 'frontier', queue: ['B', 'C'] },
  { A: 'visited', B: 'current', C: 'frontier', queue: ['C'] },
  { A: 'visited', B: 'visited', C: 'frontier', D: 'frontier', queue: ['C', 'D'] },
  { A: 'visited', B: 'visited', C: 'current', D: 'frontier', queue: ['D'] },
  { A: 'visited', B: 'visited', C: 'visited', D: 'frontier', queue: ['D'] },
  { A: 'visited', B: 'visited', C: 'visited', D: 'current', queue: [] },
  { A: 'visited', B: 'visited', C: 'visited', D: 'visited', E: 'frontier', queue: ['E'] },
  { A: 'visited', B: 'visited', C: 'visited', D: 'visited', E: 'current', queue: [] },
  { A: 'visited', B: 'visited', C: 'visited', D: 'visited', E: 'visited', queue: [] },
]
const LAST = FRAMES.length - 1
const QUESTION_AT = 4 // queue is [C, D]: which one leaves?
const STEP_MS = 760
const REST_MS = 1600 // the passive side waits a moment at the end, then starts over

const FEEDBACK = {
  C: { correct: true, text: 'Sale C: entró a la cola antes que D, y en una cola sale primero el que llegó primero.' },
  D: { correct: false, text: 'Sale C, no D. C entró antes, y en una cola (FIFO) sale primero el que llegó primero.' },
}

/** Runs `tick` every `ms` while the element is on screen. */
function useTicker(ref, ms, tick, active) {
  const latest = useRef(tick)
  useEffect(() => {
    latest.current = tick
  })
  useEffect(() => {
    if (!active) return
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer)
      if (entry.isIntersecting) timer = window.setInterval(() => latest.current(), ms)
    })
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [ref, ms, active])
}

function Graph({ frame, options = [], label }) {
  const states = FRAMES[frame]
  return (
    <svg className={styles.graph} viewBox="0 0 326 160" role="img" aria-label={label}>
      {EDGES.map(([a, b]) => (
        <line key={a + b} className={styles.edge} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
      ))}
      {Object.entries(NODES).map(([id, [x, y]]) => (
        <g key={id} className={styles.node} data-state={states[id] ?? 'idle'} data-option={options.includes(id) || undefined}>
          <circle cx={x} cy={y} r="19" />
          <text x={x} y={y}>{id}</text>
        </g>
      ))}
    </svg>
  )
}

function Progress({ frame, paused }) {
  return (
    <div className={styles.progress} data-paused={paused || undefined}>
      <span className={styles.track}>
        <span className={styles.fill} style={{ transform: `scaleX(${frame / LAST})` }} />
      </span>
      <span className={styles.count}>
        {paused ? <Icon name="pause" size={14} /> : <Icon name="play" size={14} />} paso {frame} de {LAST}
      </span>
    </div>
  )
}

function Queue({ frame }) {
  const queue = FRAMES[frame].queue
  return (
    <p className={styles.queue}>
      cola <span className={styles.queueItems}>{queue.length ? queue.join(' ') : '—'}</span>
    </p>
  )
}

export function WatchVsPredict() {
  const reduce = useReducedMotion()
  const watchRef = useRef(null)
  const predictRef = useRef(null)
  const [watchFrame, setWatchFrame] = useState(reduce ? LAST : 0)
  const [predictFrame, setPredictFrame] = useState(reduce ? QUESTION_AT : 0)
  const [answer, setAnswer] = useState(null)
  const rest = useRef(0)

  // Passive side: plays to the end, rests, starts over
  useTicker(
    watchRef,
    STEP_MS,
    () => {
      setWatchFrame((frame) => {
        if (frame < LAST) return frame + 1
        rest.current += STEP_MS
        if (rest.current < REST_MS) return frame
        rest.current = 0
        return 0
      })
    },
    !reduce,
  )

  // Cody's side: plays up to the decision, waits for an answer, then plays to the end and stays
  const waiting = predictFrame === QUESTION_AT && !answer
  useTicker(predictRef, STEP_MS, () => setPredictFrame((frame) => (frame === QUESTION_AT && !answer) || frame === LAST ? frame : frame + 1), !reduce)

  const choose = (option) => {
    setAnswer(option)
    if (reduce) setPredictFrame(LAST)
  }
  const restart = () => {
    setAnswer(null)
    setPredictFrame(reduce ? QUESTION_AT : 0)
  }
  const feedback = answer && FEEDBACK[answer]

  return (
    <div className={styles.compare}>
      <div ref={watchRef} className={styles.watch}>
        <h3 className={styles.title}>Mirar una animación</h3>
        <Graph frame={watchFrame} label="Animación de BFS que corre sola" />
        <Queue frame={watchFrame} />
        <Progress frame={watchFrame} />
        <p className={styles.text}>
          Corre sola de principio a fin. Es cómoda, pero no te pide nada: cuando termina, cuesta explicar qué pasó y por qué.
        </p>
      </div>

      <div ref={predictRef} className={styles.predict}>
        <h3 className={styles.title}>Predecir con Cody</h3>
        <Graph frame={predictFrame} options={waiting ? ['C', 'D'] : []} label="Animación de BFS frenada antes de una decisión" />
        <Queue frame={predictFrame} />
        <Progress frame={predictFrame} paused={waiting} />

        <div className={styles.decision} aria-live="polite">
          {predictFrame < QUESTION_AT && <p className={styles.text}>Corre hasta la próxima decisión…</p>}
          {waiting && (
            <>
              <p className={styles.prompt}>¿Qué nodo sale ahora de la cola?</p>
              <div className={styles.options}>
                {['C', 'D'].map((option) => (
                  <button key={option} type="button" className={styles.option} onClick={() => choose(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
          {feedback && (
            <>
              <p className={styles.feedback} data-correct={feedback.correct}>
                <Icon name={feedback.correct ? 'check' : 'close'} size={18} />
                <span>{feedback.text}</span>
              </p>
              {predictFrame === LAST && (
                <div className={styles.after}>
                  <button type="button" className={styles.again} onClick={restart}>
                    <Icon name="restart" size={16} /> Otra vez
                  </button>
                  <Link to="/algorithms/BFS" className={styles.more}>
                    Recorrer BFS completo <Icon name="arrow" size={16} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
