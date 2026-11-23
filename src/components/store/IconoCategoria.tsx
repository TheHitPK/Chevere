/**
 * Iconos 3D tipo "arcilla" para las subcategorías (franelas, jeans, vestidos, relojes, calzado…).
 * Vectores con degradado de volumen, brillo y sombra en el piso, en la paleta de la marca.
 * Se eligen por palabras clave del nombre/slug, así funcionan con categorías nuevas del panel.
 */

const MAGENTA = '#c2007a', SOL = '#ffc20e', TURQ = '#00b8c4', NARANJA = '#ffa400', DENIM = '#3b5b8c'
const ROSA = '#f48fb1', CORAL = '#ff6f61', CELESTE = '#7fa7c9', ARENA = '#c9a26b', VINO = '#7a0047', LILA = '#9b84d6', MARRON = '#8a5a3c', NOCHE = '#2b2d42'

const mezcla = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))
  return `#${c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`
}

type Pieza = {
  d: string
  color: string
  detalle?: string
  /** pliegues de la tela (trazos de sombra suaves) */
  pliegues?: string
  /** costuras pespunteadas */
  costuras?: string
  costuraColor?: string
  /** sombra interior (cuello, bolsillos) */
  interior?: string
  patron?: 'denim'
}
type Icono = { piezas: Pieza[]; extra?: string }

/* Formas en una caja de 64 × 64; el piso está en y ≈ 58 */
const remera = 'M21 11 L13 14 L5 23 L11 30 L17 27 L17 54 L47 54 L47 27 L53 30 L59 23 L51 14 L43 11 Q32 19 21 11Z'
const ICONOS: Record<string, Icono> = {
  franela: { piezas: [{ d: remera, color: MAGENTA, detalle: 'M23 12 Q32 20 41 12' }], extra: `<path d="M27 34 l5 -6 5 6 -5 2z" fill="${SOL}"/>` },
  blusa: {
    piezas: [{ d: 'M24 10 L32 22 L40 10 Q48 11 52 15 Q60 18 59 26 Q56 31 50 29 L47 27 Q47 38 50 46 Q44 52 32 52 Q20 52 14 46 Q17 38 17 27 L14 29 Q8 31 5 26 Q4 18 12 15 Q16 11 24 10Z', color: '#f6a5c0', interior: 'M24 10 L32 22 L40 10 Q32 14 24 10Z', pliegues: 'M9 18 L11 27 M55 18 L53 27 M24 30 Q26 40 23 48 M40 30 Q38 40 41 48' }],
    extra: `<path d="M14 46 Q17 51 20 47 Q23 52 26 48 Q29 53 32 48 Q35 53 38 48 Q41 52 44 47 Q47 51 50 46 L50 49 Q44 55 32 55 Q20 55 14 49Z" fill="${mezcla('#f6a5c0', 0.3)}" stroke="${mezcla('#f6a5c0', -0.25)}" stroke-width=".6"/><circle cx="32" cy="28" r="1.3" fill="#fff"/><circle cx="32" cy="34" r="1.3" fill="#fff"/>`,
  },
  camisa: {
    piezas: [{ d: 'M21 11 L12 14 L6 40 L13 42 L17 28 L17 55 L47 55 L47 28 L51 42 L58 40 L52 14 L43 11 L32 22Z', color: '#8fb3d9', detalle: 'M32 22 L32 55', pliegues: 'M22 32 Q24 44 21 54 M42 32 Q40 44 43 54 M11 22 Q12 30 10 36 M53 22 Q52 30 54 36', costuras: 'M17 53 L47 53' }],
    extra: `<path d="M21 11 L32 22 L26.5 26 L19.5 14Z M43 11 L32 22 L37.5 26 L44.5 14Z" fill="#f4f8fd"/><path d="M6 39 L13 41 L12.5 44 L5.5 42Z M58 39 L51 41 L51.5 44 L58.5 42Z" fill="${mezcla('#8fb3d9', -0.2)}"/>${[28, 35, 42, 49].map((y) => `<circle cx="33.6" cy="${y}" r="1.1" fill="#fff"/>`).join('')}<rect x="37" y="28" width="7" height="7" rx="1" fill="none" stroke="${mezcla('#8fb3d9', -0.3)}" stroke-width="1"/>`,
  },
  pantalon: { piezas: [{ d: 'M19 8 L45 8 L49 56 L36 56 L32 24 L28 56 L15 56Z', color: ARENA, detalle: 'M32 12 L32 24' }], extra: `<rect x="19" y="8" width="26" height="5" rx="1.5" fill="${mezcla(ARENA, -0.25)}"/>` },
  jean: { piezas: [{ d: 'M19 8 L45 8 L49 56 L36 56 L32 24 L28 56 L15 56Z', color: DENIM }], extra: `<rect x="19" y="8" width="26" height="5" rx="1.5" fill="${mezcla(DENIM, -0.25)}"/><path d="M21 14 Q25 20 29 15 M43 14 Q39 20 35 15 M18 18 L16 54 M46 18 L48 54" stroke="${SOL}" stroke-width="1.2" fill="none" stroke-dasharray="2 1.6"/><circle cx="32" cy="10.5" r="1.4" fill="${SOL}"/>` },
  vestido: { piezas: [{ d: 'M25 8 L24 20 Q19 24 18 30 L11 55 Q32 60 53 55 L46 30 Q45 24 40 20 L39 8 Q32 13 25 8Z', color: CORAL }], extra: `<path d="M24 21 Q32 25 40 21 L40.5 24 Q32 28 23.5 24Z" fill="${SOL}"/>` },
  falda: { piezas: [{ d: 'M22 14 L42 14 L54 54 Q32 59 10 54Z', color: '#ec008c', detalle: 'M27 16 L21 55 M32 16 L32 57 M37 16 L43 55' }], extra: `<rect x="21" y="11" width="22" height="5" rx="2" fill="${VINO}"/>` },
  short: { piezas: [{ d: 'M15 14 L49 14 L54 46 L36 48 L32 30 L28 48 L10 46Z', color: TURQ }], extra: `<rect x="15" y="14" width="34" height="5" rx="1.5" fill="${mezcla(TURQ, -0.3)}"/><path d="M32 19 L32 30" stroke="${mezcla(TURQ, -0.35)}" stroke-width="1.2"/>` },
  chaqueta: { piezas: [{ d: 'M20 10 L11 14 L6 46 L13 48 L16 30 L16 55 L48 55 L48 30 L51 48 L58 46 L53 14 L44 10 L36 30 L28 30Z', color: VINO }], extra: `<path d="M20 10 L28 30 L24 34 L18 18Z M44 10 L36 30 L40 34 L46 18Z" fill="${mezcla(VINO, 0.25)}"/><circle cx="33" cy="40" r="1.6" fill="${SOL}"/><circle cx="33" cy="47" r="1.6" fill="${SOL}"/>` },
  deportiva: { piezas: [{ d: 'M22 8 Q24 18 32 19 Q40 18 42 8 L47 10 Q46 24 48 32 Q48 50 46 55 L18 55 Q16 50 16 32 Q18 24 17 10Z', color: TURQ }], extra: `<path d="M18 38 Q32 31 46 38 L46 43 Q32 36 18 43Z" fill="${SOL}"/>` },
  interior: { piezas: [{ d: 'M8 26 Q10 18 18 14 L24 14 Q28 26 32 30 Q36 26 40 14 L46 14 Q54 18 56 26 L56 38 L8 38Z', color: ROSA }], extra: `<path d="M8 32 L56 32" stroke="#fff" stroke-width="1.4" opacity=".7"/><path d="M18 14 L20 6 M46 14 L44 6" stroke="${mezcla(ROSA, -0.3)}" stroke-width="2" stroke-linecap="round"/>` },
  traje: {
    piezas: [{ d: 'M20 10 L11 14 L6 46 L13 48 L16 30 L16 56 L48 56 L48 30 L51 48 L58 46 L53 14 L44 10 L36 36 L28 36Z', color: NOCHE, pliegues: 'M17 34 Q20 44 18 54 M47 34 Q44 44 46 54 M10 26 Q12 34 10 42 M54 26 Q52 34 54 42' }],
    extra: `<path d="M28 10 L32 16 L36 10 L36 36 L28 36Z" fill="#f4f8fd"/><path d="M30.2 16 L33.8 16 L35 31 L32 35 L29 31Z" fill="${MAGENTA}"/><path d="M20 10 L28 36 L24 30 L22 24 L18 22 L21 18Z M44 10 L36 36 L40 30 L42 24 L46 22 L43 18Z" fill="${mezcla(NOCHE, 0.18)}"/><path d="M40 28 l5 -1 0 3 -5 .5z" fill="${SOL}"/><circle cx="33" cy="44" r="1.4" fill="${mezcla(NOCHE, 0.4)}"/><circle cx="33" cy="50" r="1.4" fill="${mezcla(NOCHE, 0.4)}"/>`,
  },
  conjunto: { piezas: [{ d: 'M18 6 L12 8 L7 15 L11 19 L15 17 L15 32 L35 32 L35 17 L39 19 L43 15 L38 8 L32 6 Q25 11 18 6Z', color: NARANJA }, { d: 'M28 36 L56 36 L59 56 L45 57 L42 46 L39 57 L25 56Z', color: TURQ }] },
  pijama: { piezas: [{ d: remera, color: LILA }], extra: `<path d="M26 34 a5 5 0 1 0 6 -6 a4 4 0 1 1 -6 6Z" fill="${SOL}"/><circle cx="40" cy="42" r="1.3" fill="#fff"/><circle cx="24" cy="46" r="1.1" fill="#fff"/><circle cx="38" cy="30" r="1" fill="#fff"/>` },
  reloj: { piezas: [{ d: 'M25 4 L39 4 L38 18 L26 18Z M25 60 L39 60 L38 46 L26 46Z', color: MARRON }, { d: 'M32 14 a18 18 0 1 1 -0.1 0Z', color: SOL }], extra: `<circle cx="32" cy="32" r="13" fill="#fffaf3"/><path d="M32 32 L32 23 M32 32 L38 35" stroke="#1d0a16" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="1.6" fill="${MAGENTA}"/>` },
  'reloj-digital': { piezas: [{ d: 'M25 4 L39 4 L38 18 L26 18Z M25 60 L39 60 L38 46 L26 46Z', color: '#3a3a40' }, { d: 'M18 16 h28 a5 5 0 0 1 5 5 v22 a5 5 0 0 1 -5 5 h-28 a5 5 0 0 1 -5 -5 v-22 a5 5 0 0 1 5 -5Z', color: TURQ }], extra: `<rect x="17" y="21" width="30" height="22" rx="3" fill="#10202a"/><text x="32" y="36.5" text-anchor="middle" font-family="monospace" font-weight="700" font-size="10" fill="#7dfcc0">10:45</text>` },
  bolso: { piezas: [{ d: 'M10 24 L54 24 L50 56 L14 56Z', color: MAGENTA }], extra: `<path d="M21 24 Q21 8 32 8 Q43 8 43 24" stroke="${mezcla(MAGENTA, -0.35)}" stroke-width="3.5" fill="none" stroke-linecap="round"/><rect x="27" y="30" width="10" height="7" rx="2" fill="${SOL}"/>` },
  cinturon: { piezas: [{ d: 'M4 26 h56 v12 h-56Z', color: MARRON }], extra: `<rect x="23" y="22" width="18" height="20" rx="3.5" fill="none" stroke="${SOL}" stroke-width="3.5"/><path d="M32 26 L32 38" stroke="${SOL}" stroke-width="2.4"/><circle cx="50" cy="32" r="1.5" fill="#1d0a16" opacity=".5"/><circle cx="56" cy="32" r="1.5" fill="#1d0a16" opacity=".5"/>` },
  gafas: { piezas: [{ d: 'M4 26 Q4 21 10 21 L26 21 Q29 21 28.5 26 Q27 40 16 40 Q5 40 4 26Z M60 26 Q60 21 54 21 L38 21 Q35 21 35.5 26 Q37 40 48 40 Q59 40 60 26Z', color: VINO }], extra: `<path d="M28 25 Q32 21 36 25" stroke="${VINO}" stroke-width="2.5" fill="none"/><path d="M9 25 L15 33 M42 24 L46 30" stroke="#fff" stroke-width="2" opacity=".45" stroke-linecap="round"/>` },
  gorra: { piezas: [{ d: 'M10 40 Q9 14 32 13 Q55 14 54 40Z', color: MAGENTA }, { d: 'M8 40 Q32 34 56 40 Q60 48 32 50 Q4 48 8 40Z', color: VINO }], extra: `<circle cx="32" cy="13" r="2.4" fill="${SOL}"/><path d="M26 30 l6 -6 6 6 -6 2.5z" fill="${SOL}"/>` },
  joya: { piezas: [{ d: 'M32 22 a17 17 0 1 1 -0.1 0Z M32 28 a11 11 0 1 0 0.1 0Z', color: SOL }, { d: 'M24 14 L28 6 L36 6 L40 14 L32 24Z', color: MAGENTA }], extra: `<path d="M28 6 L32 14 L36 6 M24 14 L40 14" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/>` },
  tacon: { piezas: [{ d: 'M6 48 Q8 38 16 40 L36 44 Q46 26 56 18 L58 22 Q54 32 54 48 L50 48 L48 34 Q44 44 38 50 L10 52Z', color: MAGENTA }], extra: `<path d="M50 48 L54 48 L53 56 L51 56Z" fill="${VINO}"/>` },
  oxford: { piezas: [{ d: 'M4 46 Q4 34 14 34 L30 30 Q38 28 44 34 L56 38 Q61 41 60 48 Z', color: MARRON }], extra: `<path d="M3 48 H61 Q61 53 56 53 H8 Q3 53 3 48Z" fill="#3d2418"/><path d="M28 32 L36 36 M30 30 L38 34" stroke="#f5e6c8" stroke-width="1.4"/>` },
  formal: { piezas: [{ d: 'M4 46 Q4 34 14 34 L30 30 Q38 28 44 34 L56 38 Q61 41 60 48 Z', color: NOCHE }], extra: `<path d="M3 48 H61 Q61 53 56 53 H8 Q3 53 3 48Z" fill="#111"/><path d="M14 36 Q30 30 44 35" stroke="#fff" stroke-width="1" opacity=".35" fill="none"/>` },
  zapatilla: { piezas: [{ d: 'M5 46 Q4 32 16 30 L30 20 Q38 16 44 24 L52 33 Q60 36 59 46 Z', color: '#f2f2f4' }], extra: `<path d="M4 46 H60 Q61 53 55 53 H9 Q3 53 4 46Z" fill="${MAGENTA}"/><path d="M12 42 Q26 36 32 26 Q38 36 54 40" stroke="${MAGENTA}" stroke-width="3" fill="none" stroke-linecap="round"/>${[0, 1, 2].map((i) => `<path d="M${30 + i * 4} ${23 + i * 3} l5 -2" stroke="#1d0a16" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`).join('')}` },
  'zapatilla-ninos': { piezas: [{ d: 'M8 46 Q8 34 18 32 L30 24 Q38 20 43 27 L50 34 Q57 37 56 46 Z', color: TURQ }], extra: `<path d="M7 46 H57 Q58 52 53 52 H11 Q6 52 7 46Z" fill="${NARANJA}"/><circle cx="24" cy="38" r="3" fill="${SOL}"/><circle cx="34" cy="34" r="2.5" fill="${MAGENTA}"/>` },
  sandalia: { piezas: [{ d: 'M6 46 Q6 40 12 40 L54 41 Q60 42 59 48 L57 50 L8 50Z', color: '#e3c9a8' }], extra: `<path d="M20 41 Q28 26 40 41" stroke="${MAGENTA}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M12 41 Q15 33 20 41" stroke="${SOL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` },
  todo: { piezas: [{ d: 'M10 44 A22 22 0 0 1 54 44 Z', color: SOL }, { d: 'M6 46 Q32 36 58 46 Q50 57 32 57 Q14 57 6 46 Z', color: '#ffd21f' }], extra: [-60, -30, 0, 30, 60].map((a) => `<path d="M32 6 L36 15 L28 15Z" fill="${NARANJA}" transform="rotate(${a} 32 44)"/>`).join('') },
  generico: { piezas: [{ d: 'M14 18 L36 8 L56 28 L34 50 Z', color: MAGENTA }], extra: `<circle cx="38" cy="18" r="4" fill="#fff"/>` },
}


/* ---------- Variantes por colección: cortes de Damas, Caballeros y Niños ---------- */
const CAMEL = '#c8834a', NAVY = '#2d3e63', OLIVA = '#5f6b3a', CHINO = '#b8955f', LAVADO = '#7da3d4', INDIGO = '#23345a', NARANJA_P = '#f2672a', ROSA_V = '#e0559a', TEAL = '#2f7f8f'

const VARIANTES: Record<string, Icono> = {
  /* DAMAS */
  'franela-dama': {
    piezas: [{
      d: 'M22 10 Q32 17 42 10 L52 13 Q57 18 58 24 L50 27 L47 25 Q45 33 47 40 Q48 48 46 55 L18 55 Q16 48 17 40 Q19 33 17 25 L14 27 L6 24 Q7 18 12 13Z', color: ROSA_V,
      interior: 'M22 10 Q32 17 42 10 Q32 13.5 22 10Z', pliegues: 'M23 31 Q26 41 22 52 M41 31 Q38 42 42 52 M47 25 Q44 27 46 30', costuras: 'M18 52.5 Q32 54 46 52.5 M8 23.5 L13 25.5 M56 23.5 L51 25.5',
    }],
    extra: `<path d="M28 33 l4 -5 4 5 -4 1.6z" fill="${SOL}"/>`,
  },
  'pantalon-dama': {
    piezas: [{
      d: 'M20 6 L44 6 L46 15 Q54 36 57 57 L37 58 L32 26 L27 58 L7 57 Q10 36 18 15Z', color: NARANJA_P,
      pliegues: 'M24 15 Q20 36 14 56 M40 15 Q44 36 50 56 M32 26 L32 18', costuras: 'M8 55 L27 56 M37 56 L56 55',
    }],
    extra: `<path d="M20 6 L44 6 L45 13 L19 13Z" fill="${mezcla(NARANJA_P, -0.22)}"/><path d="M31 9 q-6 -5 -8 1 q3 3 8 0 q5 -5 8 -1 q-2 6 -8 1z" fill="${mezcla(NARANJA_P, -0.35)}"/><path d="M30 10 l-3 7 M34 10 l3 7" stroke="${mezcla(NARANJA_P, -0.35)}" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  'jean-dama': {
    piezas: [{
      d: 'M20 6 L44 6 L46 20 L50 57 L37 58 L32 24 L27 58 L14 57 L18 20Z', color: LAVADO, patron: 'denim',
      pliegues: 'M27 24 Q29 27 31 25 M37 24 Q35 27 33 25 M20 44 Q23 45 25 43 M44 44 Q41 45 39 43',
      costuras: 'M21 13 Q25 19 29 14 M43 13 Q39 19 35 14 M32 13 L32 24 M18 20 L15 56 M46 20 L49 56', costuraColor: SOL,
    }],
    extra: `<rect x="20" y="6" width="24" height="6" rx="1.5" fill="${mezcla(LAVADO, -0.2)}"/><circle cx="32" cy="9" r="1.5" fill="${SOL}"/><path d="M18 38 l3 -1 2 1.5 3 -1.2 2 1.2" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M18.5 40.5 h8" stroke="#fff" stroke-width=".9" opacity=".8"/>`,
  },
  'short-dama': {
    piezas: [{
      d: 'M18 13 L46 13 L52 40 L35 42 L32 28 L29 42 L12 40Z', color: '#ff8fb8',
      pliegues: 'M24 16 L22 38 M40 16 L42 38', costuras: 'M13 38 L29 40 M35 40 L51 38',
    }],
    extra: `<path d="M16 8 Q20 13 24 8 Q28 13 32 8 Q36 13 40 8 Q44 13 48 8 L46 15 L18 15Z" fill="${mezcla('#ff8fb8', -0.18)}"/><path d="M32 13 q-6 -5 -8 1 q3 3 8 0 q5 -5 8 -1 q-2 6 -8 1z" fill="${MAGENTA}"/>`,
  },
  'chaqueta-dama': {
    piezas: [{
      d: 'M21 8 L12 12 L6 44 L13 46 L16 28 L17 47 L47 47 L48 28 L51 46 L58 44 L52 12 L43 8 L36 30 L28 30Z', color: CAMEL,
      interior: 'M28 30 L36 30 L32 36Z', pliegues: 'M17 32 Q20 40 19 46 M47 32 Q44 40 45 46 M10 28 Q12 34 11 40 M54 28 Q52 34 53 40',
      costuras: 'M7 42 L13 44 M57 42 L51 44',
    }],
    extra: `<path d="M21 8 L28 30 L25 33 L22 26 L18 14Z M43 8 L36 30 L39 33 L42 26 L46 14Z" fill="${mezcla(CAMEL, 0.22)}"/><rect x="17" y="38" width="30" height="4" fill="${mezcla(CAMEL, -0.35)}"/><rect x="29.5" y="37" width="5" height="6" rx="1" fill="none" stroke="${SOL}" stroke-width="1.6"/>`,
  },
  'deportiva-dama': {
    piezas: [
      { d: 'M18 6 Q22 14 32 15 Q42 14 46 6 L50 8 Q50 18 48 24 L16 24 Q14 18 14 8Z', color: TURQ, costuras: 'M16 21 L48 21' },
      { d: 'M18 28 L46 28 L47 58 L37 58 L32 38 L27 58 L17 58Z', color: '#5a1a46', pliegues: 'M23 40 Q22 48 23 56 M41 40 Q42 48 41 56' },
    ],
    extra: `<path d="M17 30 L17 57 M47 30 L47 57" stroke="${SOL}" stroke-width="2"/>`,
  },
  'interior-dama': {
    piezas: [{
      d: 'M8 26 Q10 18 18 14 L24 14 Q28 26 32 30 Q36 26 40 14 L46 14 Q54 18 56 26 L56 38 L8 38Z', color: ROSA,
      pliegues: 'M18 20 Q20 26 18 32 M46 20 Q44 26 46 32',
    }],
    extra: `<path d="M8 38 ${Array.from({ length: 8 }, (_, i) => `q3 4 6 0`).join(' ')}" fill="${mezcla(ROSA, 0.35)}" stroke="${mezcla(ROSA, -0.25)}" stroke-width=".7"/><path d="M18 14 L20 6 M46 14 L44 6" stroke="${mezcla(ROSA, -0.3)}" stroke-width="2" stroke-linecap="round"/><path d="M32 30 q-2 -3 0 -4 q2 1 0 4z" fill="${MAGENTA}"/>`,
  },

  /* CABALLEROS */
  'franela-caballero': {
    piezas: [{
      d: 'M22 9 L12 12 L4 22 L11 30 L17 26 L17 56 L47 56 L47 26 L53 30 L60 22 L52 12 L42 9 Q32 15 22 9Z', color: NAVY,
      interior: 'M22 9 Q32 15 42 9 Q32 12 22 9Z', pliegues: 'M22 34 Q24 45 21 54 M43 33 Q41 45 44 54 M17 26 Q20 28 19 31',
      costuras: 'M17 53.5 L47 53.5 M5.5 21 L12 28 M58.5 21 L52 28',
    }],
    extra: `<path d="M22 9 Q32 15 42 9" stroke="${mezcla(NAVY, 0.3)}" stroke-width="2.4" fill="none"/><rect x="35" y="25" width="7" height="8" rx="1" fill="none" stroke="${mezcla(NAVY, 0.35)}" stroke-width="1.1" stroke-dasharray="1.6 1.2"/>`,
  },
  'pantalon-caballero': {
    piezas: [{
      d: 'M19 6 L45 6 L47 56 L36 57 L32 22 L28 57 L17 56Z', color: CHINO,
      pliegues: 'M23 22 L22.5 56 M41 22 L41.5 56 M29 46 Q27 48 28 50 M35 46 Q37 48 36 50', costuras: 'M20 13 Q24 18 27 13 M44 13 Q40 18 37 13 M32 13 L32 22',
    }],
    extra: `<rect x="19" y="6" width="26" height="6" rx="1" fill="${mezcla(CHINO, -0.25)}"/>${[22, 28, 36, 42].map((x) => `<rect x="${x - 1}" y="5" width="2" height="8" rx=".8" fill="${mezcla(CHINO, -0.4)}"/>`).join('')}<path d="M17 53 L28 54 M36 54 L47 53" stroke="${mezcla(CHINO, -0.3)}" stroke-width="2.4"/>`,
  },
  'jean-caballero': {
    piezas: [{
      d: 'M19 6 L45 6 L47 57 L36 57 L32 22 L28 57 L17 57Z', color: INDIGO, patron: 'denim',
      pliegues: 'M26 22 Q29 24 31 22 M38 22 Q35 24 33 22 M22 50 Q24 51 26 49 M42 50 Q40 51 38 49',
      costuras: 'M20 13 Q24 19 28 14 M44 13 Q40 19 36 14 M32 13 L32 22 M18 18 L17.5 56 M46 18 L46.5 56 M38 13 h4 v4 h-4z', costuraColor: '#e8a33a',
    }],
    extra: `<rect x="19" y="6" width="26" height="6" rx="1" fill="${mezcla(INDIGO, 0.12)}"/><circle cx="32" cy="9" r="1.5" fill="#d9b25a"/>`,
  },
  'short-caballero': {
    piezas: [{
      d: 'M17 10 L47 10 L51 48 L35 49 L32 26 L29 49 L13 48Z', color: TEAL,
      pliegues: 'M23 26 L21 47 M41 26 L43 47', costuras: 'M18 16 Q22 21 26 16 M46 16 Q42 21 38 16 M32 16 L32 26',
    }],
    extra: `<rect x="17" y="10" width="30" height="6" rx="1" fill="${mezcla(TEAL, -0.28)}"/><path d="M13 46 L29 47 M35 47 L51 46" stroke="${mezcla(TEAL, -0.3)}" stroke-width="3"/>`,
  },
  'chaqueta-caballero': {
    piezas: [{
      d: 'M20 10 L10 14 L5 46 L12 48 L15 30 L16 53 L48 53 L49 30 L52 48 L59 46 L54 14 L44 10 Q32 16 20 10Z', color: OLIVA,
      pliegues: 'M16 30 Q19 40 17 50 M48 30 Q45 40 47 50 M9 26 Q11 34 9 42 M55 26 Q53 34 55 42', costuras: 'M32 14 L32 53',
    }],
    extra: `<path d="M20 10 Q32 16 44 10 L44 13 Q32 19 20 13Z" fill="${mezcla(OLIVA, -0.35)}"/><rect x="16" y="49" width="32" height="5" fill="${mezcla(OLIVA, -0.35)}"/><path d="M5 44 L12 46 L12 49 L5 47Z M59 44 L52 46 L52 49 L59 47Z" fill="${mezcla(OLIVA, -0.35)}"/><rect x="31" y="22" width="2" height="5" rx="1" fill="${SOL}"/><rect x="51" y="20" width="5" height="7" rx="1" fill="none" stroke="${mezcla(OLIVA, 0.3)}" stroke-width="1"/>`,
  },
  'deportiva-caballero': {
    piezas: [
      { d: 'M22 6 Q24 14 32 15 Q40 14 42 6 L46 7 Q46 18 48 26 L48 36 L16 36 L16 26 Q18 18 18 7Z', color: NAVY, pliegues: 'M22 24 Q24 30 22 35 M42 24 Q40 30 42 35' },
      { d: 'M16 38 L48 38 L51 58 L35 58 L32 48 L29 58 L13 58Z', color: TURQ, costuras: 'M14 56 L29 57 M35 57 L50 56' },
    ],
    extra: `<path d="M16 30 Q32 24 48 30 L48 33 Q32 27 16 33Z" fill="${SOL}"/><path d="M16 40 L13 58 M48 40 L51 58" stroke="#fff" stroke-width="1.6"/>`,
  },

  /* NIÑOS */
  'franela-ninos': {
    piezas: [{ d: 'M22 13 L14 16 L8 24 L13 30 L18 27 L18 52 L46 52 L46 27 L51 30 L56 24 L50 16 L42 13 Q32 19 22 13Z', color: NARANJA, interior: 'M22 13 Q32 19 42 13 Q32 16 22 13Z', pliegues: 'M23 34 Q24 44 22 50 M41 34 Q40 44 42 50' }],
    extra: `<circle cx="32" cy="36" r="6" fill="${TURQ}"/><circle cx="30" cy="35" r="1.2" fill="#fff"/><circle cx="34" cy="35" r="1.2" fill="#fff"/><path d="M29 38.5 Q32 41 35 38.5" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
  },
  'pantalon-ninos': {
    piezas: [{ d: 'M19 8 L45 8 L48 52 L37 53 L32 26 L27 53 L16 52Z', color: '#6f7fd9', pliegues: 'M24 26 Q22 38 23 50 M40 26 Q42 38 41 50' }],
    extra: `<rect x="19" y="8" width="26" height="6" rx="2" fill="${mezcla('#6f7fd9', -0.25)}"/><rect x="16" y="49" width="12" height="5" rx="2" fill="${SOL}"/><rect x="36" y="49" width="12" height="5" rx="2" fill="${SOL}"/><path d="M29 11 l3 4 3 -4" stroke="#fff" stroke-width="1.2" fill="none"/>`,
  },
  'chaqueta-ninos': {
    piezas: [{ d: 'M22 14 Q20 4 32 4 Q44 4 42 14 L52 18 L58 46 L51 48 L48 32 L48 56 L16 56 L16 32 L13 48 L6 46 L12 18Z', color: SOL, interior: 'M25 13 Q25 7 32 7 Q39 7 39 13 Q32 17 25 13Z', pliegues: 'M17 34 Q20 44 18 54 M47 34 Q44 44 46 54', costuras: 'M32 16 L32 56' }],
    extra: `${[24, 32, 40, 48].map((y) => `<circle cx="35" cy="${y}" r="1.4" fill="${MAGENTA}"/>`).join('')}`,
  },
  'vestido-ninos': {
    piezas: [{ d: 'M24 10 Q32 14 40 10 L41 22 Q48 24 50 30 L54 54 Q32 59 10 54 L14 30 Q16 24 23 22Z', color: '#ff7eb6', pliegues: 'M22 30 L18 53 M32 30 L32 56 M42 30 L46 53' }],
    extra: `<path d="M24 10 Q17 11 15 18 Q19 20 23 18Z M40 10 Q47 11 49 18 Q45 20 41 18Z" fill="${mezcla('#ff7eb6', 0.3)}"/><rect x="22" y="22" width="20" height="4" rx="1.5" fill="${SOL}"/>${[[22, 36], [36, 40], [28, 46], [42, 48], [18, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff" opacity=".9"/>`).join('')}`,
  },
  'short-ninos': {
    piezas: [{ d: 'M16 14 L48 14 L52 42 L35 43 L32 28 L29 43 L12 42Z', color: TURQ, pliegues: 'M23 28 L21 41 M41 28 L43 41' }],
    extra: `<rect x="16" y="14" width="32" height="6" rx="2" fill="${mezcla(TURQ, -0.3)}"/><circle cx="22" cy="33" r="2.5" fill="${SOL}"/><circle cx="42" cy="34" r="2" fill="${MAGENTA}"/>`,
  },
}

/** Elige el icono según el nombre de la subcategoría y la colección (damas, caballeros, niños, calzado…). */
export function iconoPara(texto: string, contexto = ''): string {
  const esCalzado = contexto === 'calzado'
  const gen = contexto === 'damas' ? 'dama' : contexto === 'caballeros' ? 'caballero' : contexto.startsWith('nino') ? 'ninos' : ''
  const t = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (t === 'todo') return 'todo'
  if (esCalzado) {
    if (/dama|tacon/.test(t)) return 'tacon'
    if (/caballero/.test(t)) return 'oxford'
    if (/nin/.test(t)) return 'zapatilla-ninos'
    if (/deport/.test(t)) return 'zapatilla'
    if (/casual|sandal/.test(t)) return 'sandalia'
    if (/formal/.test(t)) return 'formal'
    return 'zapatilla'
  }
  const reglas: [RegExp, string][] = [
    [/franela|camiseta|remera/, 'franela'], [/blusa/, 'blusa'], [/camisa/, 'camisa'], [/jean/, 'jean'],
    [/pantal/, 'pantalon'], [/vestid/, 'vestido'], [/falda/, 'falda'], [/short|bermuda/, 'short'],
    [/traje|blazer/, 'traje'], [/chaquet|abrig/, 'chaqueta'], [/deport/, 'deportiva'], [/interior|lenceria/, 'interior'],
    [/conjunto/, 'conjunto'], [/pijama/, 'pijama'], [/digital/, 'reloj-digital'], [/reloj/, 'reloj'],
    [/cartera|bolso/, 'bolso'], [/cinturon/, 'cinturon'], [/gafa|lente/, 'gafas'], [/gorra|sombrero/, 'gorra'], [/joy|anillo|collar/, 'joya'],
  ]
  const base = reglas.find(([r]) => r.test(t))?.[1] ?? 'generico'
  // Variante según la colección (p. ej. pantalón de dama vs. de caballero), si existe
  const familia = base === 'jean' ? 'jean' : base === 'pantalon' ? 'pantalon' : base
  return gen && VARIANTES[`${familia}-${gen}`] ? `${familia}-${gen}` : base
}

export function IconoCategoria({ nombre, contexto, esCalzado = false, uid, className = '' }: { nombre: string; contexto?: string; esCalzado?: boolean; uid: string; className?: string }) {
  const clave = iconoPara(nombre, esCalzado ? 'calzado' : contexto ?? '')
  const ic = VARIANTES[clave] ?? ICONOS[clave] ?? ICONOS.generico
  const id = `ic-${uid}`.replace(/[^a-z0-9-]/gi, '')
  const piezas = ic.piezas
    .map((p, i) => {
      const g = `${id}-g${i}`
      return `<defs>
          <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${mezcla(p.color, 0.42)}"/><stop offset=".5" stop-color="${p.color}"/><stop offset="1" stop-color="${mezcla(p.color, -0.32)}"/>
          </linearGradient>
          <clipPath id="${g}-c"><path d="${p.d}" fill-rule="evenodd"/></clipPath>
        </defs>
        <path d="${p.d}" fill="url(#${g})" fill-rule="evenodd" stroke="${mezcla(p.color, -0.45)}" stroke-width=".8" stroke-linejoin="round"/>
        <g clip-path="url(#${g}-c)">
          <ellipse cx="18" cy="12" rx="22" ry="12" fill="#fff" opacity=".38" filter="url(#${id}-b)"/>
          <path d="${p.d}" fill="none" stroke="${mezcla(p.color, -0.35)}" stroke-width="5" opacity=".35" transform="translate(1.4 1.8)" filter="url(#${id}-b)"/>
        </g>
        ${p.patron === 'denim' ? `<g clip-path="url(#${g}-c)" opacity=".22"><rect width="64" height="64" fill="url(#${id}-denim)"/></g>` : ''}
        ${p.interior ? `<path d="${p.interior}" fill="${mezcla(p.color, -0.55)}" opacity=".9"/>` : ''}
        ${p.pliegues ? `<g clip-path="url(#${g}-c)"><path d="${p.pliegues}" fill="none" stroke="${mezcla(p.color, -0.5)}" stroke-width="1.6" stroke-linecap="round" opacity=".45" filter="url(#${id}-s)"/><path d="${p.pliegues}" fill="none" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".28" transform="translate(-1 -.6)"/></g>` : ''}
        ${p.costuras ? `<path d="${p.costuras}" fill="none" stroke="${p.costuraColor ?? mezcla(p.color, 0.35)}" stroke-width=".9" stroke-dasharray="1.6 1.2" stroke-linecap="round" opacity=".9"/>` : ''}
        ${p.detalle ? `<path d="${p.detalle}" fill="none" stroke="${mezcla(p.color, -0.35)}" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>` : ''}`
    })
    .join('')
  const svg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="${id}-b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
        <filter id="${id}-s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".6"/></filter>
        <pattern id="${id}-denim" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 L0 3" stroke="#fff" stroke-width=".9"/></pattern>
      </defs>
      <ellipse cx="32" cy="60" rx="20" ry="3" fill="#3d0024" opacity=".16"/>
      <g class="icono-cuerpo">${piezas}${ic.extra ?? ''}</g>
    </svg>`
  return <span className={`icono-3d inline-block ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />
}
