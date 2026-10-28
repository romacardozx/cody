# Cody — sistema visual

> Fuente de verdad: `frontend/src/styles/tokens.css`. Este archivo explica el porqué; si algo cambia, actualizar los dos.
> Si después corren `/impeccable init` o `/impeccable document`, que partan de esto en vez de reemplazarlo.

## Dirección

**"Pizarra de laboratorio"**: grafito cálido, texto color tiza y **un solo acento bermellón reservado para el momento de predecir**. Nada de gris frío con cian ni tarjetas genéricas: la referencia (Coddy) se usó para la estructura, no para el estilo.

- Modo: *Operate* (la gente viene a hacer algo). La personalidad está en los detalles, no en decoración.
- El lienzo tiene grilla de puntos, como una mesa de trabajo.
- El logo es un ojo: la pupila bermellón sigue al puntero, mira alrededor sola y parpadea. Cody te mira pensar.
- Durante una pregunta, todo lo que no es opción se apaga y las opciones se marcan con un anillo punteado bermellón.

## Color (tokens)

| Token | Uso |
|---|---|
| `--bg`, `--surface`, `--surface-2/3` | Fondo y capas (grafito cálido en oscuro / pizarra gris fría en claro, **no crema**) |
| `--text`, `--text-2`, `--text-3` | Tiza: principal, secundario, terciario |
| `--accent` (bermellón) | **Solo** predicción, nodo actual, línea activa y CTA principal. No usarlo como decoración |
| `--frontier` (ámbar) | Elementos en la frontera / cola |
| `--visited` (menta) | Elementos ya procesados |
| `--ok` / `--bad` | Resultado de una predicción |

Estados del engine → estilo: `DEFAULT` borde neutro · `FRONTIER` ámbar · `CURRENT` bermellón lleno + pulso · `VISITED` menta · (arreglos: `COMPARING`, `SWAPPING`, `SORTED`, `DISCARDED`, `FOUND` se definen al hacer `ArrayView`, con esta misma lógica).

Hay tema claro y oscuro (`data-theme` en `<html>`); todo color sale de los tokens, nunca hex sueltos en componentes. Todo texto pasa WCAG AA (4.5:1) sobre las superficies donde se usa.

## Tamaños

Base 17px (`html { font-size: 106.25% }`). Escala `--text-xs` (13.6px) a `--text-xl`. **Nada funcional por debajo de `--text-xs`.** Párrafos con `max-width` de ~70ch.

## Tipografía

Solo está empaquetado el corte normal de Atkinson: **nada en itálica** (el navegador la falsearía inclinando las letras). Para destacar, peso o la fuente display.

| Rol | Fuente | Por qué |
|---|---|---|
| Títulos | Bricolage Grotesque (variable, `font-stretch: 90%`) | Carácter propio sin perder legibilidad |
| Texto | Atkinson Hyperlegible Next | Diseñada para baja visión: suma al encuadre DUA |
| Código / datos | JetBrains Mono | Pseudocódigo, complejidades, etiquetas técnicas |

Las fuentes van empaquetadas con `@fontsource` (la demo funciona sin internet).

## Componentes y reglas

- **Secciones sin líneas divisorias**: se separan por espacio (clamp de 72 a 136px) y por títulos grandes. Las líneas finas quedan solo para separar filas de una misma lista (el índice del catálogo). Nada funcional en `--text-sm` o menos en la home: el tamaño base es el mínimo para texto que se lee.
- Bordes 1px, radios 5/9/14px, sombras suaves. Datos técnicos en mono; títulos de panel en la fuente display, sin mayúsculas forzadas.
- **Optimista**: toda acción se refleja en el acto (elección bloqueada + spinner) y se revierte si el servidor falla.
- **Nunca regalar la respuesta**: mientras hay una pregunta pendiente, las listas (cola) se ocultan y las opciones salen en orden aleatorio por sesión.
- Accesibilidad: todo usable con teclado (`Espacio`, `←`/`→`, `1`–`9`, `Ctrl K`), foco visible bermellón, `prefers-reduced-motion` respetado, textos en español rioplatense.
- Rendimiento: el visualizador se carga aparte (code splitting) y se precarga al pasar el mouse por una tarjeta; las lecturas de la API se cachean; sin librerías de resaltado ni de router.
- Glosario: los términos técnicos de las explicaciones (`lib/glossary.js`) se subrayan y muestran su definición al pasar el mouse, enfocar o tocar.
- Catálogo por **categorías** (`lib/families.js`): la home lo muestra como el **índice de un libro** (`CategoryIndex.jsx`), sin tarjetas: una fila por familia separada por líneas finas, con nombre grande, descripción, la lista de sus miembros (los que se pueden predecir en negrita), el conteo y un **dibujo lineal propio** de la familia que se anima al pasar el mouse (barras que se ordenan, búsqueda que se parte, grafo que se recorre, pila que recibe un plato, curvas de Big O). El mismo dibujo encabeza `/categories/{slug}`. "Conceptos" va primero: es la base de las demás. Un algoritmo nuevo aparece solo en su fila.
- Cada algoritmo tiene un **caso de uso real** (`lib/useCases.js` + una ilustración animada en `UseCaseIllustrations.jsx`) con la tabla "en el algoritmo / en la vida real". La animación termina en el cuadro completo, así con movimiento reducido se ve el resultado.
- Las opciones de una pregunta se muestran en **orden aleatorio por sesión** (lo hace el backend).
- "Cómo funciona" (`CodyTour.jsx`) es una **escena animada narrada por el ojo de Cody**, sin interacción obligatoria: recorre los niveles de la taxonomía de Naps et al. (ITiCSE 2002) en tres capítulos tipo historias (Mirar → Responder → Cambiar). El ojo tiene expresiones (sigue la acción, se aburre con el párpado a medio cerrar, se abre en la pregunta, festeja) y habla en un globo que se escribe letra a letra; un cursor falso responde. Se puede pausar y saltar de capítulo; con movimiento reducido no se reproduce. El bermellón solo aparece en la pregunta.
- El feedback de una predicción **no desaparece solo**: queda hasta "Seguir" y además va al historial.
- **Header**: sin barra ni píldora: logo, links (Algoritmos · Cómo funciona · Historial) y herramientas (GitHub, tema) directo sobre la página; en la home flota adentro del panel del hero. **Al bajar desaparece y al subir vuelve** sobre un degradé del color de fondo, sin borde (nunca una barra). Link actual con un subrayado corto. En el celular, botón de menú con una hoja desplegable. Nada "pronto" en el menú.
- **Footer**: chico y calmo, en una fila: el **logo oficial de la UNSAM** (Wikimedia Commons, dominio público), partido en dos máscaras: el libro en su celeste institucional (#7aa0c3) y el nombre en `--text`, así destaca y se lee en los dos temas; al lado, la materia en `--text-sm`, los links del sitio y los del proyecto (GitHub, Swagger). Sin logo de Cody (recarga). Único detalle: **las curvas de la complejidad** (`footer/ComplexityCurves.jsx`): O(1), O(log n), O(n), O(n log n) y O(n²) (esta en ámbar, saliéndose por arriba) se dibujan una sola vez al llegar, en su propia columna (nunca detrás del texto), a escala 1:1 para que las etiquetas no bajen de 14px. Se ocultan por debajo de 1240px. La red de puntos (plexus) se descartó: es un fondo de stock.
- **Sectores, como y.uno**: el hero es un panel propio (inset con esquinas de 28px, fondo `--surface` con grilla de puntos) que ocupa la pantalla y **se expande a ancho completo al bajar** (`--hero-p`, `useHeroExpansion`). "Cómo funciona" es una **franja de borde a borde con el tema invertido** (`data-theme` opuesto en la franja: claro sobre oscuro y al revés). El cambio de fondo divide, no las líneas. En el índice, una frase corta por familia (`short` en `families.js`).
- **Ritmo de la home: movimiento y calma alternados**: hero (escena 3D) → Algoritmos (quieto, solo reacciona al pasar el mouse) → Cómo funciona (recorrido de Cody) → footer. **Una sola escena viva a la vez** (`lib/motionFocus.js`): corre la más visible y las demás se frenan; ante un empate gana la de más abajo (a la que acabás de llegar). Mientras se scrollea, la página ignora el mouse (`html[data-scrolling]`), así nada titila al pasar bajo el cursor. Ninguna animación ligada al scroll cambia el layout: el hero se recorta con `clip-path`, no con márgenes. Toda animación que dure más de 5 s junto a otro contenido tiene botón de pausa (WCAG 2.2.2).
- **Scroll libre**, nunca secuestrado ni con secciones fijas: al bajar, los elementos que llegan a la pantalla entran una sola vez (suben 32px, se enfocan y aparecen, `lib/useReveal.js` + `[data-reveal]`), escalonados solo entre los que entran juntos. Visibles por defecto: solo se ocultan los que están debajo del pliegue. El hero entra al cargar, línea por línea.
- Animación: easing exponencial (`--ease-out-expo`) o resortes de motion; nada de rebotes con overshoot en cubic-bezier.

## Anti-slop (verificado con `impeccable detect`)

Prohibido: franja de color en un costado de una tarjeta/fila, etiqueta en mayúsculas con tracking arriba de un título, íconos en cuadradito arriba de un título, fondo crema, rayas decorativas con repeating-gradient, borde grueso de acento en elementos redondeados, texto < 11px. Correr `IMPECCABLE_NO_TELEMETRY=1 impeccable detect http://localhost:8080/...` antes de cerrar una pantalla.
