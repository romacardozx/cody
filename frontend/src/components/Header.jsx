import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { REPOSITORY_URL } from '../lib/links.js'
import { useLocation } from '../lib/router.js'
import { Icon } from './Icon.jsx'
import { Link } from './Link.jsx'
import { Logo } from './Logo.jsx'
import styles from './Header.module.css'

const LINKS = [
  { to: '/#algoritmos', label: 'Algoritmos', current: (path) => path.startsWith('/categories') || path.startsWith('/algorithms') },
  { to: '/#como-funciona', label: 'Cómo funciona', current: () => false },
  { to: '/history', label: 'Historial', current: (path) => path.startsWith('/history') },
]

/**
 * A floating pill, detached from the top edge like the hero panel: see-through at the top of the
 * page, frosted once the page scrolls under it. On phones the links fold into a menu sheet.
 */
export function Header() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const sheet = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The menu closes on Escape and on any click outside it
  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    const onClick = (event) => !sheet.current?.contains(event.target) && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  const links = LINKS.map((link) => (
    <Link
      key={link.to}
      to={link.to}
      className={styles.navLink}
      aria-current={link.current(pathname) ? 'page' : undefined}
      onClick={() => setOpen(false)}
    >
      {link.label}
    </Link>
  ))

  return (
    <header className={styles.header}>
      <div ref={sheet} className={styles.pill} data-scrolled={scrolled || open || undefined}>
        <Link to="/" className={styles.brand} aria-label="Cody, ir al inicio" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          {links}
        </nav>

        <div className={styles.tools}>
          <a className={styles.iconButton} href={REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label="Código en GitHub (se abre en otra pestaña)" title="Código en GitHub">
            <Icon name="github" />
          </a>
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-principal"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>

        {open && (
          <nav id="menu-principal" className={styles.sheet} aria-label="Principal">
            {links}
          </nav>
        )}
      </div>
    </header>
  )
}
