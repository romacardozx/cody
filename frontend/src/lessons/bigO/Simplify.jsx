import { useState } from 'react'
import lesson from '../../components/lesson/Lesson.module.css'
import styles from './BigO.module.css'
import { formatNumber } from './format.js'

/*
 * Why the notation simplifies, shown instead of stated: a count from the deck, split into what
 * stays and what is dropped. Slide n and the dropped part shrinks until it does not matter; the
 * constant in front does not change how it grows either. Then the count becomes O(…).
 */

const SIZES = [10, 100, 1_000, 1_000_000]

const COUNTS = [
  {
    label: '3n + 5',
    story: 'Mezclar el mazo (5 pasos) y contar los oros 3 veces',
    keep: { label: '3n', f: (n) => 3 * n },
    drop: { label: '+ 5', f: () => 5 },
    result: 'O(n)',
    rule: '¿Y el 3? Si duplicás n, 3n también se duplica: crece igual que n. Las constantes no cambian cómo crece.',
  },
  {
    label: 'n² + n',
    story: 'Buscar repetidas y después contar los oros',
    keep: { label: 'n²', f: (n) => n * n },
    drop: { label: '+ n', f: (n) => n },
    result: 'O(n²)',
    rule: 'Manda el término que más crece: el resto, con n grande, es una gota.',
  },
]

/** A share of the total, the way people say it: "el 14 %", "menos del 0,01 %". */
function percent(part) {
  const value = part * 100
  if (value < 0.01) return 'menos del 0,01 %'
  return `el ${value.toFixed(value < 1 ? 2 : 0).replace('.', ',')} %`
}

export function Simplify() {
  const [countIndex, setCountIndex] = useState(0)
  const [sizeIndex, setSizeIndex] = useState(0)
  const count = COUNTS[countIndex]
  const n = SIZES[sizeIndex]
  const kept = count.keep.f(n)
  const dropped = count.drop.f(n)
  const share = dropped / (kept + dropped)

  return (
    <div className={lesson.figure}>
      <div className={styles.tabs} role="group" aria-label="Cuenta">
        {COUNTS.map((c, i) => (
          <button key={c.label} type="button" className={styles.tab} aria-pressed={i === countIndex} onClick={() => setCountIndex(i)}>
            <span className={lesson.mono}>{c.label}</span>
            <span className={styles.tabSub}>{c.story}</span>
          </button>
        ))}
      </div>

      <label className={lesson.sliderRow}>
        <span className={styles.sliderName}>Cartas</span>
        <input
          type="range"
          className={lesson.slider}
          min={0}
          max={SIZES.length - 1}
          value={sizeIndex}
          onChange={(e) => setSizeIndex(Number(e.target.value))}
          aria-valuetext={`n = ${formatNumber(n)}`}
        />
        <span className={lesson.sliderValue}>n = {formatNumber(n)}</span>
      </label>

      {/* The total, split: what stays and what is dropped */}
      <div className={styles.split} aria-hidden="true">
        <span className={styles.splitKeep} style={{ flexGrow: 1 - share }}>
          {count.keep.label}
        </span>
        <span className={styles.splitDrop} style={{ flexGrow: share }}>
          {share > 0.06 && count.drop.label}
        </span>
      </div>
      <p className={styles.splitNumbers}>
        <span>
          <span className={lesson.mono}>{count.keep.label}</span> = {formatNumber(kept)}
        </span>
        <span>
          <span className={lesson.mono}>{count.drop.label}</span> = {formatNumber(dropped)}: {percent(share)} del total
        </span>
      </p>

      <p className={styles.verdict}>
        {sizeIndex === 0
          ? `Con pocas cartas, «${count.drop.label}» todavía se nota. Mové el deslizador.`
          : `Con n = ${formatNumber(n)}, «${count.drop.label}» es ${percent(share)} del total: no cambia nada.`}{' '}
        {count.rule}
      </p>

      <p className={styles.simplified}>
        <span className={lesson.mono}>{count.label}</span>
        <span className={styles.ruleArrow} aria-hidden="true">→</span>
        <span className={styles.ruleTo}>{count.result}</span>
      </p>

      <p className={styles.warnings}>
        <strong>Ojo: O(1) no significa rápido.</strong> Significa que no crece: puede tardar un segundo, pero tarda lo mismo con 10 cartas o con un millón.
      </p>
    </div>
  )
}
