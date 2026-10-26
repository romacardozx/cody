import { Suspense, use, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { getAlgorithm, getScenarios } from '../api/cody.js'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { GraphView } from '../components/GraphView.jsx'
import { Icon } from '../components/Icon.jsx'
import { PlayerControls, StepTrack } from '../components/PlayerControls.jsx'
import { Feedback, PredictionPanel } from '../components/PredictionPanel.jsx'
import { PseudocodePanel } from '../components/PseudocodePanel.jsx'
import { VariablesPanel } from '../components/VariablesPanel.jsx'
import panels from '../components/Panels.module.css'
import { useHotkeys } from '../hooks/useHotkeys.js'
import { usePlayback } from '../hooks/usePlayback.js'
import { useSession } from '../hooks/useSession.js'
import { Link } from '../components/Link.jsx'
import { FAMILY } from '../lib/families.js'
import styles from './VisualizerPage.module.css'

const STEP_TYPES = {
  START: 'Inicio',
  ENQUEUE: 'Encolar',
  DEQUEUE: 'Desencolar',
  VISIT: 'Visitar',
  RELAX: 'Relajar',
  COMPARE: 'Comparar',
  SWAP: 'Intercambiar',
  MARK_SORTED: 'Ordenado',
  NARROW_RANGE: 'Achicar rango',
  FOUND: 'Encontrado',
  FINISH: 'Fin',
}

// What the number on each node means, per algorithm
const VALUE_LABEL = { BFS: 'nivel', DIJKSTRA: 'distancia' }

export default function VisualizerPage({ code }) {
  return (
    // Animations follow the OS "reduce motion" setting
    <MotionConfig reducedMotion="user">
      <main className={styles.page}>
        <Link to="/" className={styles.back}>
          <Icon name="back" size={16} /> Algoritmos
        </Link>
        <ErrorBoundary title="No pudimos abrir este algoritmo">
          <Suspense fallback={<VisualizerSkeleton />}>
            <Visualizer code={code} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </MotionConfig>
  )
}

function Visualizer({ code }) {
  const algorithm = use(getAlgorithm(code))
  if (!algorithm.available) {
    return (
      <div className={styles.unavailable}>
        <h1 className={styles.title}>{algorithm.name}</h1>
        <p>Todavía no está disponible para predecir. Mientras tanto, probá con BFS.</p>
        <Link to="/algorithms/BFS" className={styles.unavailableLink}>Ir a BFS <Icon name="arrow" size={16} /></Link>
      </div>
    )
  }
  const scenarios = use(getScenarios(algorithm.scenarioType))
  return <Player algorithm={algorithm} scenarios={scenarios} />
}

function Player({ algorithm, scenarios }) {
  const [scenarioId, setScenarioId] = useState(() => (scenarios.find((s) => !s.graph?.directed) ?? scenarios[0])?.id)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const session = useSession(algorithm.code)
  const { start, go, cursor } = session

  useEffect(() => {
    if (scenarioId != null) start(scenarioId)
  }, [scenarioId, start])

  const chooseScenario = (id) => {
    playback.cancelResume()
    setPlaying(false)
    setScenarioId(id)
  }

  // The graph drawn is the one the current steps belong to, even while a new one loads
  const shown = scenarios.find((s) => s.id === session.scenarioId)
  const selected = scenarios.find((s) => s.id === scenarioId)
  const labels = useMemo(
    () => Object.fromEntries((shown?.graph?.nodes ?? []).map((node) => [node.id, node.label])),
    [shown],
  )
  const labelOf = useCallback((id) => labels[id] ?? id, [labels])

  const next = useCallback(() => go(cursor + 1), [go, cursor])
  const prev = useCallback(() => go(cursor - 1), [go, cursor])
  const playback = usePlayback({
    playing,
    setPlaying,
    speed,
    canGoNext: session.canGoNext,
    blocked: session.blocked,
    next,
  })

  const restart = () => {
    playback.cancelResume()
    setPlaying(false)
    start(scenarioId)
  }

  const { question, questionAnswer } = session
  const awaitingAnswer = question && !questionAnswer
  const answer = (choice) => question && session.answer(question.id, choice)

  useHotkeys({
    ' ': () => (playing ? setPlaying(false) : session.canGoNext && setPlaying(true)),
    ArrowRight: () => session.canGoNext && next(),
    ArrowLeft: () => session.canGoPrev && prev(),
    Home: () => go(0),
    ...Object.fromEntries(
      (awaitingAnswer ? question.options : []).slice(0, 9).map((option, i) => [String(i + 1), () => answer(option)]),
    ),
  })

  // The step right after an answered question reveals the answer: show how it went
  const previous = session.steps[cursor - 1]
  const lastResult = previous?.question ? session.answers[previous.question.id] : null
  const step = session.step
  const family = FAMILY[algorithm.family]
  const loading = session.status === 'loading'

  return (
    <>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.family}>
            <Icon name={family.icon} size={15} /> {family.label}
          </p>
          <h1 className={styles.title}>{algorithm.name}</h1>
          <p className={styles.description}>{algorithm.description}</p>
        </div>
        <div className={styles.headSide}>
          <div className={styles.complexities}>
            <span className={styles.complexity}><span>tiempo</span> {algorithm.timeComplexity}</span>
            <span className={styles.complexity}><span>espacio</span> {algorithm.spaceComplexity}</span>
          </div>
          <label className={styles.picker}>
            <span className={styles.pickerLabel}>Escenario</span>
            <select value={scenarioId ?? ''} onChange={(event) => chooseScenario(Number(event.target.value))}>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </label>
          {selected?.description && <p className={styles.scenarioDescription}>{selected.description}</p>}
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.stage}>
          <div className={styles.canvas} aria-busy={loading}>
            {session.status === 'error' ? (
              <div className={styles.canvasMessage} role="alert">
                <p>{session.error.message}</p>
                <button type="button" className={styles.retry} onClick={restart}>Reintentar</button>
              </div>
            ) : shown?.graph && step ? (
              <GraphView
                graph={shown.graph}
                step={step}
                valueLabel={VALUE_LABEL[algorithm.code] ?? 'valor'}
                options={awaitingAnswer || questionAnswer?.status === 'pending' ? question.options : null}
                choice={questionAnswer?.choice}
                onPick={awaitingAnswer ? answer : undefined}
                dimmed={loading}
              />
            ) : (
              <CanvasSkeleton />
            )}
            {loading && session.steps.length > 0 && <span className={styles.loadingTag}>Preparando escenario…</span>}
          </div>

          <div className={styles.legend}>
            <div className={panels.legend}>
              <span className={panels.legendItem}><i className={panels.swatch} />sin tocar</span>
              <span className={panels.legendItem}><i className={`${panels.swatch} ${panels.swFrontier}`} />en cola</span>
              <span className={panels.legendItem}><i className={`${panels.swatch} ${panels.swCurrent}`} />actual</span>
              <span className={panels.legendItem}><i className={`${panels.swatch} ${panels.swVisited}`} />visitado</span>
              <span className={panels.legendItem}><i className={`${panels.swatch} ${panels.swValue}`} />número = {VALUE_LABEL[algorithm.code] ?? 'valor'}</span>
            </div>
            {session.total > 0 && (
              <span className={styles.counter}>
                Paso <strong>{cursor + 1}</strong> de {session.total}
              </span>
            )}
          </div>

          <div className={styles.dock}>
            {session.total > 0 && (
              <StepTrack total={session.total} steps={session.steps} cursor={cursor} answers={session.answers} onGo={go} />
            )}

            <AnimatePresence mode="wait">
              {lastResult?.status === 'done' && <Feedback key={previous.question.id} answer={lastResult} labelOf={labelOf} />}
            </AnimatePresence>

            {step && (
              <motion.div
                key={`${session.sessionId}-${step.index}`}
                className={styles.explanation}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                aria-live="polite"
              >
                <span className={styles.stepType}>{STEP_TYPES[step.type] ?? step.type}</span>
                <p>{step.explanation}</p>
              </motion.div>
            )}

            {question && (
              <PredictionPanel
                key={question.id}
                question={question}
                answer={questionAnswer}
                labelOf={labelOf}
                onAnswer={answer}
                error={session.answerError}
              />
            )}

            {session.done && <FinishCard score={session.score} asked={session.asked} onRestart={restart} />}

            <PlayerControls
              playing={playing}
              onTogglePlay={() => setPlaying((value) => !value)}
              onPrev={prev}
              onNext={next}
              onRestart={restart}
              canPrev={session.canGoPrev}
              canNext={session.canGoNext}
              speed={speed}
              onSpeed={setSpeed}
              blocked={session.blocked}
            />
          </div>
        </div>

        <aside className={styles.side}>
          <section className={panels.panel} aria-labelledby="score-title">
            <h2 id="score-title" className={panels.panelTitle}>Tus predicciones</h2>
            <div className={panels.score}>
              <div className={`${panels.scoreItem} ${panels.scoreOk}`}>
                <span className={panels.scoreValue}>{session.score.correct}</span>
                <span className={panels.scoreLabel}>aciertos</span>
              </div>
              <div className={`${panels.scoreItem} ${panels.scoreBad}`}>
                <span className={panels.scoreValue}>{session.score.wrong}</span>
                <span className={panels.scoreLabel}>errores</span>
              </div>
            </div>
          </section>
          <PseudocodePanel lines={algorithm.pseudocode} activeLine={step?.codeLine} />
          <VariablesPanel variables={step?.variables} labelOf={labelOf} conceal={Boolean(question) && questionAnswer?.status !== 'done'} />
          <p className={styles.shortcuts}>
            <kbd>Espacio</kbd> reproducir · <kbd>←</kbd> <kbd>→</kbd> pasos · <kbd>1</kbd>–<kbd>9</kbd> responder
          </p>
        </aside>
      </div>
    </>
  )
}

function FinishCard({ score, asked, onRestart }) {
  const perfect = asked > 0 && score.wrong === 0
  return (
    <motion.div
      className={styles.finish}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <div>
        <p className={styles.finishTitle}>{perfect ? 'Recorrido perfecto.' : 'Recorrido terminado.'}</p>
        <p className={styles.finishText}>
          {asked === 0
            ? 'Este escenario no tuvo momentos para predecir. Probá con otro más grande.'
            : `Acertaste ${score.correct} de ${asked} ${asked === 1 ? 'predicción' : 'predicciones'}.`}
        </p>
      </div>
      <button type="button" className={styles.finishButton} onClick={onRestart}>
        <Icon name="restart" size={16} /> Otra vez
      </button>
    </motion.div>
  )
}

function CanvasSkeleton() {
  return (
    <div className={styles.canvasSkeleton} aria-label="Cargando el grafo">
      {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
    </div>
  )
}

function VisualizerSkeleton() {
  return (
    <div className={styles.skeletonPage} aria-busy="true" aria-label="Cargando">
      <div className={styles.skeletonTitle} />
      <div className={styles.layout}>
        <div className={styles.canvas}><CanvasSkeleton /></div>
        <div className={styles.skeletonSide} />
      </div>
    </div>
  )
}
