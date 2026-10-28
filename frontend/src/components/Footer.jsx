import { API_DOCS_URL, REPOSITORY_URL } from '../lib/links.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import { Logo } from './Logo.jsx'
import styles from './Footer.module.css'

/**
 * The last sector, kept calm: where to go next, the project behind the app and the university it
 * was made for, and a closing line with Cody's logo.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <nav className={styles.column} aria-label="Explorar">
          <h2 className={styles.heading}>Explorar</h2>
          <Link to="/#algoritmos" className={styles.link}>Algoritmos</Link>
          <Link to="/#como-funciona" className={styles.link}>Cómo funciona</Link>
          <Link to="/history" className={styles.link}>Historial</Link>
        </nav>

        <nav className={styles.column} aria-label="El proyecto">
          <h2 className={styles.heading}>El proyecto</h2>
          <a href={REPOSITORY_URL} className={styles.link} target="_blank" rel="noreferrer">
            <Icon name="github" size={16} /> Código en GitHub <Icon name="external" size={15} className={styles.out} />
          </a>
          <a href={API_DOCS_URL} className={styles.link} target="_blank" rel="noreferrer">
            API documentada (Swagger) <Icon name="external" size={15} className={styles.out} />
          </a>
        </nav>

        <div className={styles.column}>
          <span role="img" aria-label="Universidad Nacional de San Martín" className={styles.unsam} />
          <p className={styles.course}>
            Trabajo Práctico Integrador de Programación III
            <br />
            Escuela de Ciencia y Tecnología · 2026
          </p>
        </div>
      </div>

      <div className={styles.closing}>
        <Logo />
        <p className={styles.tagline}>Hecho para pensar, no para mirar.</p>
      </div>
    </footer>
  )
}
