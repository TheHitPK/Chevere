'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Vista previa del giro al pasar el mouse (tarjetas). Carga solo 12 frames y únicamente
 * cuando el usuario apunta a la tarjeta; con teclado se activa al recibir foco.
 */
export function Hover360({ frames, src, alt, className = '' }: { frames: string[]; src: string; alt: string; className?: string }) {
  const [idx, setIdx] = useState(-1)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const loaded = useRef<string[]>([])
  const paso = Math.max(1, Math.round(frames.length / 12))
  const muestras = frames.filter((_, i) => i % paso === 0)

  const start = () => {
    if (!muestras.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!loaded.current.length) {
      loaded.current = muestras
      muestras.forEach((s) => { const i = new Image(); i.src = s })
    }
    if (timer.current) return
    let k = 0
    timer.current = setInterval(() => { k = (k + 1) % muestras.length; setIdx(k) }, 110)
  }
  const stop = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setIdx(-1)
  }
  useEffect(() => stop, [])

  return (
    <div
      className={`relative h-full w-full ${className}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && start()}
      onPointerLeave={stop}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="p-img h-full w-full object-cover" />
      {idx >= 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={muestras[idx]} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  )
}
