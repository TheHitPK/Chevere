import Link from 'next/link'

/**
 * Sección "desliza y gira": al bajar con el scroll la prenda da una vuelta completa
 * y el cielo pasa del amanecer a la noche. Todo con animaciones CSS ligadas al scroll
 * (sin JavaScript). En navegadores sin soporte se ve como un bloque estático que gira solo.
 */
const PASOS = [
  ['Amanecer', 'Mírala desde todos los ángulos', 'Arrastra, gira y acerca. Lo que ves es lo que llega a tu casa.'],
  ['Mediodía', 'Costuras dobles que no se deforman', 'El cuello y los bordes llevan doble pespunte para aguantar lavado tras lavado.'],
  ['Atardecer', 'Algodón peinado de 180 g/m²', 'Una tela con cuerpo, suave al tacto y que cae bien sin transparentar.'],
  ['Noche', 'Lista para el día y la noche', 'Combínala con jeans o con falda. Siempre chévere.'],
] as const

export function ScrollGiro({ slug }: { slug: string }) {
  return (
    <section className="scrollgiro relative" aria-labelledby="giro-t">
      <div className="giro-stage dia relative flex min-h-[640px] items-center overflow-hidden">
        <div className="dia-sol pointer-events-none absolute h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <div className="dia-glow absolute -inset-1/2 rounded-full" />
          <svg viewBox="0 0 100 100" className="absolute inset-[22%]"><circle cx="50" cy="50" r="40" fill="#ffc20e" /></svg>
        </div>
        <svg viewBox="0 0 100 100" className="dia-luna pointer-events-none absolute right-[8%] top-[10%] h-[14vmin] w-[14vmin]" aria-hidden="true">
          <path d="M62 18a34 34 0 1 0 20 52A28 28 0 1 1 62 18Z" fill="#fff6d8" />
        </svg>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div className="relative max-md:order-2">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--m-soft)]">Desliza hacia abajo</p>
            <h2 id="giro-t" className="mt-2 text-4xl font-extrabold md:text-6xl">Una prenda, todas las luces del día.</h2>
            <ol className="giro-pasos mt-8 grid">
              {PASOS.map(([momento, t, d], i) => (
                <li key={t} className="giro-paso" style={{ ['--i' as string]: i }}>
                  <p className="text-sm font-bold text-[var(--m-accent)]">{momento}</p>
                  <h3 className="mt-1 font-sans text-2xl font-extrabold tracking-normal">{t}</h3>
                  <p className="mt-2 max-w-sm text-[var(--m-soft)]">{d}</p>
                </li>
              ))}
            </ol>
            <Link href={`/p/${slug}`} className="dia-cta mt-8 inline-block rounded-full px-7 py-3.5 font-extrabold">Verla en 360°</Link>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] max-md:max-w-[260px]">
            <div className="dia-glow absolute inset-[-14%] rounded-full" aria-hidden="true" />
            <div className="giro-spin dia-producto relative aspect-[4/5] w-full" role="img" aria-label="La franela girando mientras bajas" />
            <div className="giro-barra mx-auto mt-4 h-1 w-40 overflow-hidden rounded-full bg-[var(--m-line)]" aria-hidden="true"><span className="block h-full origin-left bg-[var(--m-accent)]" /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
