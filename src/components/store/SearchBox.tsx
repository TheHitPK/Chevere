'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

type Hit = { slug: string; nombre: string; precio: number; img?: string; cat?: string }

/** Buscador global con sugerencias en vivo (usa la API pública del panel: solo productos publicados). */
export function SearchBox({ className = '', variante = 'claro' }: { className?: string; variante?: 'claro' | 'oscuro' }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const router = useRouter()
  const listId = useId()
  const box = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setHits([]); return }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          'where[or][0][nombre][like]': term,
          'where[or][1][marca][like]': term,
          limit: '6',
          depth: '2',
        })
        const res = await fetch(`/api/productos?${params}`, { signal: ctrl.signal })
        const data = await res.json()
        setHits(
          (data.docs ?? []).map((p: { slug: string; nombre: string; precio: number; precioOferta?: number; imagenes?: { sizes?: { miniatura?: { url?: string } } }[]; categoria?: { nombre?: string } }) => ({
            slug: p.slug, nombre: p.nombre, precio: p.precioOferta ?? p.precio,
            img: p.imagenes?.[0]?.sizes?.miniatura?.url, cat: p.categoria?.nombre,
          })),
        )
        setActive(-1)
        setOpen(true)
      } catch {}
    }, 180)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <form
      ref={box}
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault()
        if (active >= 0 && hits[active]) router.push(`/p/${hits[active].slug}`)
        else if (q.trim()) router.push(`/buscar?q=${encodeURIComponent(q.trim())}`)
        setOpen(false)
      }}
    >
      <label htmlFor="buscar" className="sr-only">Buscar productos</label>
      <svg viewBox="0 0 24 24" className={`pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 ${variante === 'oscuro' ? 'text-white/70 peer-focus:text-ink-soft' : 'text-ink-soft'}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        id="buscar"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)) }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Busca jeans, relojes, vestidos…"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        className={`h-11 w-full rounded-2xl border pl-11 pr-4 text-[15px] outline-none transition ${variante === 'oscuro' ? 'buscador-hundido' : 'border-line bg-surface-2 focus:border-magenta-700 focus:bg-card'}`}
      />
      {open && q.trim().length >= 2 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-13 z-50 text-ink overflow-hidden rounded-2xl border border-line bg-card p-2 shadow-2xl">
          {hits.length === 0 && <li className="px-3 py-3 text-sm text-ink-soft">Sin resultados para “{q}”.</li>}
          {hits.map((h, i) => (
            <li key={h.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                style={{ animation: `rise .35s cubic-bezier(.22,1,.36,1) ${i * 45}ms both` }}>
              <Link
                href={`/p/${h.slug}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl p-2 transition ${i === active ? 'bg-magenta-100 dark:bg-white/10' : 'hover:bg-surface-2'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {h.img ? <img src={h.img} alt="" className="h-12 w-10 rounded-lg bg-surface-2 object-cover" /> : <span className="h-12 w-10 rounded-lg bg-surface-2" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{h.nombre}</span>
                  {h.cat && <span className="block text-xs text-ink-soft">{h.cat}</span>}
                </span>
                <span className="font-bold tabular">${h.precio.toFixed(2)}</span>
              </Link>
            </li>
          ))}
          {hits.length > 0 && (
            <li><button type="submit" className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-magenta-700 hover:bg-surface-2 dark:text-magenta-100">Ver todos los resultados →</button></li>
          )}
        </ul>
      )}
    </form>
  )
}
