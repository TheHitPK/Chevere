import 'server-only'
import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'
import type { Categoria, Media, Producto } from '@/payload-types'

/* Capa de datos de la tienda: lee del panel (Payload) y entrega modelos simples a la vista. */

export const payloadClient = cache(() => getPayload({ config }))

export type Img = { src: string; card: string; thumb: string; poster: string; alt: string; w: number; h: number }
export type Talla = { talla: string; sku: string; stock: number }
export type ColorVM = { color: string; hex: string; tallas: Talla[]; frames: string[]; poster?: string }
export type CatRef = { nombre: string; slug: string; url: string }
export type ProductoVM = {
  id: number
  slug: string
  nombre: string
  marca?: string
  precio: number
  precioOferta?: number
  categoria?: CatRef
  principal?: CatRef
  imagenes: Img[]
  colores: ColorVM[]
  stockTotal: number
  nuevo: boolean
  destacado: boolean
  composicion?: string
  cuidados?: string
  descripcion?: Producto['descripcion']
  genero?: string
  calce?: 'normal' | 'pequena' | 'grande'
  createdAt: string
  rating?: { promedio: number; total: number }
}

/** Las fotos siempre con ruta relativa (/api/media/…), aunque el sitio tenga dominio configurado. */
const rel = (u: string) => u.replace(/^https?:\/\/[^/]+/, '')

const img = (m: number | Media | null | undefined): Img | null => {
  if (!m || typeof m === 'number' || !m.url) return null
  return {
    src: rel(m.url),
    card: rel(m.sizes?.tarjeta?.url ?? m.url),
    thumb: rel(m.sizes?.miniatura?.url ?? m.url),
    poster: rel(m.sizes?.poster?.url ?? m.url),
    alt: m.alt ?? '',
    w: m.width ?? 1200,
    h: m.height ?? 1500,
  }
}

export const segmento = (c: Categoria) => {
  const padre = typeof c.padre === 'object' && c.padre ? c.padre : null
  return padre ? (c.slug ?? '').replace(`${padre.slug}-`, '') : (c.slug ?? '')
}

export const catRef = (c: Categoria | number | null | undefined): { cat?: CatRef; principal?: CatRef } => {
  if (!c || typeof c === 'number') return {}
  const padre = typeof c.padre === 'object' && c.padre ? c.padre : null
  if (!padre) return { cat: { nombre: c.nombre, slug: c.slug!, url: `/c/${c.slug}` } }
  const principal = { nombre: padre.nombre, slug: padre.slug!, url: `/c/${padre.slug}` }
  return { cat: { nombre: c.nombre, slug: c.slug!, url: `/c/${padre.slug}/${segmento(c)}` }, principal }
}

export function toVM(p: Producto): ProductoVM {
  const porColor = new Map<string, ColorVM>()
  for (const v of p.variantes ?? []) {
    const key = v.color.trim()
    const c = porColor.get(key) ?? { color: key, hex: v.colorHex || '#999999', tallas: [], frames: [] }
    c.tallas.push({ talla: v.talla, sku: v.sku, stock: v.stock ?? 0 })
    const frames = (v.frames360 ?? []).map((f) => img(f)).filter(Boolean) as Img[]
    if (frames.length && !c.frames.length) {
      c.frames = frames.map((f) => f.src)
      c.poster = frames[0].poster
    }
    porColor.set(key, c)
  }
  const { cat, principal } = catRef(p.categoria)
  return {
    id: p.id,
    slug: p.slug ?? String(p.id),
    nombre: p.nombre,
    marca: p.marca ?? undefined,
    precio: p.precio,
    precioOferta: p.precioOferta ?? undefined,
    categoria: cat,
    principal,
    imagenes: ((p.imagenes ?? []).map(img).filter(Boolean) as Img[]),
    colores: [...porColor.values()],
    stockTotal: p.stockTotal ?? 0,
    nuevo: !!p.nuevo,
    destacado: !!p.destacado,
    composicion: p.composicion ?? undefined,
    cuidados: p.cuidados ?? undefined,
    descripcion: p.descripcion,
    genero: p.genero ?? undefined,
    calce: p.calce ?? 'normal',
    createdAt: p.createdAt,
  }
}

/* ---------------- consultas ---------------- */

const PUB: Where = { _status: { equals: 'published' } }

export const getMenu = cache(async () => {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'categorias',
    where: { visible: { equals: true } },
    sort: 'orden',
    limit: 200,
    depth: 1,
  })
  const principales = docs.filter((c) => !c.padre)
  return principales.map((p) => ({
    ...catRef(p).cat!,
    id: p.id,
    imagen: img(p.imagen),
    fondo: img(p.fondoBanda),
    modelos: (p.modelos ?? []).flatMap((m) => {
      const i = img(m)
      return i && typeof m === 'object' ? [{ ...i, recorte: !!m.transparente }] : []
    }),
    hijos: docs
      .filter((h) => typeof h.padre === 'object' && h.padre?.id === p.id)
      .map((h) => ({ id: h.id, ...catRef(h).cat! })),
  }))
})

/** Promedio de reseñas aprobadas por producto (una sola consulta para toda la lista). */
async function conCalificaciones(productos: ProductoVM[]) {
  if (!productos.length) return productos
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'resenas',
    where: { and: [{ aprobada: { equals: true } }, { producto: { in: productos.map((p) => p.id) } }] },
    depth: 0, limit: 5000, pagination: false, select: { producto: true, estrellas: true },
  })
  const acc = new Map<number, { s: number; n: number }>()
  for (const r of docs) {
    const id = typeof r.producto === 'object' ? r.producto.id : r.producto
    const a = acc.get(id) ?? { s: 0, n: 0 }
    a.s += r.estrellas; a.n++
    acc.set(id, a)
  }
  return productos.map((p) => {
    const a = acc.get(p.id)
    return a ? { ...p, rating: { promedio: a.s / a.n, total: a.n } } : p
  })
}

/** Cifras reales para la portada. */
export const getCifras = cache(async () => {
  const payload = await payloadClient()
  const [prods, resenas] = await Promise.all([
    payload.find({ collection: 'productos', where: PUB, depth: 0, limit: 5000, pagination: false, select: { marca: true } }),
    payload.find({ collection: 'resenas', where: { aprobada: { equals: true } }, depth: 0, limit: 5000, pagination: false, select: { estrellas: true } }),
  ])
  const marcas = [...new Set(prods.docs.map((p) => p.marca).filter(Boolean) as string[])]
  const promedio = resenas.docs.length ? resenas.docs.reduce((s, r) => s + r.estrellas, 0) / resenas.docs.length : 0
  return { productos: prods.docs.length, marcas, promedio, resenas: resenas.docs.length }
})

export async function getProductos(opts: { where?: Where; sort?: string; limit?: number } = {}) {
  const payload = await payloadClient()
  const { docs, totalDocs } = await payload.find({
    collection: 'productos',
    where: opts.where ? { and: [PUB, opts.where] } : PUB,
    sort: opts.sort ?? '-createdAt',
    limit: opts.limit ?? 24,
    depth: 2,
  })
  return { productos: await conCalificaciones(docs.map(toVM)), total: totalDocs }
}

export const getProducto = cache(async (slug: string) => {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'productos',
    where: { and: [PUB, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  })
  return docs[0] ? toVM(docs[0]) : null
})

export async function getResenas(productoId?: number, limit = 12) {
  const payload = await payloadClient()
  const where: Where = productoId
    ? { and: [{ aprobada: { equals: true } }, { producto: { equals: productoId } }] }
    : { and: [{ aprobada: { equals: true } }, { estrellas: { greater_than_equal: 4 } }] }
  const { docs } = await payload.find({ collection: 'resenas', where, sort: '-createdAt', limit, depth: 1 })
  return docs.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    estrellas: r.estrellas,
    texto: r.texto,
    fecha: r.createdAt,
    ciudad: r.ciudad ?? undefined,
    foto: img(r.foto),
    producto: typeof r.producto === 'object' && r.producto ? { nombre: r.producto.nombre, slug: r.producto.slug } : undefined,
  }))
}

export const getAjustes = cache(async () => {
  const payload = await payloadClient()
  const a = await payload.findGlobal({ slug: 'ajustes', depth: 0 })
  return {
    catalogo: a.modoCatalogo !== false,
    whatsapp: a.whatsapp ?? '',
    aviso: a.mensajeCatalogo ?? '',
  }
})

export const money = (n: number) => `$${n.toFixed(2)}`
