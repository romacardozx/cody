import { GLOSSARY } from '../lib/glossary.js'
import styles from './Panels.module.css'

/** Always-visible glossary next to the animation: the words the explanations use, one tap away. */
export function GlossaryPanel() {
  return (
    <section className={styles.panel} aria-labelledby="glossary-panel-title">
      <h2 id="glossary-panel-title" className={styles.panelTitle}>Glosario</h2>
      <p className={styles.glossaryHint}>
        Las palabras subrayadas en las explicaciones también muestran su significado al pasar el mouse o tocarlas.
      </p>
      <div className={styles.glossaryList}>
        {GLOSSARY.map((entry) => (
          <details key={entry.term} className={styles.glossaryItem}>
            <summary>{entry.term}</summary>
            <p>{entry.definition}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
