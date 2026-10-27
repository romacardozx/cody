import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled (not loaded from Google) so the demo works without internet in the lab
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/atkinson-hyperlegible-next'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.jsx'
import { startSmoothScroll } from './lib/smoothScroll.js'

startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
