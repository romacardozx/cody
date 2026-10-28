import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'

/*
 * The notation in three rules, each as "what you count -> what you write", and the two warnings
 * people trip on most. Visual rows, no paragraphs.
 */

const RULES = [
  { from: '3n + 5', to: 'O(n)', rule: 'Las constantes no cuentan' },
  { from: 'n² + n', to: 'O(n²)', rule: 'Manda lo que más crece' },
  { from: 'un bucle dentro de otro', to: 'O(n · n)', rule: 'Anidados multiplican' },
]

const WARNINGS = [
  { title: 'O(1) no significa rápido', text: 'Significa que no crece: puede tardar un segundo, pero tarda lo mismo con 10 o con un millón.' },
  { title: 'El mejor caso no es el peor', text: 'Burbuja con la lista ya ordenada da una sola vuelta, O(n); desordenada, O(n²). Se habla del peor.' },
]

export function Rules() {
  return (
    <div className={lesson.figure}>
      <ol className={styles.rules}>
        {RULES.map((rule) => (
          <li key={rule.rule} className={styles.ruleRow}>
            <span className={styles.ruleFrom}>{rule.from}</span>
            <span className={styles.ruleArrow} aria-hidden="true">→</span>
            <span className={styles.ruleTo}>{rule.to}</span>
            <span className={styles.ruleName}>{rule.rule}</span>
          </li>
        ))}
      </ol>
      <ul className={styles.warnings}>
        {WARNINGS.map((warning) => (
          <li key={warning.title}>
            <strong>{warning.title}.</strong> {warning.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
