import { useEffect, useState } from 'react'
import { getAlgorithms, getHistory, getSessionDetail } from '../api/cody.js'
import { Icon } from '../components/Icon.jsx'
import { Link } from '../components/Link.jsx'
import { RichText } from '../components/RichText.jsx'
import styles from './HistoryPage.module.css'

const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Every past walk of this browser, stored in the database: the score and, inside each one, every
 * prediction with the right answer and why. Mistakes can be reviewed any time, not only while the
 * animation runs.
 */
export default function HistoryPage() {
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState(null)
  const [names, setNames] = useState({})
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    getHistory()
      .then((list) => alive && setSessions(list))
      .catch((e) => alive && setError(e))
    getAlgorithms()
      .then((list) => alive && setNames(Object.fromEntries(list.map((a) => [a.code, a.name]))))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [attempt])

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Historial</h1>
      <p className={styles.lead}>
        Cada recorrido que hiciste en este navegador, con tus predicciones y la explicación de cada una.
        Abrí uno para repasar en qué te equivocaste.
      </p>

      {error ? (
        <div className={styles.message} role="alert">
          <p>{error.message}</p>
          <button type="button" className={styles.button} onClick={() => { setError(null); setAttempt((n) => n + 1) }}>
            Reintentar
          </button>
        </div>
      ) : sessions === null ? (
        <div className={styles.list} aria-busy="true" aria-label="Cargando historial">
          {[0, 1, 2].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.message}>
          <p>Todavía no hiciste ningún recorrido.</p>
          <Link to="/algorithms/BFS" className={styles.primary}>Empezar con BFS <Icon name="arrow" size={16} /></Link>
        </div>
      ) : (
        <ol className={styles.list}>
          {sessions.map((session, i) => (
            <SessionRow key={session.id} session={session} name={names[session.algorithmCode] ?? session.algorithmCode} openFirst={i === 0} />
          ))}
        </ol>
      )}
    </main>
  )
}

function SessionRow({ session, name, openFirst }) {
  const [open, setOpen] = useState(openFirst)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState(null)
  const asked = session.correctCount + session.wrongCount

  useEffect(() => {
    if (!open || detail) return
    let alive = true
    getSessionDetail(session.id)
      .then((d) => alive && setDetail(d))
      .catch((e) => alive && setError(e))
    return () => {
      alive = false
    }
  }, [open, detail, session.id])

  return (
    <li className={styles.row}>
      <button type="button" className={styles.rowHead} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={styles.rowMain}>
          <span className={styles.rowTitle}>{name}</span>
          <span className={styles.rowMeta}>
            {session.scenarioName} · {dateFormat.format(new Date(session.startedAt))}
            {!session.finishedAt && ' · sin terminar'}
          </span>
        </span>
        <span className={styles.score} aria-label={`${session.correctCount} aciertos, ${session.wrongCount} errores`}>
          <span className={styles.ok}>{session.correctCount} <Icon name="check" size={15} /></span>
          <span className={styles.bad}>{session.wrongCount} <Icon name="close" size={15} /></span>
        </span>
        <span className={styles.chevron} aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className={styles.rowBody}>
          {error ? (
            <p className={styles.muted}>{error.message}</p>
          ) : !detail ? (
            <p className={styles.muted}>Cargando predicciones…</p>
          ) : asked === 0 ? (
            <p className={styles.muted}>En este recorrido no respondiste ninguna pregunta.</p>
          ) : (
            <ol className={styles.predictions}>
              {detail.predictions.map((p) => (
                <li key={`${p.stepNumber}`} className={`${styles.prediction} ${p.correct ? styles.predictionOk : styles.predictionBad}`}>
                  <span className={styles.mark}>
                    <Icon name={p.correct ? 'check' : 'close'} size={16} />
                  </span>
                  <div className={styles.predictionBody}>
                    <p className={styles.predictionHead}>
                      <span className={styles.step}>Paso {p.stepNumber}</span>
                      {p.prompt}
                    </p>
                    <p className={styles.answer}>
                      {p.correct ? (
                        <>Respondiste <strong>{p.choice}</strong>: correcto.</>
                      ) : (
                        <>Respondiste <strong>{p.choice}</strong>, pero era <strong>{p.correctAnswer}</strong>.</>
                      )}
                    </p>
                    {!p.correct && p.choiceFeedback && <p className={styles.why}><RichText>{p.choiceFeedback}</RichText></p>}
                    <p className={styles.why}><RichText>{p.explanation}</RichText></p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <Link to={`/algorithms/${session.algorithmCode}`} className={styles.again}>
            <Icon name="restart" size={15} /> Volver a intentarlo
          </Link>
        </div>
      )}
    </li>
  )
}
