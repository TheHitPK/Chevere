import Image from 'next/image'
import Link from 'next/link'
import { CarruselCategorias, type FichaCategoria } from '@/components/store/CarruselCategorias'
import { MomentoControles } from '@/components/store/Momentos'
import { Newsletter } from '@/components/store/Newsletter'
import { ScrollGiro } from '@/components/store/ScrollGiro'
import { FranjaModelos } from '@/components/store/FranjaModelos'
import { IconoCategoria } from '@/components/store/IconoCategoria'
import { ProductCard } from '@/components/store/ProductCard'
import { Stars } from '@/components/store/Stars'
import { getAjustes, getCifras, getMenu, getProducto, getProductos, getResenas, money, type ProductoVM } from '@/lib/store'

export const revalidate = 60 // la home se regenera como máximo cada minuto

const TITULARES = [
  ['amanecer', 'Amanece', 'con estilo.'],
  ['mediodia', 'Brilla', 'al mediodía.'],
  ['atardecer', 'Dorado a', 'cualquier hora.'],
  ['noche', 'La noche también', 'es chévere.'],
] as const

// Posiciones fijas (no aleatorias) para que el HTML del servidor y del cliente coincidan
const ESTRELLAS = Array.from({ length: 46 }, (_, i) => [((i * 37) % 97) + 1.5, ((i * 53) % 71) + 2, i % 5 === 0 ? 1.6 : 0.9] as const)

// Categorías sin efecto propio (Accesorios, Calzado y las que se agreguen desde el panel) usan estos valores.
const FRASES: Record<string, string> = { accesorios: 'El detalle que completa el look', calzado: 'Para cada paso del día' }
const FONDO_BASE: Record<string, string> = {
  accesorios: 'linear-gradient(135deg,#fffaf0,#f7e7b4)',
  calzado: 'linear-gradient(135deg,#ffd27a,#ffa400)',
}
const FONDOS_NUEVAS = [
  'linear-gradient(135deg,#ffe3f2,#e8a0bf)',
  'linear-gradient(135deg,#c9f3f6,#00b8c4)',
  'linear-gradient(135deg,#fff3b0,#ffd21f)',
  'linear-gradient(135deg,#ffe2b8,#ffa400)',
]

const TONO: Record<string, { clase: string; texto: string; frase: string }> = {
  damas: { clase: 'cat-damas', texto: 'text-tinta', frase: 'Colores cálidos para cada ocasión' },
  caballeros: { clase: 'cat-caballeros', texto: 'text-tinta', frase: 'Básicos con carácter' },
  'ninos-ninas': { clase: 'cat-ninos', texto: 'text-tinta', frase: 'Para jugar todo el día' },
}

export default async function Home() {
  const [menu, masVendidos, nuevos, resenas, heroProducto, ajustes, cifras, camisa, vestido, zapatilla] = await Promise.all([
    getMenu(),
    getProductos({ sort: '-vendidos', limit: 4 }),
    getProductos({ where: { nuevo: { equals: true } }, sort: '-createdAt', limit: 4 }),
    getResenas(undefined, 10),
    getProducto('franela-sol-oversize'),
    getAjustes(),
    getCifras(),
    getProducto('camisa-lino-avila'),
    getProducto('vestido-brisa-caribe'),
    getProducto('zapatilla-avila-run'),
  ])
  const estilos: { nombre: string; url: string; p: ProductoVM | null; ancho: boolean }[] = [
    { nombre: 'Casual', url: '/c/damas/franelas-camisetas', p: heroProducto, ancho: false },
    { nombre: 'Formal', url: '/c/caballeros/camisas', p: camisa, ancho: true },
    { nombre: 'Fiesta', url: '/c/damas/vestidos', p: vestido, ancho: true },
    { nombre: 'Deportivo', url: '/c/calzado/deportivo', p: zapatilla, ancho: false },
  ]
  // Todas las categorías principales visibles, en el orden del panel: una nueva aparece sola en el carrusel.
  const principales = menu
  const fichas: FichaCategoria[] = principales.map((c, i) => {
    const t = TONO[c.slug]
    const texto = t?.texto ?? 'text-tinta'
    const frase = t?.frase ?? FRASES[c.slug] ?? 'Descubre la colección'
    return {
      id: c.id,
      href: c.url,
      nombre: c.nombre,
      clase: t?.clase ?? '',
      cara: (
        <>
          {c.fondo ? (
            <>
              <Image src={c.fondo.src} alt="" fill sizes="(max-width: 768px) 220px, 290px" className="object-cover object-[52%_22%]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#fbd3e4_0%,rgb(251_211_228/0.85)_24%,transparent_52%)]" aria-hidden="true" />
            </>
          ) : c.modelos.length > 0 ? (
            <div className="absolute inset-0 bg-[linear-gradient(160deg,#ffe3f2_0%,#f6c1d6_55%,#e8a0bf_100%)]">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/35 blur-2xl" aria-hidden="true" />
              <FranjaModelos fotos={c.modelos.slice(0, 3)} className="absolute inset-x-2 bottom-[30%] top-[4%]" />
            </div>
          ) : c.imagen ? (
            <Image src={c.imagen.src} alt="" fill sizes="(max-width: 768px) 220px, 290px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center" style={{ background: FONDO_BASE[c.slug] ?? FONDOS_NUEVAS[i % FONDOS_NUEVAS.length] }} aria-hidden="true">
              <IconoCategoria nombre={c.nombre} esCalzado={c.slug === 'calzado'} uid={`ficha-${c.id}`} className="mb-20 h-32 w-32" />
            </div>
          )}
          {c.slug === 'damas' && <span className="sweep absolute inset-0" aria-hidden="true" />}
          {c.slug === 'caballeros' && <span className="reveal absolute inset-0 bg-sol" aria-hidden="true" />}
          {c.slug === 'ninos-ninas' && (
            <span className="confetti absolute bottom-24 left-1/2" aria-hidden="true">
              {['#ffd21f', '#c2007a', '#ffffff', '#ffa400'].map((col) => <span key={col} style={{ background: col }} />)}
            </span>
          )}
          <div className={`label absolute inset-x-0 bottom-0 p-5 ${texto}`}>
            <p className="text-sm font-semibold opacity-80">{frase}</p>
            <h3 className={`mt-1 text-3xl font-extrabold ${c.slug === 'caballeros' ? 'transition-colors duration-500 group-hover:text-tinta' : ''}`}>{c.nombre}</h3>
            <span className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${c.slug === 'caballeros' ? 'bg-sol text-tinta' : 'bg-white/90 text-tinta'}`}>
              Explorar <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </>
      ),
    }
  })
  const accesorios = menu.find((c) => c.slug === 'accesorios')
  const calzado = menu.find((c) => c.slug === 'calzado')

  return (
    <>
      {/* ---------------- HERO: cambia con la hora del día del visitante ---------------- */}
      <section className="dia relative isolate overflow-hidden" aria-labelledby="hero-t">
        {/* Estrellas (solo de noche) */}
        <svg className="dia-estrellas pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true">
          {ESTRELLAS.map(([x, y, r], i) => <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="#fff" />)}
        </svg>
        {/* El sol de la marca recorre el cielo */}
        <div className="dia-sol pointer-events-none absolute -z-10 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000" aria-hidden="true">
          <div className="dia-glow absolute -inset-1/2 rounded-full" />
          <svg viewBox="0 0 100 100" className="absolute inset-[18%]">
            <g className="dia-rayos" style={{ transformOrigin: '50px 50px' }}>
              {Array.from({ length: 10 }, (_, i) => <path key={i} d="M50 2 L55 14 L45 14Z" fill="#ffd21f" transform={`rotate(${i * 36} 50 50)`} />)}
            </g>
            <circle cx="50" cy="50" r="28" fill="url(#solg)" />
            <defs><linearGradient id="solg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd21f" /><stop offset=".55" stopColor="#ffc20e" /><stop offset="1" stopColor="#ffa400" /></linearGradient></defs>
          </svg>
        </div>
        {/* Luna */}
        <svg viewBox="0 0 100 100" className="dia-luna pointer-events-none absolute right-[10%] top-[12%] -z-10 h-[16vmin] w-[16vmin] transition duration-1000" aria-hidden="true">
          <defs><radialGradient id="lunag"><stop offset=".6" stopColor="#fff6d8" /><stop offset="1" stopColor="#fff6d8" stopOpacity="0" /></radialGradient></defs>
          <circle cx="50" cy="50" r="48" fill="url(#lunag)" opacity=".35" />
          <path d="M62 18a34 34 0 1 0 20 52A28 28 0 1 1 62 18Z" fill="#fff6d8" />
        </svg>

        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-8 pt-12 md:grid-cols-[1.05fr_1fr] md:pt-16">
          <div className="relative z-10 max-md:order-2 max-md:text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--m-chip)] px-4 py-1.5 text-sm font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sol" /> Colección Sol · Temporada 2026
            </p>
            <h1 id="hero-t" className="sr-only">Chévere: ropa, calzado y accesorios para toda la familia, en 360°</h1>
            <p className="dia-titulo mt-5 grid font-display text-[clamp(2.5rem,6.2vw,5.4rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]" aria-hidden="true">
              {TITULARES.map(([m, a, b]) => (
                <span key={m} data-m={m}>{a}<br /><span className="text-[var(--m-accent)]">{b}</span></span>
              ))}
            </p>
            <p className="mt-6 max-w-md text-lg text-[var(--m-soft)] max-md:mx-auto">Cada prenda en 360°, con costuras, telas y caída tal como son. La portada cambia con la luz de tu día.</p>
            <div className="mt-8 flex flex-wrap gap-3 max-md:justify-center">
              <Link href="#colecciones" className="dia-cta rounded-full px-8 py-4 text-lg font-extrabold shadow-[0_14px_30px_-12px_var(--m-glow)] hover:-translate-y-0.5">Ver colección</Link>
              <Link href={heroProducto ? `/p/${heroProducto.slug}` : '/'} className="rounded-full px-7 py-4 text-lg font-bold ring-1 ring-[var(--m-line)] transition hover:bg-[var(--m-chip)]">Probar el 360°</Link>
            </div>
            {/* Cifras reales (salen del catálogo y de las reseñas aprobadas) */}
            <dl className="mt-10 flex flex-wrap gap-y-4 max-md:justify-center">
              {[
                [`${cifras.productos}`, 'productos en 360°'],
                [`${cifras.marcas.length}`, cifras.marcas.length === 1 ? 'marca' : 'marcas'],
                ...(cifras.resenas ? [[`${cifras.promedio.toFixed(1)}/5`, `en ${cifras.resenas} reseñas`]] : []),
              ].map(([n, l], i) => (
                <div key={l} className={`pr-6 md:pr-8 ${i > 0 ? 'border-l border-[var(--m-line)] pl-6 md:pl-8' : ''}`}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-extrabold tabular md:text-4xl">{n}</dd>
                  <dd className="text-sm text-[var(--m-soft)]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Producto protagonista girando, iluminado según la hora */}
          <div className="relative mx-auto w-full max-w-[460px] max-md:order-1 max-md:max-w-[280px]">
            <div className="dia-glow absolute inset-[-12%] -z-10 rounded-full" aria-hidden="true" />
            <div className="dia-producto hero-spin relative aspect-[4/5] w-full" role="img" aria-label={heroProducto ? `${heroProducto.nombre} girando` : 'Prenda girando'} />
            {heroProducto && (
              <Link href={`/p/${heroProducto.slug}`} className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[var(--m-chip)] py-2 pl-4 pr-2 text-sm font-semibold shadow-lg ring-1 ring-[var(--m-line)] backdrop-blur-md transition hover:-translate-y-0.5">
                {heroProducto.nombre}
                <span className="font-extrabold tabular">{money(heroProducto.precioOferta ?? heroProducto.precio)}</span>
                <span className="dia-cta rounded-full px-3 py-1 text-xs font-extrabold">360° →</span>
              </Link>
            )}
          </div>
        </div>
        <div className="relative z-10 px-4 pb-10 pt-6"><MomentoControles /></div>
      </section>

      {/* ---------------- BANDA DE MARCAS ---------------- */}
      {cifras.marcas.length > 0 && (
        <section aria-label="Nuestras marcas" className="overflow-hidden border-y border-line bg-card py-6 text-tinta dark:text-ink">
          <ul className="banda-marcas flex w-max items-center gap-16 px-8">
            {[...cifras.marcas, ...cifras.marcas, ...cifras.marcas, ...cifras.marcas].map((m, i) => (
              <li key={i} aria-hidden={i >= cifras.marcas.length} className="flex items-center gap-16 whitespace-nowrap font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
                {m}<span className="text-magenta-700 dark:text-sol" aria-hidden="true">✦</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- NUEVOS INGRESOS / LOS MÁS VENDIDOS ---------------- */}
      {[
        ['Nuevos ingresos', nuevos.productos, '/buscar?nuevo=1'],
        ['Los más vendidos', masVendidos.productos, '/buscar?orden=popularidad'],
      ].map(([titulo, lista, url], i) => (
        <section key={titulo as string} className={`mx-auto max-w-7xl px-4 py-16 ${i > 0 ? 'border-t border-line' : ''}`}>
          <h2 className="titulo text-center text-4xl md:text-6xl">{titulo as string}</h2>
          <div className="stagger mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-5 lg:grid-cols-4">
            {(lista as ProductoVM[]).map((p) => <ProductCard key={p.id} p={p} quickView />)}
          </div>
          <div className="mt-10 text-center">
            <Link href={url as string} className="inline-block rounded-full px-14 py-3.5 font-bold ring-1 ring-line transition hover:bg-magenta-700 hover:text-white hover:ring-magenta-700 max-sm:w-full">Ver todos</Link>
          </div>
        </section>
      ))}

      {/* ---------------- CATEGORÍAS PRINCIPALES ---------------- */}
      <section id="colecciones" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="titulo text-4xl md:text-6xl">¿Para quién compras hoy?</h2>
          <p className="max-w-sm text-ink-soft">Gira las colecciones, o arrástralas, y entra a la que te guste.</p>
        </div>
        <CarruselCategorias fichas={fichas} />
      </section>

      {/* ---------------- DESLIZA Y GIRA (efecto ligado al scroll) ---------------- */}
      {heroProducto && <ScrollGiro slug={heroProducto.slug} />}

      {/* ---------------- EXPLORA POR ESTILO ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-panel bg-card px-5 py-10 ring-1 ring-line md:px-14 md:py-14">
          <h2 className="titulo text-center text-4xl md:text-6xl">Explora por estilo</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
            {estilos.map((e) => (
              <Link key={e.nombre} href={e.url} className={`group relative block h-[200px] overflow-hidden rounded-3xl bg-surface-2 md:h-[290px] ${e.ancho ? 'md:col-span-2' : ''}`}>
                <h3 className="absolute left-6 top-5 z-10 font-sans text-2xl font-extrabold tracking-normal md:left-9 md:top-7 md:text-4xl">{e.nombre}</h3>
                <span className="absolute bottom-5 left-6 z-10 text-sm font-bold text-magenta-700 opacity-0 transition group-hover:opacity-100 md:left-9 dark:text-magenta-100">Ver →</span>
                {e.p?.imagenes[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.p.imagenes[0].card} alt="" loading="lazy" className={`absolute bottom-0 w-auto object-contain transition duration-700 group-hover:-translate-y-2 group-hover:scale-105 ${e.ancho ? 'right-[8%] h-[115%]' : '-right-[14%] h-[82%]'}`} />
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- ACCESORIOS Y CALZADO ---------------- */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 md:grid-cols-2">
        {accesorios && (
          <div className="isla-clara group relative overflow-hidden rounded-bloque bg-[linear-gradient(135deg,#fffaf0,#f7e7b4)] p-8 text-tinta ring-1 ring-[#ecd9a0]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="titulo text-4xl">{accesorios.nombre}</h2>
                <p className="mt-1 text-tinta/75">El detalle que completa el look.</p>
              </div>
              {/* Reloj con manecillas girando */}
              <svg viewBox="0 0 64 64" className="sheen h-24 w-24 shrink-0 rounded-full" aria-hidden="true">
                <circle cx="32" cy="32" r="29" fill="#c9a227" /><circle cx="32" cy="32" r="24" fill="#fffaf3" />
                {Array.from({ length: 12 }, (_, i) => <rect key={i} x="31.3" y="10" width="1.4" height={i % 3 ? 3 : 5} fill="#1d0a16" transform={`rotate(${i * 30} 32 32)`} />)}
                <rect className="watch-hour" x="30.8" y="19" width="2.4" height="14" rx="1.2" fill="#1d0a16" />
                <rect className="watch-min" x="31.3" y="13" width="1.4" height="20" rx="0.7" fill="#c2007a" />
                <circle cx="32" cy="32" r="2.2" fill="#c9a227" />
              </svg>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {accesorios.hijos.map((h) => (
                <li key={h.id}><Link href={h.url} className="chip sheen flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold"><IconoCategoria nombre={h.nombre} uid={`a-${h.id}`} className="ficha-mini h-8 w-8" />{h.nombre}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {calzado && (
          <div className="group relative overflow-hidden isla-clara rounded-bloque bg-[linear-gradient(135deg,#ffd27a,#ffa400)] p-8 text-tinta">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="titulo text-4xl">{calzado.nombre}</h2>
                <p className="mt-1 text-tinta/75">Para cada paso del día.</p>
              </div>
              {/* Zapato que da un paso */}
              <svg viewBox="0 0 64 64" className="shoe-step h-24 w-24 shrink-0" aria-hidden="true">
                <path d="M6 44 Q5 34 16 32 L30 24 Q37 20 43 26 L52 35 Q59 38 58 45Z" fill="#fff" stroke="#1d0a16" strokeWidth="2" />
                <path d="M5 45 H59 Q60 50 55 51 H9 Q4 50 5 45Z" fill="#c2007a" />
                <path d="M14 42 Q27 37 33 29 Q38 37 54 40" fill="none" stroke="#c2007a" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {calzado.hijos.map((h) => (
                <li key={h.id}><Link href={h.url} className="chip flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold"><IconoCategoria nombre={h.nombre} esCalzado uid={`c-${h.id}`} className="ficha-mini h-8 w-8" />{h.nombre}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- CONFIANZA ---------------- */}
      <section className="border-y border-line bg-card">
        <ul className="draw mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            ['Envíos a todo el país', 'Desde Maracaibo, pagas al recibir', <><rect x="2" y="7" width="13" height="10" rx="1.5" /><path d="M15 10h4l3 3v4h-7" /><circle cx="6.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></>],
            ['Calidad revisada', 'Chequeamos cada prenda antes de enviarla', <><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>],
            ['Cambios conversados', 'Lo resolvemos contigo', <><path d="M4 9h13l-3-3M20 15H7l3 3" /></>],
            ajustes.catalogo
              ? ['Atención por WhatsApp', 'Te asesoramos con talla y color', <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /><path d="M9 10h6M9 13h4" /></>]
              : ['Pago seguro', 'Tarjeta, PayPal o Pago Móvil', <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>],
          ].map(([t, d, icon]) => (
            <li key={t as string} className="group flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-magenta-100 sm:h-14 sm:w-14 text-magenta-700 transition group-hover:-rotate-6 group-hover:scale-110 dark:bg-white/10 dark:text-sol">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
              </span>
              <span className="min-w-0 break-words"><b className="block">{t as string}</b><span className="text-sm text-ink-soft">{d as string}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- TESTIMONIOS ---------------- */}
      {resenas.length > 0 && (
        <section className="overflow-hidden py-16" aria-labelledby="t-testimonios">
          <div className="mx-auto mb-8 max-w-7xl px-4">
            <h2 id="t-testimonios" className="titulo text-4xl md:text-6xl">Nuestros clientes felices</h2>
          </div>
          <div className="marquee flex w-max gap-5 px-4" tabIndex={0} aria-label="Testimonios (se detienen al pasar el mouse)">
            {[...resenas, ...resenas].map((r, i) => (
              <figure key={`${r.id}-${i}`} aria-hidden={i >= resenas.length} className="w-[320px] shrink-0 rounded-3xl bg-card p-6 ring-1 ring-line">
                <Stars value={r.estrellas} />
                <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-soft">“{r.texto}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <b className="inline-flex items-center gap-1">{r.nombre}<svg viewBox="0 0 24 24" className="h-4 w-4 text-[#0f9d58]" aria-label="Compra verificada"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg></b>{r.ciudad && <span className="text-ink-soft"> · {r.ciudad}</span>}
                  {r.producto && <Link href={`/p/${r.producto.slug}`} tabIndex={i >= resenas.length ? -1 : 0} className="block text-magenta-700 hover:underline dark:text-magenta-100">Compró: {r.producto.nombre}</Link>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="px-4 pb-16">
        <div className="isla-clara relative mx-auto grid max-w-7xl items-center gap-6 overflow-hidden rounded-panel bg-[linear-gradient(120deg,#ffe3f2_0%,#fff6dc_100%)] px-6 py-12 text-tinta ring-1 ring-[#f6c1d6] md:grid-cols-[1.1fr_1fr] md:px-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sol/40 blur-3xl" aria-hidden="true" />
          <h2 className="titulo relative text-4xl md:text-5xl">Entérate primero de los <span className="text-magenta-700">nuevos ingresos</span></h2>
          <div className="relative">
            <p className="max-w-lg text-tinta/75">Un correo al mes con lo nuevo y ofertas solo para suscriptores. Te das de baja cuando quieras.</p>
            <Newsletter />
          </div>
        </div>
      </section>
    </>
  )
}
