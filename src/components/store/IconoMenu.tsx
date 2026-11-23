/**
 * Iconos de trazo fino para el menú principal. Cada colección conocida tiene el suyo; una categoría
 * nueva recibe el icono genérico (etiqueta) y un tono de la paleta, así que el menú nunca queda incompleto.
 */
type Trazo = { fondo: string; tono: string; d: string }

const TRAZOS: Record<string, Trazo> = {
  damas: { fondo: '#fde8f1', tono: '#e8a0bf', d: 'M18 5l2.5 9L17 24 9 42h30L31 24l-3.5-10L30 5|M20.5 14q3.5 4 7 0M17 24h14' },
  caballeros: { fondo: '#ece4ea', tono: '#8fd3da', d: 'M17 6L8 11 5 21l6 2v19h26V23l6-2-3-10-9-5-7 6z|M17 6l7 10 7-10M24 16v26' },
  ninos: { fondo: '#dff6f8', tono: '#ffd21f', d: 'M16 7q8 5 16 0l9 5-4 8-3-1v21H14V19l-3 1-4-8z|M24 33s-5-3.3-5-6.6a2.8 2.8 0 0 1 5-1.4 2.8 2.8 0 0 1 5 1.4c0 3.3-5 6.6-5 6.6z' },
  accesorios: { fondo: '#f8f0d2', tono: '#ffa400', d: 'M6 19h14v7a7 7 0 0 1-14 0zM28 19h14v7a7 7 0 0 1-14 0z|M20 21q4-3 8 0M6 19l-2-4M42 19l2-4' },
  calzado: { fondo: '#ffeccc', tono: '#00b8c4', d: 'M6 36V26l7-2q3 6 11 5l14 4q6 2 6 5v2H6z|M6 36h38M17 24l2 4M22 26l2 4' },
  generico: { fondo: '#ffe3f2', tono: '#ec008c', d: 'M6 24L24 6h16v16L22 40z|M33 15h.01' },
}
// Tonos de respaldo para categorías nuevas (se reparten por posición)
const RESPALDO = ['#ec008c', '#ffa400', '#2fb36b', '#7a5cf0']
// Color de la chapita (lleno) de cada colección conocida
const SOLIDO: Record<string, string> = { damas: '#e8a0bf', caballeros: '#1d0a16', ninos: '#00b8c4', accesorios: '#c9a227', calzado: '#ff9d00' }

export function claveMenu(nombre: string, slug = ''): string {
  const t = `${slug} ${nombre}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (/dama|mujer/.test(t)) return 'damas'
  if (/caballero|hombre/.test(t)) return 'caballeros'
  if (/nin|infant|bebe/.test(t)) return 'ninos'
  if (/accesor/.test(t)) return 'accesorios'
  if (/calzado|zapato/.test(t)) return 'calzado'
  return 'generico'
}

export function tonoMenu(clave: string, indice: number) {
  return SOLIDO[clave] ?? RESPALDO[indice % RESPALDO.length]
}

export function IconoMenu({ clave, className = 'h-8 w-8' }: { clave: string; className?: string }) {
  const t = TRAZOS[clave] ?? TRAZOS.generico
  const [a, b] = t.d.split('|')
  return (
    <svg viewBox="0 0 48 48" className={className} fill={t.tono} fillOpacity=".6" stroke="#3a0022" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={a} />
      <path d={b} />
    </svg>
  )
}
