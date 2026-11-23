import { createHash } from 'node:crypto'
import { APIError, type CollectionBeforeValidateHook, type CollectionSlug } from 'payload'

type Opciones = {
  /** Máximo de envíos por persona (por IP) dentro de la ventana de tiempo */
  porIp: number
  /** Máximo de envíos de todos los visitantes juntos dentro de la ventana de tiempo */
  global: number
  /** Ventana de tiempo en minutos (por defecto 60) */
  ventanaMin?: number
}

/**
 * IP del visitante. Detrás de Cloudflare, `cf-connecting-ip` trae la IP real del cliente.
 * Sin Cloudflare (Vercel/Railway), se usa la primera de `x-forwarded-for`.
 */
const ipDe = (headers: Headers | undefined) =>
  (
    headers?.get('cf-connecting-ip') ??
    headers?.get('x-forwarded-for')?.split(',')[0] ??
    headers?.get('x-real-ip') ??
    'desconocida'
  ).trim()

/** Guardamos solo un código (hash) de la IP, nunca la IP en claro. */
const hashDe = (ip: string) =>
  createHash('sha256')
    .update(ip + (process.env.PAYLOAD_SECRET ?? ''))
    .digest('hex')
    .slice(0, 32)

/**
 * Freno anti-spam para formularios públicos (reseñas y boletín).
 * Cuenta cuántos envíos hubo en la última hora en la propia base de datos, así que
 * funciona igual en Vercel (donde cada petición puede correr en un servidor distinto).
 * No afecta a empleados ni al seed (llamadas internas).
 */
export const limiteSpam =
  ({ porIp, global, ventanaMin = 60 }: Opciones): CollectionBeforeValidateHook =>
  async ({ data, operation, req, collection }) => {
    if (operation !== 'create' || req.user || req.payloadAPI === 'local') return data

    const ipHash = hashDe(ipDe(req.headers))
    const desde = new Date(Date.now() - ventanaMin * 60_000).toISOString()
    const slug = collection.slug as CollectionSlug

    const deEstaIp = await req.payload.count({
      collection: slug,
      where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: desde } }] },
      req,
      overrideAccess: true,
    })
    const detodos = await req.payload.count({
      collection: slug,
      where: { createdAt: { greater_than: desde } },
      req,
      overrideAccess: true,
    })

    if (deEstaIp.totalDocs >= porIp || detodos.totalDocs >= global) {
      throw new APIError('Demasiados envíos seguidos. Inténtalo de nuevo en un rato.', 429, undefined, true)
    }
    return { ...data, ipHash } // se sobrescribe siempre: el visitante no puede escoger su propio código
  }
