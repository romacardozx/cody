import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useMotionFocus } from '../lib/motionFocus.js'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import { Icon } from './Icon.jsx'
import styles from './CodyTour.module.css'

/*
 * "Cómo funciona" as a short animated scene narrated by Cody's eye. It plays by itself (no
 * interaction needed) through the three engagement levels of Naps et al. (2002): watching, where
 * the eye gets bored; responding, where the scene stops at a decision and a cursor answers; and
 * changing, where the data changes and runs again. The eye talks in a speech bubble.
 *
 * Plays only while on screen; it can be paused or jumped by chapter. With reduced motion nothing
 * plays: each chapter shows its key frame and its lines at once.
 */

const TICK_MS = 100
const TYPE_MS = 26 // per character of the speech bubble
const REACH = 4.6

const CHAPTERS = ['Mirar', 'Responder', 'Cambiar']

// What happens, beat by beat. `ms` is how long each beat lasts.
const BEATS = [
  { chapter: 0, scene: 'sort', mood: 'follow', ms: 4600, say: 'Así se ve un algoritmo en casi todos lados: una animación que corre sola.' },
  { chapter: 0, scene: 'sort', mood: 'sleepy', ms: 4400, say: 'Es linda, pero no te pide nada. Y cuando termina… ¿qué pasó?' },
  { chapter: 1, scene: 'search', steps: [0, 1], mood: 'wide', ms: 3800, say: 'En Cody, la animación se frena justo antes de cada decisión.' },
  { chapter: 1, scene: 'search', steps: [1], ask: true, ms: 4600, say: 'Buscamos el 23 y el del medio es 16. ¿Sigue por la izquierda o por la derecha?' },
  { chapter: 1, scene: 'search', steps: [2, 3, 4, 5], answered: true, mood: 'happy', ms: 4800, say: '¡Eso! 23 es mayor que 16: la mitad izquierda ni se mira.' },
  { chapter: 1, scene: 'search', steps: [5], answered: true, ms: 4400, say: 'Si te equivocás, te explico por qué, y queda en tu historial para repasarlo.' },
  { chapter: 2, scene: 'change', edit: true, ms: 3800, say: 'Y pronto vas a poder cambiar los datos…' },
  { chapter: 2, scene: 'change', run: true, ms: 4400, say: '…y volver a correrlo, para ver qué cambia y qué no.' },
  { chapter: 2, scene: 'change', run: true, done: true, mood: 'happy', ms: 5600, say: 'Cuanto más hacés con una animación, más aprendés. Por eso en Cody predecís.' },
]
const FIRST_OF = CHAPTERS.map((_, c) => BEATS.findIndex((b) => b.chapter === c))
const LAST_OF = CHAPTERS.map((_, c) => BEATS.findLastIndex((b) => b.chapter === c))
const CHAPTER_MS = CHAPTERS.map((_, c) => BEATS.filter((b) => b.chapter === c).reduce((sum, b) => sum + b.ms, 0))

// ------------------------------------------------------------------ data for the scenes

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

const SORT_VALUES = [5, 2, 8, 1, 6, 3, 7]
const SORT_FRAMES = bubbleFrames(SORT_VALUES)
const SORT_STEP_MS = 230

const LIST = [2, 5, 8, 12, 16, 23, 38, 56, 72]
const SEARCH = [
  { lo: 0, hi: 8, mid: null },
  { lo: 0, hi: 8, mid: 4 },
  { lo: 5, hi: 8, mid: null },
  { lo: 5, hi: 8, mid: 6 },
  { lo: 5, hi: 5, mid: null },
  { lo: 5, hi: 5, mid: 5, found: true },
]
const SEARCH_STEP_MS = 950

const CHANGE_BEFORE = [4, 7, 2, 9, 5]
const CHANGE_AFTER = [4, 7, 8, 9, 5] // the cursor raises the third bar
const CHANGE_FRAMES = bubbleFrames(CHANGE_AFTER)
const CHANGE_STEP_MS = 260
const EDIT_AT_MS = 2000

// ------------------------------------------------------------------ pieces

function Bars({ values, frame, highlight, barRef }) {
  const n = values.length
  return (
    <div className={styles.bars}>
      {values.map((value, id) => {
        const slot = frame.order.indexOf(id)
        const state = frame.compare.includes(id) ? (frame.swap ? 'swapping' : 'comparing') : slot >= n - frame.sorted ? 'sorted' : 'idle'
        return (
          <span
            key={id}
            ref={id === highlight ? barRef : undefined}
            className={styles.bar}
            data-state={state}
            style={{ width: `${100 / n}%`, transform: `translateX(${slot * 100}%)` }}
          >
            <span className={styles.barFill} style={{ height: `${16 + value * 9}%` }} />
            <span className={styles.barValue}>{value}</span>
          </span>
        )
      })}
    </div>
  )
}

function Cursor({ cursorRef, pressed }) {
  return (
    <svg ref={cursorRef} className={styles.cursor} data-pressed={pressed || undefined} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3l14 8.2-6.1 1.3 3.4 6.6-2.7 1.4-3.4-6.6L5.6 18z" />
    </svg>
  )
}

function Eye({ look, mood, blinking }) {
  const clip = useId()
  return (
    <svg className={styles.eye} data-mood={mood} data-blinking={blinking || undefined} viewBox="0 0 24 24" aria-hidden="true">
      <g className={styles.lid}>
        <circle cx="12" cy="12" r="9.2" className={styles.eyeWhite} />
        <g className={styles.pupilGroup} style={{ transform: `translate(${look.x}px, ${look.y}px)` }}>
          <circle cx="12" cy="12" r="3.7" className={styles.pupil} />
          <circle cx="13.4" cy="10.6" r="1.05" className={styles.shine} />
        </g>
      </g>
      {/* The upper lid that drops when Cody gets bored. It slides inside the eye, clipped to its
          circle, so when open it is hidden above it instead of leaving an edge behind */}
      <clipPath id={clip}>
        <circle cx="12" cy="12" r="9.2" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <g className={styles.sleepyLid}>
          <rect x="2" y="2" width="20" height="10.4" className={styles.sleepyLidSkin} />
          <line x1="2" y1="12.4" x2="22" y2="12.4" className={styles.sleepyLidEdge} />
        </g>
      </g>
      <circle cx="12" cy="12" r="9.2" className={styles.eyeRing} />
    </svg>
  )
}

// ------------------------------------------------------------------ the tour

export function CodyTour() {
  const reduce = useReducedMotion()
  const root = useRef(null)
  const stage = useRef(null)
  const rightButton = useRef(null)
  const editedBar = useRef(null)
  // beat: which one plays; elapsed: ms into it; chapterElapsed: ms into its chapter
  const [clock, setClock] = useState(() => (reduce ? { beat: LAST_OF[1], elapsed: 1e6, chapterElapsed: 1e6 } : { beat: 0, elapsed: 0, chapterElapsed: 0 }))
  const { beat, elapsed, chapterElapsed } = clock
  const visible = useMotionFocus('tour', root) // only plays while it is the most visible scene
  const [paused, setPaused] = useState(false)
  const cursor = useRef(null)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  const playing = visible && !paused && !reduce

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const onMedia = () => setNarrow(media.matches)
    media.addEventListener('change', onMedia)
    return () => {
      media.removeEventListener('change', onMedia)
    }
  }, [])

  // The clock: advances the beat when its time is up, and loops at the end
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setClock((c) => {
        if (c.elapsed + TICK_MS < BEATS[c.beat].ms) return { ...c, elapsed: c.elapsed + TICK_MS, chapterElapsed: c.chapterElapsed + TICK_MS }
        const next = (c.beat + 1) % BEATS.length
        const sameChapter = BEATS[next].chapter === BEATS[c.beat].chapter
        return { beat: next, elapsed: 0, chapterElapsed: sameChapter ? c.chapterElapsed + TICK_MS : 0 }
      })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  const jump = (chapter) => {
    setClock(reduce ? { beat: LAST_OF[chapter], elapsed: 1e6, chapterElapsed: 1e6 } : { beat: FIRST_OF[chapter], elapsed: 0, chapterElapsed: 0 })
  }

  const current = BEATS[beat]
  const blinking = !reduce && elapsed < 200 // Cody blinks at the start of every beat
  const chars = Math.min(current.say.length, Math.floor(elapsed / TYPE_MS))

  // ---- scene state, derived from the clock
  let sortFrame = SORT_FRAMES[Math.min(SORT_FRAMES.length - 1, Math.floor(chapterElapsed / SORT_STEP_MS))]
  const searchStep = current.steps ? current.steps[Math.min(current.steps.length - 1, Math.floor(elapsed / SEARCH_STEP_MS))] : 0
  const search = SEARCH[searchStep]
  const asking = current.ask
  const pressed = asking && elapsed > current.ms - 900
  const edited = current.scene === 'change' && (!current.edit || elapsed > EDIT_AT_MS)
  const changeValues = edited ? CHANGE_AFTER : CHANGE_BEFORE
  const changeFrame = current.run
    ? current.done
      ? CHANGE_FRAMES[CHANGE_FRAMES.length - 1]
      : CHANGE_FRAMES[Math.min(CHANGE_FRAMES.length - 1, Math.floor(elapsed / CHANGE_STEP_MS))]
    : { order: changeValues.map((_, i) => i), compare: [], sorted: 0 }

  // ---- the fake cursor: flies in from below-right to the "Derecha" button, or to the bar it edits.
  // Positioned straight on the DOM: it is a measurement of the layout, not React state.
  const cursorTarget = asking ? 'right' : current.edit ? 'bar' : null
  useLayoutEffect(() => {
    const target = cursorTarget === 'right' ? rightButton.current : editedBar.current
    const element = cursor.current
    if (!cursorTarget || !target || !element || !stage.current) return
    const box = stage.current.getBoundingClientRect()
    const r = target.getBoundingClientRect()
    const x = r.left + r.width * 0.6 - box.left
    const y = r.top + r.height * 0.55 - box.top
    element.style.transform = `translate(${x + 90}px, ${y + 110}px)`
    const frame = requestAnimationFrame(() => (element.style.transform = `translate(${x}px, ${y}px)`))
    return () => cancelAnimationFrame(frame)
  }, [cursorTarget, beat, narrow])
  const cursorPressed = pressed || (current.edit && elapsed > EDIT_AT_MS - 300 && elapsed < EDIT_AT_MS + 200)

  // ---- where the eye looks: at the action, and the stage is to its right (below on phones)
  const toward = (fraction) =>
    narrow ? { x: (fraction - 0.5) * 2 * REACH * 0.8, y: REACH * 0.75 } : { x: REACH * 0.85, y: (fraction - 0.5) * REACH * 0.9 + 0.6 }
  let look = toward(0.5)
  if (current.scene === 'sort' && sortFrame.compare.length) {
    const slot = sortFrame.order.indexOf(sortFrame.compare[0])
    look = toward(slot / (SORT_VALUES.length - 1))
  }
  if (current.scene === 'search' && search.mid !== null) look = toward(search.mid / (LIST.length - 1))
  if (current.mood === 'sleepy') look = { x: look.x * 0.6, y: REACH * 0.6 }
  if (reduce) sortFrame = SORT_FRAMES[SORT_FRAMES.length - 1]

  return (
    <div ref={root} className={styles.tour}>
      <div className={styles.chapters} data-reveal="">
        {CHAPTERS.map((name, c) => {
          const progress = c < current.chapter ? 1 : c > current.chapter ? 0 : Math.min(1, chapterElapsed / CHAPTER_MS[c])
          return (
            <button key={name} type="button" className={styles.chapter} aria-current={c === current.chapter || undefined} onClick={() => jump(c)}>
              <span className={styles.chapterBar}>
                <span className={styles.chapterFill} style={{ transform: `scaleX(${reduce && c === current.chapter ? 1 : progress})` }} />
              </span>
              {name}
            </button>
          )
        })}
        {!reduce && (
          <button type="button" className={styles.pause} onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Reproducir' : 'Pausar'}>
            <Icon name={paused ? 'play' : 'pause'} size={16} />
          </button>
        )}
      </div>

      <div className={styles.body} data-reveal="">
        <div className={styles.narrator}>
          <Eye look={look} mood={current.mood} blinking={blinking} />
          <p className={styles.bubble} aria-hidden="true">
            {current.say.slice(0, chars)}
            <span className={styles.ghost}>{current.say.slice(chars)}</span>
          </p>
        </div>

        <div ref={stage} className={styles.stage} data-scene={current.scene} aria-hidden="true">
          {current.scene === 'sort' && (
            <div className={styles.scene} key="sort">
              <Bars values={SORT_VALUES} frame={sortFrame} />
            </div>
          )}

          {current.scene === 'search' && (
            <div className={styles.scene} key="search">
              <div className={styles.list}>
                <span className={styles.range} style={{ left: `${(search.lo / LIST.length) * 100}%`, width: `${((search.hi - search.lo + 1) / LIST.length) * 100}%` }} />
                {LIST.map((value, i) => (
                  <span
                    key={value}
                    className={styles.cell}
                    data-out={i < search.lo || i > search.hi || undefined}
                    data-mid={i === search.mid || undefined}
                    data-asking={(i === search.mid && asking) || undefined}
                    data-found={(i === search.mid && search.found) || undefined}
                  >
                    {value}
                  </span>
                ))}
              </div>
              <div className={styles.options} data-visible={asking || current.answered || undefined}>
                <span className={styles.option} data-dim={current.answered || undefined}>
                  <Icon name="back" size={16} /> Izquierda
                </span>
                <span ref={rightButton} className={styles.option} data-chosen={current.answered || pressed || undefined}>
                  Derecha <Icon name="arrow" size={16} />
                </span>
              </div>
            </div>
          )}

          {current.scene === 'change' && (
            <div className={styles.scene} key="change">
              <Bars values={changeValues} frame={changeFrame} highlight={2} barRef={editedBar} />
            </div>
          )}

          {cursorTarget && <Cursor cursorRef={cursor} pressed={cursorPressed} />}
        </div>
      </div>

      {/* Everything Cody says, for screen readers, without the animation */}
      <ol className={styles.srOnly}>
        {BEATS.map((b) => (
          <li key={b.say}>{b.say}</li>
        ))}
      </ol>

      <p className={styles.source} data-reveal="">
        Los tres niveles vienen de la taxonomía de compromiso de Naps y otros (ITiCSE, 2002), que estudió cómo se aprende
        con visualizaciones de algoritmos.
      </p>
    </div>
  )
}
