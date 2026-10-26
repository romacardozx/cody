import { useId, useState } from 'react'
import { splitTerms } from '../lib/glossary.js'
import styles from './RichText.module.css'

/**
 * Text where glossary terms ("FIFO", "cola", ...) can be hovered, focused or tapped to read what
 * they mean. Nobody should be stuck on a word the explanation takes for granted.
 */
export function RichText({ children }) {
  if (typeof children !== 'string') return children
  return splitTerms(children).map((part, i) =>
    typeof part === 'string' ? part : <Term key={i} text={part.text} entry={part.entry} />,
  )
}

function Term({ text, entry }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <span className={styles.wrap} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={styles.term}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
      >
        {text}
      </button>
      <span role="tooltip" id={id} className={`${styles.tip} ${open ? styles.open : ''}`}>
        <strong className={styles.tipTerm}>{entry.term}</strong>
        {entry.definition}
      </span>
    </span>
  )
}
