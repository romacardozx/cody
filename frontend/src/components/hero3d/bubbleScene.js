import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { createTimeline, ease } from './timeline.js'

/*
 * Bubble sort with 3D bars: each pair is compared (amber), swapped with a little hop (vermillion)
 * and, at the end of each pass, the largest bar left settles in place (mint). The first few
 * comparisons ask "¿se intercambian?" before showing the answer.
 */

const VALUES = [5, 2, 7, 1, 6, 3, 4]
const GAP = 0.82
const UNIT = 0.5
const ASKS = 2

export function createBubbleScene(ctx) {
  const object = new Group()
  const box = new BoxGeometry(0.6, 1, 0.6)
  const slotX = (slot) => (slot - (VALUES.length - 1) / 2) * GAP
  const base = -1.6

  const bars = VALUES.map((value, slot) => {
    const mesh = new Mesh(box, new MeshStandardMaterial({ color: ctx.palette.idle.clone(), roughness: 0.45 }))
    const height = value * UNIT
    mesh.scale.y = height
    mesh.position.set(slotX(slot), base + height / 2, 0)
    object.add(mesh)
    return { mesh, value, height, slot, x: slotX(slot), jump: false, state: 'idle' }
  })

  // Sort a copy to build the timeline; `order[slot]` is the bar standing in that slot
  let asking = null
  let askText = ''
  const order = bars.map((_, i) => i)
  const events = []
  let asked = 0
  const states = (pairs) => () => pairs.forEach(([bar, state]) => (bars[bar].state = state))
  for (let end = VALUES.length - 1; end > 0; end--) {
    let swapped = false
    for (let i = 0; i < end; i++) {
      const left = order[i]
      const right = order[i + 1]
      events.push({ ms: 260, apply: () => { asking = null; states([[left, 'frontier'], [right, 'frontier']])() } })
      const swap = VALUES[left] > VALUES[right]
      if (asked < ASKS) {
        asked += 1
        events.push({ ms: 1300, apply: () => { asking = [left, right]; askText = '¿se intercambian?' } })
      }
      if (swap) {
        order[i] = right
        order[i + 1] = left
        swapped = true
        events.push({
          ms: 520,
          apply: () => {
            asking = null
            bars[left].slot = i + 1
            bars[right].slot = i
            bars[left].jump = true // the bigger one jumps over, the smaller slides under
            bars[right].jump = false
            states([[left, 'current'], [right, 'current']])()
          },
        })
      }
      events.push({ ms: 120, apply: () => { asking = null; states([[left, 'idle'], [right, 'idle']])() } })
    }
    const settled = order[end]
    events.push({ ms: 200, apply: () => (bars[settled].state = 'visited') })
    if (!swapped) {
      // Nothing moved in this pass: the rest is already in order
      const rest = order.slice(0, end)
      events.push({ ms: 400, apply: () => rest.forEach((bar) => (bars[bar].state = 'visited')) })
      break
    }
    if (end === 1) events.push({ ms: 200, apply: () => (bars[order[0]].state = 'visited') })
  }
  const timeline = createTimeline(events)
  const black = ctx.palette.idle.clone().setRGB(0, 0, 0)
  const sway = { t: 0 }

  return {
    object,
    radius: 3.6,
    tilt: 0.22,
    update(dt, still) {
      const done = still ? (timeline.skipAll(), true) : timeline.update(dt)
      const palette = ctx.palette
      const k = still ? 1 : ease(dt)
      if (!still) {
        sway.t += dt
        object.rotation.y = -0.35 + Math.sin(sway.t * 0.4) * 0.3
      }
      bars.forEach((bar) => {
        const target = slotX(bar.slot)
        bar.x = still ? target : bar.x + (target - bar.x) * ease(dt, 7)
        // A small arc while it moves: the bigger bar jumps over the other one
        const lift = bar.jump ? Math.sin(Math.min(1, Math.abs(target - bar.x) / GAP) * Math.PI) * 0.6 : 0
        bar.mesh.position.set(bar.x, base + bar.height / 2 + lift, 0)
        const material = bar.mesh.material
        material.color.lerp(palette[bar.state], k)
        material.emissive.lerp(bar.state === 'current' ? palette.current : black, k)
        material.emissiveIntensity = bar.state === 'current' ? 0.45 : 0
      })
      let ask = null
      if (asking) {
        const [a, b] = asking.map((i) => bars[i].mesh.position)
        const top = Math.max(bars[asking[0]].height, bars[asking[1]].height)
        ask = { position: new Vector3((a.x + b.x) / 2, base + top + 0.2, 0), text: askText }
      }
      return { done, ask, labels: [] }
    },
    dispose() {
      box.dispose()
      object.traverse((o) => o.material?.dispose?.())
    },
  }
}
