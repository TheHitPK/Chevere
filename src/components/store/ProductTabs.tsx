'use client'

import { useId, useRef, useState, type ReactNode } from 'react'

/** Pestañas accesibles (flechas ← → entre pestañas) con indicador animado. */
export function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [activa, setActiva] = useState(0)
  const base = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const ir = (i: number) => {
    const n = (i + tabs.length) % tabs.length
    setActiva(n)
    refs.current[n]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label="Información del producto" className="relative grid border-b border-line" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el }}
            role="tab"
            id={`${base}-t-${t.id}`}
            aria-selected={activa === i}
            aria-controls={`${base}-p-${t.id}`}
            tabIndex={activa === i ? 0 : -1}
            onClick={() => setActiva(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); ir(i + 1) }
              if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1) }
            }}
            className={`py-4 text-center text-[15px] font-bold transition md:text-lg ${activa === i ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
        <span
          aria-hidden="true"
          className="absolute -bottom-px h-0.5 bg-ink transition-transform duration-500 [transition-timing-function:var(--ease-chevere)]"
          style={{ width: `${100 / tabs.length}%`, transform: `translateX(${activa * 100}%)` }}
        />
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-p-${t.id}`} aria-labelledby={`${base}-t-${t.id}`} hidden={activa !== i} className="animate-fade-in pt-8">
          {t.content}
        </div>
      ))}
    </div>
  )
}
