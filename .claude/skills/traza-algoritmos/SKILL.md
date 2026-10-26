---
name: traza-algoritmos
description: Usar al implementar o modificar un algoritmo del paquete motor, o al tocar Paso, TipoPaso o Pregunta. Define el contrato de la traza y cómo testearla.
---

# Contrato de la traza
- Implementar `Algoritmo`; sin dependencias de Spring.
- Cada `Paso` es una foto COMPLETA del estado.
- Ids estables por elemento; nunca usar el valor como id.
- `lineaCodigo` apunta al pseudocódigo guardado en la entidad Algoritmo (base 1).
- La respuesta correcta de una `Pregunta` nunca se serializa al cliente.

# Puntos de pregunta por algoritmo
- Burbuja: ¿se intercambian estos dos?
- Búsqueda binaria: ¿izquierda o derecha?
- BFS: ¿qué nodo sale de la cola?
- Dijkstra: ¿qué nodo de la frontera se visita?

# Cómo testear (TDD)
1. Test del resultado final (orden, camino, distancias).
2. Test de la forma de la traza: primer y último paso, cantidad de preguntas, que no haya pasos con estado incompleto.
3. Test de un caso borde (empates, grafo desconectado, arreglo de 1 elemento).

# Agregar un algoritmo nuevo
Clase en motor/<familia>/, test en test/.../motor/, pseudocódigo en data.sql (INSERT idempotente).
