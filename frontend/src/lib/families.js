/**
 * Display data for each algorithm family, in the order the catalog shows them. The key matches
 * AlgorithmFamily in the backend; `slug` is the URL segment (/categories/graph).
 */
export const FAMILY = {
  CONCEPT: {
    slug: 'concepts',
    label: 'Conceptos',
    icon: 'spark',
    noun: ['concepto', 'conceptos'],
    description: 'Las ideas que usan todos los algoritmos: cómo medir lo que cuestan, la recursión y técnicas como dos punteros o ventana deslizante.',
  },
  SORTING: {
    slug: 'sorting',
    label: 'Ordenamiento',
    icon: 'bars',
    description: 'Poner una lista en orden comparando e intercambiando elementos, paso a paso, hasta que no quede nada fuera de lugar.',
  },
  SEARCHING: {
    slug: 'searching',
    label: 'Búsqueda',
    icon: 'target',
    description: 'Encontrar un valor en una colección: mirar uno por uno o descartar mitades enteras cuando los datos están ordenados.',
  },
  GRAPH: {
    slug: 'graph',
    label: 'Grafos',
    icon: 'graph',
    description: 'Recorrer nodos conectados por aristas: por niveles, por el camino más corto o por el más barato.',
  },
  DATA_STRUCTURE: {
    slug: 'data-structures',
    label: 'Estructuras de datos',
    noun: ['estructura', 'estructuras'],
    icon: 'layers',
    description: 'Cómo se guardan y reorganizan los datos: pilas, colas, listas, tablas hash y árboles, operación por operación.',
  },
}

// Concepts first: they are what every other family builds on
export const FAMILY_ORDER = ['CONCEPT', 'SORTING', 'SEARCHING', 'GRAPH', 'DATA_STRUCTURE']

/** "1 algoritmo", "5 estructuras", "8 conceptos". */
export function countLabel(family, count) {
  const [one, many] = FAMILY[family]?.noun ?? ['algoritmo', 'algoritmos']
  return `${count} ${count === 1 ? one : many}`
}

export function familyBySlug(slug) {
  return FAMILY_ORDER.find((key) => FAMILY[key].slug === slug) ?? null
}
