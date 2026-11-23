'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * La portada sigue la hora local del visitante: amanecer, mediodía, atardecer o noche.
 * El script inline (momentoScript) fija data-momento antes de pintar, así no hay parpadeo;
 * este componente solo agrega el reloj y los controles para ver los otros momentos.
 */
export const MOMENTOS = [
  { id: 'amanecer', label: 'Amanecer', hora: '6:30' },
  { id: 'mediodia', label: 'Mediodía', hora: '12:00' },
  { id: 'atardecer', label: 'Atardecer', hora: '17:45' },
  { id: 'noche', label: 'Noche', hora: '21:00' },
] as const
export type Momento = (typeof MOMENTOS)[number]['id']

export const momentoDeHora = (h: number): Momento => (h >= 5 && h < 11 ? 'amanecer' : h >= 11 && h < 16 ? 'mediodia' : h >= 16 && h < 19 ? 'atardecer' : 'noche')

const aplicar = (m: Momento) => { document.documentElement.dataset.momento = m }

export function MomentoControles() {
  const [actual, setActual] = useState<Momento>('mediodia')
  const [real, setReal] = useState<Momento>('mediodia')
  const [hora, setHora] = useState('')
  const [recorriendo, setRecorriendo] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setHora(d.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' }))
      setReal(momentoDeHora(d.getHours()))
    }
    tick()
    setActual((document.documentElement.dataset.momento as Momento) ?? 'mediodia')
    const t = setInterval(tick, 30_000)
    return () => { clearInterval(t); if (timer.current) clearInterval(timer.current) }
  }, [])

  const elegir = (m: Momento) => { detener(); aplicar(m); setActual(m) }
  const detener = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setRecorriendo(false) }
  const recorrer = () => {
    if (recorriendo) { detener(); aplicar(real); setActual(real); return }
    setRecorriendo(true)
    let i = MOMENTOS.findIndex((m) => m.id === actual)
    const paso = () => { i = (i + 1) % MOMENTOS.length; aplicar(MOMENTOS[i].id); setActual(MOMENTOS[i].id) }
    paso()
    timer.current = setInterval(paso, 2600)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <div role="group" aria-label="Ver la portada en otro momento del día" className="grid grid-cols-4 rounded-full bg-[var(--m-chip)] p-1 backdrop-blur-md max-sm:w-full">
        {MOMENTOS.map((m) => (
          <button key={m.id} type="button" onClick={() => elegir(m.id)} aria-pressed={actual === m.id}
            className={`relative min-h-11 rounded-full px-1.5 py-2 text-[12px] font-bold transition duration-500 sm:px-4 sm:text-[13px] ${actual === m.id ? 'bg-[var(--m-ink)] text-[var(--m-bg1)]' : 'text-[var(--m-soft)] hover:text-[var(--m-ink)]'}`}>
            {m.label}
            {real === m.id && <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-sol ring-2 ring-[var(--m-bg1)]" aria-label="(ahora)" />}
          </button>
        ))}
      </div>
      <button type="button" onClick={recorrer} aria-pressed={recorriendo}
        className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-[var(--m-ink)] ring-1 ring-[var(--m-line)] transition hover:bg-[var(--m-chip)] motion-reduce:hidden">
        {recorriendo ? <>❚❚ Detener</> : <>▶ Recorrer el día</>}
      </button>
      {hora && <p className="w-full text-center text-xs font-semibold text-[var(--m-soft)] tabular">En tu ciudad son las {hora}</p>}
    </div>
  )
}
