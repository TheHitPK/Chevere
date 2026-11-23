import type { Tabla } from '@/lib/tallas'

/** Tabla de medidas. Resalta la fila de la talla elegida (letra, número o pulgadas). */
export function TablaTallas({ tabla, resaltar, titulo = true }: { tabla: Tabla; resaltar?: string | null; titulo?: boolean }) {
  const marcada = (f: string[]) => !!resaltar && f.some((v, i) => i < 3 && v.split('–').includes(resaltar))
  return (
    <figure className="min-w-0">
      {titulo && <figcaption className="mb-2 font-display text-lg font-extrabold">{tabla.titulo}</figcaption>}
      <div tabIndex={0} role="region" aria-label={`Tabla: ${tabla.titulo}`} className="overflow-x-auto rounded-2xl bg-card ring-1 ring-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-700">
        <table className="w-full min-w-[420px] text-sm tabular">
          <thead className="bg-surface-2">
            <tr>{tabla.cols.map((c) => <th key={c} scope="col" className="px-4 py-3 text-left font-bold">{c}</th>)}</tr>
          </thead>
          <tbody>
            {tabla.filas.map((f) => (
              <tr key={f.join()} className={`border-t border-line ${marcada(f) ? 'bg-sol/35 font-bold' : ''}`}>
                {f.map((v, i) => i === 0
                  ? <th key={i} scope="row" className="px-4 py-2.5 text-left font-extrabold">{v}</th>
                  : <td key={i} className="px-4 py-2.5">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tabla.nota && <p className="mt-2 text-sm text-ink-soft">{tabla.nota}</p>}
    </figure>
  )
}
