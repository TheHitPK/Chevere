import type { MetadataRoute } from 'next'
import { getMenu, payloadClient } from '@/lib/store'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const menu = await getMenu()
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'productos', where: { _status: { equals: 'published' } }, depth: 0, pagination: false, limit: 5000,
    select: { slug: true, updatedAt: true },
  })
  return [
    { url: site, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/guia-de-tallas`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${site}/envios`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${site}/cambios`, changeFrequency: 'monthly', priority: 0.4 },
    ...menu.flatMap((c) => [c, ...c.hijos]).map((c) => ({ url: `${site}${c.url}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...docs.map((p) => ({ url: `${site}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ]
}
