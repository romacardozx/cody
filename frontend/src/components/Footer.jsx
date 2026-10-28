import { API_DOCS_URL, REPOSITORY_URL } from '../lib/links.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import { NeuralField } from './NeuralField.jsx'
import styles from './Footer.module.css'

/**
 * The last sector, small and calm: the university, the site, the project. A field of drifting
 * dots behind it is the only detail.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <NeuralField />
      <div className={styles.inner}>
        <div className={styles.institution}>
          <span role="img" aria-label="Universidad Nacional de San Martín" className={styles.unsam} />
          <p className={styles.course}>
            Trabajo Práctico Integrador · Programación III
            <br />
            Escuela de Ciencia y Tecnología · 2026
          </p>
        </div>

        <nav className={styles.links} aria-label="Explorar">
          <Link to="/#algoritmos" className={styles.link}>Algoritmos</Link>
          <Link to="/#como-funciona" className={styles.link}>Cómo funciona</Link>
          <Link to="/history" className={styles.link}>Historial</Link>
        </nav>

        <nav className={styles.links} aria-label="El proyecto">
          <a href={REPOSITORY_URL} className={styles.link} target="_blank" rel="noreferrer">
            <Icon name="github" size={15} /> GitHub <Icon name="external" size={14} className={styles.out} />
          </a>
          <a href={API_DOCS_URL} className={styles.link} target="_blank" rel="noreferrer">
            API (Swagger) <Icon name="external" size={14} className={styles.out} />
          </a>
        </nav>

        <p className={styles.tagline}>Hecho para pensar, no para mirar.</p>
      </div>
    </footer>
  )
}
