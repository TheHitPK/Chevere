'use client'

import { useState } from 'react'

export function ReviewForm({ productoId }: { productoId: number }) {
  const [abierto, setAbierto] = useState(false)
  const [estrellas, setEstrellas] = useState(0)
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  if (estado === 'ok')
    return <p className="rounded-2xl bg-surface-2 p-5 font-semibold" role="status">¡Gracias por tu reseña! La publicaremos en cuanto la revisemos.</p>

  if (!abierto)
    return <button type="button" onClick={() => setAbierto(true)} className="rounded-full border-2 border-ink px-6 py-3 font-bold transition hover:bg-ink hover:text-surface">Escribir una reseña</button>

  return (
    <form
      className="grid gap-4 rounded-3xl bg-surface-2 p-6 animate-fade-in"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        if (!estrellas) { setError('Elige de 1 a 5 estrellas.'); return }
        const texto = String(f.get('texto') ?? '').trim()
        if (texto.length < 10) { setError('Cuéntanos un poco más (mínimo 10 caracteres).'); return }
        setEstado('enviando'); setError('')
        const r = await fetch('/api/resenas', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ producto: productoId, estrellas, texto, nombre: f.get('nombre'), ciudad: f.get('ciudad') || undefined }),
        }).catch(() => null)
        if (r?.ok) setEstado('ok')
        else { setEstado('error'); setError('No pudimos enviar tu reseña. Revisa los datos e inténtalo de nuevo.') }
      }}
    >
      <fieldset>
        <legend className="mb-2 font-bold">Tu calificación</legend>
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={estrellas === i} aria-label={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`} onClick={() => setEstrellas(i)}
              className={`text-3xl transition hover:scale-125 ${i <= estrellas ? 'text-naranja' : 'text-line'}`}>★</button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">Nombre<input name="nombre" required maxLength={60} className="h-11 rounded-xl border border-line bg-card px-3 font-normal" /></label>
        <label className="grid gap-1 text-sm font-semibold">Ciudad (opcional)<input name="ciudad" maxLength={40} className="h-11 rounded-xl border border-line bg-card px-3 font-normal" /></label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">Tu opinión
        <textarea name="texto" required minLength={10} maxLength={800} rows={4} placeholder="¿Qué tal la talla, la tela, el color?" className="rounded-xl border border-line bg-card p-3 font-normal" />
      </label>
      {error && <p className="text-sm font-semibold text-magenta-700 dark:text-sol" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button disabled={estado === 'enviando'} className="rounded-full bg-magenta-700 px-6 py-3 font-bold text-white disabled:opacity-60">{estado === 'enviando' ? 'Enviando…' : 'Enviar reseña'}</button>
        <button type="button" onClick={() => setAbierto(false)} className="rounded-full px-4 py-3 font-semibold text-ink-soft">Cancelar</button>
      </div>
    </form>
  )
}
