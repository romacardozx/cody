import { useEffect, useRef, useState } from 'react'
import {
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Quaternion,
  RingGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import { HeroGraph } from './HeroGraph.jsx'
import styles from './Hero3D.module.css'

/*
 * Hero scene: a 3D graph that BFS walks for real, wave by wave. Before each dequeue with more
 * than one node waiting it stops, rings the next node and asks "¿cuál sigue?" — the product's own
 * question. Colors come from the design tokens and follow the theme.
 */

// ---------- graph: a tree-like cone of 15 nodes, plus cross edges that BFS will skip ----------

const LEVELS = [1, 3, 5, 6]
const RADII = [0, 1.35, 2.3, 3.05]

function buildGraph() {
  const nodes = []
  LEVELS.forEach((count, level) => {
    const offset = level * 0.7
    for (let i = 0; i < count; i++) {
      const angle = offset + (i / count) * Math.PI * 2
      nodes.push({ level, angle, position: new Vector3(Math.cos(angle) * RADII[level], 1.9 - level * 1.25, Math.sin(angle) * RADII[level]) })
    }
  })
  const edges = []
  const byLevel = (level) => nodes.map((n, i) => ({ ...n, i })).filter((n) => n.level === level)
  const angleGap = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
  for (let level = 1; level < LEVELS.length; level++) {
    const parents = byLevel(level - 1)
    byLevel(level).forEach((child, k) => {
      const sorted = [...parents].sort((p, q) => angleGap(p.angle, child.angle) - angleGap(q.angle, child.angle))
      edges.push([sorted[0].i, child.i])
      // Every other node also hangs from a second parent: BFS will find it already discovered
      if (k % 2 === 1 && sorted[1]) edges.push([sorted[1].i, child.i])
    })
  }
  const adjacency = nodes.map(() => [])
  edges.forEach(([a, b], e) => {
    adjacency[a].push({ to: b, e })
    adjacency[b].push({ to: a, e })
  })
  adjacency.forEach((list) => list.sort((x, y) => x.to - y.to))
  return { nodes, edges, adjacency }
}

/** The BFS run as a timeline of events, each with how long it holds the screen (ms). */
function bfsTimeline(adjacency) {
  const events = [{ type: 'discover', node: 0, ms: 600 }]
  const state = adjacency.map(() => 'idle')
  state[0] = 'frontier'
  const queue = [0]
  while (queue.length) {
    if (queue.length > 1) events.push({ type: 'ask', node: queue[0], ms: 1300 })
    const u = queue.shift()
    events.push({ type: 'current', node: u, ms: 520 })
    for (const { to, e } of adjacency[u]) {
      if (state[to] === 'idle') {
        state[to] = 'frontier'
        queue.push(to)
        events.push({ type: 'edge', edge: e, from: u, node: to, ms: 430 })
      } else if (state[to] === 'frontier') {
        events.push({ type: 'skip', edge: e, from: u, ms: 420 })
      }
    }
    state[u] = 'visited'
    events.push({ type: 'visit', node: u, ms: 260 })
  }
  events.push({ type: 'hold', ms: 2600 }, { type: 'reset', ms: 900 })
  return events
}

// In the light theme the state tokens are darkened so text passes contrast; shaded 3D spheres
// look muddy with them, so the scene uses brighter versions of the same hues there.
const LIGHT_SCENE = { idle: '#aab2bd', frontier: '#e3a12a', current: '#e2582a', visited: '#2fa06c' }

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

const UP = new Vector3(0, 1, 0)
const BLACK = new Color(0x000000)

export default function Hero3D() {
  const mount = useRef(null)
  const chip = useRef(null)
  const reduceMotion = useReducedMotion()
  const [webgl] = useState(supportsWebGL)

  useEffect(() => {
    if (!webgl) return
    const container = mount.current
    let renderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // context creation failed after the check: leave the area empty
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 1.4, 11)
    camera.lookAt(0, -0.2, 0)
    const hemi = new HemisphereLight(0xffffff, 0x222222, 1.1)
    const sun = new DirectionalLight(0xffffff, 1.4)
    sun.position.set(4, 6, 5)
    scene.add(hemi, sun)

    const world = new Group()
    scene.add(world)
    const { nodes, edges, adjacency } = buildGraph()
    let palette = readPalette()

    // Every edge, faint: the graph BFS has not explored yet
    const base = new BufferGeometry()
    base.setAttribute('position', new Float32BufferAttribute(edges.flatMap(([a, b]) => [...nodes[a].position.toArray(), ...nodes[b].position.toArray()]), 3))
    const baseMaterial = new LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.9 })
    world.add(new LineSegments(base, baseMaterial))

    // Nodes
    const sphere = new SphereGeometry(0.28, 32, 24)
    const nodeMeshes = nodes.map((node) => {
      const material = new MeshStandardMaterial({ color: palette.idle.clone(), roughness: 0.45, metalness: 0.05, emissive: new Color(0x000000) })
      const mesh = new Mesh(sphere, material)
      mesh.position.copy(node.position)
      world.add(mesh)
      return { mesh, state: 'idle', scale: 1 }
    })

    // Tubes that grow from parent to child when BFS discovers a node; built with the base at the origin
    const tube = new CylinderGeometry(0.045, 0.045, 1, 10)
    tube.translate(0, 0.5, 0)
    const edgeMeshes = edges.map(([a, b]) => {
      const from = nodes[a].position
      const to = nodes[b].position
      const material = new MeshStandardMaterial({ color: palette.current.clone(), roughness: 0.5, transparent: true, opacity: 0 })
      const mesh = new Mesh(tube, material)
      mesh.visible = false
      world.add(mesh)
      return { mesh, from, to, length: from.distanceTo(to), progress: 0, target: 0, skip: false }
    })
    const orient = (edge, reversed) => {
      const start = reversed ? edge.to : edge.from
      const end = reversed ? edge.from : edge.to
      edge.mesh.position.copy(start)
      edge.mesh.quaternion.copy(new Quaternion().setFromUnitVectors(UP, end.clone().sub(start).normalize()))
    }

    // Ring around the node that is about to leave the queue
    const ring = new Mesh(new RingGeometry(0.42, 0.5, 48), new MeshBasicMaterial({ color: palette.current, transparent: true, opacity: 0 }))
    world.add(ring)

    const events = bfsTimeline(adjacency)
    let index = 0
    let elapsed = 0
    let asking = null

    const applyEvent = (event) => {
      asking = null
      switch (event.type) {
        case 'discover':
          nodeMeshes[event.node].state = 'frontier'
          break
        case 'ask':
          asking = event.node
          break
        case 'current':
          nodeMeshes[event.node].state = 'current'
          break
        case 'edge': {
          const edge = edgeMeshes[event.edge]
          orient(edge, edges[event.edge][0] !== event.from)
          edge.mesh.visible = true
          edge.skip = false
          edge.target = 1
          nodeMeshes[event.node].state = 'frontier'
          break
        }
        case 'skip': {
          // The neighbor was already discovered: the edge lights up amber and retracts
          const edge = edgeMeshes[event.edge]
          orient(edge, edges[event.edge][0] !== event.from)
          edge.mesh.visible = true
          edge.skip = true
          edge.progress = 1
          edge.target = 0
          break
        }
        case 'visit':
          nodeMeshes[event.node].state = 'visited'
          break
        case 'reset':
          nodeMeshes.forEach((n) => (n.state = 'idle'))
          edgeMeshes.forEach((e) => (e.target = 0))
          break
        default:
      }
    }

    // Reduced motion: show the finished walk, still
    if (reduceMotion) {
      events.slice(0, -2).forEach(applyEvent)
      asking = null
      nodeMeshes.forEach((n) => (n.scale = 1))
      edgeMeshes.forEach((e) => (e.progress = e.target))
    } else {
      applyEvent(events[0])
    }

    const colorFor = (state) => palette[state]
    const pointer = { x: 0, y: 0 }
    const onPointer = (event) => {
      pointer.x = event.clientX / window.innerWidth - 0.5
      pointer.y = event.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const projected = new Vector3()
    const frame = (dt) => {
      const smooth = 1 - Math.exp(-dt * 9)
      // Timeline
      if (!reduceMotion) {
        elapsed += dt * 1000
        if (elapsed >= events[index].ms) {
          elapsed = 0
          index = (index + 1) % events.length
          applyEvent(events[index])
        }
        world.rotation.y += dt * 0.12
      }
      world.rotation.x += (pointer.y * 0.25 - world.rotation.x) * smooth * 0.3
      world.position.x += (pointer.x * 0.5 - world.position.x) * smooth * 0.3

      nodeMeshes.forEach((n) => {
        const material = n.mesh.material
        material.color.lerp(colorFor(n.state), smooth)
        material.emissive.lerp(n.state === 'current' ? palette.current : BLACK, smooth)
        material.emissiveIntensity = n.state === 'current' ? 0.55 : 0
        const target = n.state === 'current' ? 1.45 : n.state === 'frontier' ? 1.12 : 1
        n.scale += (target - n.scale) * smooth
        n.mesh.scale.setScalar(n.scale)
      })
      edgeMeshes.forEach((e) => {
        if (!e.mesh.visible) return
        e.progress += (e.target - e.progress) * (1 - Math.exp(-dt * (e.skip ? 3 : 7)))
        e.mesh.scale.set(1, Math.max(0.001, e.length * e.progress), 1)
        const material = e.mesh.material
        const tint = e.skip ? palette.frontier : e.progress > 0.92 ? palette.visited : palette.current
        material.color.lerp(tint, e.skip ? 1 : smooth * 0.6)
        material.opacity = Math.min(1, e.progress * 1.4)
        if (e.target === 0 && e.progress < 0.01) e.mesh.visible = false
      })

      // The question: ring + label over the node that leaves the queue next
      const ringMaterial = ring.material
      if (asking !== null) {
        ring.position.copy(nodes[asking].position)
        ring.quaternion.copy(camera.quaternion).premultiply(world.quaternion.clone().invert())
        const pulse = 1 + Math.sin(performance.now() / 180) * 0.08
        ring.scale.setScalar(pulse * 1.15)
        ringMaterial.opacity += (1 - ringMaterial.opacity) * smooth
        projected.copy(nodes[asking].position).applyMatrix4(world.matrixWorld).project(camera)
        const x = (projected.x * 0.5 + 0.5) * container.clientWidth
        const y = (-projected.y * 0.5 + 0.5) * container.clientHeight
        chip.current.style.transform = `translate(${x}px, ${y - 46}px) translate(-50%, -100%)`
        chip.current.dataset.visible = 'true'
      } else {
        ringMaterial.opacity += (0 - ringMaterial.opacity) * smooth
        if (chip.current) chip.current.dataset.visible = 'false'
      }
      renderer.render(scene, camera)
    }

    // Size, visibility and theme
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reduceMotion) frame(1)
    }
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(container)
    resize()

    let visible = true
    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    seen.observe(container)

    const themeObserver = new MutationObserver(() => {
      palette = readPalette()
      baseMaterial.color.copy(palette.edge)
      ring.material.color.copy(palette.current)
      hemi.groundColor.set(palette.light ? 0xbbbbbb : 0x222222)
      if (reduceMotion) frame(1)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    hemi.groundColor.set(palette.light ? 0xbbbbbb : 0x222222)

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
    container.dataset.ready = 'true'

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      sizeObserver.disconnect()
      seen.disconnect()
      themeObserver.disconnect()
      sphere.dispose()
      tube.dispose()
      base.dispose()
      ring.geometry.dispose()
      scene.traverse((object) => object.material?.dispose?.())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduceMotion, webgl])

  if (!webgl) return <HeroGraph />

  return (
    <figure className={styles.figure} aria-label="Animación en 3D: BFS recorre un grafo por niveles y se frena a preguntar qué nodo sigue">
      <div ref={mount} className={styles.stage} aria-hidden="true">
        <span ref={chip} className={styles.chip} data-visible="false">¿cuál sigue?</span>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.key}><i className={styles.swFrontier} />en cola</span>
        <span className={styles.key}><i className={styles.swCurrent} />actual</span>
        <span className={styles.key}><i className={styles.swVisited} />visitado</span>
      </figcaption>
    </figure>
  )
}
