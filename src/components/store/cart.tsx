'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/* Carrito y favoritos en el navegador (localStorage). El checkout los enviará al servidor. */

export type CartItem = {
  sku: string
  slug: string
  nombre: string
  color: string
  talla: string
  precio: number
  imagen?: string
  cantidad: number
  max: number
}

type Ctx = {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  setQty: (sku: string, cantidad: number) => void
  remove: (sku: string) => void
  open: boolean
  setOpen: (v: boolean) => void
  favs: string[]
  toggleFav: (slug: string) => void
}

const CartCtx = createContext<Ctx | null>(null)
export const useCart = () => {
  const c = useContext(CartCtx)
  if (!c) throw new Error('useCart fuera de CartProvider')
  return c
}

const read = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : d
  } catch {
    return d
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

export const money = (n: number) => `$${n.toFixed(2)}`

export function CartProvider({ children, catalogo = false }: { children: ReactNode; catalogo?: boolean }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [favs, setFavs] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    setItems(read('chevere:cart', []))
    setFavs(read('chevere:favs', []))
    loaded.current = true
  }, [])
  useEffect(() => { if (loaded.current) write('chevere:cart', items) }, [items])
  useEffect(() => { if (loaded.current) write('chevere:favs', favs) }, [favs])

  const add = useCallback<Ctx['add']>((item, cantidad = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.sku === item.sku)
      if (ex) return prev.map((i) => (i.sku === item.sku ? { ...i, cantidad: Math.min(i.max, i.cantidad + cantidad) } : i))
      return [...prev, { ...item, cantidad: Math.min(item.max, cantidad) }]
    })
  }, [])
  const setQty = useCallback((sku: string, cantidad: number) => {
    setItems((prev) => prev.flatMap((i) => (i.sku !== sku ? [i] : cantidad <= 0 ? [] : [{ ...i, cantidad: Math.min(i.max, cantidad) }])))
  }, [])
  const remove = useCallback((sku: string) => setItems((prev) => prev.filter((i) => i.sku !== sku)), [])
  const toggleFav = useCallback((slug: string) => setFavs((f) => (f.includes(slug) ? f.filter((x) => x !== slug) : [...f, slug])), [])

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.cantidad, 0),
      subtotal: items.reduce((s, i) => s + i.cantidad * i.precio, 0),
      add, setQty, remove, open, setOpen, favs, toggleFav,
    }),
    [items, favs, open, add, setQty, remove, toggleFav],
  )

  return (
    <CartCtx.Provider value={value}>
      {children}
      {!catalogo && <CartDrawer />}
    </CartCtx.Provider>
  )
}

/** Hace "volar" una imagen hasta el ícono del carrito. */
export function flyToCart(from: HTMLElement | null) {
  const target = document.getElementById('cart-icon')
  if (!from || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const ghost = from.cloneNode(true) as HTMLElement
  Object.assign(ghost.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: '0', zIndex: '100', pointerEvents: 'none', borderRadius: '24px', overflow: 'hidden', objectFit: 'contain',
  })
  document.body.appendChild(ghost)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy - 120}px) scale(0.45) rotate(-8deg)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0.3 },
    ],
    { duration: 850, easing: 'cubic-bezier(0.22,1,0.36,1)' },
  )
  return anim.finished.then(() => {
    ghost.remove()
    target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(0.34,1.56,0.64,1)' })
  })
}

export function CartButton() {
  const { count, setOpen } = useCart()
  return (
    <button
      type="button"
      id="cart-icon"
      onClick={() => setOpen(true)}
      aria-label={`Carrito, ${count} ${count === 1 ? 'artículo' : 'artículos'}`}
      className="boton-3d relative grid h-11 w-11 place-items-center rounded-2xl"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" />
        <path d="M9 7V6a3 3 0 0 1 6 0v1" />
      </svg>
      {count > 0 && (
        <span key={count} className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sol px-1 text-[11px] font-extrabold text-tinta tabular animate-fade-in">
          {count}
        </span>
      )}
    </button>
  )
}

export function FavButton({ slug, nombre, className = '' }: { slug: string; nombre: string; className?: string }) {
  const { favs, toggleFav } = useCart()
  const on = favs.includes(slug)
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(slug) }}
      aria-pressed={on}
      aria-label={on ? `Quitar ${nombre} de favoritos` : `Guardar ${nombre} en favoritos`}
      className={`grid h-11 w-11 place-items-center rounded-full bg-white/90 text-magenta-700 shadow-sm backdrop-blur transition hover:scale-110 active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    </button>
  )
}

export function FavCount() {
  const { favs } = useCart()
  return favs.length ? <span className="tabular">({favs.length})</span> : null
}

function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart()
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      onClick={(e) => { if (e.target === ref.current) setOpen(false) }}
      aria-label="Carrito"
      className="ml-auto mr-0 h-dvh max-h-dvh w-full max-w-md bg-card p-0 text-ink"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-2xl font-extrabold">Tu carrito</h2>
          <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Cerrar carrito">✕</button>
        </div>
        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <p className="text-lg font-semibold">Tu carrito está vacío</p>
              <p className="mt-1 text-ink-soft">Explora la colección y agrega lo que te guste.</p>
              <Link href="/c/damas" onClick={() => setOpen(false)} className="mt-5 inline-block rounded-full bg-magenta-700 px-6 py-3 font-bold text-white">Ver colección</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="border-b border-line px-5 py-3 text-sm">El envío se paga al recibir tu pedido. <a href="/envios" className="font-semibold underline underline-offset-4">Ver formas de entrega</a></p>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.sku} className="flex gap-4 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.imagen && <img src={i.imagen} alt="" className="h-24 w-20 shrink-0 rounded-xl bg-surface-2 object-contain" />}
                  <div className="min-w-0 flex-1">
                    <Link href={`/p/${i.slug}`} onClick={() => setOpen(false)} className="font-semibold hover:underline">{i.nombre}</Link>
                    <p className="text-sm text-ink-soft">{i.color} · Talla {i.talla}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button type="button" className="h-8 w-8" onClick={() => setQty(i.sku, i.cantidad - 1)} aria-label={`Quitar una unidad de ${i.nombre}`}>−</button>
                        <span className="w-6 text-center tabular" aria-live="polite">{i.cantidad}</span>
                        <button type="button" className="h-8 w-8 disabled:opacity-30" disabled={i.cantidad >= i.max} onClick={() => setQty(i.sku, i.cantidad + 1)} aria-label={`Agregar una unidad de ${i.nombre}`}>+</button>
                      </div>
                      <button type="button" onClick={() => remove(i.sku)} className="text-sm text-ink-soft underline">Quitar</button>
                    </div>
                  </div>
                  <p className="font-bold tabular">{money(i.precio * i.cantidad)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-5">
              <div className="flex justify-between text-lg"><span>Subtotal</span><b className="tabular">{money(subtotal)}</b></div>
              <p className="mt-1 text-sm text-ink-soft">Impuestos y envío se calculan al pagar.</p>
              <button type="button" disabled title="El pago se conecta en la siguiente fase" className="mt-4 w-full rounded-full bg-magenta-700 py-4 font-bold text-white opacity-60">
                Ir a pagar (próximamente)
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}
