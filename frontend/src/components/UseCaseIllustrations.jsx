import styles from './UseCaseIllustrations.module.css'

// One small animated illustration per algorithm. Animations are CSS only and their last frame is
// the complete picture, so with "reduce motion" the user still sees the result.

/** Dijkstra: two routes on a city map; the shortest in blocks is not the fastest. */
export function DijkstraMap() {
  const blocks = []
  for (const x of [52, 152, 252]) {
    for (const y of [52, 127]) blocks.push([x, y])
  }
  return (
    <svg viewBox="0 0 360 250" className={styles.svg} role="img" aria-label="Mapa con dos rutas de la casa a la facultad: la más rápida va por la avenida y tarda 8 minutos; la más corta cruza el centro y tarda 12">
      {blocks.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="76" height="51" rx="6" className={styles.block} />)}
      {/* Streets */}
      <path d="M40 40 H320 M40 115 H320 M40 190 H320 M40 40 V190 M140 40 V190 M240 40 V190 M320 40 V190" className={styles.street} />
      <text x="180" y="210" className={styles.streetName}>Av. General Paz</text>
      {/* Shortest in distance, slow because of traffic */}
      <path d="M40 190 L140 115 L240 115 L320 40" className={styles.routeSlow} />
      <g className={styles.tag} transform="translate(176 100)"><rect x="-38" y="-13" width="76" height="22" rx="11" /><text y="2.5">12 min</text></g>
      {/* Fastest: longer but on the avenue */}
      <path d="M40 190 H320 V40" pathLength="1" className={styles.routeFast} />
      <g className={`${styles.tag} ${styles.tagFast}`} transform="translate(285 168)"><rect x="-34" y="-13" width="68" height="22" rx="11" /><text y="2.5">8 min</text></g>
      {/* Places */}
      <g transform="translate(40 190)" className={styles.pin}><circle r="9" /><text y="30">Casa</text></g>
      <g transform="translate(320 40)" className={`${styles.pin} ${styles.pinGoal}`}><circle r="9" /><text y="-16">UNSAM</text></g>
    </svg>
  )
}

/** BFS: degrees of contact spreading from "you" in waves. */
export function BfsNetwork() {
  const first = [['A', 180, 52], ['L', 262, 115], ['S', 180, 178], ['J', 98, 115]]
  const second = [['M', 100, 30], ['P', 300, 42], ['R', 330, 160], ['T', 262, 214], ['C', 60, 210], ['V', 30, 95]]
  const links = [[0, 0], [0, 1], [1, 1], [1, 2], [2, 3], [3, 4], [3, 5]]
  return (
    <svg viewBox="0 0 360 250" className={styles.svg} role="img" aria-label="Red de contactos: vos en el centro, cuatro contactos de primer grado alrededor (verde) y seis de segundo grado más afuera (ámbar)">
      {first.map(([, x, y], i) => <line key={`a${i}`} x1="180" y1="115" x2={x} y2={y} className={styles.link} />)}
      {links.map(([f, s]) => (
        <line key={`b${f}${s}`} x1={first[f][1]} y1={first[f][2]} x2={second[s][1]} y2={second[s][2]} className={`${styles.link} ${styles.linkSecond}`} />
      ))}
      <g transform="translate(180 115)" className={styles.me}><circle r="24" /><text y="5">Vos</text></g>
      {first.map(([name, x, y]) => (
        <g key={name} transform={`translate(${x} ${y})`} className={`${styles.person} ${styles.wave1}`}><circle r="17" /><text y="5">{name}</text></g>
      ))}
      {second.map(([name, x, y]) => (
        <g key={name} transform={`translate(${x} ${y})`} className={`${styles.person} ${styles.wave2}`}><circle r="15" /><text y="5">{name}</text></g>
      ))}
      <g className={`${styles.degree} ${styles.wave1}`} transform="translate(214 74)"><rect x="-16" y="-12" width="32" height="22" rx="11" /><text y="4">1°</text></g>
      <g className={`${styles.degree} ${styles.wave2}`} transform="translate(338 16)"><rect x="-16" y="-12" width="32" height="22" rx="11" /><text y="4">2°</text></g>
    </svg>
  )
}

/** Binary search: open the dictionary in the middle and drop half. */
export function BinaryDictionary() {
  const sections = ['A–B', 'C–D', 'E–F', 'G–I', 'J–L', 'M–O', 'P–R', 'S–Z']
  return (
    <svg viewBox="0 0 360 250" className={styles.svg} role="img" aria-label="Diccionario en ocho secciones: buscando murciélago, se mira la sección del medio, se descarta la primera mitad y se encuentra en la sección M a O">
      <text x="180" y="40" className={styles.query}>Buscás “murciélago”</text>
      {sections.map((label, i) => (
        <g
          key={label}
          transform={`translate(${24 + i * 40} 80)`}
          className={`${styles.page} ${i < 4 ? styles.pageDropped : ''} ${i === 3 ? styles.pageFirstLook : ''} ${i === 5 ? styles.pageFound : ''}`}
        >
          <rect width="34" height="92" rx="5" />
          <text x="17" y="52" transform="rotate(-90 17 52)">{label}</text>
        </g>
      ))}
      <g className={styles.look1} transform="translate(161 196)"><text>1° vistazo: va después</text></g>
      <g className={styles.look2} transform="translate(241 222)"><text>2° vistazo: ¡acá está!</text></g>
    </svg>
  )
}

/** Bubble sort: after a match day the winner climbs the table swapping with the teams above. */
export function BubbleTable() {
  const rows = [
    ['River', 30, 'r0'],
    ['Boca', 29, 'r1'],
    ['Racing', 28, 'r2'],
    ['Banfield', 30, 'r3'],
    ['Lanús', 25, 'r4'],
  ]
  return (
    <svg viewBox="0 0 360 250" className={styles.svg} role="img" aria-label="Tabla de posiciones: Banfield ganó, llegó a 30 puntos y sube del cuarto al segundo puesto intercambiándose con Racing y con Boca">
      <text x="40" y="30" className={styles.tableHead}>Pos.</text>
      <text x="96" y="30" className={styles.tableHead}>Equipo</text>
      <text x="320" y="30" className={`${styles.tableHead} ${styles.right}`}>Pts</text>
      {[0, 1, 2, 3, 4].map((i) => <text key={i} x="48" y={64 + i * 40} className={styles.position}>{i + 1}</text>)}
      {rows.map(([team, points, id]) => (
        <g key={team} className={`${styles.row} ${styles[id]}`}>
          <rect x="76" y="44" width="260" height="32" rx="7" />
          <text x="92" y="65" className={styles.team}>{team}</text>
          <text x="320" y="65" className={`${styles.points} ${styles.right}`}>{points}</text>
        </g>
      ))}
    </svg>
  )
}
