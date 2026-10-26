import styles from './Logo.module.css'

/** Wordmark: the "o" is a graph node with the vermillion prediction dot inside. */
export function Logo() {
  return (
    <span className={styles.logo} aria-label="Cody">
      <span aria-hidden="true">c</span>
      <svg className={styles.node} viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle className={styles.dot} cx="10" cy="10" r="2.8" />
      </svg>
      <span aria-hidden="true">dy</span>
    </span>
  )
}
