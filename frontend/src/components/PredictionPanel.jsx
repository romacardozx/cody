import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon.jsx'
import { RichText } from './RichText.jsx'
import styles from './PredictionPanel.module.css'

const optionMotion = {
  hidden: { opacity: 0, y: 8 },
  shown: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i, type: 'spring', stiffness: 420, damping: 30 } }),
}

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
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      <div className={styles.head}>
        <span className={styles.badge}>
          <Icon name="question" size={18} /> Tu predicción
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
            <motion.button
              key={option}
              type="button"
              className={className}
              disabled={Boolean(answer)}
              aria-pressed={chosen}
              onClick={() => onAnswer(option)}
              custom={i}
              variants={optionMotion}
              initial="hidden"
              animate="shown"
              whileTap={answer ? undefined : { scale: 0.95 }}
            >
              <kbd className={styles.key}>{i + 1}</kbd>
              <span className={styles.optionLabel}>{labelOf(option)}</span>
              {chosen && pending && <span className={styles.spinner} aria-label="Comprobando" />}
              {isCorrect && <Icon name="check" size={20} />}
              {isWrongChoice && <Icon name="close" size={20} />}
            </motion.button>
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

/**
 * Result of the last prediction, shown on the step that reveals the answer. It stays until the
 * user moves on, and explains why: what was right and, if wrong, what was off in their choice.
 */
export function Feedback({ answer, labelOf, onContinue, canContinue }) {
  const ok = answer.correct
  return (
    <motion.section
      className={`${styles.feedback} ${ok ? styles.feedbackOk : styles.feedbackBad}`}
      role="status"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <motion.span
        className={styles.feedbackIcon}
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 18, delay: 0.05 }}
      >
        <Icon name={ok ? 'check' : 'close'} size={20} />
      </motion.span>
      <div className={styles.feedbackBody}>
        <p className={styles.feedbackTitle}>
          {ok ? `¡Bien predicho! Era ${labelOf(answer.correctAnswer)}.` : `Elegiste ${labelOf(answer.choice)}, pero era ${labelOf(answer.correctAnswer)}.`}
        </p>
        {!ok && answer.choiceFeedback && (
          <p className={styles.feedbackText}><RichText>{answer.choiceFeedback}</RichText></p>
        )}
        <p className={styles.feedbackText}><RichText>{answer.explanation}</RichText></p>
      </div>
      {canContinue && (
        <button type="button" className={styles.continue} onClick={onContinue}>
          Seguir <Icon name="next" size={18} />
        </button>
      )}
    </motion.section>
  )
}
