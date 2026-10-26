import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon.jsx'
import { RichText } from './RichText.jsx'
import styles from './Panels.module.css'

/**
 * Score and every prediction so far, with its explanation, so mistakes can be reviewed after the
 * animation moved on. Each entry can take the user back to the step where it was asked.
 */
export function HistoryPanel({ score, history, labelOf, onGo }) {
  return (
    <section className={styles.panel} aria-labelledby="history-title">
      <h2 id="history-title" className={styles.panelTitle}>Tus predicciones</h2>
      <div className={styles.score}>
        <div className={`${styles.scoreItem} ${styles.scoreOk}`}>
          <motion.span key={score.correct} className={styles.scoreValue} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {score.correct}
          </motion.span>
          <span className={styles.scoreLabel}>aciertos</span>
        </div>
        <div className={`${styles.scoreItem} ${styles.scoreBad}`}>
          <motion.span key={score.wrong} className={styles.scoreValue} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {score.wrong}
          </motion.span>
          <span className={styles.scoreLabel}>errores</span>
        </div>
      </div>

      {history.length === 0 ? (
        <p className={styles.muted}>Cuando respondas, cada predicción queda acá con su explicación para repasarla.</p>
      ) : (
        <ol className={styles.history}>
          <AnimatePresence initial={false}>
            {history.map((entry) => (
              <motion.li
                key={entry.questionId}
                className={styles.historyItem}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
                <details className={styles.historyDetails}>
                  <summary className={styles.historySummary}>
                    <span className={`${styles.historyMark} ${entry.correct ? styles.markOk : styles.markBad}`}>
                      <Icon name={entry.correct ? 'check' : 'close'} size={14} />
                    </span>
                    <span className={styles.historyText}>
                      <span className={styles.historyStep}>Paso {entry.stepIndex + 1}</span>
                      {entry.correct
                        ? <>Elegiste <strong>{labelOf(entry.choice)}</strong></>
                        : <>Elegiste <strong>{labelOf(entry.choice)}</strong>, era <strong>{labelOf(entry.correctAnswer)}</strong></>}
                    </span>
                  </summary>
                  <div className={styles.historyBody}>
                    {entry.question && <p className={styles.historyQuestion}>{entry.question.prompt}</p>}
                    {!entry.correct && entry.choiceFeedback && <p><RichText>{entry.choiceFeedback}</RichText></p>}
                    <p><RichText>{entry.explanation}</RichText></p>
                    <button type="button" className={styles.linkButton} onClick={() => onGo(entry.stepIndex)}>
                      Volver a ese paso
                    </button>
                  </div>
                </details>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </section>
  )
}
