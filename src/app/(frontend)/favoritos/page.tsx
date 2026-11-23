'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FavButton, money, useCart } from '@/components/store/cart'

type P = { slug: string; nombre: string; precio: number; precioOferta?: number; marca?: string; imagenes?: { sizes?: { tarjeta?: { url?: string } }; alt?: string }[] }

export default function Favoritos() {
  const { favs } = useCart()
  const [items, setItems] = useState<P[] | null>(null)

  useEffect(() => {
    if (!favs.length) { setItems([]); return }
    const params = new URLSearchParams({ depth: '1', limit: '100' })
    favs.forEach((s, i) => params.append(`where[slug][in][${i}]`, s))
    fetch(`/api/productos?${params}`).then((r) => r.json()).then((d) => setItems(d.docs ?? [])).catch(() => setItems([]))
  }, [favs])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">Tus favoritos</h1>
      <p className="mt-2 text-ink-soft">Se guardan en este dispositivo.</p>
      {items === null ? (
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton aspect-[4/5] rounded-3xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-surface-2 p-10 text-center">
          <p className="text-lg font-semibold">Todavía no guardaste nada</p>
          <p className="text-ink-soft">Toca el corazón en cualquier producto para guardarlo aquí.</p>
          <Link href="/" className="mt-5 inline-block rounded-full bg-magenta-700 px-6 py-3 font-bold text-white">Explorar la tienda</Link>
        </div>
      ) : (
        <ul className="stagger mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug} className="relative overflow-hidden rounded-3xl bg-card ring-1 ring-line">
              <Link href={`/p/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imagenes?.[0]?.sizes?.tarjeta?.url} alt={p.imagenes?.[0]?.alt ?? ''} className="aspect-[4/5] w-full bg-surface-2 object-cover" />
                <div className="p-4"><p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{p.marca}</p><p className="font-bold">{p.nombre}</p><p className="mt-1 font-extrabold tabular">{money(p.precioOferta ?? p.precio)}</p></div>
              </Link>
              <FavButton slug={p.slug} nombre={p.nombre} className="absolute right-3 top-3" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
