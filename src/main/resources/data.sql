-- Sample data for the demo (section 6 of the assignment).
--
-- This script runs on EVERY startup (spring.sql.init.mode=always), so every
-- INSERT must be idempotent: it only inserts when the row does not exist yet.
--
-- Rules:
--   1. One statement per logical line, ending with ';'. Spring splits the script
--      on ';', so do not use BEGIN ... END blocks with several statements inside.
--   2. Look rows up by a natural key (code, name), never by the generated id.
--   3. Do not insert ids by hand: SQL Server generates them (IDENTITY) and forcing
--      them requires SET IDENTITY_INSERT.
--   4. Only reference tables that already exist as a JPA entity: SQL Server
--      validates the whole statement before running it, even inside an IF.
--   5. Child rows (nodes, edges, values) find their parent by name and are only
--      inserted when the parent has none yet.
--
-- Codes and column names are in English; user-facing text is in Spanish.
-- If a user deletes a sample scenario, it comes back on the next startup.

-- ---------------------------------------------------------------- algorithms

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BUBBLE_SORT')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('BUBBLE_SORT', 'Ordenamiento burbuja', 'SORTING', 'Recorre el arreglo comparando pares vecinos y los intercambia si están desordenados. En cada pasada, el mayor que queda "flota" hasta su lugar.', 'O(n²)', 'O(1)', 1);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BINARY_SEARCH')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('BINARY_SEARCH', 'Búsqueda binaria', 'SEARCHING', 'Busca un valor en un arreglo ordenado mirando el medio y descartando la mitad donde no puede estar.', 'O(log n)', 'O(1)', 2);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BFS')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('BFS', 'Búsqueda en anchura (BFS)', 'GRAPH', 'Recorre el grafo por niveles: primero los vecinos del inicio, después los vecinos de esos, y así. Usa una cola: el primero que entra es el primero que sale.', 'O(V + E)', 'O(V)', 3);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'DIJKSTRA')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('DIJKSTRA', 'Dijkstra', 'GRAPH', 'Encuentra el camino más corto desde un nodo a todos los demás cuando los pesos no son negativos. Siempre avanza por el nodo más cercano que todavía no cerró.', 'O((V + E) log V)', 'O(V)', 4);

-- Not implemented yet: shown as "Próximamente" with their real-world use case

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'INSERTION_SORT')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('INSERTION_SORT', 'Ordenamiento por inserción', 'SORTING', 'Toma los elementos de a uno y los mete en su lugar dentro de la parte ya ordenada, corriendo a la derecha los más grandes. Como ordenar cartas en la mano.', 'O(n²)', 'O(1)', 5);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'SELECTION_SORT')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('SELECTION_SORT', 'Ordenamiento por selección', 'SORTING', 'En cada pasada busca el menor de lo que queda y lo pone al principio. Hace pocas escrituras: un intercambio por pasada.', 'O(n²)', 'O(1)', 6);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'MERGE_SORT')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('MERGE_SORT', 'Merge sort', 'SORTING', 'Divide el arreglo a la mitad hasta tener pedazos de un elemento y después los mezcla de a pares, siempre en orden. Divide y vencerás.', 'O(n log n)', 'O(n)', 7);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'QUICK_SORT')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('QUICK_SORT', 'Quicksort', 'SORTING', 'Elige un pivote, deja a la izquierda los menores y a la derecha los mayores, y repite en cada lado. En promedio es de los más rápidos en la práctica.', 'O(n log n) promedio', 'O(log n)', 8);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'A_STAR')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('A_STAR', 'A* (A estrella)', 'GRAPH', 'Como Dijkstra, pero suma una estimación de cuánto falta hasta el destino (por ejemplo, la distancia en línea recta). Así explora primero hacia la meta y revisa muchos menos nodos.', 'O(E log V)', 'O(V)', 9);

IF NOT EXISTS (SELECT 1 FROM algorithm WHERE code = 'BIDIRECTIONAL_DIJKSTRA')
    INSERT INTO algorithm (code, name, family, description, time_complexity, space_complexity, display_order)
    VALUES ('BIDIRECTIONAL_DIJKSTRA', 'Dijkstra bidireccional', 'GRAPH', 'Lanza dos búsquedas a la vez, una desde el origen y otra desde el destino. Cuando se encuentran a mitad de camino, ya tiene la ruta más corta habiendo explorado mucho menos.', 'O(E log V)', 'O(V)', 10);

-- ---------------------------------------------------------------- graph scenarios

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Rombo con cola')
    INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
    VALUES ('Rombo con cola', 'Dos caminos que se juntan en D y siguen hasta E. Ideal para ver los niveles de BFS.', 'GRAPH', 'A', 0, SYSDATETIME(), SYSDATETIME());

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

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Árbol de tres niveles')
    INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
    VALUES ('Árbol de tres niveles', 'Un árbol binario completo: BFS lo recorre piso por piso.', 'GRAPH', 'R', 0, SYSDATETIME(), SYSDATETIME());

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

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Dos islas')
    INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
    VALUES ('Dos islas', 'Un grafo desconectado: desde A nunca se llega a la segunda isla.', 'GRAPH', 'A', 0, SYSDATETIME(), SYSDATETIME());

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

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Calles de un solo sentido')
    INSERT INTO scenario (name, description, type, start_node_id, directed, created_at, updated_at)
    VALUES ('Calles de un solo sentido', 'Grafo dirigido: las aristas solo se recorren en el sentido de la flecha.', 'GRAPH', 'A', 1, SYSDATETIME(), SYSDATETIME());

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

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Cinco desordenados')
    INSERT INTO scenario (name, description, type, directed, created_at, updated_at)
    VALUES ('Cinco desordenados', 'Un arreglo chico para seguir cada intercambio.', 'ARRAY', 0, SYSDATETIME(), SYSDATETIME());

INSERT INTO scenario_array_value (scenario_id, item_order, item_value)
SELECT s.id, v.item_order, v.item_value
FROM scenario s CROSS JOIN (VALUES (0, 5), (1, 1), (2, 4), (3, 2), (4, 8)) AS v (item_order, item_value)
WHERE s.name = 'Cinco desordenados' AND NOT EXISTS (SELECT 1 FROM scenario_array_value a WHERE a.scenario_id = s.id);

IF NOT EXISTS (SELECT 1 FROM scenario WHERE name = 'Diez ordenados, buscar 23')
    INSERT INTO scenario (name, description, type, directed, target, created_at, updated_at)
    VALUES ('Diez ordenados, buscar 23', 'Arreglo ordenado para la búsqueda binaria.', 'ARRAY', 0, 23, SYSDATETIME(), SYSDATETIME());

INSERT INTO scenario_array_value (scenario_id, item_order, item_value)
SELECT s.id, v.item_order, v.item_value
FROM scenario s CROSS JOIN (VALUES (0, 2), (1, 5), (2, 8), (3, 12), (4, 16), (5, 23), (6, 38), (7, 56), (8, 72), (9, 91)) AS v (item_order, item_value)
WHERE s.name = 'Diez ordenados, buscar 23' AND NOT EXISTS (SELECT 1 FROM scenario_array_value a WHERE a.scenario_id = s.id);
