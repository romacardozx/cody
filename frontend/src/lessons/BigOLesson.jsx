import { Suspense } from 'react'
import { Icon } from '../components/Icon.jsx'
import { Chapter, ChapterRail } from '../components/lesson/Chapters.jsx'
import { LessonCheck } from '../components/lesson/LessonCheck.jsx'
import { Link } from '../components/Link.jsx'
import lesson from '../components/lesson/Lesson.module.css'
import { Chooser } from './bigO/Chooser.jsx'
import { Classroom } from './bigO/Classroom.jsx'
import { CountLoops } from './bigO/CountLoops.jsx'
import { Crossover } from './bigO/Crossover.jsx'
import { GrowthChart } from './bigO/GrowthChart.jsx'
import { GuessGame } from './bigO/GuessGame.jsx'
import { Ladder } from './bigO/Ladder.jsx'
import { Rules } from './bigO/Rules.jsx'
import { SortOrSearch } from './bigO/SortOrSearch.jsx'

/*
 * Big O, the first concept. Built on what works in teaching it (Sam Rose's "Big O", Grokking
 * Algorithms, concreteness fading, faded worked examples): concrete before abstract (a classroom,
 * then a graph, then the notation), predict before seeing, the usual mistakes faced head on, and
 * daily-life examples. Little text: one line per chapter, the pieces explain the rest.
 */

const CHAPTERS = [
  { id: 'aula', title: 'El aula' },
  { id: 'grafico', title: 'Del conteo al gráfico' },
  { id: 'notacion', title: 'La notación' },
  { id: 'vueltas', title: 'Contá las vueltas' },
  { id: 'elegir', title: 'Elegir el algoritmo' },
  { id: 'predeci', title: 'Predecí' },
]

const CHECKS = [
  {
    id: 'double',
    prompt: 'Un algoritmo es O(n²). Si los datos se duplican, ¿cuánto más tarda?',
    options: ['El doble', 'Cuatro veces más', 'Lo mismo'],
    correctAnswer: 'Cuatro veces más',
    explanation: 'Con 2n datos hace (2n)² = 4n² operaciones: cuatro veces las de antes. Como los saludos del aula.',
    optionFeedback: {
      'El doble': 'Eso pasa con O(n), como pasar lista. Acá cada uno se cruza con todos.',
      'Lo mismo': 'Eso sería O(1), como mirar quién está en la puerta.',
    },
  },
  {
    id: 'binary',
    prompt: 'Para encontrar un número entre 1.000.000 con «más alto / más bajo», ¿cuántos intentos hacen falta como mucho?',
    options: ['Unos 20', 'Unos 1.000', 'Hasta 1.000.000'],
    correctAnswer: 'Unos 20',
    explanation: 'Cada intento descarta la mitad: 1.000.000 → 500.000 → 250.000… y en 20 queda uno solo. Es O(log n).',
    optionFeedback: {
      'Unos 1.000': 'Mucho menos: cada intento parte lo que queda a la mitad, no le saca un poco.',
      'Hasta 1.000.000': 'Eso sería probar uno por uno, O(n). Con «más alto / más bajo» se descarta la mitad.',
    },
  },
  {
    id: 'choose',
    prompt: 'Tenés que ordenar 1.000.000 de ventas y la respuesta tiene que estar en un segundo. ¿Qué usás?',
    options: ['Burbuja, O(n²)', 'Merge sort, O(n log n)', 'Cualquiera, la computadora es rápida'],
    correctAnswer: 'Merge sort, O(n log n)',
    explanation: 'Con un millón, n log n son unos 20 millones de operaciones (0,2 s); n² son un billón (casi 3 horas).',
    optionFeedback: {
      'Burbuja, O(n²)': 'Con un millón de datos, n² es un billón de operaciones: casi 3 horas.',
      'Cualquiera, la computadora es rápida': 'La computadora cambia los segundos por operación, no la cantidad: n² sigue siendo un billón.',
    },
  },
]

export default function BigOLesson() {
  return (
    <div className={lesson.lesson}>
      <ChapterRail chapters={CHAPTERS} />

      <Chapter id="aula" number={1} title="El aula" lead="Una tarea, n alumnos. Lo que importa es cuánto más trabajo da cuando el curso crece.">
        <Classroom />
        <GuessGame />
      </Chapter>

      <Chapter id="grafico" number={2} title="Del conteo al gráfico" lead="Lo que contaste en el aula, dibujado: cada tarea es una curva.">
        <GrowthChart />
      </Chapter>

      <Chapter id="notacion" number={3} title="La notación" lead="Big O no cuenta exacto: dice cómo crece. Por eso se simplifica.">
        <Rules />
        <Crossover />
      </Chapter>

      <Chapter id="vueltas" number={4} title="Contá las vueltas" lead="Para saber el orden de un código alcanza con ver qué se repite según n.">
        <CountLoops />
      </Chapter>

      <Chapter id="elegir" number={5} title="Elegir el algoritmo" lead="Cuántos datos tenés y cuánto podés esperar deciden qué algoritmo sirve.">
        <Suspense fallback={<div className={lesson.loading} aria-busy="true" />}>
          <Chooser />
        </Suspense>
        <SortOrSearch />
      </Chapter>

      <Chapter id="predeci" number={6} title="Predecí">
        <div className={lesson.checks}>
          {CHECKS.map((question) => (
            <LessonCheck key={question.id} question={question} />
          ))}
        </div>
        <h3 className={lesson.subheading}>La escalera, de lo que menos crece a lo que más</h3>
        <Ladder />
        <div className={lesson.next}>
          <Link to="/algorithms/BFS" className={lesson.nextLink}>
            Ver un costo en acción: BFS, O(V + E) <Icon name="arrow" size={16} />
          </Link>
          <Link to="/categories/concepts" className={lesson.nextLink}>
            Más conceptos <Icon name="arrow" size={16} />
          </Link>
        </div>
      </Chapter>
    </div>
  )
}
