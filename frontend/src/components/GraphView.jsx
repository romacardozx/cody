import { memo, useMemo } from 'react'
import { motion } from 'motion/react'
import styles from './GraphView.module.css'

const R = 24 // node radius, in canvas units
const PAD = 64

function edgeKey(edge) {
  return `${edge.from}->${edge.to}`
}

/** Line between two node centers, trimmed so it starts and ends at the circles' border. */
function segment(from, to, directed) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const end = directed ? R + 7 : R
  return { x1: from.x + ux * R, y1: from.y + uy * R, x2: to.x - ux * end, y2: to.y - uy * end }
}

/**
 * Draws a graph scenario in one step of the trace.
 *
 * Colors come from the step's elementStates; while a question is pending, the option nodes are
 * clickable (an alternative way to answer, for users who think spatially) and the chosen one is
 * marked immediately, before the server replies.
 */
export const GraphView = memo(function GraphView({ graph, step, valueLabel, options, choice, onPick, dimmed }) {
  const byId = useMemo(() => Object.fromEntries(graph.nodes.map((node) => [node.id, node])), [graph.nodes])

  const viewBox = useMemo(() => {
    const xs = graph.nodes.map((n) => n.x)
    const ys = graph.nodes.map((n) => n.y)
    const minX = Math.min(...xs) - PAD
    const minY = Math.min(...ys) - PAD
    return `${minX} ${minY} ${Math.max(...xs) - minX + PAD} ${Math.max(...ys) - minY + PAD}`
  }, [graph.nodes])

  const states = step?.elementStates ?? {}
  const values = step?.values ?? {}
  const highlights = new Set(step?.highlights ?? [])
  const optionSet = new Set(options ?? [])
  const asking = optionSet.size > 0

  return (
    <svg
      className={`${styles.svg} ${dimmed ? styles.dimmed : ''} ${asking ? styles.asking : ''}`}
      viewBox={viewBox}
      role="group"
      aria-label="Grafo del escenario"
    >
      <defs>
        <pattern id="canvas-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1.1" className={styles.gridDot} />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className={styles.arrowHead} />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className={styles.arrowHeadActive} />
        </marker>
      </defs>
      <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#canvas-dots)" />

      {graph.edges.map((edge) => {
        const from = byId[edge.from]
        const to = byId[edge.to]
        if (!from || !to) return null
        const line = segment(from, to, graph.directed)
        const touched = [edge.from, edge.to].every((id) => states[id] && states[id] !== 'DEFAULT')
        const active = highlights.has(edgeKey(edge))
        return (
          <g key={edgeKey(edge)}>
            <line
              {...line}
              className={touched ? styles.edgeTouched : styles.edge}
              markerEnd={graph.directed ? 'url(#arrow)' : undefined}
            />
            {active && (
              <motion.line
                key={`${edgeKey(edge)}@${step.index}`}
                {...line}
                className={styles.edgeActive}
                markerEnd={graph.directed ? 'url(#arrow-active)' : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              />
            )}
          </g>
        )
      })}

      {graph.nodes.map((node) => {
        const state = (states[node.id] ?? 'DEFAULT').toLowerCase()
        const isOption = optionSet.has(node.id)
        const isChoice = choice === node.id
        const value = values[node.id]
        const interactive = isOption && !choice && onPick
        return (
          <g
            key={node.id}
            transform={`translate(${node.x} ${node.y})`}
            className={`${styles.node} ${styles[state]} ${isOption ? styles.option : ''} ${isChoice ? styles.choice : ''}`}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Predecir ${node.label}` : undefined}
            onClick={interactive ? () => onPick(node.id) : undefined}
            onKeyDown={interactive ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onPick(node.id)
              }
            } : undefined}
          >
            {state === 'current' && <circle r={R + 9} className={styles.pulse} />}
            {isOption && <circle r={R + 7} className={styles.optionRing} />}
            <circle r={R} className={styles.body} />
            <text dy="0.36em" className={styles.label}>{node.label}</text>
            {value !== undefined && (
              <g transform={`translate(${R * 0.78} ${-R * 0.95})`} className={styles.badge}>
                <title>{`${valueLabel}: ${value}`}</title>
                <rect x="-11" y="-10" width="22" height="20" rx="6" />
                <text dy="0.36em">{value}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
})
