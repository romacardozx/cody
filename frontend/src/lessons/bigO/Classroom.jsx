import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../lib/useReducedMotion.js'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * The classroom: n students sitting in a circle and a task. Every operation takes the same time
 * on screen, so how long the animation runs IS the cost. First with 8 students; then, before
 * doing it again with 16, the reader predicts how much longer it will take.
 */

const TASKS = {
  door: {
    label: '¿Quién está en la puerta?',
    order: 'O(1)',
    ops: () => 1,
    msPerOp: 500,
    answer: 'Lo mismo',
    daily: 'Abrir un contacto de la agenda del celular: va directo, tengas 10 o 1.000.',
  },
  roll: {
    label: 'Pasar lista',
    order: 'O(n)',
    ops: (n) => n,
    msPerOp: 140,
    answer: 'El doble',
    daily: 'Buscar un mensaje en un chat sin buscador: pasás uno por uno.',
  },
  greet: {
    label: 'Que todos se saluden',
    order: 'O(n²)',
    ops: (n) => (n * (n - 1)) / 2,
    msPerOp: 24,
    answer: 'Cuatro veces más',
    daily: 'Armar un torneo todos contra todos: cada equipo juega con cada otro.',
  },
}
const OPTIONS = ['Lo mismo', 'El doble', 'Cuatro veces más']
const SMALL = 8
const LARGE = 16
const R = 100 // radius of the circle of students
const C = 130 // center of the drawing

const seat = (i, n) => {
  const angle = (i / n) * Math.PI * 2 - Math.PI / 2
  return [C + R * Math.cos(angle), C + R * Math.sin(angle)]
}

/** Every pair of students, in the order they greet each other. */
function pairs(n) {
  const all = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([i, j])
  return all
}

export function Classroom() {
  const reduce = useReducedMotion()
  const [taskKey, setTaskKey] = useState('roll')
  const [n, setN] = useState(SMALL)
  const [done, setDone] = useState(0) // operations already drawn
  const [phase, setPhase] = useState('ready') // ready -> running -> asking -> running -> finished
  const [guess, setGuess] = useState(null)
  const [firstCount, setFirstCount] = useState(null)
  const task = TASKS[taskKey]
  const total = task.ops(n)

  // The animation: one operation every msPerOp, until the task is done
  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setTimeout(
      () => {
        const next = reduce ? total : done + 1
        setDone(next)
        if (next < total) return
        // Done: with 8 students, ask before trying 16; with 16, show the result
        if (n === SMALL) {
          setFirstCount(total)
          setPhase('asking')
        } else {
          setPhase('finished')
        }
      },
      reduce ? 0 : task.msPerOp,
    )
    return () => window.clearTimeout(timer)
  }, [phase, done, total, n, task.msPerOp, reduce])

  const choose = (key) => {
    setTaskKey(key)
    setN(SMALL)
    setDone(0)
    setGuess(null)
    setFirstCount(null)
    setPhase('ready')
  }
  const predict = (option) => {
    setGuess(option)
    setN(LARGE)
    setDone(0)
    setPhase('running')
  }

  const lit = (i) => taskKey === 'roll' && i < done
  const atDoor = taskKey === 'door' && done > 0

  return (
    <div className={lesson.figure}>
      <div className={styles.tabs} role="group" aria-label="Tarea">
        {Object.entries(TASKS).map(([key, t]) => (
          <button key={key} type="button" className={styles.tab} aria-pressed={key === taskKey} onClick={() => choose(key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.classroom}>
        <svg viewBox="0 0 260 260" className={styles.room} role="img" aria-label={`${n} alumnos: ${task.label}`}>
          {/* The door, at the top */}
          <rect x={C - 16} y={2} width={32} height={8} rx={2} className={styles.door} data-active={atDoor || undefined} />
          {taskKey === 'greet' &&
            pairs(n)
              .slice(0, done)
              .map(([a, b]) => {
                const [x1, y1] = seat(a, n)
                const [x2, y2] = seat(b, n)
                return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.greeting} />
              })}
          {Array.from({ length: n }, (_, i) => {
            const [x, y] = seat(i, n)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={n === SMALL ? 11 : 8}
                className={styles.student}
                data-state={(atDoor && i === 0) || lit(i) ? 'done' : taskKey === 'roll' && i === done && phase === 'running' ? 'current' : undefined}
              />
            )
          })}
        </svg>

        <div className={styles.roomSide}>
          <p className={styles.counter}>
            <span className={styles.counterValue}>{done}</span>
            <span className={styles.counterLabel}>
              {taskKey === 'greet' ? 'saludos' : 'operaciones'} · {n} alumnos
            </span>
          </p>

          {phase === 'ready' && (
            <button type="button" className={styles.run} onClick={() => setPhase('running')}>
              Hacerlo con {SMALL} alumnos
            </button>
          )}

          {phase === 'asking' && (
            <div className={styles.ask}>
              <p className={styles.askPrompt}>Con {LARGE} alumnos, ¿cuánto más va a tardar?</p>
              <div className={styles.orderOptions}>
                {OPTIONS.map((option) => (
                  <button key={option} type="button" className={styles.orderOption} onClick={() => predict(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'finished' && (
            <div className={styles.result}>
              <p className={styles.resultLine} data-right={guess === task.answer}>
                {guess === task.answer ? '¡Bien predicho! ' : `Era «${task.answer.toLowerCase()}». `}
                {SMALL} alumnos: {firstCount}. {LARGE} alumnos: {total}. Eso es <strong className={lesson.mono}>{task.order}</strong>.
              </p>
              <p className={lesson.daily}>
                <span className={lesson.dailyTag}>En el día a día</span>
                {task.daily}
              </p>
              <button type="button" className={styles.again} onClick={() => choose(taskKey)}>
                Otra vez
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
