import {
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { createTimeline, ease } from './timeline.js'

// BFS on a cone-shaped graph of 15 nodes: frontier amber, current vermillion, visited mint.

const LEVELS = [1, 3, 5, 6]
const RADII = [0, 1.35, 2.3, 3.05]
const UP = new Vector3(0, 1, 0)

function buildGraph() {
  const nodes = []
  LEVELS.forEach((count, level) => {
    for (let i = 0; i < count; i++) {
      const angle = level * 0.7 + (i / count) * Math.PI * 2
      nodes.push({ level, angle, position: new Vector3(Math.cos(angle) * RADII[level], 1.85 - level * 1.25, Math.sin(angle) * RADII[level]) })
    }
  })
  const edges = []
  const gap = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
  for (let level = 1; level < LEVELS.length; level++) {
    const parents = nodes.map((n, i) => ({ ...n, i })).filter((n) => n.level === level - 1)
    nodes.map((n, i) => ({ ...n, i })).filter((n) => n.level === level).forEach((child, k) => {
      const sorted = [...parents].sort((p, q) => gap(p.angle, child.angle) - gap(q.angle, child.angle))
      edges.push([sorted[0].i, child.i])
      if (k % 2 === 1 && sorted[1]) edges.push([sorted[1].i, child.i]) // BFS will skip these
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

export function createBfsScene(ctx) {
  const { nodes, edges, adjacency } = buildGraph()
  const object = new Group()

  const lineGeometry = new BufferGeometry()
  lineGeometry.setAttribute('position', new Float32BufferAttribute(edges.flatMap(([a, b]) => [...nodes[a].position.toArray(), ...nodes[b].position.toArray()]), 3))
  const lineMaterial = new LineBasicMaterial({ color: ctx.palette.edge })
  object.add(new LineSegments(lineGeometry, lineMaterial))

  const sphere = new SphereGeometry(0.28, 32, 24)
  const nodeMeshes = nodes.map((node) => {
    const mesh = new Mesh(sphere, new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.45, metalness: 0.05 }))
    mesh.position.copy(node.position)
    object.add(mesh)
    return { mesh, state: 'idle', scale: 1 }
  })

  const tube = new CylinderGeometry(0.045, 0.045, 1, 10)
  tube.translate(0, 0.5, 0)
  const edgeMeshes = edges.map(([a, b]) => {
    const mesh = new Mesh(tube, new MeshStandardMaterial({ color: ctx.palette.current.clone(), roughness: 0.5, transparent: true, opacity: 0 }))
    mesh.visible = false
    object.add(mesh)
    return { mesh, a, b, length: nodes[a].position.distanceTo(nodes[b].position), progress: 0, target: 0, skip: false }
  })
  const grow = (e, from, skip) => {
    const edge = edgeMeshes[e]
    const start = nodes[from].position
    const end = nodes[from === edge.a ? edge.b : edge.a].position
    edge.mesh.position.copy(start)
    edge.mesh.quaternion.copy(new Quaternion().setFromUnitVectors(UP, end.clone().sub(start).normalize()))
    edge.mesh.visible = true
    edge.skip = skip
    edge.progress = skip ? 1 : 0
    edge.target = skip ? 0 : 1
  }

  // The walk, as timed events
  let asking = null
  const events = []
  const state = nodes.map(() => 'idle')
  const set = (node, value) => () => (nodeMeshes[node].state = value)
  events.push({ ms: 700, apply: set(0, 'frontier') })
  state[0] = 'frontier'
  const queue = [0]
  while (queue.length) {
    if (queue.length > 1) {
      const next = queue[0]
      events.push({ ms: 1300, apply: () => (asking = next) })
    }
    const u = queue.shift()
    events.push({ ms: 520, apply: () => { asking = null; nodeMeshes[u].state = 'current' } })
    for (const { to, e } of adjacency[u]) {
      if (state[to] === 'idle') {
        state[to] = 'frontier'
        queue.push(to)
        events.push({ ms: 420, apply: () => { grow(e, u, false); nodeMeshes[to].state = 'frontier' } })
      } else if (state[to] === 'frontier') {
        events.push({ ms: 420, apply: () => grow(e, u, true) })
      }
    }
    state[u] = 'visited'
    events.push({ ms: 240, apply: set(u, 'visited') })
  }
  const timeline = createTimeline(events)
  const black = ctx.palette.idle.clone().setRGB(0, 0, 0)

  return {
    object,
    radius: 3.65,
    tilt: 0.12,
    update(dt, still) {
      const done = still ? (timeline.skipAll(), true) : timeline.update(dt)
      const palette = ctx.palette
      const k = still ? 1 : ease(dt)
      if (!still) object.rotation.y += dt * 0.12
      lineMaterial.color.copy(palette.edge)
      nodeMeshes.forEach((n) => {
        const material = n.mesh.material
        material.color.lerp(palette[n.state], k)
        material.emissive.lerp(n.state === 'current' ? palette.current : black, k)
        material.emissiveIntensity = n.state === 'current' ? 0.55 : 0
        n.scale += ((n.state === 'current' ? 1.45 : n.state === 'frontier' ? 1.12 : 1) - n.scale) * k
        n.mesh.scale.setScalar(n.scale)
      })
      edgeMeshes.forEach((e) => {
        if (!e.mesh.visible) return
        e.progress = still ? e.target : e.progress + (e.target - e.progress) * ease(dt, e.skip ? 3 : 7)
        e.mesh.scale.set(1, Math.max(0.001, e.length * e.progress), 1)
        e.mesh.material.color.lerp(e.skip ? palette.frontier : e.progress > 0.92 ? palette.visited : palette.current, e.skip ? 1 : k * 0.6)
        e.mesh.material.opacity = Math.min(1, e.progress * 1.4)
        if (e.target === 0 && e.progress < 0.01) e.mesh.visible = false
      })
      return {
        done,
        ask: asking === null ? null : { position: nodes[asking].position, text: '¿cuál sigue?' },
        labels: [],
      }
    },
    dispose() {
      lineGeometry.dispose()
      sphere.dispose()
      tube.dispose()
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
