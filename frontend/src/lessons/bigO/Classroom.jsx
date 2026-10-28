import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { useReducedMotion } from '../../lib/useReducedMotion.js'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * A real classroom: the board, the teacher in front and students at their desks, each with a
 * name. Every operation takes the same time on screen, so how long the animation runs IS the
 * cost, and a line tells what is happening ("La profe llama a Ana"). First with a few students;
 * then, before doing it again with twice as many, the reader predicts how much longer it takes.
 * The class size changes on every try, and each task has several daily-life examples.
 */

const NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Facu', 'Gabi', 'Hugo', 'Inés', 'Juli', 'Kevin', 'Lucía',
  'Mati', 'Nico', 'Olga', 'Pablo', 'Quimey', 'Rocío', 'Santi', 'Tomás',
]

const TASKS = {
  first: {
    label: 'Mirar el primer banco',
    order: 'O(1)',
    ops: () => 1,
    msPerOp: 700,
    answer: 'Lo mismo',
    say: () => `La profe mira el primer banco: es ${NAMES[0]}. Una sola mirada.`,
    daily: [
      'Abrir un contacto de la agenda del celular: va directo, tengas 10 o 1.000.',
      'Agarrar el primer plato de la pila: no importa cuántos haya abajo.',
      'Ver el saldo de tu cuenta: el banco no suma tus movimientos cada vez, lo tiene guardado.',
    ],
  },
  roll: {
    label: 'Pasar lista',
    order: 'O(n)',
    ops: (n) => n,
    msPerOp: 220,
    answer: 'El doble',
    say: (step) => `La profe llama a ${NAMES[step]}… ¡presente!`,
    daily: [
      'Buscar un mensaje en un chat sin buscador: pasás uno por uno.',
      'Revisar cada caja de la mudanza hasta encontrar el cargador.',
      'Contar la plata de la alcancía moneda por moneda.',
    ],
  },
  greet: {
    label: 'Que todos se saluden',
    order: 'O(n²)',
    ops: (n) => (n * (n - 1)) / 2,
    msPerOp: 45,
    answer: 'Cuatro veces más',
    say: (_, pair) => `${NAMES[pair[0]]} saluda a ${NAMES[pair[1]]}.`,
    daily: [
      'Armar un torneo todos contra todos: cada equipo juega con cada otro.',
      'Buscar fotos repetidas comparando cada foto con todas las demás.',
      'Brindar en una mesa: cada uno choca la copa con cada uno.',
    ],
  },
}
const OPTIONS = ['Lo mismo', 'El doble', 'Cuatro veces más']

const randomClassSize = () => 5 + Math.floor(Math.random() * 5) // 5 to 9; then twice as many

// Desks in rows facing the board, numbered from the front-left
const W = 320
function seat(i, n) {
  const columns = n <= 9 ? 3 : 6
  const row = Math.floor(i / columns)
  const column = i % columns
  const spacing = (W - 40) / columns
  return [20 + spacing * (column + 0.5), 92 + row * 52]
}

function pairs(n) {
  const all = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([i, j])
  return all
}

export function Classroom() {
  const reduce = useReducedMotion()
  const [taskKey, setTaskKey] = useState('roll')
  const [small, setSmall] = useState(6)
  const [n, setN] = useState(6)
  const [done, setDone] = useState(0)
  const [phase, setPhase] = useState('ready') // ready -> running -> asking -> running -> finished
  const [guess, setGuess] = useState(null)
  const [firstCount, setFirstCount] = useState(null)
  const [example, setExample] = useState(0)
  const task = TASKS[taskKey]
  const total = task.ops(n)
  const allPairs = taskKey === 'greet' ? pairs(n) : []

  // One operation every msPerOp; the next phase is decided when the last one lands
  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setTimeout(
      () => {
        const next = reduce ? total : done + 1
        setDone(next)
        if (next < total) return
        if (n === small) {
          setFirstCount(total)
          setPhase('asking')
        } else {
          setPhase('finished')
        }
      },
      reduce ? 0 : task.msPerOp,
    )
    return () => window.clearTimeout(timer)
  }, [phase, done, total, n, small, task.msPerOp, reduce])

  const reset = (key) => {
    const size = randomClassSize()
    setTaskKey(key)
    setSmall(size)
    setN(size)
    setDone(0)
    setGuess(null)
    setFirstCount(null)
    setPhase('ready')
  }
  const predict = (option) => {
    setGuess(option)
    setN(small * 2)
    setDone(0)
    setPhase('running')
  }

  const caption =
    done === 0 ? 'La clase está lista.' : task.say(Math.min(done, n) - 1, allPairs[Math.max(0, done - 1)])
  const stateOf = (i) => {
    if (taskKey === 'first') return done > 0 && i === 0 ? 'done' : undefined
    if (taskKey === 'roll') return i < done ? 'done' : i === done && phase === 'running' ? 'current' : undefined
    const last = allPairs[done - 1]
    return phase === 'running' && last && last.includes(i) ? 'current' : undefined
  }

  return (
    <div className={lesson.figure}>
      <div className={styles.tabs} role="group" aria-label="Tarea">
        {Object.entries(TASKS).map(([key, t]) => (
          <button key={key} type="button" className={styles.tab} aria-pressed={key === taskKey} onClick={() => reset(key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.classroom}>
        <svg viewBox={`0 0 ${W} 260`} className={styles.room} role="img" aria-label={`Aula con ${n} alumnos. ${caption}`}>
          <rect x={60} y={10} width={200} height={26} rx={3} className={styles.board} />
          <text x={160} y={28} className={styles.boardText} textAnchor="middle">pizarrón</text>
          {/* The teacher, in front of the board */}
          <g className={styles.teacher}>
            <circle cx={30} cy={50} r={8} />
            <path d="M18 74 q12 -18 24 0" />
            <text x={30} y={88} textAnchor="middle" className={styles.personLabel}>profe</text>
          </g>
          {taskKey === 'greet' &&
            allPairs.slice(0, done).map(([a, b]) => {
              const [x1, y1] = seat(a, n)
              const [x2, y2] = seat(b, n)
              return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.greeting} />
            })}
          {Array.from({ length: n }, (_, i) => {
            const [x, y] = seat(i, n)
            return (
              <g key={i} className={styles.desk} data-state={stateOf(i)}>
                <rect x={x - 17} y={y + 9} width={34} height={7} rx={2} className={styles.deskTop} />
                <circle cx={x} cy={y} r={11} className={styles.student} />
                <text x={x} y={y + 4.5} textAnchor="middle" className={styles.studentInitial}>{NAMES[i][0]}</text>
              </g>
            )
          })}
        </svg>

        <div className={styles.roomSide}>
          <p className={styles.counter}>
            <span className={styles.counterValue}>{done}</span>
            <span className={styles.counterLabel}>
              {taskKey === 'greet' ? 'saludos' : taskKey === 'first' ? 'miradas' : 'llamados'} · {n} alumnos
            </span>
          </p>
          <p className={styles.caption} aria-live="polite">{caption}</p>

          {phase === 'ready' && (
            <button type="button" className={styles.run} onClick={() => setPhase('running')}>
              {task.label} con {small} alumnos
            </button>
          )}

          {phase === 'asking' && (
            <div className={styles.ask}>
              <p className={styles.askPrompt}>Ahora son {small * 2}, el doble. ¿Cuánto más va a tardar?</p>
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
                {small} alumnos: {firstCount}. {small * 2} alumnos: {total}. Eso es{' '}
                <strong className={lesson.mono}>{task.order}</strong>.
              </p>
              <button type="button" className={styles.again} onClick={() => reset(taskKey)}>
                Otra vez, con otro curso
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={lesson.daily}>
        <span className={lesson.dailyTag}>En el día a día, {task.order}</span>
        <span>{task.daily[example % task.daily.length]}</span>
        <button type="button" className={styles.another} onClick={() => setExample((e) => e + 1)}>
          <Icon name="restart" size={14} /> Otro ejemplo
        </button>
      </p>
    </div>
  )
}
