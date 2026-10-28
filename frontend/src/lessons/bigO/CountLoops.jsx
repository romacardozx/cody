import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { javaTokens } from '../../lib/highlight.js'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * "Count the laps" with faded worked examples: the first fragment comes solved, with a note on the
 * line that counts; the second gives half of the reasoning; the last two are the reader's, one of
 * them the classic trap (contains inside a loop). Each fragment is something from daily life.
 */

const OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n²)']

const SNIPPETS = [
  {
    mode: 'worked',
    title: 'Pasar lista',
    code: ['for (Student student : students) {', '  attendance.mark(student);', '}'],
    notes: { 0: 'una vuelta por alumno: n' },
    answer: 'O(n)',
    why: 'Una vuelta por alumno. Si el curso se duplica, las vueltas se duplican.',
  },
  {
    mode: 'guided',
    title: 'Buscar nombres repetidos',
    code: [
      'for (int i = 0; i < n; i++) {',
      '  for (int j = i + 1; j < n; j++) {',
      '    if (names[i].equals(names[j])) repeated = true;',
      '  }',
      '}',
    ],
    notes: { 0: 'n vueltas', 1: '¿y por cada una?' },
    answer: 'O(n²)',
    why: 'Por cada una de las n vueltas de afuera, el de adentro da hasta n más: n × n.',
  },
  {
    mode: 'solo',
    title: 'Adivinar el número',
    code: ['while (left < right) {', '  int middle = (left + right) / 2;', '  if (target > middle) left = middle + 1;', '  else right = middle;', '}'],
    answer: 'O(log n)',
    why: 'Cada vuelta descarta la mitad: de 100 posibles quedan 50, 25, 12… En 7 vueltas queda uno.',
  },
  {
    mode: 'solo',
    title: '¿Quién de los inscriptos está en la lista de espera?',
    code: [
      'List<String> waitlist = loadWaitlist();',
      'for (String name : enrolled) {',
      '  if (waitlist.contains(name)) notify(name);',
      '}',
    ],
    answer: 'O(n²)',
    why: 'Trampa: contains en una List recorre toda la lista, es un bucle escondido. Con un HashSet, contains es O(1) y todo queda O(n).',
  },
]

const MODE_LABEL = { worked: 'Resuelto', guided: 'Juntos', solo: 'Vos' }

function Code({ lines, notes = {} }) {
  return (
    <pre className={styles.code}>
      {lines.map((line, i) => (
        <span key={i} className={styles.codeLine}>
          {javaTokens(line).map(([kind, text], k) =>
            kind === 'plain' ? text : <span key={k} className={styles[`tok_${kind}`]}>{text}</span>,
          )}
          {notes[i] && <span className={styles.note}>{notes[i]}</span>}
        </span>
      ))}
    </pre>
  )
}

function Snippet({ snippet }) {
  const worked = snippet.mode === 'worked'
  const [choice, setChoice] = useState(worked ? snippet.answer : null)
  const answered = choice !== null
  const right = choice === snippet.answer
  return (
    <li className={styles.snippet}>
      <p className={styles.snippetTitle}>
        <span className={styles.mode} data-mode={snippet.mode}>{MODE_LABEL[snippet.mode]}</span>
        {snippet.title}
      </p>
      <Code lines={snippet.code} notes={snippet.notes} />
      <div className={styles.orderOptions} role="group" aria-label={`Orden de «${snippet.title}»`}>
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.orderOption}
            disabled={answered}
            data-state={!answered ? undefined : option === snippet.answer ? 'right' : option === choice ? 'wrong' : 'faded'}
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
            {right || worked ? '' : `Es ${snippet.answer}. `}
            {snippet.why}
          </span>
        </p>
      )}
    </li>
  )
}

export function CountLoops() {
  return (
    <ol className={`${lesson.figure} ${styles.snippets}`}>
      {SNIPPETS.map((snippet) => (
        <Snippet key={snippet.title} snippet={snippet} />
      ))}
    </ol>
  )
}
