import { useTheme } from '../hooks/useTheme.js'
import { useLocation } from '../lib/router.js'
import { Link } from './Link.jsx'
import { Icon } from './Icon.jsx'
import { Logo } from './Logo.jsx'
import styles from './Header.module.css'

export function Header() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const onHome = pathname === '/'

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Cody, ir al inicio">
          <Logo />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <Link to="/" className={styles.navLink} aria-current={onHome ? 'page' : undefined}>
            Algoritmos
          </Link>
          <Link to="/#como-funciona" className={styles.navLink}>
            Cómo funciona
          </Link>
          <Link to="/history" className={styles.navLink} aria-current={pathname === '/history' ? 'page' : undefined}>
            Historial
          </Link>
          <span className={styles.navSoon} title="Llega con el editor de escenarios">
            Mis escenarios <span className={styles.soon}>pronto</span>
          </span>
        </nav>

        <button
          type="button"
          className={`${styles.iconButton} ${styles.themeButton}`}
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
          title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  )
}
