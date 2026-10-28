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
 * A bare header, no bar or pill: logo, links and tools straight on the page, over the hero on the
 * home page. Scrolling down it gets out of the way; scrolling up it comes back, on a light frosted
 * backing so it reads over whatever is below. On phones the links fold into a menu sheet.
 */
export function Header() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const [state, setState] = useState('top') // 'top' | 'hidden' | 'shown'
  const [open, setOpen] = useState(false)
  const sheet = useRef(null)
  const overlay = pathname === '/' // on the home page it floats over the hero instead of taking room

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 24) setState('top')
      else if (y > last + 4 && y > 120) setState('hidden')
      else if (y < last - 4) setState('shown')
      last = y
    }
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
    <header className={styles.header} data-state={open ? 'shown' : state} data-overlay={overlay || undefined}>
      <div ref={sheet} className={styles.bar}>
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
