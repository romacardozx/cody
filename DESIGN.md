# Cody — sistema visual

> Fuente de verdad: `frontend/src/styles/tokens.css`. Este archivo explica el porqué; si algo cambia, actualizar los dos.
> Si después corren `/impeccable init` o `/impeccable document`, que partan de esto en vez de reemplazarlo.

## Dirección

**"Pizarra de laboratorio"**: grafito cálido, texto color tiza y **un solo acento bermellón reservado para el momento de predecir**. Nada de gris frío con cian ni tarjetas genéricas: la referencia (Coddy) se usó para la estructura, no para el estilo.

- Modo: *Operate* (la gente viene a hacer algo). La personalidad está en los detalles, no en decoración.
- El lienzo tiene grilla de puntos, como una mesa de trabajo.
- Durante una pregunta, todo lo que no es opción se apaga y las opciones se marcan con un anillo punteado bermellón.

## Color (tokens)

| Token | Uso |
|---|---|
| `--bg`, `--surface`, `--surface-2/3` | Fondo y capas (grafito cálido / papel en claro) |
| `--text`, `--text-2`, `--text-3` | Tiza: principal, secundario, terciario |
| `--accent` (bermellón) | **Solo** predicción, nodo actual, línea activa y CTA principal. No usarlo como decoración |
| `--frontier` (ámbar) | Elementos en la frontera / cola |
| `--visited` (menta) | Elementos ya procesados |
| `--ok` / `--bad` | Resultado de una predicción |

Estados del engine → estilo: `DEFAULT` borde neutro · `FRONTIER` ámbar · `CURRENT` bermellón lleno + pulso · `VISITED` menta · (arreglos: `COMPARING`, `SWAPPING`, `SORTED`, `DISCARDED`, `FOUND` se definen al hacer `ArrayView`, con esta misma lógica).

Hay tema claro y oscuro (`data-theme` en `<html>`); todo color sale de los tokens, nunca hex sueltos en componentes.

## Tipografía

| Rol | Fuente | Por qué |
|---|---|---|
| Títulos | Bricolage Grotesque (variable, `font-stretch: 90%`) | Carácter propio sin perder legibilidad |
| Texto | Atkinson Hyperlegible Next | Diseñada para baja visión: suma al encuadre DUA |
| Código / datos | JetBrains Mono | Pseudocódigo, complejidades, etiquetas técnicas |

Las fuentes van empaquetadas con `@fontsource` (la demo funciona sin internet).

## Componentes y reglas

- Bordes 1px, radios 5/9/14px, sombras suaves. Etiquetas técnicas en mono, mayúsculas y con tracking.
- **Optimista**: toda acción se refleja en el acto (elección bloqueada + spinner) y se revierte si el servidor falla.
- **Nunca regalar la respuesta**: mientras hay una pregunta pendiente, las listas (cola) se ocultan y las opciones van ordenadas alfabéticamente.
- Accesibilidad: todo usable con teclado (`Espacio`, `←`/`→`, `1`–`9`, `Ctrl K`), foco visible bermellón, `prefers-reduced-motion` respetado, textos en español rioplatense.
- Rendimiento: el visualizador se carga aparte (code splitting) y se precarga al pasar el mouse por una tarjeta; las lecturas de la API se cachean.
