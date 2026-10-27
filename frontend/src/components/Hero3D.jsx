import { useEffect, useRef, useState } from 'react'
import { Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshBasicMaterial, PerspectiveCamera, RingGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import { createBfsScene } from './hero3d/bfsScene.js'
import { createBubbleScene } from './hero3d/bubbleScene.js'
import { createDijkstraScene } from './hero3d/dijkstraScene.js'
import { createMapSearchScene } from './hero3d/mapSearchScene.js'
import { createRouteScene } from './hero3d/routeScene.js'
import { ease } from './hero3d/timeline.js'
import { HeroGraph } from './HeroGraph.jsx'
import styles from './Hero3D.module.css'

/*
 * Hero: three algorithms drawn in 3D, one after the other. Each one stops where Cody would ask
 * ("¿cuál sigue?", "¿se intercambian?") before showing what happens. Colors come from the design
 * tokens and follow the theme.
 */

const SCENES = [
  {
    key: 'bfs',
    name: 'BFS',
    caption: 'Recorre un grafo por niveles, usando una cola',
    legend: [['frontier', 'en cola'], ['current', 'actual'], ['visited', 'visitado']],
    create: createBfsScene,
  },
  {
    key: 'dijkstra',
    name: 'Dijkstra',
    caption: 'Busca la ruta más rápida: suma minutos, no cuadras',
    legend: [['frontier', 'en frontera'], ['current', 'actual y ruta'], ['visited', 'cerrado']],
    create: createDijkstraScene,
  },
  {
    key: 'astar',
    name: 'A*',
    caption: 'De Mar del Plata a CABA: Dijkstra con brújula, mira hacia el destino y explora mucho menos',
    legend: [['frontier', 'explorado'], ['current', 'ruta']],
    create: createRouteScene,
  },
  {
    key: 'bidirectional',
    name: 'Bidireccional',
    caption: 'Dos búsquedas, desde el origen y desde el destino, que se encuentran a mitad de camino',
    legend: [['frontier', 'desde el origen'], ['visited', 'desde el destino'], ['current', 'ruta']],
    create: createMapSearchScene,
  },
  {
    key: 'bubble',
    name: 'Burbuja',
    caption: 'Compara vecinos e intercambia hasta ordenar',
    legend: [['frontier', 'comparando'], ['current', 'intercambiando'], ['visited', 'en su lugar']],
    create: createBubbleScene,
  },
]

const FADE_IN = 0.6
const FADE_OUT = 0.45
const HOLD = 2.4

// In the light theme the state tokens are darkened so text passes contrast; shaded 3D objects
// look muddy with them, so the scenes use brighter versions of the same hues there.
const LIGHT_SCENE = { idle: '#aab2bd', frontier: '#e3a12a', current: '#e2582a', visited: '#2fa06c', building: '#c9ced6' }

function readPalette() {
  const css = getComputedStyle(document.documentElement)
  const light = document.documentElement.dataset.theme === 'light'
  const get = (name, override) => new Color(override || css.getPropertyValue(name).trim() || '#888')
  return {
    idle: get('--node-stroke', light && LIGHT_SCENE.idle),
    frontier: get('--frontier', light && LIGHT_SCENE.frontier),
    current: get('--accent', light && LIGHT_SCENE.current),
    visited: get('--visited', light && LIGHT_SCENE.visited),
    edge: get('--edge'),
    text: get('--text'),
    // Buildings need their own tone: --surface-3 is too close to the dark background
    building: get('--surface-3', light ? LIGHT_SCENE.building : '#4a443b'),
    light,
  }
}

/** Whether the browser can draw WebGL at all; without it the 2D hero is shown instead. */
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Hero3D() {
  const mount = useRef(null)
  const ask = useRef(null)
  const labels = useRef([])
  const hud = useRef(null)
  const selectScene = useRef(() => {})
  const reduceMotion = useReducedMotion()
  const [webgl] = useState(supportsWebGL)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!webgl) return
    const container = mount.current
    const stage = container.querySelector(`.${styles.canvas}`)
    let renderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // context creation failed after the check: leave the area empty
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    stage.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(30, 1, 0.1, 200)
    const hemi = new HemisphereLight(0xffffff, 0x222222, 1.1)
    const sun = new DirectionalLight(0xffffff, 1.4)
    sun.position.set(4, 7, 6)
    scene.add(hemi, sun)

    // Everything turns around the origin; scenes are built centered inside a known radius
    const pivot = new Group()
    scene.add(pivot)
    // depthWrite off: even when faded out, the ring must not hide transparent layers behind it
    const ring = new Mesh(new RingGeometry(0.42, 0.5, 48), new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    scene.add(ring)

    const ctx = { palette: readPalette() }
    const applyLights = () => {
      hemi.groundColor.set(ctx.palette.light ? 0xbbbbbb : 0x222222)
      ring.material.color.copy(ctx.palette.current)
    }
    applyLights()

    let current = null
    let index = 0
    let phase = 'in'
    let phaseTime = 0
    let pending = null

    const fit = () => {
      if (!current) return
      // Distance so the scene's bounding sphere fits the narrower field of view, with margin:
      // it can turn any way without leaving the frame
      const vertical = (camera.fov * Math.PI) / 180
      const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect)
      const half = Math.min(vertical, horizontal) / 2
      camera.position.set(0, 0, (current.radius / Math.sin(half)) * 0.98)
      camera.lookAt(0, 0, 0)
    }

    const load = (i) => {
      if (current) {
        pivot.remove(current.object)
        current.dispose()
      }
      index = i
      current = SCENES[i].create(ctx)
      pivot.add(current.object)
      fit()
      setActive(i)
      if (hud.current) hud.current.dataset.side = current.hudSide ?? 'left'
      container.dataset.hud = current.hudSide ?? 'left'
      phase = 'in'
      phaseTime = 0
    }

    const pointer = { x: 0, y: 0 }
    const onPointer = (event) => {
      pointer.x = Math.max(-0.5, Math.min(0.5, event.clientX / window.innerWidth - 0.5))
      pointer.y = Math.max(-0.5, Math.min(0.5, event.clientY / window.innerHeight - 0.5))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const projected = new Vector3()
    const place = (element, local, above) => {
      projected.copy(local).applyMatrix4(current.object.matrixWorld).project(camera)
      const width = container.clientWidth
      const height = stage.clientHeight
      const margin = 8
      const w = element.offsetWidth
      const h = element.offsetHeight
      // Keep every label inside the frame, whatever the rotation
      const x = Math.min(width - margin - w / 2, Math.max(margin + w / 2, (projected.x * 0.5 + 0.5) * width))
      const y = Math.min(height - margin, Math.max(margin + h, (-projected.y * 0.5 + 0.5) * height - above))
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
    }

    const frame = (dt) => {
      // React clears the refs a moment before this effect is cleaned up: skip that last frame
      if (!ask.current || !hud.current || !labels.current[0]) return
      const still = reduceMotion
      phaseTime += dt
      if (!still) {
        if (phase === 'in' && phaseTime >= FADE_IN) phase = 'play'
        if (phase === 'hold' && phaseTime >= (current.hold ?? HOLD)) [phase, phaseTime] = ['out', 0]
        if (phase === 'out' && phaseTime >= FADE_OUT) {
          load(pending ?? (index + 1) % SCENES.length)
          pending = null
        }
      }
      const opacity = still ? 1 : phase === 'in' ? Math.min(1, phaseTime / FADE_IN) : phase === 'out' ? Math.max(0, 1 - phaseTime / FADE_OUT) : 1
      stage.style.opacity = String(opacity)
      container.style.setProperty('--scene-opacity', String(opacity)) // labels fade with the scene

      // Only a tilt follows the pointer (no sliding): the scene always stays inside the frame
      const k = still ? 1 : ease(dt, 4)
      pivot.rotation.x += (current.tilt + pointer.y * 0.16 - pivot.rotation.x) * k
      pivot.rotation.y += (pointer.x * 0.24 - pivot.rotation.y) * k
      pivot.updateMatrixWorld(true)

      const result = current.update(dt, still)
      current.object.updateMatrixWorld(true)
      if (!still && phase === 'play' && result.done) [phase, phaseTime] = ['hold', 0]

      if (result.ask) {
        ring.position.copy(result.ask.position).applyMatrix4(current.object.matrixWorld)
        ring.quaternion.copy(camera.quaternion)
        ring.scale.setScalar(1.15 + Math.sin(performance.now() / 180) * 0.08)
        ring.material.opacity += (opacity - ring.material.opacity) * ease(dt, 10)
        ask.current.textContent = result.ask.text
        place(ask.current, result.ask.position, 40)
        ask.current.dataset.visible = 'true'
      } else {
        ring.material.opacity += (0 - ring.material.opacity) * (still ? 1 : ease(dt, 10))
        ask.current.dataset.visible = 'false'
      }
      // Data panel (search scenes): only touch the DOM when the text changes
      const hudText = result.hud ? `${result.hud.title}|${result.hud.rows.flat().join('|')}` : ''
      if (hud.current.dataset.text !== hudText) {
        hud.current.dataset.text = hudText
        hud.current.dataset.visible = result.hud ? 'true' : 'false'
        if (result.hud) {
          hud.current.querySelector('[data-title]').textContent = result.hud.title
          hud.current.querySelectorAll('[data-row]').forEach((row, i) => {
            const [name, value] = result.hud.rows[i] ?? ['', '']
            row.firstChild.textContent = name
            row.lastChild.textContent = value
          })
        }
      }
      labels.current.forEach((element, i) => {
        const label = result.labels[i]
        if (!element) return
        element.dataset.visible = label ? 'true' : 'false'
        element.dataset.minor = label?.minor ? 'true' : 'false'
        if (label) {
          element.textContent = label.text
          place(element, label.position, 18)
        }
      })
      renderer.render(scene, camera)
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = stage
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      fit()
      if (reduceMotion) frame(1)
    }

    selectScene.current = (i) => {
      if (i === index) return
      if (reduceMotion) {
        load(i)
        frame(1)
      } else {
        pending = i
        if (phase !== 'out') [phase, phaseTime] = ['out', 0]
      }
    }

    load(0)
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(stage)
    resize()

    let visible = true
    // Only one scene moves at a time: the 3D stops once most of it has scrolled away
    const seen = new IntersectionObserver(([entry]) => (visible = entry.intersectionRatio >= 0.35), { threshold: [0, 0.35, 1] })
    seen.observe(container)

    const themeObserver = new MutationObserver(() => {
      ctx.palette = readPalette()
      applyLights()
      if (reduceMotion) frame(1)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible && !document.hidden) frame(dt)
    }
    if (reduceMotion) frame(1)
    else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      sizeObserver.disconnect()
      seen.disconnect()
      themeObserver.disconnect()
      current?.dispose()
      ring.geometry.dispose()
      ring.material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduceMotion, webgl])

  if (!webgl) return <HeroGraph />

  const scene = SCENES[active]
  return (
    <figure className={styles.figure} aria-label={`Animación en 3D: ${scene.name}. ${scene.caption}`}>
      <div ref={mount} className={styles.stage}>
        <div className={styles.canvas} aria-hidden="true" />
        <span ref={ask} className={styles.ask} data-visible="false" aria-hidden="true" />
        <div ref={hud} className={styles.hud} data-visible="false" aria-hidden="true">
          <span data-title className={styles.hudTitle} />
          {[0, 1, 2].map((i) => (
            <span key={i} data-row className={styles.hudRow}>
              <span className={styles.hudName} />
              <span className={styles.hudValue} />
            </span>
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} ref={(element) => (labels.current[i] = element)} className={styles.label} data-visible="false" aria-hidden="true" />
        ))}
      </div>
      <figcaption className={styles.caption}>
        <div className={styles.switcher} role="group" aria-label="Elegir algoritmo de la animación">
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={styles.sceneButton}
              aria-pressed={i === active}
              onClick={() => selectScene.current(i)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className={styles.sceneCaption}>{scene.caption}</p>
        <div className={styles.legend}>
          {scene.legend.map(([state, text]) => (
            <span key={state} className={styles.key}><i className={styles[`sw_${state}`]} />{text}</span>
          ))}
        </div>
      </figcaption>
    </figure>
  )
}
