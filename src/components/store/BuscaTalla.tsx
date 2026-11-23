'use client'

import { useState } from 'react'
import { CABALLEROS, CABALLEROS_JEANS, CALZADO_CABALLERO, CALZADO_DAMA, DAMAS, DAMAS_JEANS, NINOS, rango, recomendar } from '@/lib/tallas'

type Para = 'dama' | 'caballero' | 'nino'

const CAMPOS: Record<Para, { k: string; label: string; ayuda: string }[]> = {
  dama: [
    { k: 'busto', label: 'Busto', ayuda: 'La parte más llena del pecho' },
    { k: 'cintura', label: 'Cintura', ayuda: 'La parte más estrecha, sobre el ombligo' },
    { k: 'cadera', label: 'Cadera', ayuda: 'La parte más ancha de los glúteos' },
    { k: 'pie', label: 'Largo del pie', ayuda: 'Del talón a la punta del dedo más largo' },
  ],
  caballero: [
    { k: 'pecho', label: 'Pecho', ayuda: 'Bajo las axilas, la parte más ancha' },
    { k: 'cintura', label: 'Cintura', ayuda: 'Donde usas el pantalón' },
    { k: 'cuello', label: 'Cuello', ayuda: 'En la base, dejando un dedo de holgura' },
    { k: 'pie', label: 'Largo del pie', ayuda: 'Del talón a la punta del dedo más largo' },
  ],
  nino: [
    { k: 'estatura', label: 'Estatura', ayuda: 'Descalzo, de espaldas a la pared' },
    { k: 'pecho', label: 'Pecho', ayuda: 'Bajo las axilas' },
  ],
}

/** Calzado: la primera talla cuyo largo de pie alcanza la medida. */
const calzado = (t: typeof CALZADO_DAMA, cm: number) => t.filas.find((f) => parseFloat(f[2]) >= cm) ?? null

/** "¿Cuál es mi talla?": la persona escribe sus medidas en cm y ve la talla sugerida al instante. */
export function BuscaTalla() {
  const [para, setPara] = useState<Para>('dama')
  const [m, setM] = useState<Record<string, string>>({})
  const n = (k: string) => (m[k] ? parseFloat(m[k].replace(',', '.')) : undefined)

  const resultados: { titulo: string; valor: string; detalle?: string }[] = []
  if (para === 'dama') {
    const r = recomendar(DAMAS, { 'Busto (cm)': n('busto'), 'Cintura (cm)': n('cintura'), 'Cadera (cm)': n('cadera') })
    if (r) { const f = DAMAS.filas.find((x) => x[0] === r); resultados.push({ titulo: 'Blusas, franelas y vestidos', valor: r, detalle: f ? `o número ${f[1]}` : undefined }) }
    const j = recomendar(DAMAS_JEANS, { 'Cintura (cm)': n('cintura'), 'Cadera (cm)': n('cadera') })
    if (j && (n('cintura') || n('cadera'))) { const f = DAMAS_JEANS.filas.find((x) => x[0] === j); resultados.push({ titulo: 'Jeans y pantalones', valor: j, detalle: f ? `número ${f[1]} · cintura ${f[2]}"` : undefined }) }
    const p = n('pie'); const z = p ? calzado(CALZADO_DAMA, p) : null
    if (z) resultados.push({ titulo: 'Calzado', valor: z[0], detalle: `US ${z[1]}` })
  } else if (para === 'caballero') {
    const r = recomendar(CABALLEROS, { 'Pecho (cm)': n('pecho'), 'Cintura (cm)': n('cintura'), 'Cuello (cm)': n('cuello') })
    if (r) resultados.push({ titulo: 'Franelas, camisas y chaquetas', valor: r })
    const c = n('cintura'); const j = c ? CABALLEROS_JEANS.filas.find((f) => c <= rango(f[2])[1]) : null
    if (j) resultados.push({ titulo: 'Jeans y pantalones', valor: `${j[1]}"`, detalle: `talla ${j[0]}` })
    const p = n('pie'); const z = p ? calzado(CALZADO_CABALLERO, p) : null
    if (z) resultados.push({ titulo: 'Calzado', valor: z[0], detalle: `US ${z[1]}` })
  } else {
    const e = n('estatura'); const pe = n('pecho')
    const f = NINOS.filas.find((x) => (!e || e <= rango(x[2])[1]) && (!pe || pe <= parseFloat(x[3]) + 2))
    if (e || pe) resultados.push({ titulo: 'Ropa infantil', valor: f ? `Talla ${f[0]}` : 'Más de talla 16', detalle: f ? `para ${f[1]} aprox.` : 'Prueba con talla S de adulto' })
  }

  return (
    <div className="rounded-bloque bg-card p-5 ring-1 ring-line sm:p-7">
      <div role="radiogroup" aria-label="¿Para quién es la talla?" className="flex flex-wrap gap-2">
        {([['dama', 'Dama'], ['caballero', 'Caballero'], ['nino', 'Niño o niña']] as const).map(([v, t]) => (
          <button key={v} type="button" role="radio" aria-checked={para === v} onClick={() => { setPara(v); setM({}) }}
            className={`chip inline-flex h-11 items-center rounded-full px-4 text-[15px] font-semibold ${para === v ? 'chip-activo' : ''}`}>{t}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {CAMPOS[para].map((c) => (
          <label key={c.k} className="grid gap-1">
            <span className="font-semibold">{c.label} <span className="font-normal text-ink-soft">(cm)</span></span>
            <input inputMode="decimal" value={m[c.k] ?? ''} onChange={(e) => setM({ ...m, [c.k]: e.target.value.replace(/[^\d.,]/g, '') })}
              placeholder="Ej. 88" className="h-12 rounded-2xl border border-line bg-surface px-4 text-lg tabular outline-none focus-visible:ring-2 focus-visible:ring-magenta-700" />
            <span className="text-sm text-ink-soft">{c.ayuda}</span>
          </label>
        ))}
      </div>
      <div aria-live="polite" className="mt-6">
        {resultados.length === 0 ? (
          <p className="rounded-2xl bg-surface-2 px-4 py-3 text-ink-soft">Escribe al menos una medida y aquí aparece tu talla.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {resultados.map((r) => (
              <li key={r.titulo} className="rounded-2xl bg-sol/30 px-4 py-3 ring-1 ring-sol">
                <p className="text-sm font-semibold">{r.titulo}</p>
                <p className="font-display text-3xl font-extrabold">{r.valor}</p>
                {r.detalle && <p className="text-sm">{r.detalle}</p>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-ink-soft">Si la prenda viene de China o Asia, pide una talla más de la que te sale aquí.</p>
      </div>
    </div>
  )
}
