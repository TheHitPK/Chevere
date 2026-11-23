import { ProductCardSkeleton } from '@/components/store/ProductCard'

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando productos">
      <div className="bg-surface-2">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton mt-6 h-14 w-72 rounded-xl" />
          <div className="skeleton mt-4 h-5 w-96 max-w-full rounded" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-4 lg:block">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
      </div>
    </div>
  )
}
