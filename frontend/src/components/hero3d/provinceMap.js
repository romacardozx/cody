/*
 * A simplified road network of Buenos Aires province for the A* scene: the whole outline (land
 * borders, Paraná, Río de la Plata, Atlantic coast down to the Río Negro), towns at their real
 * coordinates, the main routes as fast roads and a grid of slow rural roads, like the ones that
 * cross the pampa. The outline is approximate but recognizable.
 *
 * Coordinates are on the XZ plane (north = -z), 1 unit = 100 km. Edge weight = travel time in
 * hours, so the search prefers routes the way a GPS does. The A* heuristic is the straight-line
 * distance at the top speed: it never overestimates, so the route found is still the fastest.
 */

const LON0 = -60.0
const LAT0 = -37.2
export const KM_PER_UNIT = 100
const KM_PER_LON = 111.2 * Math.cos((LAT0 * Math.PI) / 180)
const KM_PER_LAT = 111.2
const RURAL_SPEED = 50 // km/h on gravel roads
// Highest legal speed in Argentina (motorways). No road here is faster, so the heuristic below
// (straight line at this speed) never overestimates
const MAX_SPEED = 130
const GRID = 0.2 // rural road spacing: 20 km
const ROAD_STEP = 0.1 // fast roads get a node (and a junction) every 10 km

export const project = ([lon, lat]) => [((lon - LON0) * KM_PER_LON) / KM_PER_UNIT, ((LAT0 - lat) * KM_PER_LAT) / KM_PER_UNIT]

// The outline, clockwise from the north-west corner: land border with Córdoba and Santa Fe...
const NORTH_BORDER = [[-63.39, -34.4], [-62.6, -34.35], [-62.0, -34.15], [-61.4, -33.9], [-60.85, -33.72], [-60.5, -33.5], [-60.22, -33.27]]
// ...then water: Paraná, Río de la Plata, Samborombón bay and the Atlantic down to the Río Negro...
const SHORE = [
  [-60.22, -33.27], [-59.95, -33.5], [-59.65, -33.7], [-59.3, -33.95], [-59.0, -34.12], [-58.75, -34.3], [-58.6, -34.4],
  [-58.48, -34.5], [-58.37, -34.58], [-58.25, -34.68], [-58.1, -34.76], [-57.95, -34.83], [-57.75, -34.92], [-57.5, -35.03],
  [-57.3, -35.18], [-57.14, -35.42], [-57.25, -35.6], [-57.36, -35.78], [-57.33, -35.98], [-57.18, -36.17], [-56.98, -36.3],
  [-56.75, -36.3], [-56.68, -36.4], [-56.67, -36.6], [-56.72, -36.85], [-56.85, -37.1], [-56.98, -37.3], [-57.18, -37.52],
  [-57.4, -37.75], [-57.53, -37.97], [-57.6, -38.08], [-57.83, -38.27], [-58.3, -38.47], [-58.74, -38.58], [-59.3, -38.73],
  [-60.07, -38.87], [-60.6, -38.94], [-61.3, -39.0], [-61.8, -38.98], [-62.1, -38.88], [-62.27, -38.78], [-62.15, -39.05],
  [-62.0, -39.3], [-62.1, -39.6], [-62.15, -39.9], [-62.3, -40.25], [-62.25, -40.55], [-62.5, -40.8], [-62.78, -41.03],
]
// ...and the Río Negro and the land border with Río Negro and La Pampa, back north
const SOUTH_BORDER = [[-62.78, -41.03], [-63.0, -40.88], [-63.39, -40.7], [-63.39, -34.4]]

export const OUTLINE = {
  shore: SHORE.map(project),
  borders: [NORTH_BORDER.map(project), SOUTH_BORDER.map(project)],
}
const LAND = [...NORTH_BORDER, ...SHORE.slice(1), ...SOUTH_BORDER.slice(1, -1)].map(project)
export const LAND_OUTLINE = LAND

export const TOWNS = {
  caba: { name: 'CABA', at: [-58.38, -34.6], label: true },
  laPlata: { name: 'La Plata', at: [-57.95, -34.92] },
  chascomus: { name: 'Chascomús', at: [-58.01, -35.57] },
  castelli: { name: 'Castelli', at: [-57.8, -36.09] },
  dolores: { name: 'Dolores', at: [-57.68, -36.31], label: true }, // halfway on RN 2, clear of CABA's pin
  maipu: { name: 'Maipú', at: [-57.88, -36.86] },
  mdp: { name: 'Mar del Plata', at: [-57.56, -37.99], label: true },
  balcarce: { name: 'Balcarce', at: [-58.25, -37.85] },
  tandil: { name: 'Tandil', at: [-59.13, -37.32], label: true },
  azul: { name: 'Azul', at: [-59.86, -36.78] },
  lasFlores: { name: 'Las Flores', at: [-59.1, -36.01] },
  monte: { name: 'Monte', at: [-58.8, -35.44] },
  canuelas: { name: 'Cañuelas', at: [-58.76, -35.05] },
  lobos: { name: 'Lobos', at: [-59.1, -35.18] },
  saladillo: { name: 'Saladillo', at: [-59.78, -35.64] },
  brandsen: { name: 'Brandsen', at: [-58.23, -35.17] },
  belgrano: { name: 'Gral. Belgrano', at: [-58.49, -35.77] },
  ayacucho: { name: 'Ayacucho', at: [-58.49, -37.15] },
  magdalena: { name: 'Magdalena', at: [-57.52, -35.08] },
  pipinas: { name: 'Pipinas', at: [-57.33, -35.53] },
  conesa: { name: 'Gral. Conesa', at: [-57.32, -36.52] },
  lavalle: { name: 'Gral. Lavalle', at: [-56.94, -36.41] },
  ajo: { name: 'Mar de Ajó', at: [-56.72, -36.72] },
  pinamar: { name: 'Pinamar', at: [-56.88, -37.1] },
  gesell: { name: 'Villa Gesell', at: [-57.0, -37.26] },
  madariaga: { name: 'Gral. Madariaga', at: [-57.14, -37.0] },
  marChiquita: { name: 'Mar Chiquita', at: [-57.44, -37.74] },
  pilar: { name: 'Pilar', at: [-58.91, -34.46] },
  lujan: { name: 'Luján', at: [-59.1, -34.57] },
  mercedes: { name: 'Mercedes', at: [-59.43, -34.65] },
  chivilcoy: { name: 'Chivilcoy', at: [-60.02, -34.9] },
  bragado: { name: 'Bragado', at: [-60.49, -35.12] },
  nueveDeJulio: { name: '9 de Julio', at: [-60.88, -35.44] },
  pehuajo: { name: 'Pehuajó', at: [-61.9, -35.81] },
  trenqueLauquen: { name: 'Trenque Lauquen', at: [-62.73, -35.97] },
  giles: { name: 'S. A. de Giles', at: [-59.44, -34.45] },
  junin: { name: 'Junín', at: [-60.95, -34.59], label: true },
  lincoln: { name: 'Lincoln', at: [-61.53, -34.87] },
  villegas: { name: 'Gral. Villegas', at: [-63.01, -35.03] },
  zarate: { name: 'Zárate', at: [-59.03, -34.1] },
  sanPedro: { name: 'San Pedro', at: [-59.66, -33.68] },
  sanNicolas: { name: 'San Nicolás', at: [-60.22, -33.36] },
  areco: { name: 'S. A. de Areco', at: [-59.47, -34.24] },
  pergamino: { name: 'Pergamino', at: [-60.57, -33.89] },
  olavarria: { name: 'Olavarría', at: [-60.32, -36.89] },
  bolivar: { name: 'Bolívar', at: [-61.11, -36.23] },
  veinticincoDeMayo: { name: '25 de Mayo', at: [-60.17, -35.43] },
  juarez: { name: 'Benito Juárez', at: [-59.8, -37.67] },
  tresArroyos: { name: 'Tres Arroyos', at: [-60.28, -38.38] },
  necochea: { name: 'Necochea', at: [-58.74, -38.52] },
  bahiaBlanca: { name: 'Bahía Blanca', at: [-62.27, -38.72], label: true },
  tornquist: { name: 'Tornquist', at: [-62.22, -38.1] },
  pigue: { name: 'Pigüé', at: [-62.41, -37.61] },
  medanos: { name: 'Médanos', at: [-62.69, -38.83] },
  pedroLuro: { name: 'Pedro Luro', at: [-62.68, -39.5] },
  patagones: { name: 'Carmen de Patagones', at: [-62.98, -40.8] },
}

// Main routes: towns by key, plain [lon, lat] for bends between them. Speeds in km/h.
const ROADS = [
  { name: 'RN 2', speed: 110, via: ['caba', [-58.25, -34.8], [-58.12, -35.1], 'chascomus', [-57.88, -35.87], 'castelli', 'dolores', [-57.75, -36.6], 'maipu', [-57.73, -37.45], [-57.64, -37.68], 'mdp'] },
  { name: 'Autopista La Plata', speed: 100, via: ['caba', [-58.15, -34.75], 'laPlata'] },
  { name: 'RP 11', speed: 80, via: ['laPlata', 'magdalena', 'pipinas', [-57.48, -35.85], [-57.45, -36.2], 'conesa', 'lavalle', [-56.76, -36.42], 'ajo', 'pinamar', 'gesell', [-57.2, -37.48], 'marChiquita', 'mdp'] },
  { name: 'RP 63', speed: 80, via: ['dolores', [-57.45, -36.42], 'conesa'] },
  { name: 'RP 74', speed: 80, via: ['pinamar', 'madariaga', [-57.85, -37.08], 'ayacucho', 'tandil'] },
  { name: 'RN 226', speed: 100, via: ['mdp', 'balcarce', 'tandil', 'azul', 'olavarria', 'bolivar', 'pehuajo', 'villegas'] },
  { name: 'RN 3', speed: 100, via: ['caba', [-58.55, -34.8], 'canuelas', 'monte', 'lasFlores', [-59.5, -36.4], 'azul', 'juarez', 'tresArroyos', [-61.3, -38.6], 'bahiaBlanca', 'medanos', 'pedroLuro', 'patagones'] },
  { name: 'RN 205', speed: 90, via: ['canuelas', 'lobos', 'saladillo', 'veinticincoDeMayo', 'bolivar'] },
  { name: 'RP 29', speed: 80, via: ['brandsen', 'belgrano', [-58.5, -36.5], 'ayacucho', 'balcarce'] },
  { name: 'RP 215', speed: 80, via: ['laPlata', 'brandsen', 'monte'] },
  { name: 'RN 5', speed: 100, via: ['caba', 'lujan', 'mercedes', 'chivilcoy', 'bragado', 'nueveDeJulio', 'pehuajo', 'trenqueLauquen'] },
  { name: 'RN 7', speed: 110, via: ['caba', 'lujan', 'giles', 'junin', 'lincoln', [-62.3, -34.6]] },
  { name: 'RN 8', speed: 100, via: ['caba', 'pilar', 'areco', 'pergamino'] },
  { name: 'RN 9', speed: 110, via: ['caba', 'zarate', 'sanPedro', 'sanNicolas'] },
  { name: 'RN 33', speed: 90, via: ['bahiaBlanca', 'tornquist', 'pigue', [-62.6, -36.8], 'trenqueLauquen', [-62.85, -35.2], [-62.85, -34.45]] },
  { name: 'RP 88', speed: 90, via: ['mdp', [-58.2, -38.3], 'necochea', 'tresArroyos'] },
  { name: 'RP 51', speed: 80, via: ['bahiaBlanca', [-61.4, -37.95], 'olavarria'] },
]

// Small deterministic hash in [0, 1)
function hash(a, b, salt) {
  let h = (a * 374761393 + b * 668265263 + salt * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function onLand(x, z) {
  let inside = false
  for (let i = 0, j = LAND.length - 1; i < LAND.length; j = i++) {
    const [xi, zi] = LAND[i]
    const [xj, zj] = LAND[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

export function buildProvinceMap() {
  const xs = []
  const zs = []
  const edges = []
  const avenue = [] // true for main routes
  const weights = []
  const link = (a, b, speed) => {
    const km = Math.hypot(xs[a] - xs[b], zs[a] - zs[b]) * KM_PER_UNIT
    edges.push([a, b])
    avenue.push(speed > RURAL_SPEED)
    weights.push(km / speed)
  }
  const addAt = (x, z) => {
    zs.push(z)
    return xs.push(x) - 1
  }

  // Rural grid: straight section roads with a little jitter, only on land; a few are missing
  const minX = Math.min(...LAND.map(([x]) => x))
  const maxX = Math.max(...LAND.map(([x]) => x))
  const minZ = Math.min(...LAND.map(([, z]) => z))
  const maxZ = Math.max(...LAND.map(([, z]) => z))
  const grid = new Map()
  for (let r = 0; minZ + r * GRID <= maxZ; r++) {
    for (let c = 0; minX + c * GRID <= maxX; c++) {
      const x = minX + c * GRID + (hash(c, r, 1) - 0.5) * GRID * 0.2
      const z = minZ + r * GRID + (hash(c, r, 2) - 0.5) * GRID * 0.2
      if (onLand(x, z)) grid.set(`${c},${r}`, addAt(x, z))
    }
  }
  for (const [key, here] of grid) {
    const [c, r] = key.split(',').map(Number)
    for (const [dc, dr, salt] of [[1, 0, 3], [0, 1, 4]]) {
      const there = grid.get(`${c + dc},${r + dr}`)
      if (there === undefined || hash(c, r, salt) < 0.12) continue
      // Skip roads that would cross a bit of water
      if (!onLand((xs[here] + xs[there]) / 2, (zs[here] + zs[there]) / 2)) continue
      link(here, there, RURAL_SPEED)
    }
  }
  const gridNodes = [...grid.values()]
  const nearestGrid = (x, z, limit) => {
    const found = []
    for (const n of gridNodes) {
      const d = Math.hypot(xs[n] - x, zs[n] - z)
      if (d < limit) found.push([d, n])
    }
    return found.sort((a, b) => a[0] - b[0])
  }

  // Towns are nodes shared by every route that goes through them
  const town = {}
  for (const [key, t] of Object.entries(TOWNS)) {
    const [x, z] = project(t.at)
    town[key] = addAt(x, z)
    nearestGrid(x, z, GRID * 1.1).slice(0, 3).forEach(([, n]) => link(town[key], n, RURAL_SPEED))
  }

  // Routes: split into short pieces; each piece joins the rural road crossing it
  const roads = ROADS.map((road) => {
    const stops = road.via.map((v) => (typeof v === 'string' ? town[v] : addAt(...project(v))))
    const points = [stops[0]]
    for (let i = 1; i < stops.length; i++) {
      const [a, b] = [stops[i - 1], stops[i]]
      const pieces = Math.max(1, Math.round(Math.hypot(xs[b] - xs[a], zs[b] - zs[a]) / ROAD_STEP))
      let previous = a
      for (let p = 1; p <= pieces; p++) {
        const n = p === pieces ? b : addAt(xs[a] + ((xs[b] - xs[a]) * p) / pieces, zs[a] + ((zs[b] - zs[a]) * p) / pieces)
        link(previous, n, road.speed)
        if (p < pieces) {
          const [nearest] = nearestGrid(xs[n], zs[n], GRID * 0.45)
          if (nearest) link(n, nearest[1], RURAL_SPEED)
        }
        points.push(n)
        previous = n
      }
    }
    return { name: road.name, points }
  })

  const adjacency = Array.from({ length: xs.length }, () => [])
  edges.forEach(([a, b], e) => {
    adjacency[a].push({ to: b, w: weights[e], e })
    adjacency[b].push({ to: a, w: weights[e], e })
  })

  return {
    xs,
    zs,
    edges,
    avenue,
    adjacency,
    roads,
    town,
    source: town.mdp,
    target: town.caba,
    // Straight line in hours at top speed: never more than the real trip
    heuristicScale: KM_PER_UNIT / MAX_SPEED,
    radius: Math.hypot(maxX - minX, maxZ - minZ) / 2,
  }
}
