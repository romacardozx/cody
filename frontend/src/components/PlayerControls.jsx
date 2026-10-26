import { Icon } from './Icon.jsx'
import styles from './PlayerControls.module.css'

const SPEEDS = [0.5, 1, 2]

export function PlayerControls({ playing, onTogglePlay, onPrev, onNext, onRestart, canPrev, canNext, speed, onSpeed, blocked }) {
  return (
    <div className={styles.controls}>
      <div className={styles.transport}>
        <button type="button" className={styles.button} onClick={onRestart} aria-label="Empezar de nuevo" title="Empezar de nuevo">
          <Icon name="restart" />
        </button>
        <button type="button" className={styles.button} onClick={onPrev} disabled={!canPrev} aria-label="Paso anterior" title="Paso anterior (←)">
          <Icon name="prev" size={20} />
        </button>
        <button
          type="button"
          className={styles.play}
          onClick={onTogglePlay}
          disabled={!playing && !canNext}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          title={blocked ? 'Respondé la pregunta para seguir' : playing ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={22} />
        </button>
        <button type="button" className={styles.button} onClick={onNext} disabled={!canNext} aria-label="Paso siguiente" title="Paso siguiente (→)">
          <Icon name="next" size={20} />
        </button>
      </div>

      <div className={styles.speed} role="radiogroup" aria-label="Velocidad">
        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={speed === value}
            className={styles.speedOption}
            onClick={() => onSpeed(value)}
          >
            {value}×
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * One cell per step of the whole trace. Received steps can be jumped to; question steps carry a
 * marker; steps the server has not sent yet are locked (they exist, but cannot be seen).
 */
export function StepTrack({ total, steps, cursor, answers, onGo }) {
  const cells = Array.from({ length: total }, (_, i) => steps[i] ?? null)
  return (
    <div className={styles.track} role="group" aria-label={`Paso ${cursor + 1} de ${total}`}>
      {cells.map((step, i) => {
        if (!step) {
          return <span key={i} className={`${styles.cell} ${styles.locked}`} aria-hidden="true" />
        }
        const question = step.question
        const result = question ? answers[question.id] : null
        const className = [
          styles.cell,
          i < cursor ? styles.past : '',
          i === cursor ? styles.current : '',
          question ? styles.question : '',
          result?.status === 'done' ? (result.correct ? styles.ok : styles.bad) : '',
        ].join(' ')
        return (
          <button
            key={i}
            type="button"
            className={className}
            onClick={() => onGo(i)}
            aria-label={`Ir al paso ${i + 1}${question ? ' (pregunta)' : ''}`}
            aria-current={i === cursor ? 'step' : undefined}
          />
        )
      })}
    </div>
  )
}
