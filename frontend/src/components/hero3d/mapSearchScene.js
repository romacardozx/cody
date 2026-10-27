import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CurvePath,
  Group,
  LineBasicMaterial,
  LineCurve3,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { bidirectional, buildStreetMap, search } from './streetMap.js'

/*
 * Bidirectional Dijkstra on a night map of a city by the bay: the search lights up street by
 * street, like a heat front (amber from the origin, mint from the destination, meeting halfway);
 * each explored street flares and then cools down. Then the shortest route draws itself in
 * vermillion. A HUD counts explored streets against plain Dijkstra.
 */

const EDGES_PER_SECOND = 130
const PATH_SECONDS = 1.3
const COOL_PER_SECOND = 1.1

let cache = null // the map and plain Dijkstra on it, computed once

const kilometers = (units) => `${(units * 1.2).toFixed(1).replace('.', ',')} km`

export function createMapSearchScene(ctx) {
  if (!cache) {
    const map = buildStreetMap()
    cache = { map, dijkstra: search(map), result: bidirectional(map) }
  }
  const { map, dijkstra, result } = cache
  const { xs, zs, edges, avenue, source, target } = map

  const object = new Group()
  const ground = new Group()
  ground.rotation.x = 0.72 // look at the map from above, tilted
  object.add(ground)

  // Street geometry, shared by the base layer and the glow layer
  const positions = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], e) => positions.set([xs[a], 0, zs[a], xs[b], 0, zs[b]], e * 6))
  const baseColors = new Float32Array(edges.length * 6)
  const baseGeometry = new BufferGeometry()
  baseGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  baseGeometry.setAttribute('color', new BufferAttribute(baseColors, 3))
  const baseMaterial = new LineBasicMaterial({ vertexColors: true })
  ground.add(new LineSegments(baseGeometry, baseMaterial))

  // Glow layer: RGBA per vertex, invisible (alpha 0) until the street is explored
  const glowColors = new Float32Array(edges.length * 8)
  const glowGeometry = new BufferGeometry()
  glowGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  glowGeometry.setAttribute('color', new BufferAttribute(glowColors, 4))
  const glowMaterial = new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false })
  const glow = new LineSegments(glowGeometry, glowMaterial)
  glow.position.y = 0.005
  ground.add(glow)

  // The route: a tube that draws itself from origin to destination
  const curve = new CurvePath()
  for (let i = 1; i < result.path.length; i++) {
    const a = result.path[i - 1]
    const b = result.path[i]
    curve.add(new LineCurve3(new Vector3(xs[a], 0.03, zs[a]), new Vector3(xs[b], 0.03, zs[b])))
  }
  const tubeGeometry = new TubeGeometry(curve, Math.max(8, result.path.length * 6), 0.035, 8, false)
  const routeMaterial = new MeshBasicMaterial({ color: ctx.palette.current.clone() })
  const route = new Mesh(tubeGeometry, routeMaterial)
  const routeIndexCount = tubeGeometry.index.count
  tubeGeometry.setDrawRange(0, 0)
  ground.add(route)

  // Origin and destination
  const pinGeometry = new SphereGeometry(0.12, 24, 16)
  const pin = (n, key) => {
    const mesh = new Mesh(pinGeometry, new MeshStandardMaterial({ color: ctx.palette[key].clone(), roughness: 0.35 }))
    mesh.position.set(xs[n], 0.12, zs[n])
    ground.add(mesh)
    return { mesh, key }
  }
  const pins = [pin(source, 'text'), pin(target, 'current')]

  const heat = new Float32Array(edges.length) // 1 = just explored, cools towards 0
  const side = new Uint8Array(edges.length)
  const active = new Set()
  let shown = 0 // streets already lit (integer index into result.explored)
  let budget = 0 // how many should be lit by now (grows with time)
  let pathProgress = 0
  let sway = 0
  const scratch = new Color()
  const tints = [new Color(), new Color()]

  const paintBase = (palette) => {
    edges.forEach((_, e) => {
      scratch.copy(palette.edge)
      if (avenue[e]) scratch.lerp(palette.text, palette.light ? 0.12 : 0.18)
      baseColors.set([scratch.r, scratch.g, scratch.b, scratch.r, scratch.g, scratch.b], e * 6)
    })
    baseGeometry.attributes.color.needsUpdate = true
  }
  let paintedFor = null

  const paintGlow = (e) => {
    const tint = tints[side[e]]
    const h = heat[e]
    // Hot: close to white-hot version of the side color; cool: the side color, dimmer
    scratch.copy(tint).multiplyScalar(0.85 + 0.15 * (1 - h)).lerp(ctx.palette.light ? tint : ctx.palette.text, h * 0.55)
    const alpha = 0.8 + 0.2 * h
    glowColors.set([scratch.r, scratch.g, scratch.b, alpha, scratch.r, scratch.g, scratch.b, alpha], e * 8)
  }

  return {
    object,
    // A tilted plane takes less room than its bounding sphere; checked against the frame edges
    radius: map.radius * 0.86,
    tilt: 0.04,
    hold: 5, // time to read the data panel before the next scene
    update(dt, still) {
      const palette = ctx.palette
      if (paintedFor !== palette) {
        paintBase(palette)
        paintedFor = palette
      }
      tints[0].copy(palette.frontier)
      tints[1].copy(palette.visited)
      routeMaterial.color.copy(palette.current)
      pins.forEach((p) => p.mesh.material.color.copy(palette[p.key]))

      if (!still) {
        sway += dt
        object.rotation.y = Math.sin(sway * 0.3) * 0.28
      }

      // Reveal explored streets at a steady pace: a smarter search finishes sooner
      const total = result.explored.length
      budget = still ? total : Math.min(total, budget + EDGES_PER_SECOND * dt)
      while (shown < Math.floor(budget)) {
        const { e, side: s } = result.explored[shown]
        side[e] = s
        heat[e] = still ? 0 : 1
        active.add(e)
        shown += 1
      }

      for (const e of active) {
        heat[e] = Math.max(0, heat[e] - dt * COOL_PER_SECOND)
        paintGlow(e)
        if (heat[e] === 0 && !still) active.delete(e)
      }
      if (still) active.clear()
      glowGeometry.attributes.color.needsUpdate = true

      const searching = shown < total
      if (!searching) pathProgress = still ? 1 : Math.min(1, pathProgress + dt / PATH_SECONDS)
      tubeGeometry.setDrawRange(0, Math.floor((routeIndexCount * pathProgress) / 3) * 3)

      object.updateMatrixWorld(true)
      const local = (mesh) => object.worldToLocal(mesh.getWorldPosition(new Vector3()))
      const found = pathProgress >= 1
      return {
        done: found,
        ask: null,
        labels: [
          { position: local(pins[0].mesh), text: 'Origen' },
          { position: local(pins[1].mesh), text: 'Destino' },
        ],
        hud: {
          title: 'Dijkstra bidireccional',
          rows: [
            ['Calles exploradas', String(shown)],
            ['Dijkstra común', String(dijkstra.explored.length)],
            ['Distancia', found ? kilometers(result.distance) : '—'],
          ],
        },
      }
    },
    dispose() {
      baseGeometry.dispose()
      glowGeometry.dispose()
      tubeGeometry.dispose()
      pinGeometry.dispose()
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
