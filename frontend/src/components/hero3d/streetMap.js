/*
 * A procedural city for the search scenes: a jittered street grid with missing blocks, a few
 * diagonals, avenues, and a coastline with no streets. Deterministic (fixed hash), so every run
 * draws the same city and the algorithms can be compared on equal ground.
 *
 * Coordinates are on the XZ plane, centered at the origin. Edge weight = street length.
 */

const COLS = 46
const ROWS = 34
const STEP = 0.2

// Small deterministic hash in [0, 1)
function hash(a, b, salt = 0) {
  let h = (a * 374761393 + b * 668265263 + salt * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export function buildStreetMap() {
  const width = (COLS - 1) * STEP
  const depth = (ROWS - 1) * STEP
  const index = new Map()
  const xs = []
  const zs = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * STEP - width / 2 + (hash(c, r, 1) - 0.5) * STEP * 0.7
      const z = r * STEP - depth / 2 + (hash(c, r, 2) - 0.5) * STEP * 0.7
      // A bay at the top: water, no streets
      const coast = -depth / 2 + 1.25 + Math.sin(x * 0.75 + 0.6) * 0.75 + Math.cos(x * 1.9) * 0.18
      if (z < coast) continue
      index.set(`${c},${r}`, xs.length)
      xs.push(x)
      zs.push(z)
    }
  }

  const edges = []
  const avenue = []
  const link = (a, b, isAvenue) => {
    if (a === undefined || b === undefined) return
    edges.push([a, b])
    avenue.push(isAvenue)
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const here = index.get(`${c},${r}`)
      if (here === undefined) continue
      const rowAvenue = r % 8 === 4
      const colAvenue = c % 9 === 3
      if (rowAvenue || hash(c, r, 3) > 0.17) link(here, index.get(`${c + 1},${r}`), rowAvenue)
      if (colAvenue || hash(c, r, 4) > 0.17) link(here, index.get(`${c},${r + 1}`), colAvenue)
      if (hash(c, r, 5) > 0.93) link(here, index.get(`${c + 1},${r + 1}`), false)
      if (hash(c, r, 6) > 0.95) link(here, index.get(`${c - 1},${r + 1}`), false)
    }
  }

  const count = xs.length
  const adjacency = Array.from({ length: count }, () => [])
  edges.forEach(([a, b], e) => {
    const w = Math.hypot(xs[a] - xs[b], zs[a] - zs[b])
    adjacency[a].push({ to: b, w, e })
    adjacency[b].push({ to: a, w, e })
  })

  const nearest = (x, z) => {
    let best = 0
    let bestDistance = Infinity
    for (let i = 0; i < count; i++) {
      const d = Math.hypot(xs[i] - x, zs[i] - z)
      if (d < bestDistance && adjacency[i].length > 1) [best, bestDistance] = [i, d]
    }
    return best
  }
  // Origin and destination inside the city, far from its borders: a search that hits the border
  // stops growing there, which would hide the difference between the algorithms
  const source = nearest(-1.7, 1.1)
  const target = nearest(1.7, -0.5)

  return { xs, zs, edges, avenue, adjacency, source, target, radius: Math.hypot(width, depth) / 2 }
}

/** Binary min-heap of [priority, node]. */
class Heap {
  constructor() {
    this.items = []
  }
  get size() {
    return this.items.length
  }
  peek() {
    return this.items[0]
  }
  push(item) {
    const a = this.items
    a.push(item)
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      for (let i = 0; ;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

function pathFrom(previous, from, to) {
  const nodes = []
  for (let n = to; n !== -1; n = previous[n]) {
    nodes.unshift(n)
    if (n === from) break
  }
  return nodes
}

/**
 * Dijkstra, or A* when `heuristic` is given. Returns the edges in the order they were explored
 * (each relaxed street, tagged with the side that explored it), the settled count and the path.
 */
export function search(map, { heuristic = false } = {}) {
  const { xs, zs, adjacency, source, target } = map
  const h = (n) => (heuristic ? Math.hypot(xs[n] - xs[target], zs[n] - zs[target]) : 0)
  const dist = new Float64Array(xs.length).fill(Infinity)
  const previous = new Int32Array(xs.length).fill(-1)
  const closed = new Uint8Array(xs.length)
  const explored = []
  const heap = new Heap()
  dist[source] = 0
  heap.push([h(source), source])
  let settled = 0
  while (heap.size) {
    const [, u] = heap.pop()
    if (closed[u]) continue
    closed[u] = 1
    settled += 1
    if (u === target) break
    for (const { to, w, e } of adjacency[u]) {
      if (closed[to] || dist[u] + w >= dist[to]) continue
      dist[to] = dist[u] + w
      previous[to] = u
      explored.push({ e, side: 0 })
      heap.push([dist[to] + h(to), to])
    }
  }
  return { explored, settled, path: pathFrom(previous, source, target), distance: dist[target] }
}

/**
 * Bidirectional Dijkstra: one search from the origin and one from the destination, expanding
 * the side whose next node is closer. It stops when topForward + topBackward >= best, the
 * standard condition that guarantees the best path found is the shortest.
 */
export function bidirectional(map) {
  const { xs, adjacency, source, target } = map
  const make = (start) => {
    const dist = new Float64Array(xs.length).fill(Infinity)
    const previous = new Int32Array(xs.length).fill(-1)
    const closed = new Uint8Array(xs.length)
    const heap = new Heap()
    dist[start] = 0
    heap.push([0, start])
    return { dist, previous, closed, heap }
  }
  const sides = [make(source), make(target)]
  const explored = []
  let best = Infinity
  let meeting = -1
  let settled = 0
  const top = (side) => {
    while (side.heap.size && side.closed[side.heap.peek()[1]]) side.heap.pop()
    return side.heap.size ? side.heap.peek()[0] : Infinity
  }
  while (top(sides[0]) + top(sides[1]) < best) {
    const s = top(sides[0]) <= top(sides[1]) ? 0 : 1
    const me = sides[s]
    const other = sides[1 - s]
    const [, u] = me.heap.pop()
    me.closed[u] = 1
    settled += 1
    for (const { to, w, e } of adjacency[u]) {
      if (me.dist[u] + w < me.dist[to]) {
        me.dist[to] = me.dist[u] + w
        me.previous[to] = u
        me.heap.push([me.dist[to], to])
        explored.push({ e, side: s })
      }
      // A street that links both searches: candidate for the shortest path
      if (other.dist[to] < Infinity && me.dist[u] + w + other.dist[to] < best) {
        best = me.dist[u] + w + other.dist[to]
        meeting = s === 0 ? { left: u, right: to } : { left: to, right: u }
      }
    }
  }
  const forward = pathFrom(sides[0].previous, source, meeting.left)
  const backward = pathFrom(sides[1].previous, target, meeting.right).reverse()
  return { explored, settled, path: [...forward, ...backward], distance: best }
}
