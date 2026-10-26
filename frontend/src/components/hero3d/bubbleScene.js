import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { createTimeline, ease } from './timeline.js'

/*
 * Bubble sort with a gantry crane: numbered blocks stand on a platform; each pair is compared
 * (amber) and, when they must swap, the crane picks the bigger block up, carries it over the
 * smaller one (which slides the other way) and sets it down. At the end of each pass the block
 * that reached its place turns mint. The first comparisons ask "¿se intercambian?".
 */

const VALUES = [4, 2, 6, 1, 5, 3]
const GAP = 0.95
const WIDTH = 0.7
const BASE = -1.85 // top of the platform
const ASKS = 2
const heightOf = (value) => 0.3 + value * 0.22
const MAX_HEIGHT = heightOf(Math.max(...VALUES))
const RAIL = BASE + MAX_HEIGHT * 2 + 0.45 // high enough to carry any block over any other
const HOOK_REST = RAIL - 0.35

/** A square texture with the block's number, readable on any block color. */
function numberTexture(value) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const g = canvas.getContext('2d')
  g.font = '700 84px "Bricolage Grotesque Variable", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.lineWidth = 10
  g.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  g.strokeText(String(value), 64, 70)
  g.fillStyle = '#ffffff'
  g.fillText(String(value), 64, 70)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function createBubbleScene(ctx) {
  const object = new Group()
  const slotX = (slot) => (slot - (VALUES.length - 1) / 2) * GAP
  const span = (VALUES.length - 1) * GAP + WIDTH + 0.6

  // Structure: platform, two posts and the rail on top
  const box = new BoxGeometry(1, 1, 1)
  const frameMaterial = new MeshStandardMaterial({ color: ctx.palette.building.clone(), roughness: 0.6, metalness: 0.2 })
  const platform = new Mesh(box, frameMaterial)
  platform.scale.set(span, 0.22, 1.3)
  platform.position.set(0, BASE - 0.11, 0)
  const post = new CylinderGeometry(0.06, 0.06, RAIL - BASE, 12)
  const posts = [-1, 1].map((side) => {
    const mesh = new Mesh(post, frameMaterial)
    mesh.position.set((side * span) / 2 - side * 0.12, (BASE + RAIL) / 2, -0.45)
    return mesh
  })
  const rail = new Mesh(box, frameMaterial)
  rail.scale.set(span - 0.1, 0.09, 0.12)
  rail.position.set(0, RAIL, -0.45)
  object.add(platform, ...posts, rail)

  // Crane: trolley on the rail, a cable and a hook
  const trolley = new Mesh(box, new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.4 }))
  trolley.scale.set(0.42, 0.22, 0.42)
  const cable = new Mesh(new CylinderGeometry(0.015, 0.015, 1, 6), new MeshStandardMaterial({ color: ctx.palette.idle.clone() }))
  const hook = new Mesh(box, new MeshStandardMaterial({ color: ctx.palette.current.clone(), roughness: 0.4 }))
  hook.scale.set(0.26, 0.07, 0.26)
  object.add(trolley, cable, hook)
  const crane = { x: 0, hook: HOOK_REST, targetX: 0, targetHook: HOOK_REST }

  // Blocks: a box plus its number on the front face
  const plane = new PlaneGeometry(0.46, 0.46)
  const blocks = VALUES.map((value, slot) => {
    const group = new Group()
    const height = heightOf(value)
    const body = new Mesh(box, new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.5 }))
    body.scale.set(WIDTH, height, WIDTH)
    const texture = numberTexture(value)
    const label = new Mesh(plane, new MeshBasicMaterial({ map: texture, transparent: true }))
    label.position.set(0, height / 2 - 0.3, WIDTH / 2 + 0.002)
    group.add(body, label)
    group.position.set(slotX(slot), BASE + height / 2, 0)
    object.add(group)
    return { group, body, texture, value, height, slot, x: slotX(slot), targetX: slotX(slot), state: 'idle' }
  })

  // Build the timeline by sorting a copy; `order[slot]` is the block standing in that slot
  let asking = null
  let carrying = null
  const order = blocks.map((_, i) => i)
  const events = []
  let asked = 0
  const setStates = (pairs) => pairs.forEach(([b, state]) => (blocks[b].state = state))
  for (let end = VALUES.length - 1; end > 0; end--) {
    let swapped = false
    for (let i = 0; i < end; i++) {
      const left = order[i]
      const right = order[i + 1]
      events.push({ ms: 300, apply: () => { asking = null; setStates([[left, 'frontier'], [right, 'frontier']]) } })
      if (asked < ASKS) {
        asked += 1
        events.push({ ms: 1300, apply: () => (asking = [left, right]) })
      }
      if (VALUES[left] > VALUES[right]) {
        order[i] = right
        order[i + 1] = left
        swapped = true
        const L = blocks[left]
        const R = blocks[right]
        events.push(
          // Reach: the crane goes over the bigger block and lowers the hook onto it
          { ms: 420, apply: () => { asking = null; crane.targetX = slotX(i); crane.targetHook = BASE + L.height + 0.05 } },
          // Lift it above every other block
          { ms: 420, apply: () => { carrying = L; L.state = 'current'; crane.targetHook = BASE + MAX_HEIGHT + 0.15 + L.height } },
          // Carry it one place right while the smaller one slides left
          { ms: 520, apply: () => { crane.targetX = slotX(i + 1); R.targetX = slotX(i); R.state = 'current' } },
          // Set it down and let go
          { ms: 400, apply: () => { crane.targetHook = BASE + L.height + 0.05 } },
          { ms: 260, apply: () => { carrying = null; L.targetX = slotX(i + 1); crane.targetHook = HOOK_REST } },
        )
      }
      events.push({ ms: 120, apply: () => setStates([[left, 'idle'], [right, 'idle']]) })
    }
    const settled = order[end]
    events.push({ ms: 260, apply: () => (blocks[settled].state = 'visited') })
    if (!swapped) {
      // Nothing moved in this pass: the rest is already in order
      const rest = order.slice(0, end)
      events.push({ ms: 400, apply: () => rest.forEach((b) => (blocks[b].state = 'visited')) })
      break
    }
    if (end === 1) events.push({ ms: 260, apply: () => (blocks[order[0]].state = 'visited') })
  }
  events.push({ ms: 400, apply: () => { crane.targetX = 0; crane.targetHook = HOOK_REST } })
  const timeline = createTimeline(events)
  const black = ctx.palette.idle.clone().setRGB(0, 0, 0)
  let sway = 0

  return {
    object,
    radius: 3.75,
    tilt: 0.18,
    update(dt, still) {
      const done = still ? (timeline.skipAll(), (carrying = null), true) : timeline.update(dt)
      const palette = ctx.palette
      const k = still ? 1 : ease(dt)
      if (!still) {
        sway += dt
        object.rotation.y = -0.3 + Math.sin(sway * 0.35) * 0.28
      }
      frameMaterial.color.copy(palette.building)
      trolley.material.color.copy(palette.idle)
      cable.material.color.copy(palette.idle)
      hook.material.color.copy(palette.current)

      // Crane
      const move = still ? 1 : ease(dt, 9)
      crane.x += (crane.targetX - crane.x) * move
      crane.hook += (crane.targetHook - crane.hook) * move
      trolley.position.set(crane.x, RAIL - 0.16, 0)
      hook.position.set(crane.x, crane.hook, 0)
      const length = Math.max(0.01, RAIL - 0.27 - crane.hook)
      cable.scale.y = length
      cable.position.set(crane.x, crane.hook + length / 2, 0)

      // Blocks: the carried one hangs from the hook, the rest slide along the platform
      blocks.forEach((b) => {
        if (b === carrying) {
          b.x = crane.x
          b.group.position.set(crane.x, crane.hook - 0.05 - b.height / 2, 0)
        } else {
          b.x = still ? b.targetX : b.x + (b.targetX - b.x) * ease(dt, 8)
          b.group.position.set(b.x, BASE + b.height / 2, 0)
        }
        const material = b.body.material
        material.color.lerp(palette[b.state], k)
        material.emissive.lerp(b.state === 'current' ? palette.current : black, k)
        material.emissiveIntensity = b.state === 'current' ? 0.35 : 0
      })

      let ask = null
      if (asking) {
        const [a, b] = asking.map((i) => blocks[i])
        ask = { position: new Vector3((a.x + b.x) / 2, BASE + Math.max(a.height, b.height) + 0.25, 0), text: '¿se intercambian?' }
      }
      return { done, ask, labels: [] }
    },
    dispose() {
      box.dispose()
      post.dispose()
      plane.dispose()
      cable.geometry.dispose()
      blocks.forEach((b) => b.texture.dispose())
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
