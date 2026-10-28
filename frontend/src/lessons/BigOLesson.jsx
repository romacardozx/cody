import { Icon } from '../components/Icon.jsx'
import { LessonCheck } from '../components/lesson/LessonCheck.jsx'
import { Link } from '../components/Link.jsx'
import lesson from '../components/lesson/Lesson.module.css'
import { CountLoops } from './bigO/CountLoops.jsx'
import { Crossover } from './bigO/Crossover.jsx'
import { GrowthTable } from './bigO/GrowthTable.jsx'

/*
 * Big O, the first concept: short reading blocks, each with a piece to play with, and three
 * predictions at the end. Everything later in Cody (the cost of each algorithm) is written in it.
 */

const CHECKS = [
  {
    id: 'double',
    prompt: 'Un algoritmo es O(n²). Si los datos se duplican, ¿cuánto más tarda?',
    options: ['El doble', 'Cuatro veces más', 'Lo mismo'],
    correctAnswer: 'Cuatro veces más',
    explanation: 'Con 2n datos hace (2n)² = 4n² operaciones: cuatro veces las de antes. Por eso n² explota tan rápido.',
    optionFeedback: {
      'El doble': 'Eso pasa con O(n): una vuelta por dato. Acá cada dato se compara con todos los demás.',
      'Lo mismo': 'Eso sería O(1). Acá el trabajo depende de n, y mucho.',
    },
  },
  {
    id: 'binary',
    prompt: 'La búsqueda binaria es O(log n). Para encontrar un valor entre 1.000.000 de números ordenados, ¿cuántas comparaciones hace como mucho?',
    options: ['Unas 20', 'Unas 1.000', 'Hasta 1.000.000'],
    correctAnswer: 'Unas 20',
    explanation: 'Cada comparación descarta la mitad: 1.000.000 → 500.000 → 250.000… y en unas 20 queda uno solo (2²⁰ ≈ 1.000.000).',
    optionFeedback: {
      'Unas 1.000': 'Eso sería √n. El logaritmo crece mucho más lento: cada paso parte el problema a la mitad.',
      'Hasta 1.000.000': 'Eso es la búsqueda lineal, O(n), que mira uno por uno.',
    },
  },
  {
    id: 'large',
    prompt: 'Para datos muy grandes, ¿cuál hace menos operaciones?',
    options: ['100·n', 'n²', 'Depende de la computadora'],
    correctAnswer: '100·n',
    explanation: 'Desde n = 100 en adelante, 100·n queda siempre abajo y la distancia crece. Big O se fija en eso: cómo crece, no la constante.',
    optionFeedback: {
      'n²': 'Con n chico sí, pero desde n = 100 n² lo pasa y nunca más lo alcanza.',
      'Depende de la computadora': 'La computadora cambia los segundos, no la cantidad de operaciones: Big O cuenta operaciones.',
    },
  },
]

export default function BigOLesson() {
  return (
    <div className={lesson.lesson}>
      <section className={lesson.block}>
        <h2 className={lesson.heading}>No medimos segundos</h2>
        <p className={lesson.prose}>
          El mismo programa tarda distinto en tu computadora y en la de la facultad. Por eso no se mide en segundos: se
          cuenta <strong>cuántas operaciones hace según el tamaño de los datos</strong>, al que llamamos <span className={lesson.mono}>n</span>.
          Big O dice cómo crece esa cuenta cuando n crece. Mové el deslizador.
        </p>
        <GrowthTable />
      </section>

      <section className={lesson.block}>
        <h2 className={lesson.heading}>Contá las vueltas</h2>
        <p className={lesson.prose}>
          Para saber el orden de un código no hace falta correrlo: alcanza con mirar <strong>cuántas veces se repite
          algo según n</strong>. Antes de ver la respuesta, elegí el orden de cada fragmento.
        </p>
        <CountLoops />
      </section>

      <section className={lesson.block}>
        <h2 className={lesson.heading}>Lo que importa es cuando n crece</h2>
        <p className={lesson.prose}>
          Big O descarta las constantes: 100·n se escribe O(n). ¿No es hacer trampa? Comparalo con n² y mové n.
        </p>
        <Crossover />
        <p className={lesson.prose}>
          De ahí salen las reglas para leerla: <strong>las constantes no cuentan</strong> (O(3n) es O(n)),{' '}
          <strong>manda el término que más crece</strong> (O(n² + n) es O(n²)) y <strong>los bucles anidados
          multiplican</strong>, mientras que uno después de otro suman.
        </p>
      </section>

      <section className={lesson.block}>
        <h2 className={lesson.heading}>Predecí</h2>
        <div className={lesson.checks}>
          {CHECKS.map((question) => (
            <LessonCheck key={question.id} question={question} />
          ))}
        </div>
      </section>

      <section className={lesson.block}>
        <p className={lesson.prose}>
          Desde ahora, cada algoritmo de Cody muestra su costo en esta notación. BFS, por ejemplo, es O(V + E): una
          vuelta por nodo y una por arista.
        </p>
        <div className={lesson.next}>
          <Link to="/algorithms/BFS" className={lesson.nextLink}>
            Ver el costo en acción con BFS <Icon name="arrow" size={16} />
          </Link>
          <Link to="/categories/concepts" className={lesson.nextLink}>
            Más conceptos <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
