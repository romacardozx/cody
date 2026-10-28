import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * Think of a number from 1 to 100: Cody always guesses the middle of what is left, so each answer
 * throws away half. It never needs more than 7 guesses. That is O(log n).
 */

const MAX = 100

export function GuessGame() {
  const [range, setRange] = useState([1, MAX])
  const [guesses, setGuesses] = useState(1)
  const [result, setResult] = useState(null) // 'found' | 'impossible'
  const [found, setFound] = useState(null)
  const [lo, hi] = range
  const guess = Math.floor((lo + hi) / 2)

  const answer = (direction) => {
    const next = direction === 'higher' ? [guess + 1, hi] : [lo, guess - 1]
    if (next[0] > next[1]) {
      setResult('impossible')
      return
    }
    setRange(next)
    setGuesses((g) => g + 1)
    // One number left: that one, no need to ask
    if (next[0] === next[1]) {
      setFound(next[0])
      setResult('found')
    }
  }
  const restart = () => {
    setRange([1, MAX])
    setGuesses(1)
    setResult(null)
    setFound(null)
  }
  const shown = found ?? guess

  return (
    <div className={lesson.figure}>
      <p className={styles.askPrompt}>Pensá un número del 1 al 100. Cody adivina: vos le decís si es más alto o más bajo.</p>
      <div className={styles.guess}>
        <div className={styles.guessHead}>
          <p className={styles.guessNumber}>
            {result === 'impossible' ? '¿?' : shown}
            <span className={styles.guessCount}>intento {guesses}</span>
          </p>
          {/* What is still possible, as a band over 1..100 */}
          <div className={styles.line} aria-hidden="true">
            <span className={styles.lineRange} style={{ left: `${((lo - 1) / MAX) * 100}%`, width: `${((hi - lo + 1) / MAX) * 100}%` }} />
            <span className={styles.lineGuess} style={{ left: `${((shown - 0.5) / MAX) * 100}%` }} />
          </div>
          <div className={styles.lineScale} aria-hidden="true">
            <span>1</span>
            <span>{MAX}</span>
          </div>
        </div>

        {!result && (
          <div className={styles.guessButtons}>
            <button type="button" className={styles.orderOption} onClick={() => answer('lower')}>Es más bajo</button>
            <button
              type="button"
              className={styles.orderOption}
              onClick={() => {
                setFound(guess)
                setResult('found')
              }}
            >
              ¡Es ese!
            </button>
            <button type="button" className={styles.orderOption} onClick={() => answer('higher')}>Es más alto</button>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <p className={styles.resultLine} data-right={result === 'found'}>
              {result === 'found'
                ? `Es el ${shown}: ${guesses} ${guesses === 1 ? 'intento' : 'intentos'}. Con 100 números nunca hacen falta más de 7; con un millón, 20.`
                : 'Ese número no existe: alguna respuesta no coincide. Probá de nuevo.'}
            </p>
            <button type="button" className={styles.again} onClick={restart}>
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>
      <p className={lesson.daily}>
        <span className={lesson.dailyTag}>En el día a día</span>
        Buscar una palabra en el diccionario: abrís al medio y descartás la mitad que no es.
      </p>
    </div>
  )
}
