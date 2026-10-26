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
  INSERTION_SORT: {
    short: 'Ordenar las cartas en la mano',
    title: 'Las cartas en la mano',
    where: 'Python y Java, para tramos cortos',
    text:
      'Cuando recibís cartas de a una, cada nueva la metés en su lugar entre las que ya tenés ordenadas: eso es inserción. Con listas chicas es tan rápido que Python y Java lo usan dentro de su ordenamiento (TimSort) para los tramos cortos.',
    mapping: [
      ['Elemento', 'Una carta'],
      ['Parte ordenada', 'Las cartas que ya acomodaste'],
      ['Insertar', 'Meterla entre dos cartas'],
    ],
  },
  SELECTION_SORT: {
    short: 'Formar una fila por altura',
    title: 'La fila por altura',
    where: 'Cuando mover cosas es caro',
    text:
      'Para ordenar a un curso por altura, buscás al más bajo, lo ponés primero y repetís con los que quedan. Hace muchas comparaciones pero un solo intercambio por pasada, por eso conviene cuando mover o escribir es lo costoso.',
    mapping: [
      ['Elemento', 'Una persona'],
      ['Buscar el mínimo', 'Encontrar a la más baja de las que quedan'],
      ['Intercambio', 'Pasarla adelante de la fila'],
    ],
  },
  MERGE_SORT: {
    short: 'Ordenar lo que no entra en memoria',
    title: 'Ordenar lo que no entra en memoria',
    where: 'Bases de datos y Java',
    text:
      'Cuando hay que ordenar millones de registros que no entran en la memoria, se ordenan pedazos que sí entran y después se mezclan de a pares leyendo del disco. Las bases de datos lo hacen para un ORDER BY grande, y Java ordena listas de objetos con TimSort, una variante de merge sort.',
    mapping: [
      ['Dividir', 'Partir los datos en pedazos que entren en memoria'],
      ['Ordenar cada mitad', 'Ordenar cada pedazo por separado'],
      ['Mezclar', 'Combinar los pedazos leyendo de a uno, siempre el menor'],
    ],
  },
  QUICK_SORT: {
    short: 'Arrays.sort de Java con números',
    title: 'El sort de todos los días',
    where: 'Java y C++',
    text:
      'Cuando en Java llamás a Arrays.sort con un arreglo de int, abajo corre un quicksort de doble pivote. El std::sort de C++ usa introsort, que arranca como quicksort. En la práctica es de los más rápidos porque trabaja sobre el mismo arreglo, sin copiarlo.',
    mapping: [
      ['Pivote', 'El valor que se usa para partir'],
      ['Partición', 'Menores a la izquierda, mayores a la derecha'],
      ['Recursión', 'Repetir en cada lado hasta que quede ordenado'],
    ],
  },
  A_STAR: {
    short: 'Rutas en tiempo real y videojuegos',
    title: 'Navegar sin revisar toda la ciudad',
    where: 'Navegadores y videojuegos',
    text:
      'Para calcular una ruta mientras manejás no alcanza con revisar todas las calles. A* prioriza las que acercan al destino usando la distancia en línea recta como brújula, y llega a la misma ruta revisando una fracción de la ciudad. Los personajes de muchos videojuegos encuentran su camino con A*.',
    mapping: [
      ['Nodo', 'Una esquina'],
      ['Peso', 'Los minutos de cada cuadra'],
      ['Heurística', 'La distancia en línea recta hasta el destino'],
    ],
  },
  BIDIRECTIONAL_DIJKSTRA: {
    short: 'Rutas largas entre dos ciudades',
    title: 'Buscar desde las dos puntas',
    where: 'Planificadores de viajes largos',
    text:
      'Para un viaje largo, buscar desde el origen hasta tocar el destino obliga a revisar un círculo enorme. Si además buscás desde el destino hacia atrás, cada búsqueda cubre la mitad del radio y se encuentran en el medio: dos círculos chicos en lugar de uno grande.',
    mapping: [
      ['Búsqueda hacia adelante', 'Desde tu casa'],
      ['Búsqueda hacia atrás', 'Desde el destino'],
      ['Encuentro', 'La esquina donde las dos se tocan'],
    ],
  },
}
