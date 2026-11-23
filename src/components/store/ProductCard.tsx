import Link from 'next/link'
import { money, type ProductoVM } from '@/lib/store'
import { FavButton } from './cart'
import { Hover360 } from './Hover360'
import { QuickView360 } from './QuickView360'
import { Stars } from './Stars'

/** Tarjeta de producto: foto sobre fondo suave, nombre, calificación, precio y descuento. */
export function ProductCard({ p, quickView = false, prioridad = false }: { p: ProductoVM; quickView?: boolean; prioridad?: boolean }) {
  const portada = p.imagenes[0]
  const conGiro = p.colores.find((c) => c.frames.length)
  const descuento = p.precioOferta ? Math.round((1 - p.precioOferta / p.precio) * 100) : 0

  return (
    <article className="p-card group relative flex flex-col">
      <div className="relative">
        {/* La foto repite el enlace del título: se oculta a lectores y al tabulador para no anunciarlo dos veces */}
        <Link href={`/p/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-tarjeta bg-surface-2" tabIndex={-1} aria-hidden="true">
          {portada &&
            (conGiro ? (
              <Hover360 frames={conGiro.frames} src={portada.card} alt={portada.alt} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portada.card} alt={portada.alt} loading={prioridad ? 'eager' : 'lazy'} decoding="async" className="p-img h-full w-full object-cover" />
            ))}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {p.nuevo && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-magenta-700 shadow-sm ring-1 ring-magenta-100">Nuevo</span>}
            {p.stockTotal === 0 && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-tinta">Agotado</span>}
          </div>
          {conGiro && (
            <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-tinta backdrop-blur transition group-hover:opacity-0">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
              360°
            </span>
          )}
        </Link>
        <FavButton slug={p.slug} nombre={p.nombre} className="absolute right-3 top-3" />
        {quickView && conGiro && portada && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100 max-md:hidden">
            <QuickView360 nombre={p.nombre} slug={p.slug} frames={conGiro.frames} poster={conGiro.poster ?? portada.poster} gallery={p.imagenes.map((i) => ({ src: i.src, alt: i.alt }))} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1 pt-3">
        <h3 className="font-sans text-base font-bold leading-snug tracking-normal md:text-lg">
          <Link href={`/p/${p.slug}`} className="hover:text-magenta-700 dark:hover:text-magenta-100">{p.nombre}</Link>
        </h3>
        {p.rating ? (
          <p className="flex items-center gap-2 text-sm"><Stars value={p.rating.promedio} size={15} /><span className="tabular text-ink-soft">{p.rating.promedio.toFixed(1)}/5</span></p>
        ) : (
          <p className="text-sm text-ink-soft">{p.marca}</p>
        )}
        <p className="mt-auto flex flex-wrap items-center gap-2 pt-1 tabular">
          <span className="text-xl font-extrabold">{money(p.precioOferta ?? p.precio)}</span>
          {p.precioOferta && <s className="text-lg font-bold text-ink-soft" aria-label={`Antes ${money(p.precio)}`}>{money(p.precio)}</s>}
          {descuento > 0 && <span className="rounded-full bg-magenta-100 px-2.5 py-0.5 text-xs font-extrabold text-magenta-700 dark:bg-magenta-700/25 dark:text-magenta-100">−{descuento}%</span>}
        </p>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[4/5] rounded-tarjeta" />
      <div className="space-y-2 px-1 pt-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
    </div>
  )
}
