'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// El visor se descarga solo cuando alguien pide verlo
const Viewer360 = dynamic(() => import('./Viewer360'), { ssr: false, loading: () => <div className="skeleton aspect-[4/5] w-full rounded-3xl" /> })

type Props = { nombre: string; slug: string; frames: string[]; poster: string; gallery: { src: string; alt: string }[] }

export function QuickView360({ nombre, slug, frames, poster, gallery }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(true); ref.current?.showModal() }}
        className="pointer-events-auto rounded-full bg-sol px-4 py-2 text-sm font-bold text-tinta shadow-lg transition hover:scale-105"
      >
        Ver 360°
      </button>
      {mounted && createPortal(
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}
        aria-label={`${nombre} en 360°`}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-3xl bg-card p-4 text-ink"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">{nombre}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Cerrar">✕</button>
        </div>
        {open && <Viewer360 frames={frames} poster={poster} gallery={gallery} alt={nombre} loadOn="visible" />}
        <Link href={`/p/${slug}`} className="mt-3 block rounded-full bg-magenta-700 py-3 text-center font-bold text-white">Ver detalles y comprar</Link>
      </dialog>,
      document.body)}
    </>
  )
}
