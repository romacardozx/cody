import { AnimatePresence, motion } from 'motion/react'
import styles from './Panels.module.css'

/** Parses a list printed by Java ("[B, C]") into its items. */
function parseList(value) {
  const inner = value.trim().replace(/^\[|\]$/g, '').trim()
  return inner ? inner.split(',').map((item) => item.trim()) : []
}

// What each variable means, read by screen readers and shown on hover
const MEANING = {
  cola: 'Nodos descubiertos que esperan su turno',
  u: 'Nodo que se está procesando',
  v: 'Vecino de u que se está mirando',
}

/**
 * Algorithm variables. Lists (like BFS's queue) are drawn as chips that slide in and out, with
 * where they leave and where they enter, so FIFO is visible and not just readable.
 *
 * While a prediction is pending, lists are concealed: showing the queue in order would hand over
 * the answer instead of making the user remember how it was built.
 */
export function VariablesPanel({ variables, labelOf, conceal }) {
  const entries = Object.entries(variables ?? {})
  return (
    <section className={styles.panel} aria-labelledby="variables-title">
      <h2 id="variables-title" className={styles.panelTitle}>Variables</h2>
      {entries.length === 0 && <p className={styles.muted}>Todavía no hay variables.</p>}
      <dl className={styles.vars}>
        {entries.map(([name, value]) => {
          const isList = value.startsWith('[')
          const items = isList ? parseList(value) : []
          return (
            <div key={name} className={styles.var}>
              <dt className={styles.varName} title={MEANING[name]}>{name}</dt>
              <dd className={styles.varValue}>
                {isList && conceal ? (
                  <div className={styles.concealed} aria-label={`${name}: oculta hasta que respondas`}>
                    {items.map((id) => <span key={id} className={styles.concealedItem} aria-hidden="true">?</span>)}
                    <span className={styles.concealedNote}>se revela al responder</span>
                  </div>
                ) : isList ? (
                  <>
                    <ol className={styles.queue} aria-label={`${name}: ${items.map(labelOf).join(', ') || 'vacía'}`}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {items.map((id) => (
                          <motion.li
                            key={id}
                            layout
                            className={styles.queueItem}
                            initial={{ opacity: 0, x: 16, scale: 0.85 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -16, scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                          >
                            {labelOf(id)}
                          </motion.li>
                        ))}
                      </AnimatePresence>
                      {items.length === 0 && <li className={styles.queueEmpty}>vacía</li>}
                    </ol>
                    {items.length > 0 && (
                      <div className={styles.queueEnds} aria-hidden="true">
                        <span>← sale por acá</span>
                        <span>entra por acá →</span>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.span
                    key={value}
                    className={`${styles.scalar} ${name === 'u' ? '' : styles.scalarSoft}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                  >
                    {labelOf(value)}
                  </motion.span>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}
