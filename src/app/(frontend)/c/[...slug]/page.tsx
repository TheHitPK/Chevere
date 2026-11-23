import Image from 'next/image'
import localFont from 'next/font/local'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Where } from 'payload'
import { Breadcrumbs } from '@/components/store/Breadcrumbs'
import { Filters, type Facetas } from '@/components/store/Filters'
import { ProductCard } from '@/components/store/ProductCard'
import { FranjaModelos } from '@/components/store/FranjaModelos'
import { IconoCategoria } from '@/components/store/IconoCategoria'
import { getMenu, getProductos, payloadClient } from '@/lib/store'

// Letra de caricatura solo para el título de Niños (no se precarga en el resto de la tienda)
const chewy = localFont({ src: '../../../../fonts/chewy.woff2', weight: '400', display: 'swap', preload: false })
const COLORES_NINOS = ['#e6007e', '#f05a00', '#7b4dff', '#00a35b', '#1e7bff', '#d4007a']

/** Título de Niños: cada letra de un color, con borde blanco y "bailando". Se lee entero para lectores de pantalla. */
function TituloNinos({ texto }: { texto: string }) {
  let k = 0
  return (
    <span className={`${chewy.className} texto-ninos`}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {[...texto].map((ch, i) => {
          if (ch === ' ') return <span key={i}>{'\u00a0'}</span>
          if (!/\p{L}/u.test(ch)) return <span key={i} className="letra-nino" style={{ ['--c' as string]: '#1d0a16' }}>{ch}</span>
          const n = k++
          return <span key={i} className="letra-nino" style={{ ['--c' as string]: COLORES_NINOS[n % 6], ['--r' as string]: (n % 2 ? 3 : -4) + 'deg', ['--y' as string]: ((n % 3) - 1) * 3 + 'px', ['--d' as string]: n * 0.05 + 's' }}>{ch}</span>
        })}
      </span>
    </span>
  )
}

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

/** Personalidad visual de cada colección (encabezado). */
const ESTILO: Record<string, { fondo: string; texto: string; anim: string; frase: string; desde: string }> = {
  damas: { fondo: 'bg-[linear-gradient(100deg,#ffe3f2_0%,#fbd3e4_32%)]', texto: 'text-tinta', anim: 'anim-damas', desde: '#fbd3e4', frase: 'Prendas cómodas y femeninas en colores cálidos.' },
  caballeros: { fondo: 'bg-[linear-gradient(120deg,#f6f7fa,#dfe4ec)]', texto: 'text-tinta', anim: 'anim-caballeros', desde: '#e8ebf1', frase: 'Básicos de buena tela y cortes que sientan bien.' },
  'ninos-ninas': { fondo: 'bg-[linear-gradient(120deg,#effcfd,#cdf3f6)]', texto: 'text-tinta', anim: 'anim-ninos', desde: '#dcf7f9', frase: 'Ropa resistente y suave para jugar todo el día.' },
  accesorios: { fondo: 'bg-[linear-gradient(120deg,#f2dc96,#c9a227)]', texto: 'text-tinta', anim: 'anim-accesorios', desde: '#e3c560', frase: 'Relojes, gafas y detalles que completan el look.' },
  calzado: { fondo: 'bg-[linear-gradient(120deg,#ffd27a,#ffa400)]', texto: 'text-tinta', anim: 'anim-calzado', desde: '#ffbd45', frase: 'Para cada paso: deportivo, casual y formal.' },
}

async function resolver(slug: string[]) {
  const menu = await getMenu()
  const principal = menu.find((c) => c.slug === slug[0])
  if (!principal) return null
  const sub = slug[1] ? principal.hijos.find((h) => h.url === `/c/${slug[0]}/${slug[1]}`) : undefined
  if (slug[1] && !sub) return null
  return { principal, sub, menu }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolver((await params).slug)
  if (!r) return {}
  const t = r.sub ? `${r.sub.nombre} para ${r.principal.nombre}` : r.principal.nombre
  return { title: t, description: `${t} en Chévere. ${ESTILO[r.principal.slug]?.frase ?? ''} Mira cada prenda en 360°.`, alternates: { canonical: r.sub?.url ?? r.principal.url } }
}

const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : [])

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const r = await resolver(slug)
  if (!r) notFound()
  const { principal, sub } = r
  const catIds = sub ? [sub.id] : [principal.id, ...principal.hijos.map((h) => h.id)]

  // Facetas: todo lo publicado en esta categoría (para un catálogo de miles, pasar a una consulta agregada)
  const payload = await payloadClient()
  const base = await payload.find({
    collection: 'productos',
    where: { and: [{ _status: { equals: 'published' } }, { categoria: { in: catIds } }] },
    depth: 0, limit: 1000, pagination: false,
    select: { variantes: true, marca: true, precio: true, precioOferta: true, stockTotal: true, categoria: true },
  })
  const tallas = new Map<string, number>(), colores = new Map<string, { hex: string; n: number }>(), marcas = new Map<string, number>(), porSub = new Map<number, number>()
  let min = Infinity, max = 0, agotados = 0
  for (const p of base.docs) {
    const precio = p.precioOferta ?? p.precio
    min = Math.min(min, precio); max = Math.max(max, precio)
    if (!p.stockTotal) agotados++
    if (p.marca) marcas.set(p.marca, (marcas.get(p.marca) ?? 0) + 1)
    if (typeof p.categoria === 'number') porSub.set(p.categoria, (porSub.get(p.categoria) ?? 0) + 1)
    const vistos = new Set<string>()
    for (const v of p.variantes ?? []) {
      tallas.set(v.talla, (tallas.get(v.talla) ?? 0) + 1)
      if (!vistos.has(v.color)) { vistos.add(v.color); colores.set(v.color, { hex: v.colorHex || '#999', n: (colores.get(v.color)?.n ?? 0) + 1 }) }
    }
  }
  const ordenTallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const facetas: Facetas = {
    tallas: [...tallas].map(([valor, n]) => ({ valor, n })).sort((a, b) => {
      const ia = ordenTallas.indexOf(a.valor), ib = ordenTallas.indexOf(b.valor)
      return ia >= 0 && ib >= 0 ? ia - ib : Number(a.valor) - Number(b.valor) || a.valor.localeCompare(b.valor)
    }),
    colores: [...colores].map(([valor, c]) => ({ valor, ...c })),
    marcas: [...marcas].map(([valor, n]) => ({ valor, n })),
    precio: { min: base.docs.length ? min : 0, max },
    agotados,
  }

  // Consulta filtrada
  const and: Where[] = [{ categoria: { in: catIds } }]
  if (arr(sp.talla).length) and.push({ 'variantes.talla': { in: arr(sp.talla) } })
  if (arr(sp.color).length) and.push({ 'variantes.color': { in: arr(sp.color) } })
  if (arr(sp.marca).length) and.push({ marca: { in: arr(sp.marca) } })
  if (sp.disp) and.push({ stockTotal: { greater_than: 0 } })
  const pmin = Number(sp.min) || 0, pmax = Number(sp.max) || 0
  if (pmin || pmax) {
    const rango = { ...(pmin ? { greater_than_equal: pmin } : {}), ...(pmax ? { less_than_equal: pmax } : {}) }
    and.push({ or: [{ and: [{ precioOferta: { exists: true } }, { precioOferta: rango }] }, { and: [{ precioOferta: { exists: false } }, { precio: rango }] }] })
  }
  const orden = { novedad: '-createdAt', popularidad: '-vendidos', 'precio-asc': 'precio', 'precio-desc': '-precio' }[String(sp.orden ?? 'novedad')] ?? '-createdAt'
  const { productos, total } = await getProductos({ where: { and }, sort: orden, limit: 48 })

  const estilo = ESTILO[principal.slug] ?? ESTILO.damas
  const titulo = sub?.nombre ?? principal.nombre

  return (
    <>
      <header className={`${estilo.fondo} ${estilo.texto} ${estilo.texto === 'text-tinta' ? 'isla-clara' : ''} relative overflow-hidden`}>
        {/* Foto de fondo de la banda (se carga desde el panel). Degradado desde la izquierda para que el título se lea. */}
        {principal.fondo && (
          <div className="banda-foto relative h-[230px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] sm:h-[300px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[70%] md:[mask-image:linear-gradient(to_right,transparent_0%,rgb(0_0_0/0.35)_14%,#000_44%)]">
            <Image src={principal.fondo.src} alt={principal.fondo.alt} fill priority sizes="(max-width: 768px) 100vw, 70vw" className="object-cover object-[60%_30%]" />
          </div>
        )}
        <div className={`${estilo.anim} relative mx-auto max-w-7xl px-4 pb-10 pt-6 ${principal.fondo ? 'max-md:-mt-12 md:min-h-[420px] [&>.texto-banda]:md:max-w-[46%]' : principal.modelos.length ? 'md:min-h-[380px] md:pr-[48%]' : ''}`}>
          {!principal.fondo && principal.modelos.length > 0 && (
            <FranjaModelos fotos={principal.modelos} className="mx-auto mb-2 h-[230px] w-full max-w-[460px] md:absolute md:bottom-0 md:right-4 md:mb-0 md:h-[360px] md:w-[46%] md:max-w-none" />
          )}
          <div className={estilo.texto === 'text-white' ? '[&_*]:!text-white/85 [&_[aria-current]]:!text-white' : ''}>
            <Breadcrumbs items={[{ nombre: 'Inicio', url: '/' }, { nombre: principal.nombre, url: principal.url }, ...(sub ? [{ nombre: sub.nombre }] : [])]} />
          </div>
          <div className="texto-banda">
          <h1 className="anim-title titulo relative mt-6 inline-block text-5xl md:text-7xl">
            {principal.slug === 'damas' ? <span className="texto-oro">{titulo}</span> : principal.slug === 'caballeros' ? <span className="texto-hierro">{titulo}</span> : principal.slug === 'ninos-ninas' ? <TituloNinos texto={titulo} /> : titulo}
            {principal.slug !== 'caballeros' && (
              /* Trazo amarillo como la ola del sol del logo */
              <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="trazo-sol absolute -bottom-3 left-0 h-4 w-[105%] md:-bottom-4 md:h-5" aria-hidden="true">
                <path d="M4 16 Q80 2 150 10 T296 8 Q292 18 240 20 Q150 24 70 21 Q20 20 4 16Z" fill="#ffd21f" />
              </svg>
            )}
          </h1>
          <p className="anim-sub mt-5 max-w-xl text-lg opacity-85">{estilo.frase}</p>
          </div>
          {/* Tipo de prenda: subcategorías con su número de productos */}
          <nav aria-label={`Tipos de prenda en ${principal.nombre}`} className="anim-chips mt-6">
            <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {[{ id: 0, nombre: 'Todo', url: principal.url }, ...principal.hijos].map((h, i) => {
                const activa = i === 0 ? !sub : sub?.id === h.id
                const n = i > 0 && !sub ? porSub.get(h.id) : undefined
                return (
                  <li key={h.id} className="snap-start">
                    <Link href={h.url} aria-current={activa ? 'page' : undefined} className={`ficha relative ${activa ? 'ficha-activa' : ''}`}>
                      <IconoCategoria nombre={h.nombre} contexto={principal.slug} uid={`${principal.slug}-${i}`} className="h-[62px] w-[62px]" />
                      <span className="ficha-texto">{h.nombre}</span>
                      {n ? <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-sol px-1.5 text-[11px] font-extrabold text-tinta shadow-sm ring-2 ring-white tabular" aria-label={`${n} ${n === 1 ? 'producto' : 'productos'}`}>{n}</span> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="sr-only">Productos</h2>
        <Filters facetas={facetas} total={total} mostrando={productos.length}>
          {productos.length ? (
            <div className="stagger grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-5 xl:grid-cols-3">
              {productos.map((p, i) => <ProductCard key={p.id} p={p} quickView prioridad={i < 2} />)}
            </div>
          ) : (
            <div className="rounded-3xl bg-surface-2 px-6 py-16 text-center">
              <p className="text-xl font-bold">No hay productos con esos filtros</p>
              <p className="mt-1 text-ink-soft">{base.docs.length ? 'Prueba quitando algún filtro.' : 'Pronto tendremos novedades en esta sección.'}</p>
              {base.docs.length > 0 && <Link href={sub?.url ?? principal.url} className="mt-5 inline-block rounded-full bg-magenta-700 px-6 py-3 font-bold text-white">Quitar filtros</Link>}
            </div>
          )}
        </Filters>
      </div>
    </>
  )
}
