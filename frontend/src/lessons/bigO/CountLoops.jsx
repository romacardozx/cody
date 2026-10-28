import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { javaTokens } from '../../lib/highlight.js'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * "Count the laps": four short Java fragments, and the reader guesses each one's order before
 * seeing why. The fragments are the four shapes that cover most of what comes later.
 */

const OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)']

const SNIPPETS = [
  {
    code: ['int first = list[0];'],
    answer: 'O(1)',
    why: 'Una sola operación, sea la lista de 10 o de un millón: no hay ninguna vuelta que dependa de n.',
  },
  {
    code: ['int sum = 0;', 'for (int i = 0; i < n; i++) {', '  sum += list[i];', '}'],
    answer: 'O(n)',
    why: 'Una vuelta por elemento: si la lista se duplica, las vueltas se duplican.',
  },
  {
    code: [
      'for (int i = 0; i < n; i++) {',
      '  for (int j = 0; j < n; j++) {',
      '    if (i != j && list[i] == list[j]) repeated = true;',
      '  }',
      '}',
    ],
    answer: 'O(n²)',
    why: 'Por cada una de las n vueltas de afuera, el de adentro da otras n: n × n. Bucles anidados multiplican.',
  },
  {
    code: ['while (n > 1) {', '  n = n / 2;', '  steps++;', '}'],
    answer: 'O(log n)',
    why: 'Cada vuelta parte n a la mitad: de un millón llega a 1 en unas 20 vueltas. Es lo que hace la búsqueda binaria.',
  },
]

function Code({ lines }) {
  return (
    <pre className={styles.code}>
      {lines.map((line, i) => (
        <span key={i} className={styles.codeLine}>
          {javaTokens(line).map(([kind, text], k) =>
            kind === 'plain' ? text : <span key={k} className={styles[`tok_${kind}`]}>{text}</span>,
          )}
        </span>
      ))}
    </pre>
  )
}

function Snippet({ snippet, number }) {
  const [choice, setChoice] = useState(null)
  const answered = choice !== null
  const right = choice === snippet.answer
  return (
    <li className={styles.snippet}>
      <span className={styles.snippetNumber} aria-hidden="true">{number}</span>
      <Code lines={snippet.code} />
      <div className={styles.snippetSide}>
        <div className={styles.orderOptions} role="group" aria-label={`Orden del fragmento ${number}`}>
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.orderOption}
              disabled={answered}
              data-state={
                !answered ? undefined : option === snippet.answer ? 'right' : option === choice ? 'wrong' : 'faded'
              }
              onClick={() => setChoice(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {answered && (
          <p className={styles.why} data-right={right}>
            <Icon name={right ? 'check' : 'close'} size={17} />
            <span>
              {right ? '' : `Es ${snippet.answer}. `}
              {snippet.why}
            </span>
          </p>
        )}
      </div>
    </li>
  )
}

export function CountLoops() {
  return (
    <ol className={`${lesson.figure} ${styles.snippets}`}>
      {SNIPPETS.map((snippet, i) => (
        <Snippet key={i} snippet={snippet} number={i + 1} />
      ))}
    </ol>
  )
}
