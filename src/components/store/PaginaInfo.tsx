import type { ReactNode } from 'react'
import { getAjustes } from '@/lib/store'
import { Breadcrumbs } from './Breadcrumbs'
import { WhatsAppIcon, waLink } from './whatsapp'

/** Plantilla de las páginas de ayuda (envíos, cambios): cabecera clara, contenido y cierre con WhatsApp. */
export async function PaginaInfo({ titulo, intro, mensajeWa, children }: { titulo: string; intro: string; mensajeWa: string; children: ReactNode }) {
  const ajustes = await getAjustes()
  return (
    <>
      <header className="isla-clara overflow-hidden bg-[linear-gradient(110deg,#fff4d1,#ffe3f2)] text-tinta">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6">
          <Breadcrumbs items={[{ nombre: 'Inicio', url: '/' }, { nombre: titulo }]} />
          <h1 className="titulo relative isolate mt-6 inline-block text-4xl sm:text-5xl md:text-7xl">
            {titulo}
            <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="trazo-sol absolute -bottom-3 left-0 h-4 w-[105%] md:-bottom-4 md:h-5" aria-hidden="true">
              <path d="M4 16 Q80 2 150 10 T296 8 Q292 18 240 20 Q150 24 70 21 Q20 20 4 16Z" fill="#ffd21f" />
            </svg>
          </h1>
          <p className="mt-6 max-w-2xl text-lg">{intro}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12">
        {children}
        {ajustes.whatsapp && (
          <section aria-label="Contacto" className="isla-clara flex flex-wrap items-center justify-between gap-4 rounded-bloque bg-[linear-gradient(110deg,#fff4d1,#ffe3f2)] p-6 text-tinta">
            <div>
              <p className="font-display text-2xl font-extrabold">¿Tienes otra pregunta?</p>
              <p>Escríbenos y te respondemos de lunes a sábado, de 9:00 a 18:00.</p>
            </div>
            <a href={waLink(ajustes.whatsapp, mensajeWa)} target="_blank" rel="noopener noreferrer" className="wa-3d flex h-12 items-center gap-2 rounded-2xl px-5 font-extrabold">
              <WhatsAppIcon className="h-5 w-5" /> Escribir por WhatsApp
            </a>
          </section>
        )}
      </div>
    </>
  )
}

/** Tarjeta con ícono para una opción (forma de entrega, paso, etc.). */
export function TarjetaInfo({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <li className="rounded-bloque bg-card p-6 ring-1 ring-line">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-magenta-100 text-magenta-700 dark:bg-white/10 dark:text-sol" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icono}</svg>
      </span>
      <h3 className="mt-4 font-display text-xl font-extrabold">{titulo}</h3>
      <div className="mt-2 grid gap-2 text-ink-soft">{children}</div>
    </li>
  )
}
