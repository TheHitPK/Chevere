'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react'

export type Facetas = {
  tallas: { valor: string; n: number }[]
  colores: { valor: string; hex: string; n: number }[]
  marcas: { valor: string; n: number }[]
  precio: { min: number; max: number }
  agotados: number
}

const ORDEN = [
  ['novedad', 'Novedades'],
  ['popularidad', 'Más vendidos'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
] as const

function Grupo({ titulo, children, open = true }: { titulo: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="filter border-b border-line py-1" open={open}>
      <summary className="flex items-center justify-between py-3 font-bold">{titulo}<span className="chev text-ink-soft" aria-hidden="true">⌄</span></summary>
      <div className="body pb-4">{children}</div>
    </details>
  )
}


/**
 * Filtros de categoría. Cada cambio actualiza la URL (compartible, funciona con "atrás")
 * y el servidor devuelve los resultados; el contador se actualiza en vivo.
 */
export function Filters({ facetas, total, mostrando, children }: { facetas: Facetas; total: number; mostrando?: number; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [pending, start] = useTransition()
  const [abierto, setAbierto] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  const lista = (k: string) => sp.getAll(k)
  const set = (fn: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString())
    fn(p)
    start(() => router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false }))
  }
  const toggle = (k: string, v: string) =>
    set((p) => {
      const vals = p.getAll(k)
      p.delete(k)
      ;(vals.includes(v) ? vals.filter((x) => x !== v) : [...vals, v]).forEach((x) => p.append(k, x))
    })
  const activos = ['talla', 'color', 'marca'].reduce((s, k) => s + lista(k).length, 0) + (sp.get('disp') ? 1 : 0) + (sp.get('min') || sp.get('max') ? 1 : 0)

  useEffect(() => {
    document.body.style.overflow = abierto && innerWidth < 1024 ? 'hidden' : ''
  }, [abierto])

  const filtros = (
    <div ref={panel} className="space-y-1">
      <Grupo titulo="Talla">
        <div className="flex flex-wrap gap-2">
          {facetas.tallas.map((t) => {
            const on = lista('talla').includes(t.valor)
            return (
              <button key={t.valor} type="button" aria-pressed={on} onClick={() => toggle('talla', t.valor)}
                className={`min-h-11 min-w-12 rounded-xl border px-3 py-2 text-sm font-semibold transition ${on ? 'border-magenta-700 bg-magenta-700 text-white' : 'border-line hover:border-ink'}`}>
                {t.valor}
              </button>
            )
          })}
        </div>
      </Grupo>
      <Grupo titulo="Color">
        <ul className="grid grid-cols-2 gap-1">
          {facetas.colores.map((c) => {
            const on = lista('color').includes(c.valor)
            return (
              <li key={c.valor}>
                <button type="button" aria-pressed={on} onClick={() => toggle('color', c.valor)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${on ? 'bg-magenta-100 font-bold text-magenta-900 dark:bg-white/10 dark:text-white' : 'hover:bg-surface-2'}`}>
                  <span className={`h-5 w-5 shrink-0 rounded-full ring-1 ring-line transition ${on ? 'scale-110 ring-2 ring-magenta-700' : ''}`} style={{ background: c.hex }} />
                  <span className="truncate">{c.valor}</span><span className="ml-auto text-xs text-ink-soft tabular">{c.n}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Grupo>
      <Grupo titulo="Precio">
        <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); set((p) => { for (const k of ['min', 'max']) { const v = String(f.get(k) ?? ''); if (v) p.set(k, v); else p.delete(k) } }) }}>
          <label className="grid min-w-0 flex-1 gap-1 text-xs text-ink-soft">Desde
            <input name="min" type="number" min={0} inputMode="decimal" defaultValue={sp.get('min') ?? ''} placeholder={`$${Math.floor(facetas.precio.min)}`} className="h-10 w-full min-w-0 rounded-lg border border-line bg-card px-2 text-sm text-ink" />
          </label>
          <label className="grid min-w-0 flex-1 gap-1 text-xs text-ink-soft">Hasta
            <input name="max" type="number" min={0} inputMode="decimal" defaultValue={sp.get('max') ?? ''} placeholder={`$${Math.ceil(facetas.precio.max)}`} className="h-10 w-full min-w-0 rounded-lg border border-line bg-card px-2 text-sm text-ink" />
          </label>
          <button className="h-10 rounded-lg bg-magenta-700 px-3 text-sm font-bold text-white">Aplicar</button>
        </form>
      </Grupo>
      {facetas.marcas.length > 1 && (
        <Grupo titulo="Marca" open={false}>
          {facetas.marcas.map((m) => (
            <label key={m.valor} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={lista('marca').includes(m.valor)} onChange={() => toggle('marca', m.valor)} className="h-6 w-6 shrink-0 accent-magenta-700" />
              {m.valor}<span className="ml-auto text-xs text-ink-soft tabular">{m.n}</span>
            </label>
          ))}
        </Grupo>
      )}
      <Grupo titulo="Disponibilidad">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={!!sp.get('disp')} onChange={() => set((p) => (p.get('disp') ? p.delete('disp') : p.set('disp', '1')))} className="h-6 w-6 shrink-0 accent-magenta-700" />
          Ocultar agotados {facetas.agotados > 0 && <span className="text-ink-soft">({facetas.agotados})</span>}
        </label>
      </Grupo>
    </div>
  )

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
      {/* Panel lateral (escritorio) / hoja inferior (móvil) */}
      <aside aria-label="Filtros" className={`lg:block ${abierto ? 'fixed inset-0 z-50 flex flex-col bg-card p-5 lg:static lg:bg-transparent lg:p-0' : 'hidden'}`}>
        <div className="mb-2 flex items-center justify-between lg:hidden">
          <h2 className="text-2xl font-extrabold">Filtros</h2>
          <button type="button" onClick={() => setAbierto(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Cerrar filtros">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto lg:sticky lg:top-32 lg:max-h-[calc(100dvh-9rem)]">{filtros}</div>
        <div className="flex gap-2 pt-4 lg:hidden">
          <button type="button" onClick={() => set((p) => ['talla', 'color', 'marca', 'min', 'max', 'disp'].forEach((k) => p.delete(k)))} className="flex-1 rounded-full border border-line py-3 font-bold">Limpiar</button>
          <button type="button" onClick={() => setAbierto(false)} className="flex-[2] rounded-full bg-magenta-700 py-3 font-bold text-white">
            Ver {total} {total === 1 ? 'resultado' : 'resultados'}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setAbierto(true)} className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 font-semibold lg:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Filtros{activos > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-magenta-700 px-1 text-xs text-white">{activos}</span>}
          </button>
          <p className="text-ink-soft" aria-live="polite">
            {mostrando !== undefined && total > 0 ? <>Mostrando 1–<b key={`m${mostrando}`} className="inline-block text-ink tabular animate-fade-in">{mostrando}</b> de </> : null}
            <b key={total} className="inline-block text-ink tabular animate-fade-in">{total}</b> {total === 1 ? 'producto' : 'productos'}
            {pending && <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-magenta-700 border-t-transparent align-middle" aria-label="Actualizando" />}
          </p>
          {activos > 0 && (
            <button type="button" onClick={() => set((p) => ['talla', 'color', 'marca', 'min', 'max', 'disp'].forEach((k) => p.delete(k)))} className="text-sm font-semibold text-magenta-700 underline dark:text-magenta-100 max-lg:hidden">
              Quitar filtros ({activos})
            </button>
          )}
          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-ink-soft max-sm:sr-only">Ordenar por</span>
            <select value={sp.get('orden') ?? 'novedad'} onChange={(e) => set((p) => (e.target.value === 'novedad' ? p.delete('orden') : p.set('orden', e.target.value)))}
                    className="h-10 rounded-full border border-line bg-card px-3 font-semibold">
              {ORDEN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <div className={`transition-opacity duration-300 ${pending ? 'opacity-50' : ''}`}>{children}</div>
      </div>
    </div>
  )
}
