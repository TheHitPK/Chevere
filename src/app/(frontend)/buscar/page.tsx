import type { Metadata } from 'next'
import type { Where } from 'payload'
import { ProductCard } from '@/components/store/ProductCard'
import { SearchBox } from '@/components/store/SearchBox'
import { getProductos } from '@/lib/store'

type Props = { searchParams: Promise<{ q?: string; nuevo?: string; orden?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Resultados para “${q}”` : 'Buscar', robots: { index: false } }
}

export default async function Buscar({ searchParams }: Props) {
  const { q = '', nuevo, orden } = await searchParams
  const term = q.trim()
  const where: Where | undefined = term
    ? { or: [{ nombre: { like: term } }, { marca: { like: term } }, { 'categoria.nombre': { like: term } }, { composicion: { like: term } }] }
    : nuevo ? { nuevo: { equals: true } } : undefined
  const { productos, total } = await getProductos({ where, limit: 48, sort: orden === 'popularidad' ? '-vendidos' : '-createdAt' })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="titulo text-4xl md:text-6xl">{term ? <>Resultados para “{term}”</> : nuevo ? 'Nuevos ingresos' : orden === 'popularidad' ? 'Los más vendidos' : 'Todo el catálogo'}</h1>
      <SearchBox className="mt-6 max-w-xl md:hidden" />
      <p className="mt-3 text-ink-soft" aria-live="polite"><b className="text-ink tabular">{total}</b> {total === 1 ? 'producto' : 'productos'}</p>
      <h2 className="sr-only">Resultados</h2>
      {productos.length ? (
        <div className="stagger mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-5 lg:grid-cols-4">{productos.map((p) => <ProductCard key={p.id} p={p} quickView />)}</div>
      ) : (
        <p className="mt-8 rounded-3xl bg-surface-2 p-10 text-center text-lg">No encontramos productos para “{term}”. Prueba con otra palabra, como “jean” o “reloj”.</p>
      )}
    </div>
  )
}
