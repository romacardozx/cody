import { lazy, Suspense } from 'react'
import { Header } from './components/Header.jsx'
import { Link } from './components/Link.jsx'
import { matchPath, useLocation } from './lib/router.js'
import { HomePage } from './pages/HomePage.jsx'
import styles from './App.module.css'

// The visualizer (and the motion library it uses) is loaded only when needed, or ahead of time
// when the user hovers an algorithm card
const VisualizerPage = lazy(() => import('./pages/VisualizerPage.jsx'))
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'))

export default function App() {
  const { pathname } = useLocation()
  const visualizer = matchPath('/algorithms/:code', pathname)

  let page
  if (pathname === '/' || pathname === '/algorithms') page = <HomePage />
  else if (visualizer) page = <VisualizerPage key={visualizer.code} code={visualizer.code} />
  else if (pathname === '/history') page = <HistoryPage />
  else page = <NotFound />

  return (
    <>
      <a href="#contenido" className={styles.skip}>Saltar al contenido</a>
      <Header />
      <div id="contenido">
        <Suspense fallback={<div className={styles.pageLoading} aria-busy="true" />}>{page}</Suspense>
      </div>
      <footer className={styles.footer}>
        <span>Cody · TP Integrador de Programación III · ECyT-UNSAM · 2026</span>
        <span className={styles.footerNote}>Hecho para pensar, no para mirar.</span>
      </footer>
    </>
  )
}

function NotFound() {
  return (
    <main className={styles.notFound}>
      <p className={styles.code}>404</p>
      <h1>Este nodo no está en el grafo.</h1>
      <Link to="/" className={styles.home}>Volver al inicio</Link>
    </main>
  )
}
