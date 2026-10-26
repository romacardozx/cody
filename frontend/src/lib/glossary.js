// Terms the explanations use, with a plain definition for whoever does not know them yet.
// Matching is case-insensitive and covers the listed forms (singular, plural, gender).
export const GLOSSARY = [
  {
    term: 'FIFO',
    forms: ['FIFO'],
    definition:
      'First In, First Out: el primero que entra es el primero que sale. Como la fila del colectivo: nadie se cuela y se atiende en orden de llegada.',
  },
  {
    term: 'cola',
    forms: ['cola'],
    definition:
      'Estructura donde los elementos esperan su turno: se agregan al final y se sacan del principio (FIFO). BFS la usa para visitar los nodos por niveles.',
  },
  {
    term: 'nivel',
    forms: ['nivel', 'niveles'],
    definition:
      'Cantidad mínima de aristas para llegar a un nodo desde el inicio. BFS visita todos los de nivel 1 antes que cualquiera de nivel 2.',
  },
  {
    term: 'descubierto',
    forms: ['descubierto', 'descubiertos', 'descubierta'],
    definition:
      'Un nodo que ya vimos y metimos en la cola. Todavía falta revisar sus vecinos. Marcarlo evita meterlo dos veces.',
  },
  {
    term: 'visitado',
    forms: ['visitado', 'visitados', 'visitada'],
    definition: 'Un nodo que ya salió de la cola y revisó a todos sus vecinos: terminamos con él.',
  },
  {
    term: 'vecino',
    forms: ['vecino', 'vecinos'],
    definition: 'Dos nodos son vecinos si una arista los une. En un grafo dirigido, solo cuenta en el sentido de la flecha.',
  },
  {
    term: 'arista',
    forms: ['arista', 'aristas'],
    definition: 'Una conexión entre dos nodos. En el dibujo es cada línea; si tiene flecha, solo se recorre en ese sentido.',
  },
]

const byForm = new Map(GLOSSARY.flatMap((entry) => entry.forms.map((form) => [form.toLowerCase(), entry])))
const pattern = new RegExp(`(?<![\\p{L}])(${[...byForm.keys()].sort((a, b) => b.length - a.length).join('|')})(?![\\p{L}])`, 'giu')

/**
 * Splits a text into plain strings and glossary matches. Only the first occurrence of each term is
 * marked, so long explanations do not fill up with underlines.
 */
export function splitTerms(text) {
  const parts = []
  const seen = new Set()
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const entry = byForm.get(match[0].toLowerCase())
    if (seen.has(entry.term)) continue
    seen.add(entry.term)
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ text: match[0], entry })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
