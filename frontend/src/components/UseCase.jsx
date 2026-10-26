import { USE_CASES } from '../lib/useCases.js'
import { RichText } from './RichText.jsx'
import { BfsNetwork, BinaryDictionary, BubbleTable, DijkstraMap } from './UseCaseIllustrations.jsx'
import styles from './UseCase.module.css'

const ILLUSTRATIONS = {
  DIJKSTRA: DijkstraMap,
  BFS: BfsNetwork,
  BINARY_SEARCH: BinaryDictionary,
  BUBBLE_SORT: BubbleTable,
}

/** "In the real world": where the algorithm is used, drawn, and how its concepts translate. */
export function UseCase({ code }) {
  const useCase = USE_CASES[code]
  const Illustration = ILLUSTRATIONS[code]
  if (!useCase) return null
  return (
    <section className={styles.section} aria-labelledby={`use-case-${code}`}>
      <figure className={styles.figure}>
        {Illustration && <Illustration />}
      </figure>
      <div className={styles.body}>
        <p className={styles.where}>{useCase.where}</p>
        <h2 id={`use-case-${code}`} className={styles.title}>En el mundo real: {useCase.title.toLowerCase()}</h2>
        <p className={styles.text}><RichText>{useCase.text}</RichText></p>
        <table className={styles.mapping}>
          <caption className="visually-hidden">Cómo se traduce el algoritmo a este caso</caption>
          <thead>
            <tr>
              <th scope="col">En el algoritmo</th>
              <th scope="col">En la vida real</th>
            </tr>
          </thead>
          <tbody>
            {useCase.mapping.map(([concept, real]) => (
              <tr key={concept}>
                <th scope="row">{concept}</th>
                <td>{real}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
