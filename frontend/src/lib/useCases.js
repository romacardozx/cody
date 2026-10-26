// A real use of each algorithm, so practice connects with something the user has seen.
// `mapping` translates the algorithm's concepts to the real-world ones.
export const USE_CASES = {
  BFS: {
    short: 'Contactos de 2° grado en LinkedIn',
    title: 'Grados de contacto',
    where: 'Redes sociales como LinkedIn',
    text:
      'Cuando una red te dice que alguien es contacto de 2° grado, está contando niveles desde vos: tus contactos son el nivel 1, los contactos de ellos el nivel 2. Es exactamente el número que BFS escribe en cada nodo, y por eso lo encuentra recorriendo por niveles.',
    mapping: [
      ['Nodo', 'Una persona'],
      ['Arista', 'Una conexión entre dos personas'],
      ['Nivel', 'El grado de contacto (1°, 2°, 3°)'],
    ],
  },
  DIJKSTRA: {
    short: 'La ruta más rápida en Google Maps',
    title: 'La ruta más rápida',
    where: 'Navegadores como Google Maps o Waze',
    text:
      'Los navegadores modelan la ciudad como un grafo: las esquinas son nodos y las cuadras son aristas con el tiempo de viaje como peso. Para ir de tu casa a la facultad usan variantes de Dijkstra (como A*). La ruta más corta en cuadras no siempre es la más rápida: Dijkstra suma minutos, no metros.',
    mapping: [
      ['Nodo', 'Una esquina'],
      ['Arista', 'Una cuadra'],
      ['Peso', 'Los minutos que tarda recorrerla con el tránsito de ahora'],
    ],
  },
  BINARY_SEARCH: {
    short: 'Buscar una palabra en el diccionario',
    title: 'Buscar en el diccionario',
    where: 'Diccionarios, agendas y git bisect',
    text:
      'Nadie lee el diccionario desde la A: lo abrís al medio, ves si la palabra va antes o después y descartás la mitad. Con 1000 páginas alcanzan unos 10 vistazos. Con la misma idea, git bisect encuentra qué commit rompió el código entre cientos.',
    mapping: [
      ['Arreglo ordenado', 'Las páginas, en orden alfabético'],
      ['Mirar el medio', 'Abrir el diccionario en la mitad que queda'],
      ['Descartar la mitad', 'Saber que la palabra va antes o después'],
    ],
  },
  BUBBLE_SORT: {
    short: 'Acomodar la tabla de posiciones',
    title: 'La tabla de posiciones',
    where: 'Listas que ya están casi ordenadas',
    text:
      'En la práctica se usan algoritmos más rápidos, pero burbuja tiene una ventaja: si la lista está casi ordenada, termina enseguida. Después de una fecha la tabla cambia poco: el equipo que ganó sube intercambiándose con los de arriba hasta quedar en su lugar.',
    mapping: [
      ['Elemento', 'Un equipo con sus puntos'],
      ['Comparar vecinos', '¿Tiene más puntos que el de arriba?'],
      ['Intercambio', 'Pasarlo un puesto adelante'],
    ],
  },
}
