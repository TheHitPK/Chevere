'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ColorVM, Img } from '@/lib/store'
import { AVISO_CALCE, type Calce, type Tabla } from '@/lib/tallas'
import Link from 'next/link'
import { TablaTallas } from './TablaTallas'
import { FavButton, flyToCart, money, useCart } from './cart'
import Viewer360 from './Viewer360'
import { WhatsAppIcon, waLink } from './whatsapp'

type Props = {
  slug: string
  nombre: string
  marca?: string
  precio: number
  precioOferta?: number
  colores: ColorVM[]
  imagenes: Img[]
  categoria?: string
  rating?: { promedio: number; total: number }
  ratingNode?: ReactNode
  detalles: ReactNode
  /** Tablas de medidas que aplican a este producto (vacío = talla única). */
  guiaTallas: Tabla[]
  /** Cómo calza la prenda (se configura en el panel). */
  calce?: Calce
  /** Modo catálogo: sin carrito; el botón principal abre WhatsApp con el producto elegido. */
  catalogo?: { whatsapp: string; aviso: string } | null
}

export function ProductView(props: Props) {
  const { slug, nombre, marca, precio, precioOferta, colores, imagenes, detalles, guiaTallas, calce = 'normal', catalogo } = props
  const [colorIdx, setColorIdx] = useState(0)
  const color = colores[colorIdx]
  const primeraConStock = color.tallas.find((t) => t.stock > 0)
  const [talla, setTalla] = useState<string | null>(color.tallas.length === 1 ? (primeraConStock?.talla ?? null) : null)
  const [vista, setVista] = useState<'360' | number>(color.frames.length ? '360' : 0)
  const [aviso, setAviso] = useState('')
  const [agregado, setAgregado] = useState(false)
  const media = useRef<HTMLDivElement>(null)
  const cta = useRef<HTMLButtonElement>(null)
  const guia = useRef<HTMLDialogElement>(null)
  const lupa = useRef<HTMLDialogElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  const { add, setOpen } = useCart()

  const seleccion = color.tallas.find((t) => t.talla === talla)
  const precioFinal = precioOferta ?? precio
  const agotado = color.tallas.every((t) => t.stock === 0)

  // Barra fija en móvil cuando el botón principal sale de la pantalla
  useEffect(() => {
    const el = cta.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { rootMargin: '0px 0px -40px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const cambiarColor = (i: number) => {
    setColorIdx(i)
    const c = colores[i]
    setTalla(c.tallas.length === 1 && c.tallas[0].stock > 0 ? c.tallas[0].talla : talla && c.tallas.some((t) => t.talla === talla && t.stock > 0) ? talla : null)
    setVista(c.frames.length ? '360' : 0)
  }

  const consultar = () => {
    if (!catalogo) return
    const msg = [
      '¡Hola Chévere! Me interesa este producto:',
      `• ${nombre}`,
      `• Color: ${color.color}`,
      `• Talla: ${seleccion?.talla ?? 'aún no sé, ¿me ayudan?'}`,
      `• Precio: ${money(precioFinal)}`,
      typeof window !== 'undefined' ? window.location.origin + `/p/${slug}` : '',
      '¿Está disponible?',
    ].filter(Boolean).join('\n')
    window.open(waLink(catalogo.whatsapp, msg), '_blank', 'noopener,noreferrer')
  }

  const agregar = async () => {
    if (catalogo) return consultar()
    if (!seleccion) {
      setAviso('Elige una talla para continuar.')
      document.getElementById('tallas')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('tallas')?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true })
      return
    }
    setAviso('')
    const imagen = color.poster ?? imagenes[0]?.card
    add({ sku: seleccion.sku, slug, nombre, color: color.color, talla: seleccion.talla, precio: precioFinal, imagen, max: seleccion.stock })
    const origen = media.current?.querySelector<HTMLElement>('canvas, img')
    setAgregado(true)
    await flyToCart(origen ?? null)
    setTimeout(() => setAgregado(false), 1800)
  }

  const fotoActiva = typeof vista === 'number' ? imagenes[vista] : null

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      {/* ------------- Medios: 360° + fotos ------------- */}
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div ref={media} className="relative">
          {vista === '360' && color.frames.length > 1 ? (
            <Viewer360
              key={color.color}
              frames={color.frames}
              poster={color.poster ?? imagenes[0]?.poster ?? color.frames[0]}
              gallery={imagenes.map((i) => ({ src: i.src, alt: i.alt }))}
              alt={`${nombre}, color ${color.color}`}
              loadOn="visible"
              autoRotate
            />
          ) : fotoActiva ? (
            <button type="button" onClick={() => lupa.current?.showModal()} className="group block w-full cursor-zoom-in overflow-hidden rounded-3xl bg-surface-2" aria-label={`Ampliar: ${fotoActiva.alt}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={fotoActiva.src} src={fotoActiva.src} alt={fotoActiva.alt} className="aspect-[4/5] w-full object-contain animate-fade-in transition duration-500 group-hover:scale-105" />
              <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-tinta shadow">🔍 Ampliar</span>
            </button>
          ) : null}
        </div>
        {/* Miniaturas */}
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Vistas del producto">
          {color.frames.length > 1 && (
            <li>
              <button type="button" onClick={() => setVista('360')} aria-pressed={vista === '360'}
                className={`grid h-24 w-20 place-items-center rounded-2xl border-2 bg-surface-2 text-sm font-extrabold transition ${vista === '360' ? 'scale-105 border-magenta-700 text-magenta-700 dark:text-magenta-100' : 'border-transparent hover:border-line'}`}>
                <span className="grid place-items-center gap-1"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>360°</span>
              </button>
            </li>
          )}
          {imagenes.map((im, i) => (
            <li key={im.src}>
              <button type="button" onClick={() => setVista(i)} aria-pressed={vista === i} aria-label={`Ver foto: ${im.alt}`}
                className={`h-24 w-20 overflow-hidden rounded-2xl border-2 bg-surface-2 transition ${vista === i ? 'scale-105 border-magenta-700' : 'border-transparent opacity-80 hover:opacity-100'}`}
                style={{ transitionDelay: `${i * 40}ms` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ------------- Información y compra ------------- */}
      <div className="min-w-0">
        {marca && <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">{marca}</p>}
        <h1 className="titulo mt-1 text-4xl md:text-5xl">{nombre}</h1>
        {props.ratingNode}
        <p className="mt-4 flex items-baseline gap-3 tabular">
          <span className="text-3xl font-extrabold">{money(precioFinal)}</span>
          {precioOferta && (
            <>
              <s className="text-lg text-ink-soft">{money(precio)}</s>
              <span className="rounded-full bg-naranja px-2.5 py-1 text-sm font-extrabold text-tinta">Ahorras {money(precio - precioOferta)}</span>
            </>
          )}
        </p>

        {detalles && <div className="mt-4 max-w-xl border-b border-line pb-6">{detalles}</div>}

        {/* Color */}
        <fieldset className="mt-7">
          <legend className="font-bold">Color: <span className="font-normal text-ink-soft">{color.color}</span></legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {colores.map((c, i) => (
              <button key={c.color} type="button" onClick={() => cambiarColor(i)} aria-pressed={i === colorIdx} aria-label={c.color} title={c.color}
                className={`h-11 w-11 rounded-full ring-offset-2 ring-offset-surface transition duration-300 ${i === colorIdx ? 'scale-110 ring-[3px] ring-magenta-700' : 'ring-1 ring-line hover:scale-105'}`}
                style={{ background: c.hex }} />
            ))}
          </div>
        </fieldset>

        {/* Talla */}
        <fieldset className="mt-6" id="tallas">
          <div className="flex items-center justify-between">
            <legend className="font-bold">Talla{talla && <span className="font-normal text-ink-soft">: {talla}</span>}</legend>
            {guiaTallas.length > 0 && (
              <button type="button" onClick={() => guia.current?.showModal()} className="text-sm font-semibold text-magenta-700 underline underline-offset-4 dark:text-magenta-100">Guía de tallas</button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {color.tallas.map((t) => (
              <button key={t.sku} type="button" disabled={t.stock === 0} onClick={() => { setTalla(t.talla); setAviso('') }} aria-pressed={talla === t.talla}
                aria-label={`Talla ${t.talla}${t.stock === 0 ? ', agotada' : t.stock <= 3 ? `, quedan ${t.stock}` : ''}`}
                className={`relative min-w-14 rounded-2xl border-2 px-4 py-3 font-bold transition ${talla === t.talla ? 'border-magenta-700 bg-magenta-700 text-white' : 'border-line hover:border-ink'} disabled:cursor-not-allowed disabled:border-dashed disabled:text-ink-soft/60 disabled:line-through`}>
                {t.talla}
                {t.stock > 0 && t.stock <= 3 && <span className="absolute -right-1.5 -top-2 rounded-full bg-naranja px-1.5 text-[11px] font-extrabold text-tinta no-underline">{t.stock}</span>}
              </button>
            ))}
          </div>
          {AVISO_CALCE[calce] && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-sol/30 px-3 py-2 text-sm font-semibold ring-1 ring-sol">
              <span aria-hidden="true">📏</span>{AVISO_CALCE[calce]}
            </p>
          )}
          <p className="mt-2 min-h-5 text-sm font-semibold text-magenta-700 dark:text-sol" role="alert">{aviso}</p>
          {seleccion && seleccion.stock <= 3 && <p className="text-sm text-ink-soft">¡Quedan solo {seleccion.stock} en esta talla!</p>}
        </fieldset>

        <div className="mt-4 flex gap-3">
          {catalogo ? (
            <button ref={cta} type="button" onClick={consultar} disabled={agotado || !catalogo.whatsapp}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp py-4 text-lg font-extrabold text-whatsapp-tinta transition hover:brightness-95 active:scale-[0.98] disabled:bg-ink-soft disabled:text-white">
              {agotado ? 'Agotado en este color' : <><WhatsAppIcon className="h-6 w-6" /> Consultar por WhatsApp</>}
            </button>
          ) : (
            <button ref={cta} type="button" onClick={agregar} disabled={agotado}
              className={`relative flex-1 overflow-hidden rounded-full py-4 text-lg font-extrabold text-white transition active:scale-[0.98] disabled:bg-ink-soft ${agregado ? 'bg-[#0f7a4a]' : 'bg-magenta-700 hover:bg-magenta-900'}`}>
              {agotado ? 'Agotado en este color' : agregado ? <>✓ Agregado al carrito</> : 'Agregar al carrito'}
            </button>
          )}
          <FavButton slug={slug} nombre={nombre} className="!h-[60px] !w-[60px] ring-1 ring-line" />
        </div>
        {catalogo && <p className="mt-3 text-sm text-ink-soft">{catalogo.aviso} {!talla && 'Si eliges talla y color, los incluimos en tu mensaje.'}</p>}
        {!catalogo && agregado && (
          <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-full border-2 border-ink py-3 font-bold animate-fade-in">Ver carrito y pagar</button>
        )}

        <ul className="mt-6 grid gap-2 rounded-3xl bg-surface-2 p-5 text-sm">
          <li>🚚 <b>Enviamos a toda Venezuela</b> desde Maracaibo. El envío se paga al recibir.</li>
          <li>↩️ <b>¿No te quedó?</b> Lo resolvemos contigo por WhatsApp.</li>
          <li>{catalogo ? <>💬 <b>Atención personalizada</b> por WhatsApp: te confirmamos talla, color y entrega.</> : <>🔒 Pago seguro con tarjeta, PayPal o Pago Móvil.</>}</li>
        </ul>

      </div>

      {/* ------------- Barra fija móvil ------------- */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur transition duration-300 lg:hidden ${ctaVisible ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{nombre}</p>
            <p className="font-extrabold tabular">{money(precioFinal)}{talla && <span className="ml-2 text-sm font-normal text-ink-soft">Talla {talla}</span>}</p>
          </div>
          {catalogo ? (
            <button type="button" onClick={consultar} disabled={agotado || !catalogo.whatsapp} className="flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3.5 font-extrabold text-whatsapp-tinta disabled:bg-ink-soft">
              <WhatsAppIcon className="h-5 w-5" /> Consultar
            </button>
          ) : (
            <button type="button" onClick={agregar} disabled={agotado} className="rounded-full bg-magenta-700 px-6 py-3.5 font-extrabold text-white disabled:bg-ink-soft">
              {agregado ? '✓ Listo' : 'Agregar'}
            </button>
          )}
        </div>
      </div>

      {/* ------------- Guía de tallas ------------- */}
      <dialog ref={guia} onClick={(e) => { if (e.target === guia.current) guia.current?.close() }} className="m-auto max-h-[90dvh] w-[min(680px,calc(100vw-32px))] rounded-3xl bg-card p-0 text-ink" aria-labelledby="guia-t">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 id="guia-t" className="text-2xl font-extrabold">Guía de tallas</h2>
            <button type="button" onClick={() => guia.current?.close()} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Cerrar">✕</button>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Mide sobre el cuerpo, sin apretar la cinta. Si quedas entre dos tallas, elige la mayor.</p>
          {AVISO_CALCE[calce] && <p className="mt-3 rounded-2xl bg-sol/30 px-3 py-2 text-sm font-semibold ring-1 ring-sol">{AVISO_CALCE[calce]}</p>}
          <div className="mt-4 grid gap-6">
            {guiaTallas.map((t) => <TablaTallas key={t.id} tabla={t} resaltar={talla} titulo={guiaTallas.length > 1} />)}
          </div>
          <Link href="/guia-de-tallas" className="mt-5 inline-block font-semibold text-magenta-700 underline underline-offset-4 dark:text-magenta-100">Ver la guía completa y cómo medirte →</Link>
        </div>
      </dialog>

      {/* ------------- Lupa de detalle ------------- */}
      <dialog ref={lupa} onClick={(e) => { if (e.target === lupa.current) lupa.current?.close() }} className="m-auto h-[min(92dvh,1000px)] w-[min(92vw,820px)] overflow-hidden rounded-3xl bg-card p-0" aria-label="Foto ampliada">
        {fotoActiva && <Lupa src={fotoActiva.src} alt={fotoActiva.alt} onClose={() => lupa.current?.close()} />}
      </dialog>
    </div>
  )
}

/** Imagen ampliada: el zoom sigue al cursor o al dedo para revisar costuras y textura. */
function Lupa({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [o, setO] = useState('50% 50%')
  const [zoom, setZoom] = useState(2.2)
  return (
    <div className="relative h-full w-full bg-surface-2"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full touch-none object-contain transition-transform duration-150" style={{ transform: `scale(${zoom})`, transformOrigin: o }} />
      <div className="absolute right-4 top-4 flex gap-2">
        <button type="button" onClick={() => setZoom((z) => (z > 1.5 ? 1 : 2.2))} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-tinta shadow">{zoom > 1.5 ? 'Alejar' : 'Acercar'}</button>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-tinta shadow" aria-label="Cerrar">✕</button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/75 px-4 py-1.5 text-sm text-white">Mueve el cursor o el dedo para recorrer la foto</p>
    </div>
  )
}
