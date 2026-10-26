import { useState } from 'react'
import { motion } from 'motion/react'
import { javaTokens, pseudocodeTokens } from '../lib/highlight.js'
import styles from './CodePanel.module.css'

/**
 * Pseudocode and Java in tabs. Both highlight the same instruction: steps point to a pseudocode
 * line and `javaLines` says which Java line it corresponds to.
 */
export function CodePanel({ pseudocode, javaCode, javaLines, activeLine }) {
  const [tab, setTab] = useState('pseudo')
  const hasJava = javaCode?.length > 0
  const showJava = tab === 'java' && hasJava

  return (
    <section className={styles.panel} aria-label="Código">
      <div className={styles.tabs} role="tablist" aria-label="Lenguaje">
        <Tab id="pseudo" current={tab} onSelect={setTab}>Pseudocódigo</Tab>
        {hasJava && <Tab id="java" current={tab} onSelect={setTab}>Java</Tab>}
      </div>

      <div role="tabpanel" id={`code-${tab}`} aria-labelledby={`tab-${tab}`}>
        {showJava ? (
          <Listing lines={javaCode} tokenize={javaTokens} activeLine={activeLine ? javaLines?.[activeLine - 1] : undefined} java />
        ) : (
          <Listing lines={pseudocode} tokenize={pseudocodeTokens} activeLine={activeLine} />
        )}
      </div>
    </section>
  )
}

function Tab({ id, current, onSelect, children }) {
  const selected = current === id
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`code-${id}`}
      className={styles.tab}
      onClick={() => onSelect(id)}
    >
      {children}
      {selected && <motion.span layoutId="code-tab" className={styles.tabMarker} transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
    </button>
  )
}

function Listing({ lines, tokenize, activeLine, java = false }) {
  return (
    <ol className={`${styles.code} ${java ? styles.java : ''}`}>
      {lines.map((line, i) => {
        const active = i + 1 === activeLine
        return (
          <li key={i} className={`${styles.line} ${active ? styles.lineActive : ''}`} aria-current={active ? 'step' : undefined}>
            {active && (
              <motion.span
                layoutId={java ? 'active-java' : 'active-pseudo'}
                className={styles.marker}
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            )}
            <span className={styles.gutter} aria-hidden="true">{active ? '→' : i + 1}</span>
            <code className={styles.text}>
              {tokenize(line).map(([kind, text], k) =>
                kind === 'plain' ? text : <span key={k} className={styles[kind]}>{text}</span>,
              )}
            </code>
          </li>
        )
      })}
    </ol>
  )
}
