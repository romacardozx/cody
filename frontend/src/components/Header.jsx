import { useRef } from 'react'
import { useHotkeys } from '../hooks/useHotkeys.js'
import { useTheme } from '../hooks/useTheme.js'
import { navigate, useLocation } from '../lib/router.js'
import { Link } from './Link.jsx'
import { Icon } from './Icon.jsx'
import { Logo } from './Logo.jsx'
import styles from './Header.module.css'

export function Header() {
  const { pathname, query } = useLocation()
  const { theme, toggle } = useTheme()
  const search = useRef(null)
  const onHome = pathname === '/'

  useHotkeys({ 'mod+k': () => search.current?.focus() })

  function onSearch(event) {
    const value = event.target.value
    const target = value ? `/?q=${encodeURIComponent(value)}` : '/'
    // Typing replaces history entries; jumping from another page adds one
    navigate(target, { replace: onHome, scroll: !onHome })
    if (!onHome) requestAnimationFrame(() => document.getElementById('algoritmos')?.scrollIntoView())
  }

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
          <a href="/#como-funciona" className={styles.navLink} onClick={(e) => {
            if (onHome) return
            e.preventDefault()
            navigate('/')
            requestAnimationFrame(() => document.getElementById('como-funciona')?.scrollIntoView())
          }}>
            Cómo funciona
          </a>
          <span className={styles.navSoon} title="Llega con el editor de escenarios">
            Mis escenarios <span className={styles.soon}>pronto</span>
          </span>
        </nav>

        <label className={styles.search}>
          <Icon name="search" size={16} />
          <span className="visually-hidden">Buscar algoritmos</span>
          <input
            ref={search}
            type="search"
            placeholder="Buscar algoritmo…"
            value={onHome ? query.get('q') ?? '' : ''}
            onChange={onSearch}
          />
          <kbd>Ctrl K</kbd>
        </label>

        <button
          type="button"
          className={styles.iconButton}
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
