'use client'

import { useRef, type ReactNode } from 'react'

/** Carrusel con scroll-snap nativo (desliza con el dedo) y flechas en escritorio. */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null)
  const mover = (dir: number) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return (
    <div className="relative" role="region" aria-roledescription="carrusel" aria-label={label}>
      <div ref={track} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        {[[-1, 'Anteriores', 'M15 18l-6-6 6-6'], [1, 'Siguientes', 'M9 6l6 6-6 6']].map(([d, l, path]) => (
          <button key={l as string} type="button" onClick={() => mover(d as number)} aria-label={l as string}
                  className="grid h-12 w-12 place-items-center rounded-full border border-line bg-card transition hover:border-magenta-700 hover:bg-magenta-700 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d={path as string} /></svg>
          </button>
        ))}
      </div>
    </div>
  )
}
