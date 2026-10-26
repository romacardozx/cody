/**
 * Display data for each algorithm family, in the order the catalog shows them. The key matches
 * AlgorithmFamily in the backend; `slug` is the URL segment (/categories/graph).
 */
export const FAMILY = {
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
}

export const FAMILY_ORDER = ['SORTING', 'SEARCHING', 'GRAPH']

export function familyBySlug(slug) {
  return FAMILY_ORDER.find((key) => FAMILY[key].slug === slug) ?? null
}
