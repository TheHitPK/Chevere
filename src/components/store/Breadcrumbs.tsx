import Link from 'next/link'

export type Miga = { nombre: string; url?: string }

export function Breadcrumbs({ items }: { items: Miga[] }) {
  const site = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, ...(m.url ? { item: `${site}${m.url}` } : {}) })),
  }
  return (
    <nav aria-label="Ruta de navegación" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-soft">
        {items.map((m, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {m.url && i < items.length - 1 ? (
              <Link href={m.url} className="hover:text-magenta-700 hover:underline dark:hover:text-magenta-100">{m.nombre}</Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">{m.nombre}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  )
}
