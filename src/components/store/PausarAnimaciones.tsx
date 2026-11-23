'use client'

import { useEffect, useState } from 'react'

/** Botón para detener todo lo que se mueve solo (WCAG 2.2.2). Recuerda la elección. */
export function PausarAnimaciones() {
  const [pausado, setPausado] = useState(false)
  useEffect(() => setPausado(document.documentElement.dataset.movimiento === 'pausado'), [])
  const alternar = () => {
    const nuevo = !pausado
    if (nuevo) document.documentElement.dataset.movimiento = 'pausado'
    else delete document.documentElement.dataset.movimiento
    try { localStorage.setItem('chevere:movimiento', nuevo ? 'pausado' : 'activo') } catch {}
    setPausado(nuevo)
  }
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={pausado}
      className="absolute right-2 top-1/2 z-10 flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold text-white/90 transition hover:bg-white/15 focus-visible:bg-white/15 sm:right-4"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        {pausado ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
      </svg>
      <span className="max-sm:sr-only">{pausado ? 'Reanudar animaciones' : 'Pausar animaciones'}</span>
    </button>
  )
}
