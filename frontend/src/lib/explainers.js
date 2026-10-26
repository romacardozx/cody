// "How it works" for each algorithm, in a few ideas, shown under the visualizer.
export const EXPLAINERS = {
  BFS: {
    title: 'BFS en cinco ideas',
    ideas: [
      {
        title: 'Recorre por niveles',
        text: 'Primero el nodo inicial, después todos sus vecinos, después los vecinos de esos. Como una piedra en el agua: las ondas se abren de a una.',
      },
      {
        title: 'La cola guarda el orden',
        text: 'Cada nodo descubierto entra al final de la cola y se procesa cuando llega al principio. Por ser FIFO, los de un nivel salen antes que los del siguiente.',
      },
      {
        title: 'Marcar evita repetir',
        text: 'Un nodo se marca como descubierto al entrar a la cola. Si otro vecino lo vuelve a encontrar, se lo ignora: así ninguno se visita dos veces.',
      },
      {
        title: 'Da el camino más corto en aristas',
        text: 'El nivel con el que se descubre cada nodo es la menor cantidad de aristas desde el inicio. Por eso BFS sirve para "¿a cuántos saltos está?".',
      },
      {
        title: 'Cuesta O(V + E)',
        text: 'Cada nodo entra y sale de la cola una vez (V) y cada arista se mira una vez por extremo (E). Con un grafo de 1000 nodos, son unas pocas miles de operaciones.',
      },
    ],
  },
}
