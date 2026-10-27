import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import { Icon } from './Icon.jsx'
import styles from './EngagementLadder.module.css'

/*
 * "Cómo funciona" as the engagement taxonomy of Naps et al. (2002): the more a learner does with an
 * algorithm visualization, the more they learn. Three levels, each with a live demo of a different
 * algorithm: watching (bubble sort that runs by itself), responding (a binary search that stops and
 * asks: where Cody is) and changing (your own array, run again). Cody's eye travels along the rail
 * between them and settles on "Responder".
 */

const CODY_LEVEL = 1
const REACH = 4.4 // pupil travel, same as the logo

/** Runs `tick` every `ms` while `ref` is on screen and `active` is true. */
function useTicker(ref, ms, tick, active = true) {
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

// ------------------------------------------------------------------ bars (bubble sort)

/** Every step of bubble sort over `values`: which item is in each slot, what is being compared. */
function bubbleFrames(values) {
  const n = values.length
  const order = values.map((_, i) => i)
  const frames = [{ order: [...order], compare: [], sorted: 0 }]
  for (let end = n - 1; end > 0; end--) {
    let swapped = false
    for (let i = 0; i < end; i++) {
      frames.push({ order: [...order], compare: [order[i], order[i + 1]], sorted: n - 1 - end })
      if (values[order[i]] > values[order[i + 1]]) {
        ;[order[i], order[i + 1]] = [order[i + 1], order[i]]
        swapped = true
        frames.push({ order: [...order], compare: [order[i], order[i + 1]], sorted: n - 1 - end, swap: true })
      }
    }
    if (!swapped) break
  }
  frames.push({ order: [...order], compare: [], sorted: n })
  return frames
}

function Bars({ values, frame, onBarClick, label }) {
  const n = values.length
  const Tag = onBarClick ? 'button' : 'span'
  return (
    <div className={styles.bars} role={onBarClick ? 'group' : 'img'} aria-label={label}>
      {values.map((value, id) => {
        const slot = frame.order.indexOf(id)
        const state = frame.compare.includes(id) ? (frame.swap ? 'swapping' : 'comparing') : slot >= n - frame.sorted ? 'sorted' : 'idle'
        return (
          <Tag
            key={id}
            type={onBarClick ? 'button' : undefined}
            className={styles.bar}
            data-state={state}
            style={{ width: `${100 / n}%`, transform: `translateX(${slot * 100}%)` }}
            onClick={onBarClick ? () => onBarClick(slot) : undefined}
            aria-label={onBarClick ? `Valor ${value}: tocá para cambiarlo` : undefined}
          >
            <span className={styles.barFill} style={{ height: `${18 + value * 9}%` }} />
            <span className={styles.barValue}>{value}</span>
          </Tag>
        )
      })}
    </div>
  )
}

function Progress({ frame, total, paused }) {
  return (
    <div className={styles.progress} data-paused={paused || undefined}>
      <span className={styles.track}>
        <span className={styles.fill} style={{ transform: `scaleX(${total ? frame / total : 0})` }} />
      </span>
      <span className={styles.count}>
        <Icon name={paused ? 'pause' : 'play'} size={13} /> {frame}/{total}
      </span>
    </div>
  )
}

// ------------------------------------------------------------------ level 1: watching

const WATCH_VALUES = [5, 2, 8, 1, 6, 3]
const WATCH_FRAMES = bubbleFrames(WATCH_VALUES)
const WATCH_LAST = WATCH_FRAMES.length - 1

function Watch() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [frame, setFrame] = useState(reduce ? WATCH_LAST : 0)
  const rest = useRef(0)
  useTicker(
    ref,
    560,
    () =>
      setFrame((f) => {
        if (f < WATCH_LAST) return f + 1
        rest.current += 1
        if (rest.current < 4) return f
        rest.current = 0
        return 0
      }),
    !reduce,
  )
  return (
    <div ref={ref} className={styles.demo}>
      <Bars values={WATCH_VALUES} frame={WATCH_FRAMES[frame]} label="Ordenamiento burbuja que corre solo" />
      <Progress frame={frame} total={WATCH_LAST} />
    </div>
  )
}

// ------------------------------------------------------------------ level 2: responding

const LIST = [2, 5, 8, 12, 16, 23, 38, 56, 72]
const TARGET = 23
// Binary search for 23: the live range [lo, hi], the middle being looked at, and what it says
const SEARCH = [
  { lo: 0, hi: 8, mid: null, text: `Buscamos ${TARGET} en una lista ordenada de ${LIST.length} números.` },
  { lo: 0, hi: 8, mid: 4, ask: true },
  { lo: 5, hi: 8, mid: null, text: 'La mitad izquierda se descarta entera, sin mirarla.' },
  { lo: 5, hi: 8, mid: 6, text: '38 es mayor que 23: ahora queda la izquierda.' },
  { lo: 5, hi: 5, mid: null, text: 'Queda un solo candidato.' },
  { lo: 5, hi: 5, mid: 5, found: true, text: 'Encontrado en 3 pasos, de 9 números.' },
]
const ASK_AT = 1
const SEARCH_LAST = SEARCH.length - 1

const ANSWERS = {
  right: { correct: true, text: '23 es mayor que 16 y la lista está ordenada: solo puede estar a la derecha.' },
  left: { correct: false, text: 'A la izquierda de 16 todo es menor, y 23 es mayor: solo puede estar a la derecha.' },
}

function Respond() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [step, setStep] = useState(reduce ? ASK_AT : 0)
  const [answer, setAnswer] = useState(null)
  const waiting = step === ASK_AT && !answer
  useTicker(ref, 1100, () => setStep((s) => (s === ASK_AT && !answer) || s === SEARCH_LAST ? s : s + 1), !reduce)

  const choose = (side) => {
    setAnswer(side)
    if (reduce) setStep(SEARCH_LAST)
  }
  const again = () => {
    setAnswer(null)
    setStep(reduce ? ASK_AT : 0)
  }
  const { lo, hi, mid, found, text } = SEARCH[step]
  const feedback = answer && ANSWERS[answer]

  return (
    <div ref={ref} className={styles.demo}>
      <div className={styles.list} role="img" aria-label={`Lista ordenada: ${LIST.join(', ')}`}>
        {/* The live range, as a band that shrinks under the numbers */}
        <span className={styles.range} style={{ left: `${(lo / LIST.length) * 100}%`, width: `${((hi - lo + 1) / LIST.length) * 100}%` }} />
        {LIST.map((value, i) => (
          <span
            key={value}
            className={styles.cell}
            data-out={i < lo || i > hi || undefined}
            data-mid={i === mid || undefined}
            data-asking={(i === mid && waiting) || undefined}
            data-found={(i === mid && found) || undefined}
          >
            {value}
          </span>
        ))}
      </div>
      <Progress frame={step} total={SEARCH_LAST} paused={waiting} />
      <div className={styles.decision} aria-live="polite">
        {waiting ? (
          <>
            <p className={styles.prompt}>El del medio es 16. ¿{TARGET} está a la izquierda o a la derecha?</p>
            <div className={styles.options}>
              <button type="button" className={styles.option} onClick={() => choose('left')}>
                <Icon name="back" size={16} /> Izquierda
              </button>
              <button type="button" className={styles.option} onClick={() => choose('right')}>
                Derecha <Icon name="arrow" size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            {feedback && (
              <p className={styles.feedback} data-correct={feedback.correct}>
                <Icon name={feedback.correct ? 'check' : 'close'} size={17} />
                <span>{feedback.text}</span>
              </p>
            )}
            {text && <p className={styles.note}>{text}</p>}
            {step === SEARCH_LAST && (
              <button type="button" className={styles.again} onClick={again}>
                <Icon name="restart" size={15} /> Otra vez
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ level 3: changing

function Change() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [values, setValues] = useState([4, 7, 2, 9, 5])
  const [frames, setFrames] = useState(null) // null while editing
  const [frame, setFrame] = useState(0)
  const running = frames && frame < frames.length - 1
  useTicker(ref, 420, () => setFrame((f) => (frames && f < frames.length - 1 ? f + 1 : f)), Boolean(running) && !reduce)

  const shown = frames ? frames[frame] : { order: values.map((_, i) => i), compare: [], sorted: 0 }
  const edit = (slot) => {
    if (running) return
    // Keep what is on screen (maybe already sorted) and bump the touched value
    const current = shown.order.map((id) => values[id])
    current[slot] = (current[slot] % 9) + 1
    setValues(current)
    setFrames(null)
    setFrame(0)
  }
  const run = () => {
    const all = bubbleFrames(values)
    setFrames(all)
    setFrame(reduce ? all.length - 1 : 0)
  }
  return (
    <div ref={ref} className={styles.demo}>
      <Bars values={values} frame={shown} onBarClick={edit} label="Tu arreglo: tocá una barra para cambiar su valor" />
      <div className={styles.changeRow}>
        <button type="button" className={styles.again} onClick={run} disabled={running}>
          <Icon name="play" size={14} /> {frames && !running ? 'Correr de nuevo' : 'Correr'}
        </button>
        <span className={styles.hint}>Tocá una barra para cambiar su valor.</span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ Cody's eye on the rail

function Eye({ look, moving, blinking }) {
  return (
    <svg className={styles.eye} data-moving={moving || undefined} data-blinking={blinking || undefined} viewBox="0 0 24 24" aria-hidden="true">
      <g className={styles.lid}>
        <circle cx="12" cy="12" r="9" className={styles.eyeWhite} />
        <g className={styles.pupilGroup} style={{ transform: `translate(${look.x}px, ${look.y}px)` }}>
          <circle cx="12" cy="12" r="3.6" className={styles.pupil} />
          <circle cx="13.3" cy="10.7" r="1" className={styles.shine} />
        </g>
      </g>
    </svg>
  )
}

const LEVELS = [
  {
    name: 'Mirar',
    line: 'La animación corre sola. Es cómoda, pero no te pide nada: cuando termina, cuesta explicar qué pasó.',
    demo: <Watch />,
  },
  {
    name: 'Responder',
    tag: 'Acá trabaja Cody',
    line: 'Se frena antes de cada decisión y te pregunta qué sigue. Para contestar, tenés que pensar como el algoritmo.',
    demo: <Respond />,
  },
  {
    name: 'Cambiar',
    tag: 'Próximamente: Mis escenarios',
    line: 'Cambiás los datos y lo volvés a correr, para ver qué cambia y qué no.',
    demo: <Change />,
  },
]

export function EngagementLadder() {
  const reduce = useReducedMotion()
  const root = useRef(null)
  const stations = useRef([])
  const [points, setPoints] = useState([])
  const [hovered, setHovered] = useState(null)
  const [arrived, setArrived] = useState(reduce)
  const [look, setLook] = useState({ x: 0, y: REACH * 0.8 })
  const [moving, setMoving] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const target = hovered ?? (arrived ? CODY_LEVEL : 0)
  const previous = useRef(target)

  // Where each station's dot is, relative to the ladder (the layout changes on phones)
  const measure = useCallback(() => {
    const box = root.current?.getBoundingClientRect()
    if (!box) return
    setPoints(
      stations.current.map((dot) => {
        const r = dot.getBoundingClientRect()
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
      }),
    )
  }, [])
  useEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [measure])

  // First time on screen, the eye walks from "Mirar" to "Responder"
  useEffect(() => {
    if (reduce) return
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      timer = window.setTimeout(() => setArrived(true), 700)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(root.current)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [reduce])

  // On every move: look where it is going, stretch, then settle, blink and look down at the demo
  useEffect(() => {
    const from = points[previous.current]
    const to = points[target]
    previous.current = target
    if (!from || !to || (from.x === to.x && from.y === to.y)) return
    const dx = to.x - from.x
    const dy = to.y - from.y
    const length = Math.hypot(dx, dy)
    setLook({ x: (dx / length) * REACH, y: (dy / length) * REACH })
    setMoving(true)
    const settle = window.setTimeout(() => {
      setMoving(false)
      setBlinking(true)
      setLook({ x: 0, y: REACH * 0.8 })
    }, reduce ? 0 : 820)
    const open = window.setTimeout(() => setBlinking(false), reduce ? 0 : 1050)
    return () => {
      window.clearTimeout(settle)
      window.clearTimeout(open)
    }
  }, [target, points, reduce])

  const at = points[target]
  const first = points[0]
  const last = points[points.length - 1]
  return (
    <div ref={root} className={styles.ladder} onPointerLeave={() => setHovered(null)}>
      {first && last && (
        <span aria-hidden="true">
          <span className={styles.rail} style={{ left: first.x, top: first.y, width: Math.max(2, last.x - first.x), height: Math.max(2, last.y - first.y) }} />
          {at && (
            <span className={styles.eyeHolder} style={{ transform: `translate(${at.x}px, ${at.y}px)` }}>
              <Eye look={look} moving={moving} blinking={blinking} />
            </span>
          )}
        </span>
      )}

      <ol className={styles.levels}>
        {LEVELS.map((level, i) => (
          <li
            key={level.name}
            className={styles.level}
            data-cody={i === CODY_LEVEL || undefined}
            onPointerEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
          >
            <div className={styles.head}>
              <span ref={(element) => (stations.current[i] = element)} className={styles.station} aria-hidden="true" />
              <h3 className={styles.name}>{level.name}</h3>
              {level.tag && <span className={styles.tag}>{level.tag}</span>}
            </div>
            <p className={styles.line}>{level.line}</p>
            {level.demo}
          </li>
        ))}
      </ol>

      <p className={styles.source}>
        Los niveles vienen de la taxonomía de compromiso de Naps y otros (ITiCSE, 2002), que estudió cómo se aprende con
        visualizaciones de algoritmos: cuanto más hacés con la animación, más aprendés.
      </p>
    </div>
  )
}
