import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import { createTimeline, ease } from './timeline.js'

/*
 * Dijkstra on a small city: corners are nodes, blocks are edges weighted in minutes. The avenue
 * around the edge is fast (1 min per block), the center is slow (3 min). Dijkstra explores from
 * "Casa", asks which corner it closes next, and finally lights up the fastest route to "UNSAM":
 * every route has the same number of blocks, but the one along the avenue takes fewer minutes.
 */

const COLS = 5
const ROWS = 4
const STEP = 1.6
const id = (c, r) => r * COLS + c
const SOURCE = id(0, ROWS - 1)
const TARGET = id(COLS - 1, 0)
const ASKS = 3 // only the first few closings ask, so the scene keeps its pace

function position(c, r) {
  return new Vector3((c - (COLS - 1) / 2) * STEP, 0, (r - (ROWS - 1) / 2) * STEP)
}

function buildCity() {
  const edges = []
  const onAvenue = (c1, r1, c2, r2) => (r1 === ROWS - 1 && r2 === ROWS - 1) || (c1 === COLS - 1 && c2 === COLS - 1)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 1 < COLS) edges.push({ a: id(c, r), b: id(c + 1, r), w: onAvenue(c, r, c + 1, r) ? 1 : 3 })
      if (r + 1 < ROWS) edges.push({ a: id(c, r), b: id(c, r + 1), w: onAvenue(c, r, c, r + 1) ? 1 : 3 })
    }
  }
  const adjacency = Array.from({ length: COLS * ROWS }, () => [])
  edges.forEach(({ a, b, w }, e) => {
    adjacency[a].push({ to: b, w, e })
    adjacency[b].push({ to: a, w, e })
  })
  return { edges, adjacency }
}

export function createDijkstraScene(ctx) {
  const { edges, adjacency } = buildCity()
  const object = new Group()
  const city = new Group()
  city.rotation.x = 0.95 // look at the map from above, tilted
  object.add(city)

  // Blocks with buildings of varied (but fixed) heights
  const box = new BoxGeometry(1, 1, 1)
  const buildingMaterial = new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.8 })
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const height = 0.25 + ((c * 7 + r * 13) % 5) * 0.16
      const building = new Mesh(box, buildingMaterial)
      building.scale.set(STEP - 0.5, height, STEP - 0.5)
      building.position.copy(position(c + 0.5, r + 0.5)).setY(height / 2)
      city.add(building)
    }
  }

  // Streets: flat strips; their color shows what Dijkstra is doing on them
  const streets = edges.map(({ a, b, w }) => {
    const from = position(a % COLS, Math.floor(a / COLS))
    const to = position(b % COLS, Math.floor(b / COLS))
    const horizontal = from.z === to.z
    const strip = new Mesh(box, new MeshStandardMaterial({ color: ctx.palette.edge.clone(), roughness: 0.6 }))
    const width = w === 1 ? 0.3 : 0.16 // the avenue is wider
    strip.scale.set(horizontal ? STEP : width, 0.04, horizontal ? width : STEP)
    strip.position.copy(from.clone().add(to).multiplyScalar(0.5))
    city.add(strip)
    return { strip, state: 'idle' }
  })

  // Corners
  const disc = new CylinderGeometry(0.17, 0.17, 0.12, 24)
  const corners = Array.from({ length: COLS * ROWS }, (_, n) => {
    const mesh = new Mesh(disc, new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.4 }))
    mesh.position.copy(position(n % COLS, Math.floor(n / COLS))).setY(0.06)
    city.add(mesh)
    return { mesh, state: 'idle', scale: 1 }
  })

  // Pins for home and destination
  const pinGeometry = new SphereGeometry(0.22, 24, 16)
  const stick = new CylinderGeometry(0.035, 0.035, 0.7, 8)
  const pin = (n, colorKey) => {
    const group = new Group()
    const head = new Mesh(pinGeometry, new MeshStandardMaterial({ color: ctx.palette[colorKey].clone(), roughness: 0.35 }))
    head.position.y = 0.8
    const pole = new Mesh(stick, new MeshStandardMaterial({ color: ctx.palette.idle.clone() }))
    pole.position.y = 0.4
    group.add(head, pole)
    group.position.copy(position(n % COLS, Math.floor(n / COLS)))
    city.add(group)
    return { head, colorKey }
  }
  const pins = [pin(SOURCE, 'text'), pin(TARGET, 'current')]

  // Dijkstra, as timed events
  let asking = null
  let showPath = false
  const dist = corners.map(() => Infinity)
  const closed = corners.map(() => false)
  const previous = corners.map(() => -1)
  dist[SOURCE] = 0
  const events = [{ ms: 600, apply: () => (corners[SOURCE].state = 'frontier') }]
  let asked = 0
  for (;;) {
    let u = -1
    for (let n = 0; n < dist.length; n++) if (!closed[n] && dist[n] < Infinity && (u === -1 || dist[n] < dist[u])) u = n
    if (u === -1) break
    const open = dist.filter((d, n) => d < Infinity && !closed[n]).length
    if (open > 1 && asked < ASKS) {
      asked += 1
      events.push({ ms: 1300, apply: () => (asking = u) })
    }
    events.push({ ms: 260, apply: () => { asking = null; corners[u].state = 'current' } })
    for (const { to, w, e } of adjacency[u]) {
      if (closed[to] || dist[u] + w >= dist[to]) continue
      dist[to] = dist[u] + w
      previous[to] = u
      events.push({ ms: 150, apply: () => { streets[e].state = 'frontier'; corners[to].state = 'frontier' } })
    }
    closed[u] = true
    events.push({ ms: 130, apply: () => (corners[u].state = 'visited') })
  }
  // Fastest route, from home to destination
  const route = []
  for (let n = TARGET; previous[n] !== -1; n = previous[n]) route.unshift([previous[n], n])
  const streetOf = (a, b) => adjacency[a].find((x) => x.to === b).e
  events.push({ ms: 300, apply: () => (showPath = true) })
  route.forEach(([a, b]) => events.push({ ms: 180, apply: () => { streets[streetOf(a, b)].state = 'route'; corners[b].state = 'route' } }))
  events.push({ ms: 200, apply: () => (corners[SOURCE].state = 'route') })
  const timeline = createTimeline(events)
  const black = ctx.palette.idle.clone().setRGB(0, 0, 0)
  const minutes = route.reduce((sum, [a, b]) => sum + adjacency[a].find((x) => x.to === b).w, 0)

  const colorOf = (state, palette) => (state === 'route' ? palette.current : palette[state === 'idle' ? 'idle' : state])
  const sway = { t: 0 }

  return {
    object,
    radius: 4.4,
    tilt: 0.05,
    update(dt, still) {
      const done = still ? (timeline.skipAll(), true) : timeline.update(dt)
      const palette = ctx.palette
      const k = still ? 1 : ease(dt)
      if (!still) {
        sway.t += dt
        object.rotation.y = Math.sin(sway.t * 0.35) * 0.35 // gentle, so the map stays readable
      }
      buildingMaterial.color.copy(palette.building)
      streets.forEach((s) => s.strip.material.color.lerp(s.state === 'idle' ? palette.edge : colorOf(s.state, palette), k))
      corners.forEach((c) => {
        const material = c.mesh.material
        material.color.lerp(colorOf(c.state, palette), k)
        material.emissive.lerp(c.state === 'current' || c.state === 'route' ? palette.current : black, k)
        material.emissiveIntensity = c.state === 'current' ? 0.6 : c.state === 'route' ? 0.35 : 0
        c.scale += ((c.state === 'current' ? 1.6 : c.state === 'route' ? 1.25 : 1) - c.scale) * k
        c.mesh.scale.set(c.scale, 1, c.scale)
      })
      pins.forEach((p) => p.head.material.color.copy(palette[p.colorKey]))
      object.updateMatrixWorld(true)
      const world = (n) => corners[n].mesh.getWorldPosition(new Vector3())
      const objectSpace = (n) => object.worldToLocal(world(n))
      return {
        done,
        ask: asking === null ? null : { position: objectSpace(asking), text: '¿cuál sigue?' },
        labels: [
          { position: object.worldToLocal(pins[0].head.getWorldPosition(new Vector3())), text: 'Casa' },
          { position: object.worldToLocal(pins[1].head.getWorldPosition(new Vector3())), text: showPath ? `UNSAM · ${minutes} min` : 'UNSAM' },
        ],
      }
    },
    dispose() {
      box.dispose()
      disc.dispose()
      pinGeometry.dispose()
      stick.dispose()
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
