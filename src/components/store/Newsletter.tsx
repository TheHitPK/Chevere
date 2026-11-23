'use client'

import { useState } from 'react'

export function Newsletter() {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  return (
    <form
      className="relative mt-6 flex w-full max-w-lg flex-col flex-wrap gap-3 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault()
        const email = new FormData(e.currentTarget).get('email') as string
        setEstado('enviando')
        try {
          const r = await fetch('/api/suscriptores', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
          if (r.ok) { setEstado('ok'); setMsg('¡Listo! Te avisaremos de los nuevos ingresos.'); return }
          const data = await r.json().catch(() => ({}))
          const dup = JSON.stringify(data).includes('unique') || JSON.stringify(data).toLowerCase().includes('único')
          setEstado(dup ? 'ok' : 'error')
          setMsg(dup ? 'Ya estabas suscrito. ¡Gracias!' : 'Revisa que el email esté bien escrito.')
        } catch {
          setEstado('error'); setMsg('No pudimos conectar. Inténtalo de nuevo en un momento.')
        }
      }}
    >
      <label htmlFor="nl-email" className="sr-only">Tu email</label>
      <div className="nl-field min-w-0 flex-1 rounded-full bg-white ring-1 ring-[#f0c6db] sm:min-w-64">
        <input id="nl-email" name="email" type="email" required placeholder="tu@email.com" autoComplete="email"
               className="h-14 w-full rounded-full bg-transparent px-6 text-tinta outline-none placeholder:text-[#5c4654]" />
      </div>
      <button disabled={estado === 'enviando'} className="h-14 rounded-full bg-sol px-7 font-extrabold text-tinta transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
        {estado === 'enviando' ? 'Enviando…' : 'Suscribirme'}
      </button>
      <p role="status" className={`basis-full text-sm font-semibold ${estado === 'error' ? 'text-magenta-700' : 'text-tinta'}`}>{msg}</p>
    </form>
  )
}
