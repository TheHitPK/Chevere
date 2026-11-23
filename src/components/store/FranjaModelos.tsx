import type { Img } from '@/lib/store'

/**
 * Franja de fotos de modelos reales (se cargan desde el panel, en la categoría principal).
 *  - PNG/WebP con fondo transparente: se muestran de pie, una junto a otra, como una franja de siluetas.
 *  - Fotos con fondo: se muestran como tarjetas verticales escalonadas.
 */
export function FranjaModelos({ fotos, className = '' }: { fotos: (Img & { recorte?: boolean })[]; className?: string }) {
  const recortes = fotos.every((f) => f.recorte)
  return (
    <ul className={`pointer-events-none flex items-end justify-center ${recortes ? '-space-x-[6%]' : 'gap-2 md:gap-3'} ${className}`} aria-label="Modelos de la colección">
      {fotos.map((f, i) => (
        <li key={f.src} className="modelo flex h-full min-w-0 flex-1 items-end justify-center" style={{ ['--i' as string]: i, zIndex: i % 2 ? 1 : 2 }}>
          <div className={`modelo-cuerpo h-full w-full ${recortes ? '' : i % 2 ? 'pb-0' : 'pb-[8%]'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recortes ? f.src : f.card}
              alt={f.alt}
              loading="lazy"
              decoding="async"
              className={recortes
                ? 'h-full w-full object-contain object-bottom drop-shadow-[0_12px_14px_rgb(61_0_36/0.25)]'
                : 'h-full w-full rounded-3xl object-cover shadow-[0_14px_28px_-12px_rgb(61_0_36/0.45)] ring-4 ring-white/70'}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
