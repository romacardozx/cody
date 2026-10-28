import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { useReducedMotion } from '../../lib/useReducedMotion.js'
import lesson from '../../components/lesson/Lesson.module.css'
import bigO from './BigO.module.css'
import styles from './Cards.module.css'

/*
 * A Spanish deck on the table: n cards and four tasks, one per order. Every move takes the same
 * time on screen, so how long the animation runs IS the cost, and a line tells each move ("Das
 * vuelta el 3 de bastos… no es oro"). First with a few cards; then, before doing it again with
 * twice as many, the reader predicts how much longer it takes. The deck changes on every try.
 */

const SUITS = ['oros', 'copas', 'espadas', 'bastos']
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
const FIGURES = { 10: 'sota', 11: 'caballo', 12: 'rey' }

const nameOf = (card) => `${FIGURES[card.number] ?? card.number} de ${card.suit}`
const same = (a, b) => a.suit === b.suit && a.number === b.number

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const FULL_DECK = SUITS.flatMap((suit) => NUMBERS.map((number) => ({ suit, number })))

/** n cards for a task: shuffled, sorted, or with two repeated cards to find. */
function dealFor(taskKey, n) {
  if (taskKey === 'pairs') {
    const distinct = shuffled(FULL_DECK).slice(0, n - 2)
    return shuffled([...distinct, distinct[0], distinct[1]])
  }
  const cards = shuffled(FULL_DECK).slice(0, n)
  // Sorted by number only, smallest to largest: an order anyone can see (the suit does not matter)
  return taskKey === 'sorted' ? cards.sort((a, b) => a.number - b.number) : cards
}

/** The moves of a binary search for `value` in a deck sorted by number. */
function binarySearch(deck, value) {
  const moves = []
  const seen = []
  let low = 0
  let high = deck.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    seen.push(middle)
    moves.push({ low, high, middle })
    if (deck[middle].number === value) break
    if (deck[middle].number < value) low = middle + 1
    else high = middle - 1
  }
  return moves
}

/**
 * The card to look for: the one that needs the most looks (the worst case, which is what Big O
 * measures), among those whose number appears once, so finding the number means finding it.
 */
function sortedTarget(deck) {
  const counts = {}
  deck.forEach((card) => (counts[card.number] = (counts[card.number] ?? 0) + 1))
  let best = null
  for (const onlyUnique of [true, false]) {
    deck.forEach((card, i) => {
      if (onlyUnique && counts[card.number] !== 1) return
      const steps = binarySearch(deck, card.number).length
      if (!best || steps > best.steps) best = { index: i, steps }
    })
    if (best) break // every number repeated (rare with 16 cards): take the longest search anyway
  }
  return deck[best.index]
}

// Numbers first, figure in brackets ("un 12 (rey)"): the order is by number, and not everyone knows
// that the rey is the 12
const word = (n) => (FIGURES[n] ? `${n} (${FIGURES[n]})` : String(n))
const anOrA = () => 'un'

/*
 * Each task becomes the list of its moves. A move is a full snapshot of the table: which cards
 * are face up, which are being looked at, which are out of play or found, and what is said.
 */
const TASKS = {
  top: {
    label: 'Agarrar la de arriba',
    order: 'O(1)',
    msPerMove: 700,
    answer: 'Lo mismo',
    moves(deck) {
      return [{ up: [0], focus: [0], say: `Agarrás la de arriba: el ${nameOf(deck[0])}. Un solo movimiento.` }]
    },
    daily: [
      'Abrir un contacto de la agenda del celular: va directo, tengas 10 o 1.000.',
      'Ver el saldo de tu cuenta: el banco no suma tus movimientos cada vez, lo tiene guardado.',
      'Agarrar el primer plato de la pila: no importa cuántos haya abajo.',
    ],
  },
  count: {
    label: 'Contar los oros',
    order: 'O(n)',
    msPerMove: 260,
    answer: 'El doble',
    moves(deck) {
      const found = []
      return deck.map((card, i) => {
        const gold = card.suit === 'oros'
        if (gold) found.push(i)
        return {
          up: deck.map((_, k) => k).slice(0, i + 1),
          focus: [i],
          found: [...found],
          say: `Das vuelta el ${nameOf(card)}… ${gold ? `¡oro! Van ${found.length}.` : 'no es oro.'}`,
        }
      })
    },
    daily: [
      'Buscar un mensaje en un chat sin buscador: pasás uno por uno.',
      'Revisar cada caja de la mudanza hasta encontrar el cargador.',
      'Contar la plata de la alcancía moneda por moneda.',
    ],
  },
  sorted: {
    label: 'Buscar en el mazo ordenado',
    order: 'O(log n)',
    msPerMove: 1700,
    answer: 'Un paso más',
    moves(deck) {
      const target = sortedTarget(deck).number
      const all = deck.map((_, k) => k)
      const seen = []
      return binarySearch(deck, target).map(({ low, high, middle }) => {
        seen.push(middle)
        const card = deck[middle]
        const out = all.filter((k) => k < low || k > high)
        const looking = `Mirás la del medio: ${anOrA(card.number)} ${word(card.number)}.`
        if (card.number === target) return { up: [...seen], focus: [middle], out, found: [middle], say: `${looking} ¡Es la que buscabas!` }
        // The reason, every time: sorted means one look tells which side it cannot be on
        const say =
          card.number < target
            ? `${looking} Como van de menor a mayor, todo lo de su izquierda es ${word(card.number)} o menos: ${anOrA(target)} ${word(target)} no puede estar ahí. Descartás esa mitad.`
            : `${looking} Como van de menor a mayor, todo lo de su derecha es ${word(card.number)} o más: ${anOrA(target)} ${word(target)} no puede estar ahí. Descartás esa mitad.`
        return { up: [...seen], focus: [middle], out, say }
      })
    },
    lead: (deck) => {
      const target = sortedTarget(deck).number
      return `Las cartas están ordenadas por número, de menor a mayor; el palo no importa. Buscás ${anOrA(target)} ${word(target)}, la que más vueltas necesita: el peor caso.`
    },
    target: (deck) => sortedTarget(deck),
    daily: [
      'Buscar «perro» en el diccionario: abrís en la M, y como está en orden alfabético, nada de lo anterior a la M puede ser. Lo descartás sin leerlo.',
      'Buscar tu DNI en el padrón ordenado: mirás el del medio y sabés si el tuyo está antes o después.',
      'Adivinar un número del 1 al 100 con «más alto» o «más bajo»: cada respuesta descarta la mitad. En 7 intentos alcanza.',
    ],
  },
  pairs: {
    label: 'Buscar repetidas',
    order: 'O(n²)',
    msPerMove: 50,
    answer: 'Cuatro veces más',
    moves(deck) {
      const all = deck.map((_, k) => k)
      const found = []
      const moves = []
      for (let i = 0; i < deck.length; i++) {
        for (let j = i + 1; j < deck.length; j++) {
          const equal = same(deck[i], deck[j])
          if (equal) found.push(i, j)
          moves.push({
            up: all,
            focus: [i, j],
            found: [...found],
            say: `Comparás el ${nameOf(deck[i])} con el ${nameOf(deck[j])}… ${equal ? '¡repetidas!' : 'distintas.'}`,
          })
        }
      }
      return moves
    },
    daily: [
      'Buscar fotos repetidas comparando cada foto con todas las demás.',
      'Armar un torneo todos contra todos: cada equipo juega con cada otro.',
      'Brindar en una mesa: cada uno choca la copa con cada uno.',
    ],
  },
}
const OPTIONS = ['Lo mismo', 'Un paso más', 'El doble', 'Cuatro veces más']
const randomSize = () => 6 + Math.floor(Math.random() * 3) // 6 to 8 cards; then twice as many

function SuitIcon({ suit }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.suit} data-suit={suit} aria-hidden="true">
      {suit === 'oros' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
        </>
      )}
      {suit === 'copas' && <path d="M6 5h12c0 5-3 8-6 8s-6-3-6-8zM12 13v5M8 19h8" />}
      {suit === 'espadas' && <path d="M12 3v14M8 17h8M12 17v4M10 5l2-2 2 2" />}
      {/* A knotty stick, wider at the top */}
      {suit === 'bastos' && <path d="M10.5 21 9 6.5a3 3 0 0 1 6 0L13.5 21zM9.3 10h2M12.7 13.5h2" />}
    </svg>
  )
}

function Card({ card, up, state }) {
  return (
    <span className={styles.card} data-up={up || undefined} data-state={state}>
      <span className={styles.cardInner}>
        <span className={styles.back} />
        <span className={styles.face}>
          <span className={styles.number}>{card.number}</span>
          <SuitIcon suit={card.suit} />
        </span>
      </span>
    </span>
  )
}

export function CardTable() {
  const reduce = useReducedMotion()
  const [taskKey, setTaskKey] = useState('count')
  const [small, setSmall] = useState(8)
  const [deck, setDeck] = useState(() => dealFor('count', 8))
  const [done, setDone] = useState(0)
  const [phase, setPhase] = useState('ready') // ready -> running -> asking -> running -> finished
  const [guess, setGuess] = useState(null)
  const [firstCount, setFirstCount] = useState(null)
  const [example, setExample] = useState(0)
  const task = TASKS[taskKey]
  const moves = useMemo(() => task.moves(deck), [task, deck])
  const total = moves.length
  const n = deck.length

  // One move every msPerMove; the next phase is decided when the last one lands
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
      reduce ? 0 : task.msPerMove,
    )
    return () => window.clearTimeout(timer)
  }, [phase, done, total, n, small, task.msPerMove, reduce])

  const reset = (key) => {
    const size = randomSize()
    setTaskKey(key)
    setSmall(size)
    setDeck(dealFor(key, size))
    setDone(0)
    setGuess(null)
    setFirstCount(null)
    setPhase('ready')
  }
  const predict = (option) => {
    setGuess(option)
    setDeck(dealFor(taskKey, small * 2))
    setDone(0)
    setPhase('running')
  }

  const move = done > 0 ? moves[done - 1] : null
  const stateOf = (i) => {
    if (!move) return undefined
    if (move.found?.includes(i)) return 'found'
    if (move.focus.includes(i)) return 'focus'
    if (move.out?.includes(i)) return 'out'
    return undefined
  }
  const caption = move?.say ?? task.lead?.(deck) ?? `Hay ${n} cartas en la mesa.`

  return (
    <div className={lesson.figure}>
      <div className={bigO.tabs} role="group" aria-label="Tarea">
        {Object.entries(TASKS).map(([key, t]) => (
          <button key={key} type="button" className={bigO.tab} aria-pressed={key === taskKey} onClick={() => reset(key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tableRow}>
        <div className={styles.tableColumn}>
          <div className={styles.table} role="img" aria-label={`${n} cartas. ${caption}`}>
            {deck.map((card, i) => (
              <Card key={`${i}-${card.suit}-${card.number}`} card={card} up={move?.up.includes(i)} state={stateOf(i)} />
            ))}
          </div>
          {taskKey === 'sorted' && (
            <p className={styles.axis} aria-hidden="true">
              <span>menor</span>
              <span className={styles.axisLine} />
              <span>mayor</span>
            </p>
          )}
        </div>
        {task.target && (
          <div className={styles.target}>
            <span className={styles.targetLabel}>Buscás</span>
            <span className={styles.targetCard}>{task.target(deck).number}</span>
            <span className={styles.targetNote}>de cualquier palo</span>
          </div>
        )}
      </div>

      <div className={styles.status}>
        <p className={bigO.counter}>
          <span className={bigO.counterValue}>{done}</span>
          <span className={bigO.counterLabel}>movimientos · {n} cartas</span>
        </p>
        <p className={bigO.caption} aria-live="polite">{caption}</p>
      </div>

      {phase === 'ready' && (
        <button type="button" className={bigO.run} onClick={() => setPhase('running')}>
          {task.label} con {small} cartas
        </button>
      )}

      {phase === 'asking' && (
        <div className={bigO.ask}>
          <p className={bigO.askPrompt}>Ahora son {small * 2} cartas, el doble. ¿Cuánto más va a tardar?</p>
          <div className={bigO.orderOptions}>
            {OPTIONS.map((option) => (
              <button key={option} type="button" className={bigO.orderOption} onClick={() => predict(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div className={bigO.result}>
          <p className={bigO.resultLine} data-right={guess === task.answer}>
            {guess === task.answer ? '¡Bien predicho! ' : `Era «${task.answer.toLowerCase()}». `}
            {small} cartas: {firstCount} {firstCount === 1 ? 'movimiento' : 'movimientos'}. {small * 2} cartas: {total}. Eso es{' '}
            <strong className={lesson.mono}>{task.order}</strong>.
          </p>
          <button type="button" className={bigO.again} onClick={() => reset(taskKey)}>
            Otra vez, con otro mazo
          </button>
        </div>
      )}

      <p className={lesson.daily}>
        <span className={lesson.dailyTag}>En el día a día, {task.order}</span>
        <span>{task.daily[example % task.daily.length]}</span>
        <button type="button" className={bigO.another} onClick={() => setExample((e) => e + 1)}>
          <Icon name="restart" size={14} /> Otro ejemplo
        </button>
      </p>
    </div>
  )
}
