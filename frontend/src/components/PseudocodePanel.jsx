import { motion } from 'motion/react'
import styles from './Panels.module.css'

// The pseudocode is Spanish, so a general-purpose highlighter would not know its keywords
const KEYWORDS = new Set(['mientras', 'para', 'cada', 'si', 'sino', 'fin', 'de', 'no', 'y', 'o', 'en'])
// Splits into words, the assignment arrow and calls like "desencolar()", keeping the separators
const TOKENS = /([\p{L}\p{N}_]+\([^)]*\)|[\p{L}]+|←)/u

function highlight(line) {
  return line.split(TOKENS).filter(Boolean).map((part, i) => {
    if (KEYWORDS.has(part)) return <span key={i} className={styles.kw}>{part}</span>
    if (part === '←') return <span key={i} className={styles.op}>{part}</span>
    if (/\w+\(/.test(part)) return <span key={i} className={styles.fn}>{part}</span>
    return part
  })
}

/** Pseudocode with the current line marked; the marker slides between lines. */
export function PseudocodePanel({ lines, activeLine }) {
  return (
    <section className={styles.panel} aria-labelledby="pseudocode-title">
      <h2 id="pseudocode-title" className={styles.panelTitle}>Pseudocódigo</h2>
      <ol className={styles.code}>
        {lines.map((line, i) => {
          const active = i + 1 === activeLine
          return (
            <li key={i} className={`${styles.codeLine} ${active ? styles.codeLineActive : ''}`} aria-current={active ? 'step' : undefined}>
              {active && (
                <motion.span
                  layoutId="active-line"
                  className={styles.codeMarker}
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              )}
              <span className={styles.lineNumber}>{i + 1}</span>
              <code className={styles.lineText}>{highlight(line)}</code>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
