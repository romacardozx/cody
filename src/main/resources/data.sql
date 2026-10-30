-- Sample data for the demo (section 6 of the assignment).
--
-- This script runs on EVERY startup (spring.sql.init.mode=always), so every
-- INSERT must be idempotent: it only inserts when the row does not exist yet,
-- written as INSERT ... SELECT ... WHERE NOT EXISTS (...).
--
-- Rules:
--   1. One statement per logical line, ending with ';'. Spring splits the script
--      on ';', so do not use DO blocks or functions with several statements inside.
--   2. Look rows up by a natural key (code, name), never by the generated id.
--   3. Do not insert ids by hand: PostgreSQL generates them (IDENTITY) and a forced
--      id leaves the sequence behind, so the next insert from the app would collide.
--   4. Only reference tables that already exist as a JPA entity: PostgreSQL rejects
--      the statement if a table is missing, even when no row would be inserted.
--   5. Child rows (nodes, edges, values) find their parent by name and are only
--      inserted when the parent has none yet.
--
-- Codes and column names are in English; user-facing text is in Spanish.
-- If a user deletes a sample scenario, it comes back on the next startup.

-- ---------------------------------------------------------------- algorithms

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BUBBLE_SORT', 'Ordenamiento burbuja', 'SORTING', 'Recorre el arreglo comparando pares vecinos y los intercambia si están desordenados. En cada pasada, el mayor que queda "flota" hasta su lugar.', 'O(n²)', 'O(1)', 1
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BUBBLE_SORT');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BINARY_SEARCH', 'Búsqueda binaria', 'SEARCHING', 'Busca un valor en un arreglo ordenado mirando el medio y descartando la mitad donde no puede estar.', 'O(log n)', 'O(1)', 2
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BINARY_SEARCH');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BFS', 'Búsqueda en anchura (BFS)', 'GRAPH', 'Recorre el grafo por niveles: primero los vecinos del inicio, después los vecinos de esos, y así. Usa una cola: el primero que entra es el primero que sale.', 'O(V + E)', 'O(V)', 3
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BFS');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'DIJKSTRA', 'Dijkstra', 'GRAPH', 'Encuentra el camino más corto desde un nodo a todos los demás cuando los pesos no son negativos. Siempre avanza por el nodo más cercano que todavía no cerró.', 'O((V + E) log V)', 'O(V)', 4
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'DIJKSTRA');

-- Not implemented yet: shown as "Próximamente" with their real-world use case

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'INSERTION_SORT', 'Ordenamiento por inserción', 'SORTING', 'Toma los elementos de a uno y los mete en su lugar dentro de la parte ya ordenada, corriendo a la derecha los más grandes. Como ordenar cartas en la mano.', 'O(n²)', 'O(1)', 5
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'INSERTION_SORT');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'SELECTION_SORT', 'Ordenamiento por selección', 'SORTING', 'En cada pasada busca el menor de lo que queda y lo pone al principio. Hace pocas escrituras: un intercambio por pasada.', 'O(n²)', 'O(1)', 6
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'SELECTION_SORT');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'MERGE_SORT', 'Merge sort', 'SORTING', 'Divide el arreglo a la mitad hasta tener pedazos de un elemento y después los mezcla de a pares, siempre en orden. Divide y vencerás.', 'O(n log n)', 'O(n)', 7
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'MERGE_SORT');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'QUICK_SORT', 'Quicksort', 'SORTING', 'Elige un pivote, deja a la izquierda los menores y a la derecha los mayores, y repite en cada lado. En promedio es de los más rápidos en la práctica.', 'O(n log n) promedio', 'O(log n)', 8
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'QUICK_SORT');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'A_STAR', 'A* (A estrella)', 'GRAPH', 'Como Dijkstra, pero suma una estimación de cuánto falta hasta el destino (por ejemplo, la distancia en línea recta). Así explora primero hacia la meta y revisa muchos menos nodos.', 'O(E log V)', 'O(V)', 9
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'A_STAR');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BIDIRECTIONAL_DIJKSTRA', 'Dijkstra bidireccional', 'GRAPH', 'Lanza dos búsquedas a la vez, una desde el origen y otra desde el destino. Cuando se encuentran a mitad de camino, ya tiene la ruta más corta habiendo explorado mucho menos.', 'O(E log V)', 'O(V)', 10
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BIDIRECTIONAL_DIJKSTRA');

-- Hibernate creates algorithm.family with a CHECK listing the enum values, and ddl-auto=update
-- never changes it, so every new family would be rejected on an existing database. The CHECK is
-- dropped whenever it is there (the enum in Java already restricts the values). PostgreSQL names
-- an inline column CHECK <table>_<column>_check.
ALTER TABLE algorithm DROP CONSTRAINT IF EXISTS algorithm_family_check;

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'LINEAR_SEARCH', 'Búsqueda lineal', 'SEARCHING', 'Mira los elementos uno por uno, de izquierda a derecha, hasta encontrar el valor o llegar al final. Es la más simple y funciona aunque la lista no esté ordenada.', 'O(n)', 'O(1)', 2
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'LINEAR_SEARCH');


-- Linear search is taught before binary search. Plain UPDATEs are idempotent (same value every time).
UPDATE algorithm SET display_order = 2 WHERE code = 'LINEAR_SEARCH' AND display_order <> 2;
UPDATE algorithm SET display_order = 11 WHERE code = 'BINARY_SEARCH' AND display_order <> 11;
INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'STACK', 'Pila', 'DATA_STRUCTURE', 'Se apila y se desapila por el mismo extremo: el último en entrar es el primero en salir (LIFO). Así funciona el botón de deshacer.', 'O(1) apilar y desapilar', 'O(n)', 12
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'STACK');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'QUEUE', 'Cola', 'DATA_STRUCTURE', 'Se encola por atrás y se desencola por adelante: el primero en entrar es el primero en salir (FIFO). Es la que usa BFS para recorrer por niveles.', 'O(1) encolar y desencolar', 'O(n)', 13
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'QUEUE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'LINKED_LIST', 'Lista enlazada', 'DATA_STRUCTURE', 'Nodos que apuntan cada uno al siguiente. Insertar es mover un par de punteros; buscar, en cambio, obliga a recorrerla desde el principio.', 'O(n) buscar, O(1) insertar al inicio', 'O(n)', 14
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'LINKED_LIST');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'DOUBLY_LINKED_LIST', 'Lista doblemente enlazada', 'DATA_STRUCTURE', 'Cada nodo apunta al siguiente y al anterior: se recorre en los dos sentidos y se puede sacar un nodo sin buscar al que está antes.', 'O(n) buscar, O(1) sacar un nodo dado', 'O(n)', 15
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'DOUBLY_LINKED_LIST');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'HASH_TABLE', 'Tabla hash', 'DATA_STRUCTURE', 'Una función hash convierte cada clave en el número de un casillero. Si dos claves caen en el mismo, se encadenan en una lista.', 'O(1) promedio', 'O(n)', 16
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'HASH_TABLE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'HASH_MAP', 'Mapa hash (clave y valor)', 'DATA_STRUCTURE', 'Como la tabla hash, pero cada clave guarda un valor asociado: se busca por la clave y se obtiene el valor sin recorrer nada.', 'O(1) promedio', 'O(n)', 17
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'HASH_MAP');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BINARY_TREE', 'Árbol binario', 'DATA_STRUCTURE', 'Cada nodo tiene hasta dos hijos. Se llena nivel por nivel y después se recorre en preorden, inorden y postorden.', 'O(n) recorrer', 'O(n)', 18
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BINARY_TREE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BINARY_SEARCH_TREE', 'Árbol binario de búsqueda', 'DATA_STRUCTURE', 'Cada valor va a la izquierda si es menor y a la derecha si es mayor. Buscar es bajar comparando, sin mirar todo el árbol.', 'O(log n) promedio, O(n) peor caso', 'O(n)', 19
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BINARY_SEARCH_TREE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'AVL_TREE', 'Árbol AVL', 'DATA_STRUCTURE', 'Un árbol de búsqueda que se rebalancea solo, con rotaciones, cuando una rama crece de más. Así buscar es siempre O(log n).', 'O(log n)', 'O(n)', 20
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'AVL_TREE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'HEAP', 'Heap (cola de prioridad)', 'DATA_STRUCTURE', 'Un árbol donde cada padre es menor que sus hijos, así el mínimo queda arriba. Cada valor nuevo sube comparándose con su padre hasta su lugar.', 'O(log n) insertar y sacar el mínimo', 'O(n)', 21
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'HEAP');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'TRIE', 'Trie (árbol de prefijos)', 'DATA_STRUCTURE', 'Guarda palabras letra por letra: las que empiezan igual comparten el camino. Buscar una palabra cuesta lo que mide la palabra, no cuántas hay guardadas.', 'O(L) por palabra de largo L', 'O(total de letras)', 22
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'TRIE');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'BIG_O', 'Notación Big O', 'CONCEPT', 'Cómo crece el trabajo de un algoritmo cuando crecen los datos: O(1), O(log n), O(n), O(n²). Sirve para comparar algoritmos sin cronómetro.', '—', '—', 23
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BIG_O');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'SPACE_COMPLEXITY', 'Complejidad espacial', 'CONCEPT', 'Cuánta memoria extra usa un algoritmo además de sus datos, y cómo crece con ellos. A veces se gana tiempo gastando memoria, y al revés.', '—', '—', 24
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'SPACE_COMPLEXITY');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'RECURSION', 'Recursión', 'CONCEPT', 'Una función que se llama a sí misma con un problema más chico, hasta llegar a un caso tan simple que se resuelve directo.', '—', '—', 25
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'RECURSION');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'TWO_POINTERS', 'Dos punteros', 'CONCEPT', 'Dos índices que recorren el arreglo, desde las puntas o a distinta velocidad, y resuelven en una pasada lo que con dos bucles anidados costaría O(n²).', 'O(n)', 'O(1)', 26
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'TWO_POINTERS');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'SLIDING_WINDOW', 'Ventana deslizante', 'CONCEPT', 'Una ventana de elementos seguidos que avanza de a uno: suma el que entra, resta el que sale y nunca recalcula todo de nuevo.', 'O(n)', 'O(1)', 27
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'SLIDING_WINDOW');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'PREFIX_SUM', 'Sumas prefijas', 'CONCEPT', 'Se calcula una vez la suma acumulada del arreglo, y después la suma de cualquier tramo sale con una sola resta.', 'O(n) armar, O(1) consultar', 'O(n)', 28
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'PREFIX_SUM');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'MEMOIZATION', 'Memoización', 'CONCEPT', 'Guardar el resultado de cada cálculo para no repetirlo. Con eso, Fibonacci recursivo pasa de tardar una eternidad a ser instantáneo.', 'O(n) para Fibonacci', 'O(n)', 29
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'MEMOIZATION');

INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
SELECT 'GREEDY_VS_DP', 'Greedy vs. programación dinámica', 'CONCEPT', 'Greedy elige lo mejor de cada paso sin volver atrás; programación dinámica considera todas las opciones guardando subresultados. Cuándo alcanza una y cuándo hace falta la otra.', '—', '—', 30
WHERE NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'GREEDY_VS_DP');

-- ---------------------------------------------------------------- graph scenarios

INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
SELECT 'Rombo con cola', 'Dos caminos que se juntan en D y siguen hasta E. Ideal para ver los niveles de BFS.', 'GRAPH', 'A', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Rombo con cola');

INSERT INTO scenario_node (scenario_id, item_order, node_id, label, x, y)
SELECT s.id, v.item_order, v.node_id, v.label, v.x, v.y
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'A', 90, 200), (1, 'B', 'B', 250, 90), (2, 'C', 'C', 250, 310), (3, 'D', 'D', 410, 200), (4, 'E', 'E', 570, 200)
) AS v (item_order, node_id, label, x, y)
WHERE s.name = 'Rombo con cola' AND NOT EXISTS (SELECT 1 FROM scenario_node n WHERE n.scenario_id = s.id);

INSERT INTO scenario_edge (scenario_id, item_order, from_node, to_node, weight)
SELECT s.id, v.item_order, v.from_node, v.to_node, v.weight
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'B', 4), (1, 'A', 'C', 1), (2, 'B', 'D', 1), (3, 'C', 'D', 5), (4, 'D', 'E', 2)
) AS v (item_order, from_node, to_node, weight)
WHERE s.name = 'Rombo con cola' AND NOT EXISTS (SELECT 1 FROM scenario_edge e WHERE e.scenario_id = s.id);

INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
SELECT 'Árbol de tres niveles', 'Un árbol binario completo: BFS lo recorre piso por piso.', 'GRAPH', 'R', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Árbol de tres niveles');

INSERT INTO scenario_node (scenario_id, item_order, node_id, label, x, y)
SELECT s.id, v.item_order, v.node_id, v.label, v.x, v.y
FROM scenario s CROSS JOIN (VALUES
    (0, 'R', 'R', 330, 60), (1, 'A', 'A', 180, 180), (2, 'B', 'B', 480, 180),
    (3, 'C', 'C', 100, 310), (4, 'D', 'D', 260, 310), (5, 'E', 'E', 400, 310), (6, 'F', 'F', 560, 310)
) AS v (item_order, node_id, label, x, y)
WHERE s.name = 'Árbol de tres niveles' AND NOT EXISTS (SELECT 1 FROM scenario_node n WHERE n.scenario_id = s.id);

INSERT INTO scenario_edge (scenario_id, item_order, from_node, to_node, weight)
SELECT s.id, v.item_order, v.from_node, v.to_node, v.weight
FROM scenario s CROSS JOIN (VALUES
    (0, 'R', 'A', 1), (1, 'R', 'B', 1), (2, 'A', 'C', 1), (3, 'A', 'D', 1), (4, 'B', 'E', 1), (5, 'B', 'F', 1)
) AS v (item_order, from_node, to_node, weight)
WHERE s.name = 'Árbol de tres niveles' AND NOT EXISTS (SELECT 1 FROM scenario_edge e WHERE e.scenario_id = s.id);

INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
SELECT 'Dos islas', 'Un grafo desconectado: desde A nunca se llega a la segunda isla.', 'GRAPH', 'A', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Dos islas');

INSERT INTO scenario_node (scenario_id, item_order, node_id, label, x, y)
SELECT s.id, v.item_order, v.node_id, v.label, v.x, v.y
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'A', 90, 120), (1, 'B', 'B', 240, 70), (2, 'C', 'C', 240, 250), (3, 'D', 'D', 110, 300),
    (4, 'X', 'X', 450, 120), (5, 'Y', 'Y', 590, 200), (6, 'Z', 'Z', 450, 300)
) AS v (item_order, node_id, label, x, y)
WHERE s.name = 'Dos islas' AND NOT EXISTS (SELECT 1 FROM scenario_node n WHERE n.scenario_id = s.id);

INSERT INTO scenario_edge (scenario_id, item_order, from_node, to_node, weight)
SELECT s.id, v.item_order, v.from_node, v.to_node, v.weight
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'B', 1), (1, 'A', 'C', 1), (2, 'C', 'D', 1), (3, 'B', 'C', 1), (4, 'X', 'Y', 1), (5, 'Y', 'Z', 1)
) AS v (item_order, from_node, to_node, weight)
WHERE s.name = 'Dos islas' AND NOT EXISTS (SELECT 1 FROM scenario_edge e WHERE e.scenario_id = s.id);

INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
SELECT 'Calles de un solo sentido', 'Grafo dirigido: las aristas solo se recorren en el sentido de la flecha.', 'GRAPH', 'A', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Calles de un solo sentido');

INSERT INTO scenario_node (scenario_id, item_order, node_id, label, x, y)
SELECT s.id, v.item_order, v.node_id, v.label, v.x, v.y
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'A', 90, 200), (1, 'B', 'B', 240, 80), (2, 'C', 'C', 240, 320), (3, 'D', 'D', 410, 80), (4, 'E', 'E', 410, 320), (5, 'F', 'F', 570, 200)
) AS v (item_order, node_id, label, x, y)
WHERE s.name = 'Calles de un solo sentido' AND NOT EXISTS (SELECT 1 FROM scenario_node n WHERE n.scenario_id = s.id);

INSERT INTO scenario_edge (scenario_id, item_order, from_node, to_node, weight)
SELECT s.id, v.item_order, v.from_node, v.to_node, v.weight
FROM scenario s CROSS JOIN (VALUES
    (0, 'A', 'B', 2), (1, 'A', 'C', 6), (2, 'B', 'D', 3), (3, 'C', 'B', 1), (4, 'C', 'E', 2), (5, 'D', 'F', 4), (6, 'E', 'F', 1), (7, 'E', 'D', 2)
) AS v (item_order, from_node, to_node, weight)
WHERE s.name = 'Calles de un solo sentido' AND NOT EXISTS (SELECT 1 FROM scenario_edge e WHERE e.scenario_id = s.id);

-- ---------------------------------------------------------------- array scenarios

INSERT INTO scenario (name, description, type, directed, created_at, updated_at)
SELECT 'Cinco desordenados', 'Un arreglo chico para seguir cada intercambio.', 'ARRAY', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Cinco desordenados');

INSERT INTO scenario_array_value (scenario_id, item_order, item_value)
SELECT s.id, v.item_order, v.item_value
FROM scenario s CROSS JOIN (VALUES (0, 5), (1, 1), (2, 4), (3, 2), (4, 8)) AS v (item_order, item_value)
WHERE s.name = 'Cinco desordenados' AND NOT EXISTS (SELECT 1 FROM scenario_array_value a WHERE a.scenario_id = s.id);

INSERT INTO scenario (name, description, type, directed, target, created_at, updated_at)
SELECT 'Diez ordenados, buscar 23', 'Arreglo ordenado para la búsqueda binaria.', 'ARRAY', false, 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Diez ordenados, buscar 23');

INSERT INTO scenario_array_value (scenario_id, item_order, item_value)
SELECT s.id, v.item_order, v.item_value
FROM scenario s CROSS JOIN (VALUES (0, 2), (1, 5), (2, 8), (3, 12), (4, 16), (5, 23), (6, 38), (7, 56), (8, 72), (9, 91)) AS v (item_order, item_value)
WHERE s.name = 'Diez ordenados, buscar 23' AND NOT EXISTS (SELECT 1 FROM scenario_array_value a WHERE a.scenario_id = s.id);
