import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CurvePath,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  LineCurve3,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { buildProvinceMap, KM_PER_UNIT, LAND_OUTLINE, OUTLINE, TOWNS } from './provinceMap.js'
import { search } from './streetMap.js'

/*
 * A* from Mar del Plata to CABA on a map of the whole Buenos Aires province: its outline, main
 * routes as solid roads, rural roads dashed. The search lights up the roads it explores (pulled
 * north, towards the destination), then the route draws itself with a car at its tip. The HUD
 * compares it with plain Dijkstra and gives the trip's length and time.
 */

const EDGES_PER_SECOND = 45
const PATH_SECONDS = 2.4
const COOL_PER_SECOND = 1.1
const LIFT = 0.004 // layers stacked above the land, so they never flicker into each other

let cache = null // the map and both searches never change: computed once

const formatKm = (km) => `${Math.round(km)} km`
const formatTime = (hours) => `${Math.floor(hours)} h ${String(Math.round((hours % 1) * 60)).padStart(2, '0')} min`

export function createRouteScene(ctx) {
  if (!cache) {
    const map = buildProvinceMap()
    const astar = search(map, { heuristic: true })
    let km = 0
    for (let i = 1; i < astar.path.length; i++) {
      const [a, b] = [astar.path[i - 1], astar.path[i]]
      km += Math.hypot(map.xs[a] - map.xs[b], map.zs[a] - map.zs[b]) * KM_PER_UNIT
    }
    cache = { map, astar, dijkstra: search(map), km }
  }
  const { map, astar, dijkstra, km } = cache
  const { xs, zs, edges, avenue, roads, town } = map

  const object = new Group()
  const ground = new Group()
  ground.rotation.x = 0.6 // flatter than the city scenes: the province's outline should read at a glance
  object.add(ground)

  // Land: a flat silhouette of the province; the shore drawn over it, land borders fainter
  const shape = new Shape()
  LAND_OUTLINE.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)))
  const landGeometry = new ShapeGeometry(shape)
  landGeometry.rotateX(Math.PI / 2)
  const landMaterial = new MeshBasicMaterial({ side: DoubleSide, transparent: true, depthWrite: false })
  ground.add(new Mesh(landGeometry, landMaterial))

  const toLine = (points) => new BufferGeometry().setFromPoints(points.map(([x, z]) => new Vector3(x, LIFT, z)))
  const coastGeometry = toLine(OUTLINE.shore)
  const coastMaterial = new LineBasicMaterial()
  ground.add(new Line(coastGeometry, coastMaterial))
  const borderGeometries = OUTLINE.borders.map(toLine)
  const borderMaterial = new LineBasicMaterial()
  borderGeometries.forEach((geometry) => ground.add(new Line(geometry, borderMaterial)))

  // Rural roads: dashed lines
  const rural = edges.map((_, e) => e).filter((e) => !avenue[e])
  const ruralPositions = new Float32Array(rural.length * 6)
  rural.forEach((e, i) => {
    const [a, b] = edges[e]
    ruralPositions.set([xs[a], LIFT, zs[a], xs[b], LIFT, zs[b]], i * 6)
  })
  const ruralGeometry = new BufferGeometry()
  ruralGeometry.setAttribute('position', new BufferAttribute(ruralPositions, 3))
  const ruralLines = new LineSegments(ruralGeometry, new LineDashedMaterial({ dashSize: 0.035, gapSize: 0.04 }))
  ruralLines.computeLineDistances()
  ground.add(ruralLines)

  // Main routes: solid, thicker roads
  const roadMaterial = new MeshBasicMaterial()
  const roadGeometries = roads.map(({ points }) => {
    const curve = new CatmullRomCurve3(points.map((n) => new Vector3(xs[n], LIFT * 2, zs[n])), false, 'centripetal', 0.1)
    return new TubeGeometry(curve, points.length * 3, 0.014, 5, false)
  })
  roadGeometries.forEach((geometry) => ground.add(new Mesh(geometry, roadMaterial)))

  // Glow layer: every road, invisible (alpha 0) until the search explores it
  const positions = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], e) => positions.set([xs[a], LIFT * 6, zs[a], xs[b], LIFT * 6, zs[b]], e * 6))
  const glowColors = new Float32Array(edges.length * 8)
  const glowGeometry = new BufferGeometry()
  glowGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  glowGeometry.setAttribute('color', new BufferAttribute(glowColors, 4))
  const glowMaterial = new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false })
  ground.add(new LineSegments(glowGeometry, glowMaterial))

  // Towns: a dot each, bigger for the labelled ones
  const townGeometry = new SphereGeometry(1, 16, 10)
  const townMaterial = new MeshStandardMaterial({ roughness: 0.5 })
  const labelled = []
  for (const [key, t] of Object.entries(TOWNS)) {
    const dot = new Mesh(townGeometry, townMaterial)
    dot.scale.setScalar(t.label ? 0.045 : 0.025)
    dot.position.set(xs[town[key]], 0.03, zs[town[key]])
    ground.add(dot)
    if (t.label && key !== 'mdp' && key !== 'caba') labelled.push({ dot, text: t.name })
  }

  // The route, drawn from Mar del Plata north, with a car leading it
  const curve = new CurvePath()
  for (let i = 1; i < astar.path.length; i++) {
    const [a, b] = [astar.path[i - 1], astar.path[i]]
    curve.add(new LineCurve3(new Vector3(xs[a], 0.03, zs[a]), new Vector3(xs[b], 0.03, zs[b])))
  }
  const routeGeometry = new TubeGeometry(curve, astar.path.length * 4, 0.035, 8, false)
  const routeMaterial = new MeshBasicMaterial()
  const routeIndexCount = routeGeometry.index.count
  routeGeometry.setDrawRange(0, 0)
  ground.add(new Mesh(routeGeometry, routeMaterial))

  const pinGeometry = new SphereGeometry(0.11, 24, 16)
  const origin = new Mesh(pinGeometry, new MeshStandardMaterial({ roughness: 0.35 }))
  const destination = new Mesh(pinGeometry, new MeshStandardMaterial({ roughness: 0.35 }))
  origin.position.set(xs[map.source], 0.11, zs[map.source])
  destination.position.set(xs[map.target], 0.11, zs[map.target])
  const car = new Mesh(new SphereGeometry(0.075, 20, 14), new MeshStandardMaterial({ roughness: 0.3, emissiveIntensity: 0.6 }))
  car.visible = false
  ground.add(origin, destination, car)

  const heat = new Float32Array(edges.length)
  const active = new Set()
  let shown = 0
  let budget = 0
  let pathProgress = 0
  let sway = 0
  const scratch = new Color()

  return {
    object,
    radius: map.radius * 0.9,
    tilt: 0.02,
    hold: 5,
    hudSide: 'bottom-right', // the open Atlantic: the panel covers no land there
    update(dt, still) {
      const palette = ctx.palette
      landMaterial.color.copy(palette.building)
      landMaterial.opacity = palette.light ? 0.55 : 0.4
      coastMaterial.color.copy(palette.edge).lerp(palette.text, 0.45)
      borderMaterial.color.copy(palette.edge).lerp(palette.text, 0.2)
      ruralLines.material.color.copy(palette.edge).lerp(palette.text, palette.light ? 0.05 : 0.12)
      roadMaterial.color.copy(palette.edge).lerp(palette.text, 0.4)
      townMaterial.color.copy(palette.text)
      routeMaterial.color.copy(palette.current)
      origin.material.color.copy(palette.text)
      destination.material.color.copy(palette.current)
      car.material.color.copy(palette.current)
      car.material.emissive.copy(palette.current)

      if (!still) {
        sway += dt
        object.rotation.y = Math.sin(sway * 0.3) * 0.16
      }

      // Light up explored roads at a steady pace; each one flares, then cools to amber
      const total = astar.explored.length
      budget = still ? total : Math.min(total, budget + EDGES_PER_SECOND * dt)
      while (shown < Math.floor(budget)) {
        const { e } = astar.explored[shown]
        heat[e] = still ? 0 : 1
        active.add(e)
        shown += 1
      }
      for (const e of active) {
        heat[e] = Math.max(0, heat[e] - dt * COOL_PER_SECOND)
        const h = heat[e]
        scratch.copy(palette.frontier).lerp(palette.light ? palette.frontier : palette.text, h * 0.55)
        const alpha = 0.85 + 0.15 * h
        glowColors.set([scratch.r, scratch.g, scratch.b, alpha, scratch.r, scratch.g, scratch.b, alpha], e * 8)
        if (h === 0 && !still) active.delete(e)
      }
      if (still) active.clear()
      glowGeometry.attributes.color.needsUpdate = true

      if (shown >= total) pathProgress = still ? 1 : Math.min(1, pathProgress + dt / PATH_SECONDS)
      routeGeometry.setDrawRange(0, Math.floor((routeIndexCount * pathProgress) / 3) * 3)
      car.visible = pathProgress > 0 && pathProgress < 1
      if (car.visible) car.position.copy(curve.getPointAt(pathProgress)).setY(0.075)

      object.updateMatrixWorld(true)
      const local = (mesh) => object.worldToLocal(mesh.getWorldPosition(new Vector3()))
      const found = pathProgress >= 1
      return {
        done: found,
        ask: null,
        labels: [
          { position: local(origin), text: 'Mar del Plata' },
          { position: local(destination), text: 'CABA' },
          ...labelled.map(({ dot, text }) => ({ position: local(dot), text, minor: true })),
        ],
        hud: {
          title: 'A*',
          rows: [
            ['Tramos explorados', String(shown)],
            ['Dijkstra común', String(dijkstra.explored.length)],
            ['Viaje', found ? `${formatKm(km)} · ${formatTime(astar.distance)}` : '—'],
          ],
        },
      }
    },
    dispose() {
      ;[landGeometry, coastGeometry, ...borderGeometries, ruralGeometry, glowGeometry, routeGeometry, townGeometry, pinGeometry, car.geometry, ...roadGeometries].forEach((g) => g.dispose())
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
