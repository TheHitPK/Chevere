import { tablasPara } from '@/lib/tallas'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/store/Breadcrumbs'
import { Carousel } from '@/components/store/Carousel'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductTabs } from '@/components/store/ProductTabs'
import { ProductView } from '@/components/store/ProductView'
import { ReviewForm } from '@/components/store/ReviewForm'
import { Stars } from '@/components/store/Stars'
import { getAjustes, getProducto, getProductos, getResenas } from '@/lib/store'

type Props = { params: Promise<{ slug: string }> }

const FAQS = [
  ['¿Cómo sé qué talla elegir?', 'Abre la guía de tallas junto al selector. Mide sobre el cuerpo sin apretar la cinta; si quedas entre dos tallas, elige la mayor. También puedes escribirnos y te asesoramos.'],
  ['¿Cuánto tarda el envío?', 'Despachamos desde Maracaibo: delivery en la ciudad, encomienda (MRW, Zoom o Tealca) al resto del país, o retiro en tienda. El envío se paga al recibir y te confirmamos el tiempo por WhatsApp.'],
  ['¿Puedo cambiar una prenda?', 'Si no te quedó bien, escríbenos apenas la recibas. Conversamos tu caso y llegamos a un acuerdo. Conserva la prenda sin usar y con su etiqueta.'],
  ['¿El color es igual al de las fotos?', 'Fotografiamos cada prenda en 360° con luz neutra para que el color sea lo más fiel posible. Las pantallas pueden variar un poco.'],
]


export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProducto((await params).slug)
  if (!p) return {}
  const img = p.imagenes[0]
  const desc = `${p.nombre}${p.marca ? ` de ${p.marca}` : ''} a $${(p.precioOferta ?? p.precio).toFixed(2)}. ${p.composicion ?? ''} Míralo en 360° y elige tu talla.`
  return {
    title: p.nombre,
    description: desc,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { title: p.nombre, description: desc, type: 'website', images: img ? [{ url: img.card, width: 600, height: 750, alt: img.alt }] : [] },
  }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const p = await getProducto(slug)
  if (!p) notFound()

  const [resenas, relacionados, ajustes] = await Promise.all([
    getResenas(p.id, 20),
    getProductos({ where: { and: [{ id: { not_equals: p.id } }, ...(p.categoria ? [{ 'categoria.slug': { equals: p.categoria.slug } }] : [])] }, limit: 8 }),
    getAjustes(),
  ])
  // Si la subcategoría tiene pocos productos, completar con su colección principal
  let rel = relacionados.productos
  if (rel.length < 4 && p.principal) {
    const extra = await getProductos({ where: { and: [{ id: { not_equals: p.id } }, { 'categoria.padre.slug': { equals: p.principal.slug } }] }, sort: '-vendidos', limit: 8 })
    rel = [...rel, ...extra.productos.filter((x) => !rel.some((r) => r.id === x.id))].slice(0, 8)
  }

  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0
  const tallasTxt = p.colores.flatMap((c) => c.tallas.map((t) => t.talla)).join(' ')
  const guia = /^(Única\s*)*$/.test(tallasTxt.trim()) ? [] : tablasPara(p.principal?.slug, p.categoria?.nombre, tallasTxt)

  const site = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const precios = p.colores.flatMap((c) => c.tallas)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    image: p.imagenes.map((i) => `${site}${i.src}`),
    description: p.composicion,
    sku: precios[0]?.sku,
    brand: p.marca ? { '@type': 'Brand', name: p.marca } : undefined,
    color: p.colores.map((c) => c.color).join(', '),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: p.precioOferta ?? p.precio,
      highPrice: p.precioOferta ?? p.precio,
      offerCount: precios.length,
      availability: p.stockTotal > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${site}/p/${p.slug}`,
    },
    ...(resenas.length ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: promedio.toFixed(1), reviewCount: resenas.length } } : {}),
  }

  // Texto plano del primer párrafo de la descripción, para el resumen junto al precio
  type Nodo = { text?: string; children?: Nodo[] }
  const plano = (n?: Nodo): string => (n?.text ?? '') + (n?.children ?? []).map(plano).join('')
  const resumen = plano((p.descripcion?.root?.children?.[0] as Nodo | undefined)).trim()

  const Acordeon = ({ titulo, children, open = false }: { titulo: string; children: React.ReactNode; open?: boolean }) => (
    <details className="filter border-b border-line" open={open}>
      <summary className="flex items-center justify-between py-4 text-lg font-bold">{titulo}<span className="chev text-ink-soft" aria-hidden="true">⌄</span></summary>
      <div className="body pb-5 leading-relaxed text-ink-soft [&_p]:mb-3">{children}</div>
    </details>
  )

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs items={[
          { nombre: 'Inicio', url: '/' },
          ...(p.principal ? [{ nombre: p.principal.nombre, url: p.principal.url }] : []),
          ...(p.categoria ? [{ nombre: p.categoria.nombre, url: p.categoria.url }] : []),
          { nombre: p.nombre },
        ]} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <ProductView
          slug={p.slug}
          nombre={p.nombre}
          marca={p.marca}
          precio={p.precio}
          precioOferta={p.precioOferta}
          colores={p.colores}
          imagenes={p.imagenes}
          categoria={p.categoria?.nombre}
          guiaTallas={guia}
          calce={p.calce}
          catalogo={ajustes.catalogo ? { whatsapp: ajustes.whatsapp, aviso: ajustes.aviso } : null}
          ratingNode={resenas.length > 0 && (
            <a href="#info" className="mt-2 inline-flex items-center gap-2 text-sm hover:underline">
              <Stars value={promedio} /> <span className="tabular">{promedio.toFixed(1)}</span> <span className="text-ink-soft">({resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'})</span>
            </a>
          )}
          detalles={resumen ? <p className="leading-relaxed text-ink-soft">{resumen} <a href="#info" className="font-semibold text-ink underline underline-offset-4">Ver detalles</a></p> : null}
        />
      </section>

      {/* Pestañas: detalles, reseñas y preguntas frecuentes */}
      <section id="info" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14">
        <ProductTabs tabs={[
          {
            id: 'detalles', label: 'Detalles del producto',
            content: (
              <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
                <div className="leading-relaxed text-ink-soft [&_p]:mb-3">{p.descripcion ? <RichText data={p.descripcion} /> : <p>Sin descripción.</p>}</div>
                <dl className="grid content-start gap-4 rounded-3xl bg-surface-2 p-6 text-sm">
                  {[['Marca', p.marca], ['Composición', p.composicion], ['Cuidados', p.cuidados], ['Colores', p.colores.map((c) => c.color).join(', ')], ['Público', p.genero]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><dt className="font-bold">{k}</dt><dd className="mt-0.5 text-ink-soft">{v}</dd></div>
                  ))}
                </dl>
              </div>
            ),
          },
          {
            id: 'resenas', label: `Reseñas${resenas.length ? ` (${resenas.length})` : ''}`,
            content: (
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 className="titulo text-3xl">Reseñas</h2>
            {resenas.length ? (
              <>
                <p className="mt-3 flex items-baseline gap-2"><span className="font-display text-6xl font-extrabold tabular">{promedio.toFixed(1)}</span><span className="text-ink-soft">de 5</span></p>
                <Stars value={promedio} size={22} />
                <ul className="mt-5 space-y-1.5 text-sm">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = resenas.filter((r) => r.estrellas === n).length
                    return (
                      <li key={n} className="flex items-center gap-2">
                        <span className="w-3 tabular">{n}</span><span className="text-naranja">★</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-naranja" style={{ width: `${(c / resenas.length) * 100}%` }} /></span>
                        <span className="w-6 text-right text-ink-soft tabular">{c}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : <p className="mt-3 text-ink-soft">Aún no hay reseñas. ¡Sé la primera persona en opinar!</p>}
            <div className="mt-6"><ReviewForm productoId={p.id} /></div>
          </div>
          <ul className="grid content-start gap-4 md:grid-cols-2">
            {resenas.map((r) => (
              <li key={r.id} className="rounded-3xl bg-card p-6 ring-1 ring-line">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={r.estrellas} />
                  <time className="text-xs text-ink-soft" dateTime={r.fecha}>{new Date(r.fecha).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                </div>
                <p className="mt-3 leading-relaxed">{r.texto}</p>
                {r.foto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.foto.thumb} alt={`Foto de ${r.nombre}`} className="mt-3 h-24 w-20 rounded-xl object-cover" loading="lazy" />
                )}
                <p className="mt-4 text-sm"><b>{r.nombre}</b>{r.ciudad && <span className="text-ink-soft"> · {r.ciudad}</span>} <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold">✓ Compra verificada</span></p>
              </li>
            ))}
          </ul>
        </div>
            ),
          },
          {
            id: 'faq', label: 'Preguntas frecuentes',
            content: (
              <div className="max-w-3xl border-t border-line">
                {FAQS.map(([q, r]) => <Acordeon key={q} titulo={q}>{r}</Acordeon>)}
              </div>
            ),
          },
        ]} />
      </section>

      {/* Relacionados */}
      {rel.length > 0 && (
        <section className="bg-surface-2 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="titulo mb-8 text-center text-4xl md:text-5xl">También te puede gustar</h2>
            <Carousel label="Productos relacionados">
              {rel.map((r) => <div key={r.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[23.5%]"><ProductCard p={r} /></div>)}
            </Carousel>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}
