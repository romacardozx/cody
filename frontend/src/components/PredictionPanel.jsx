import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon.jsx'
import styles from './PredictionPanel.module.css'

/**
 * The prediction moment. The click is reflected instantly (optimistic): the chosen option is
 * locked and the others fade while the server checks it. Keys 1-9 pick an option.
 */
export function PredictionPanel({ question, answer, labelOf, onAnswer, error }) {
  const pending = answer?.status === 'pending'
  const done = answer?.status === 'done'
  const ref = useRef(null)

  // The question is the key moment: make sure it is on screen when it appears
  useEffect(() => {
    if (!answer) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [question.id, answer])

  return (
    <motion.section
      ref={ref}
      className={styles.panel}
      aria-labelledby="prediction-title"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className={styles.head}>
        <span className={styles.badge}>
          <Icon name="question" size={16} /> Tu predicción
        </span>
        {!answer && <span className={styles.hint}>Elegí una opción o tocá el nodo en el grafo</span>}
      </div>
      <h2 id="prediction-title" className={styles.prompt}>{question.prompt}</h2>

      <div className={styles.options} role="group" aria-label="Opciones">
        {question.options.map((option, i) => {
          const chosen = answer?.choice === option
          const isCorrect = done && answer.correctAnswer === option
          const isWrongChoice = done && chosen && !answer.correct
          const className = [
            styles.option,
            chosen ? styles.chosen : '',
            answer && !chosen && !isCorrect ? styles.faded : '',
            isCorrect ? styles.correct : '',
            isWrongChoice ? styles.wrong : '',
          ].join(' ')
          return (
            <button
              key={option}
              type="button"
              className={className}
              disabled={Boolean(answer)}
              aria-pressed={chosen}
              onClick={() => onAnswer(option)}
            >
              <kbd className={styles.key}>{i + 1}</kbd>
              <span className={styles.optionLabel}>{labelOf(option)}</span>
              {chosen && pending && <span className={styles.spinner} aria-label="Comprobando" />}
              {isCorrect && <Icon name="check" size={18} />}
              {isWrongChoice && <Icon name="close" size={18} />}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className={styles.error}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error.message} Probá de nuevo.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/** Result of the last prediction, shown on the step that reveals the answer. */
export function Feedback({ answer, labelOf }) {
  return (
    <motion.div
      className={`${styles.feedback} ${answer.correct ? styles.feedbackOk : styles.feedbackBad}`}
      role="status"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
    >
      <span className={styles.feedbackIcon}>
        <Icon name={answer.correct ? 'check' : 'close'} size={18} />
      </span>
      <p>
        <strong>{answer.correct ? '¡Bien predicho!' : 'Casi.'}</strong>{' '}
        {answer.correct
          ? `Era ${labelOf(answer.correctAnswer)}.`
          : `Elegiste ${labelOf(answer.choice)}, pero era ${labelOf(answer.correctAnswer)}. Fijate en el paso de abajo por qué.`}
      </p>
    </motion.div>
  )
}
