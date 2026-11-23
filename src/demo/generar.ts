/**
 * Generador de imágenes de MUESTRA (solo para probar la tienda sin fotos reales).
 * Dibuja cada prenda en vectores y simula una mesa giratoria: 36 frames por color.
 * En producción se reemplazan por fotos reales desde el panel.
 */
import sharp from 'sharp'

export type Forma = 'franela' | 'camisa' | 'vestido' | 'pantalon' | 'reloj' | 'reloj-digital' | 'zapatilla' | 'sandalia' | 'gafas' | 'gorra'

const W = 400
const H = 500

const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))
  return `#${c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`
}
const luz = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)
}

/** Estampado: el sol de la marca, en miniatura. */
const solPrint = (cx: number, cy: number, r: number, color: string) => `
  <g transform="translate(${cx} ${cy})">
    ${[-80, -40, 0, 40, 80].map((a) => `<path d="M0 ${-r * 1.75} L${r * 0.22} ${-r * 1.3} L${-r * 0.22} ${-r * 1.3}Z" fill="${color}" transform="rotate(${a})"/>`).join('')}
    <path d="M${-r} 0 A${r} ${r} 0 0 1 ${r} 0Z" fill="${color}"/>
    <path d="M${-r * 1.3} ${r * 0.15} Q0 ${-r * 0.25} ${r * 1.3} ${r * 0.15} Q${r * 0.9} ${r * 0.6} 0 ${r * 0.6} Q${-r * 0.9} ${r * 0.6} ${-r * 1.3} ${r * 0.15}Z" fill="${color}" opacity=".9"/>
  </g>`

const costura = (d: string, c: string) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".55"/>`

/** Devuelve la prenda vista de frente (frente=true) o de espaldas. */
function prenda(forma: Forma, base: string, acento: string, frente: boolean) {
  const borde = shade(base, -0.28)
  const hilo = luz(base) > 140 ? shade(base, -0.45) : shade(base, 0.45)
  const print = luz(base) > 170 ? '#c2007a' : '#ffd21f'
  switch (forma) {
    case 'franela':
    case 'camisa': {
      const d =
        forma === 'camisa'
          ? 'M140 70 L110 80 L50 130 L40 300 L85 312 L115 190 L115 440 L285 440 L285 190 L315 312 L360 300 L350 130 L290 80 L260 70 Q200 100 140 70 Z'
          : 'M140 70 L110 80 L50 130 L80 185 L115 165 L115 440 L285 440 L285 165 L320 185 L350 130 L290 80 L260 70 Q200 110 140 70 Z'
      const cuello = frente
        ? forma === 'camisa'
          ? `<path d="M150 72 L200 120 L178 140 L140 78Z M250 72 L200 120 L222 140 L260 78Z" fill="${shade(base, 0.12)}" stroke="${borde}" stroke-width="2"/>
             <line x1="200" y1="125" x2="200" y2="438" stroke="${borde}" stroke-width="2"/>
             ${[170, 225, 280, 335, 390].map((y) => `<circle cx="206" cy="${y}" r="4.5" fill="${shade(base, -0.15)}" stroke="${borde}"/>`).join('')}
             <rect x="232" y="175" width="38" height="44" rx="4" fill="none" stroke="${borde}" stroke-width="2"/>`
          : `<path d="M140 70 Q200 118 260 70 Q200 95 140 70Z" fill="${shade(base, -0.35)}"/>
             ${costura('M144 76 Q200 122 256 76', hilo)}
             ${solPrint(200, 230, 34, print)}`
        : `<path d="M140 70 Q200 84 260 70 Q200 78 140 70Z" fill="${shade(base, -0.3)}"/>`
      return `<path d="${d}" fill="${base}" stroke="${borde}" stroke-width="2.5" stroke-linejoin="round"/>
        ${costura('M118 430 L282 430', hilo)}
        ${forma === 'franela' ? costura('M57 140 L84 178', hilo) + costura('M343 140 L316 178', hilo) : ''}
        ${cuello}`
    }
    case 'vestido':
      return `<path d="M160 60 L150 140 Q120 165 112 205 L70 452 Q200 485 330 452 L288 205 Q280 165 250 140 L240 60 Q200 92 160 60Z" fill="${base}" stroke="${borde}" stroke-width="2.5"/>
        <path d="M150 140 Q200 162 250 140 L254 158 Q200 180 146 158Z" fill="${acento}"/>
        ${frente ? `<path d="M160 60 Q200 100 240 60" fill="none" stroke="${borde}" stroke-width="3"/>
          ${[[150, 250], [230, 300], [130, 360], [270, 390], [200, 420], [180, 220], [240, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${acento}" opacity=".8"/><circle cx="${x}" cy="${y}" r="3.5" fill="#fff" opacity=".9"/>`).join('')}` : ''}
        ${costura('M78 440 Q200 470 322 440', hilo)}`
    case 'pantalon':
      return `<path d="M118 60 L282 60 L304 452 L216 452 L200 185 L184 452 L96 452Z" fill="${base}" stroke="${borde}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="118" y="60" width="164" height="26" fill="${shade(base, -0.12)}" stroke="${borde}" stroke-width="2"/>
        ${[135, 175, 225, 265].map((x) => `<rect x="${x - 4}" y="58" width="8" height="30" rx="2" fill="${shade(base, -0.2)}"/>`).join('')}
        ${frente ? `<circle cx="200" cy="73" r="6" fill="#c9a227" stroke="#8a6d10"/>
          ${costura('M122 92 Q150 130 178 96', '#e8b04a')}${costura('M278 92 Q250 130 222 96', '#e8b04a')}
          ${costura('M200 88 L200 175', '#e8b04a')}`
        : `<path d="M135 120 L175 115 L172 165 L152 175 L132 165Z M265 120 L225 115 L228 165 L248 175 L268 165Z" fill="none" stroke="#e8b04a" stroke-width="1.8" stroke-dasharray="5 4"/>`}
        ${costura('M100 440 L182 440', '#e8b04a')}${costura('M218 440 L300 440', '#e8b04a')}
        ${costura('M116 100 L100 440', '#e8b04a')}${costura('M284 100 L300 440', '#e8b04a')}`
    case 'reloj':
    case 'reloj-digital': {
      const correa = shade(acento, -0.1)
      const cara =
        forma === 'reloj'
          ? `<circle cx="200" cy="250" r="78" fill="#fffaf3"/>
             ${Array.from({ length: 12 }, (_, i) => `<rect x="198" y="178" width="4" height="${i % 3 ? 9 : 16}" fill="#1d0a16" transform="rotate(${i * 30} 200 250)"/>`).join('')}
             <rect x="197" y="200" width="6" height="54" rx="3" fill="#1d0a16" transform="rotate(-50 200 250)"/>
             <rect x="198" y="185" width="4" height="68" rx="2" fill="#1d0a16" transform="rotate(60 200 250)"/>
             <rect x="199" y="180" width="2" height="76" fill="#c2007a" transform="rotate(170 200 250)"/>
             <circle cx="200" cy="250" r="6" fill="${base}"/>
             <text x="200" y="292" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#7a0047">CHÉVERE</text>`
          : `<rect x="138" y="198" width="124" height="104" rx="18" fill="#101418"/>
             <text x="200" y="262" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="40" fill="#7dfcc0">10:45</text>
             <text x="200" y="284" text-anchor="middle" font-family="Arial" font-size="11" fill="#7dfcc0" opacity=".75">LUN 09</text>`
      return `<path d="M150 20 L250 20 L245 175 L155 175Z M150 480 L250 480 L245 325 L155 325Z" fill="${correa}" stroke="${shade(correa, -0.3)}" stroke-width="2"/>
        ${[60, 95, 130].map((y) => `<line x1="160" y1="${y}" x2="240" y2="${y}" stroke="${shade(correa, -0.3)}" stroke-width="2" opacity=".5"/>`).join('')}
        ${[390, 420, 450].map((y) => `<ellipse cx="200" cy="${y}" rx="6" ry="4" fill="${shade(correa, -0.4)}"/>`).join('')}
        ${forma === 'reloj' ? `<circle cx="200" cy="250" r="96" fill="${base}" stroke="${shade(base, -0.35)}" stroke-width="3"/>` : `<rect x="122" y="182" width="156" height="136" rx="30" fill="${base}" stroke="${shade(base, -0.35)}" stroke-width="3"/>`}
        <rect x="${forma === 'reloj' ? 292 : 276}" y="240" width="14" height="22" rx="4" fill="${shade(base, -0.2)}"/>
        ${frente ? cara : `<circle cx="200" cy="250" r="${forma === 'reloj' ? 70 : 52}" fill="${shade(base, -0.15)}"/><text x="200" y="255" text-anchor="middle" font-family="Arial" font-size="12" fill="${shade(base, -0.5)}">ACERO 316L</text>`}`
    }
    case 'zapatilla':
    case 'sandalia': {
      if (forma === 'sandalia')
        return `<path d="M60 330 Q50 300 90 295 L330 300 Q365 305 355 335 Z" fill="${shade(base, -0.1)}" stroke="${shade(base, -0.4)}" stroke-width="2"/>
          <path d="M70 345 L350 345 L355 335 L58 330Z" fill="#3a2a20"/>
          <path d="M150 300 Q190 220 250 300" fill="none" stroke="${acento}" stroke-width="18" stroke-linecap="round"/>
          <path d="M90 298 Q110 250 140 300" fill="none" stroke="${acento}" stroke-width="12" stroke-linecap="round"/>
          ${costura('M75 322 L345 322', '#fff')}`
      return `<path d="M50 345 Q45 285 110 272 L190 228 Q230 205 268 232 L320 282 Q358 300 352 342 Z" fill="${base}" stroke="${shade(base, -0.35)}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M44 348 L356 348 Q362 372 330 376 L64 376 Q40 372 44 348Z" fill="#f4f1ec" stroke="#cfc6bb" stroke-width="2"/>
        <path d="M48 362 L352 362" stroke="${acento}" stroke-width="4" opacity=".8"/>
        <path d="${frente ? 'M95 330 Q170 300 205 255 Q235 300 330 318' : 'M330 330 Q255 300 220 255 Q190 300 95 318'}" fill="none" stroke="${acento}" stroke-width="12" stroke-linecap="round"/>
        ${[0, 1, 2, 3].map((i) => `<line x1="${200 + i * 16}" y1="${236 + i * 10}" x2="${222 + i * 16}" y2="${228 + i * 10}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join('')}
        ${costura('M60 336 Q60 292 112 282 L190 240', '#ffffff')}`
    }
    case 'gafas':
      return `<path d="M60 230 Q60 200 100 200 L170 200 Q190 200 186 235 Q180 290 125 290 Q70 290 60 230Z M340 230 Q340 200 300 200 L230 200 Q210 200 214 235 Q220 290 275 290 Q330 290 340 230Z" fill="${shade(acento, -0.2)}" fill-opacity=".85" stroke="${base}" stroke-width="12" stroke-linejoin="round"/>
        <path d="M186 222 Q200 210 214 222" fill="none" stroke="${base}" stroke-width="10"/>
        <path d="M80 215 L120 260 M290 212 L320 245" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/>`
    case 'gorra':
      return `<path d="M95 290 Q90 160 200 150 Q310 160 305 290Z" fill="${base}" stroke="${shade(base, -0.35)}" stroke-width="2.5"/>
        <path d="${frente ? 'M90 288 Q200 262 310 288 Q330 330 200 340 Q70 330 90 288Z' : 'M150 290 Q200 300 250 290 L246 300 Q200 310 154 300Z'}" fill="${shade(base, -0.15)}" stroke="${shade(base, -0.4)}" stroke-width="2"/>
        <circle cx="200" cy="150" r="9" fill="${shade(base, -0.2)}"/>
        ${[150, 250].map((x) => costura(`M200 152 Q${x} 200 ${x === 150 ? 120 : 280} 288`, shade(base, 0.4))).join('')}
        ${frente ? solPrint(200, 240, 22, acento) : `<rect x="175" y="255" width="50" height="16" rx="8" fill="${shade(base, -0.3)}"/>`}`
  }
}

/** SVG de un frame del giro. angulo en grados (0 = frente). */
export function frameSVG(forma: Forma, base: string, acento: string, angulo: number, fondo = '#f6eee6') {
  const a = (angulo * Math.PI) / 180
  const cos = Math.cos(a)
  const plano = forma === 'zapatilla' || forma === 'sandalia' || forma === 'gafas'
  const minimo = plano ? 0.42 : forma.startsWith('reloj') ? 0.28 : 0.34
  const sx = Math.max(minimo, Math.abs(cos)) * (cos < 0 ? -1 : 1)
  const frente = cos >= 0
  const hl = 50 - Math.sin(a) * 38
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
    <defs>
      <linearGradient id="luz" x1="0" x2="1">
        <stop offset="${Math.max(0, hl - 30)}%" stop-color="#000" stop-opacity=".22"/>
        <stop offset="${hl}%" stop-color="#fff" stop-opacity=".22"/>
        <stop offset="${Math.min(100, hl + 30)}%" stop-color="#000" stop-opacity=".25"/>
      </linearGradient>
      <radialGradient id="piso"><stop offset="0" stop-color="#1d0a16" stop-opacity=".22"/><stop offset="1" stop-color="#1d0a16" stop-opacity="0"/></radialGradient>
      <mask id="m"><g transform="translate(200 0) scale(${sx} 1) translate(-200 0)">${prenda(forma, '#ffffff', '#ffffff', frente).replace(/fill="[^"]+"/g, 'fill="#fff"').replace(/stroke="[^"]+"/g, 'stroke="#fff"')}</g></mask>
    </defs>
    <rect width="${W}" height="${H}" fill="${fondo}"/>
    <ellipse cx="200" cy="${plano ? 382 : 470}" rx="${150 * Math.max(0.55, Math.abs(cos))}" ry="16" fill="url(#piso)"/>
    <g transform="translate(200 0) scale(${sx} 1) translate(-200 0)">${prenda(forma, base, acento, frente)}</g>
    <rect width="${W}" height="${H}" fill="url(#luz)" mask="url(#m)"/>
  </svg>`
}

export async function frameWebp(forma: Forma, base: string, acento: string, angulo: number, ancho = 800, fondo?: string) {
  return sharp(Buffer.from(frameSVG(forma, base, acento, angulo, fondo))).resize(ancho).webp({ quality: 80 }).toBuffer()
}

/** Foto de detalle: acercamiento 2.4x a la zona de costuras / estampado. */
export async function detalleWebp(forma: Forma, base: string, acento: string) {
  const full = await sharp(Buffer.from(frameSVG(forma, base, acento, 0))).resize(1200).png().toBuffer()
  const foco: Record<string, [number, number]> = {
    franela: [0.5, 0.42], camisa: [0.5, 0.35], vestido: [0.5, 0.36], pantalon: [0.5, 0.2], reloj: [0.5, 0.5], 'reloj-digital': [0.5, 0.5],
    zapatilla: [0.55, 0.55], sandalia: [0.5, 0.6], gafas: [0.5, 0.48], gorra: [0.5, 0.5],
  }
  const [fx, fy] = foco[forma]
  const w = 500, h = 625
  const left = Math.round(Math.min(1200 - w, Math.max(0, fx * 1200 - w / 2)))
  const top = Math.round(Math.min(1500 - h, Math.max(0, fy * 1500 - h / 2)))
  return sharp(full).extract({ left, top, width: w, height: h }).resize(1200, 1500).webp({ quality: 82 }).toBuffer()
}

/** Imagen editorial para las tarjetas de categoría. */
export async function categoriaWebp(fondoA: string, fondoB: string, piezas: { forma: Forma; base: string; acento: string; x: number; y: number; s: number; r: number }[]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fondoA}"/><stop offset="1" stop-color="${fondoB}"/></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#g)"/>
    <circle cx="640" cy="180" r="220" fill="#fff" opacity=".12"/><circle cx="120" cy="900" r="260" fill="#fff" opacity=".08"/>
    ${piezas.map((p) => `<g transform="translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s}) translate(-200 -250)">${prenda(p.forma, p.base, p.acento, true)}</g>`).join('')}
  </svg>`
  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()
}
