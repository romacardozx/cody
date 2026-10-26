import { useEffect, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion.js'
import styles from './HeroGraph.module.css'

// A small tree that BFS walks forever: the hero shows the product instead of describing it.
const NODES = {
  R: [180, 40],
  A: [95, 125],
  B: [265, 125],
  C: [45, 215],
  D: [145, 215],
  E: [215, 215],
  F: [315, 215],
}
const EDGES = [['R', 'A'], ['R', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['B', 'F']]
const CHILDREN = { R: ['A', 'B'], A: ['C', 'D'], B: ['E', 'F'] }
const ORDER = ['R', 'A', 'B', 'C', 'D', 'E', 'F']

/** Frame k: ORDER[k] is being processed; earlier nodes are visited; their children wait in the queue. */
function frame(k) {
  const visited = new Set(ORDER.slice(0, k))
  const current = ORDER[k] ?? null
  const discovered = new Set(['R'])
  ORDER.slice(0, k + 1).forEach((id) => (CHILDREN[id] ?? []).forEach((child) => discovered.add(child)))
  const frontier = [...discovered].filter((id) => !visited.has(id) && id !== current)
  const nextUp = ORDER[k + 1] ?? null
  return { visited, current, frontier: new Set(frontier), nextUp }
}

export function HeroGraph() {
  const reduceMotion = useReducedMotion()
  const [k, setK] = useState(reduceMotion ? 2 : 0)

  useEffect(() => {
    if (reduceMotion) return
    const timer = setTimeout(() => setK((value) => (value + 1) % (ORDER.length + 2)), k >= ORDER.length ? 1800 : 1150)
    return () => clearTimeout(timer)
  }, [k, reduceMotion])

  const { visited, current, frontier, nextUp } = frame(k)
  const state = (id) => (id === current ? 'current' : visited.has(id) ? 'visited' : frontier.has(id) ? 'frontier' : 'idle')

  return (
    <figure className={styles.figure} aria-label="Animación: BFS recorriendo un árbol por niveles">
      <svg viewBox="0 0 360 260" className={styles.svg} aria-hidden="true">
        <defs>
          <pattern id="hero-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className={styles.dot} />
          </pattern>
        </defs>
        <rect width="360" height="260" fill="url(#hero-dots)" />
        {EDGES.map(([from, to]) => {
          const active = (state(to) !== 'idle') && (state(from) === 'visited' || state(from) === 'current')
          return (
            <line
              key={from + to}
              x1={NODES[from][0]}
              y1={NODES[from][1]}
              x2={NODES[to][0]}
              y2={NODES[to][1]}
              className={active ? styles.edgeActive : styles.edge}
            />
          )
        })}
        {Object.entries(NODES).map(([id, [x, y]]) => (
          <g key={id} transform={`translate(${x} ${y})`} className={styles[state(id)]}>
            <circle r="19" className={styles.node} />
            <text dy="0.35em" className={styles.label}>{id}</text>
          </g>
        ))}
        {nextUp && current && (
          <g key={nextUp} transform={`translate(${NODES[nextUp][0] + 16} ${NODES[nextUp][1] - 30})`} className={styles.bubble}>
            <rect x="-6" y="-15" width="70" height="26" rx="13" />
            <text x="29" y="2.5">¿sigue?</text>
          </g>
        )}
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.key}><i className={styles.swFrontier} />en cola</span>
        <span className={styles.key}><i className={styles.swCurrent} />actual</span>
        <span className={styles.key}><i className={styles.swVisited} />visitado</span>
      </figcaption>
    </figure>
  )
}
