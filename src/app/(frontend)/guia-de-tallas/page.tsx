import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/store/Breadcrumbs'
import { BuscaTalla } from '@/components/store/BuscaTalla'
import { TablaTallas } from '@/components/store/TablaTallas'
import { WhatsAppIcon, waLink } from '@/components/store/whatsapp'
import { getAjustes } from '@/lib/store'
import {
  CABALLEROS, CABALLEROS_JEANS, CALCE_ORIGEN, CALZADO_CABALLERO, CALZADO_DAMA, CALZADO_NINOS, DAMAS, DAMAS_JEANS, NINOS,
} from '@/lib/tallas'

export const metadata: Metadata = {
  title: 'Guía de tallas',
  description: 'Encuentra tu talla en Chévere: tablas de damas, caballeros, niños y calzado, con equivalencias entre letras, números, pulgadas y tallas US.',
}

const SECCIONES = [
  ['medirte', 'Cómo medirte'], ['mi-talla', '¿Cuál es mi talla?'], ['damas', 'Damas'], ['caballeros', 'Caballeros'],
  ['ninos', 'Niños'], ['calzado', 'Calzado'], ['procedencia', 'Según su origen'],
] as const

/** Silueta con los puntos de medida numerados. */
function Figura() {
  const linea = (y: number, x1: number, x2: number, n: number) => (
    <g key={n}>
      <path d={`M${x1} ${y} H${x2}`} stroke="#c2007a" strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
      <circle cx={x2 + 22} cy={y} r="14" fill="#ffd21f" stroke="#1d0a16" strokeWidth="2" />
      <text x={x2 + 22} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d0a16">{n}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 300 392" className="h-auto w-full max-w-[300px]" role="img" aria-label="Silueta con los puntos de medida: 1 busto o pecho, 2 cintura, 3 cadera y 4 largo del pie">
      <circle cx="120" cy="42" r="26" fill="#f3d7e6" />
      <path d="M120 72c-30 0-52 10-58 34l-14 92c-2 12 14 14 17 3l12-70 4 60-10 86h22l12-90h18l12 90h22l-10-86 4-60 12 70c3 11 19 9 17-3l-14-92c-6-24-28-34-58-34Z" fill="#f3d7e6" />
      {linea(118, 70, 170, 1)}
      {linea(158, 80, 160, 2)}
      {linea(196, 72, 168, 3)}
      <path d="M40 352c0-14 10-22 26-22h40c18 0 30 8 30 18 0 8-6 12-16 12H52c-8 0-12-3-12-8Z" fill="#f3d7e6" />
      <path d="M40 372H136" stroke="#c2007a" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 366v12M136 366v12" stroke="#c2007a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="160" cy="370" r="14" fill="#ffd21f" stroke="#1d0a16" strokeWidth="2" />
      <text x="160" y="375" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1d0a16">4</text>
    </svg>
  )
}

const PASOS = [
  ['Busto o pecho', 'Pasa la cinta por la parte más llena del pecho, bajo las axilas, sin apretar.'],
  ['Cintura', 'En la parte más estrecha del torso, un poco arriba del ombligo. Respira normal.'],
  ['Cadera', 'Con los pies juntos, por la parte más ancha de los glúteos.'],
  ['Largo del pie', 'Pisa una hoja contra la pared y marca la punta del dedo más largo. Mide del borde a la marca. Mide en la tarde: el pie está un poco más grande.'],
]

export default async function GuiaDeTallas() {
  const ajustes = await getAjustes()
  return (
    <>
      <header className="overflow-hidden bg-[linear-gradient(110deg,#fff4d1,#ffe3f2)] text-tinta isla-clara">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6">
          <Breadcrumbs items={[{ nombre: 'Inicio', url: '/' }, { nombre: 'Guía de tallas' }]} />
          <h1 className="titulo relative isolate mt-6 inline-block text-5xl md:text-7xl">
            Guía de tallas
            <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="trazo-sol absolute -bottom-3 left-0 h-4 w-[105%] md:-bottom-4 md:h-5" aria-hidden="true">
              <path d="M4 16 Q80 2 150 10 T296 8 Q292 18 240 20 Q150 24 70 21 Q20 20 4 16Z" fill="#ffd21f" />
            </svg>
          </h1>
          <p className="mt-6 max-w-2xl text-lg">Nuestra ropa llega de Estados Unidos, Asia, Panamá y Colombia, y cada lugar marca las tallas a su manera. Aquí tienes todas las equivalencias en un solo sitio.</p>
          <nav aria-label="Secciones de la guía" className="mt-6">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
              {SECCIONES.map(([id, t]) => <li key={id} className="shrink-0"><a href={`#${id}`} className="chip inline-flex h-11 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-semibold no-underline">{t}</a></li>)}
            </ul>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-12 [&>section]:scroll-mt-28">
        <section id="medirte" aria-labelledby="t-medirte" className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
          <div className="mx-auto"><Figura /></div>
          <div className="min-w-0">
            <h2 id="t-medirte" className="text-3xl font-extrabold">Cómo medirte</h2>
            <p className="mt-2 text-ink-soft">Necesitas una cinta métrica de costura. Mide sobre el cuerpo o con ropa ligera, con la cinta recta y sin apretar.</p>
            <ol className="mt-5 grid gap-3">
              {PASOS.map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sol font-extrabold text-tinta ring-2 ring-tinta" aria-hidden="true">{i + 1}</span>
                  <p><strong>{t}.</strong> {d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-2xl bg-surface-2 px-4 py-3"><strong>Si quedas entre dos tallas,</strong> elige la mayor. En jeans y pantalones guíate primero por la cintura.</p>
          </div>
        </section>

        <section id="mi-talla" aria-labelledby="t-mi-talla">
          <h2 id="t-mi-talla" className="text-3xl font-extrabold">¿Cuál es mi talla?</h2>
          <p className="mb-5 mt-2 text-ink-soft">Escribe tus medidas en centímetros y te decimos tu talla al instante.</p>
          <BuscaTalla />
        </section>

        <section id="damas" aria-labelledby="t-damas" className="grid gap-8">
          <h2 id="t-damas" className="text-3xl font-extrabold">Damas</h2>
          <TablaTallas tabla={DAMAS} />
          <TablaTallas tabla={DAMAS_JEANS} />
        </section>

        <section id="caballeros" aria-labelledby="t-caballeros" className="grid gap-8">
          <h2 id="t-caballeros" className="text-3xl font-extrabold">Caballeros</h2>
          <TablaTallas tabla={CABALLEROS} />
          <TablaTallas tabla={CABALLEROS_JEANS} />
        </section>

        <section id="ninos" aria-labelledby="t-ninos" className="grid gap-8">
          <h2 id="t-ninos" className="text-3xl font-extrabold">Niños y niñas</h2>
          <TablaTallas tabla={NINOS} titulo={false} />
        </section>

        <section id="calzado" aria-labelledby="t-calzado" className="grid gap-8">
          <div>
            <h2 id="t-calzado" className="text-3xl font-extrabold">Calzado</h2>
            <p className="mt-2 text-ink-soft">En Venezuela usamos la numeración europea (35, 36, 37…). Si conoces tu talla americana, búscala en la segunda columna.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <TablaTallas tabla={CALZADO_DAMA} />
            <TablaTallas tabla={CALZADO_CABALLERO} />
            <TablaTallas tabla={CALZADO_NINOS} />
          </div>
        </section>

        <section id="procedencia" aria-labelledby="t-procedencia">
          <h2 id="t-procedencia" className="text-3xl font-extrabold">Cómo calza según su origen</h2>
          <p className="mt-2 text-ink-soft">En cada producto te avisamos si talla pequeño o grande.</p>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {CALCE_ORIGEN.map((c) => (
              <li key={c.origen} className="rounded-bloque bg-card p-5 ring-1 ring-line">
                <p className="font-display text-xl font-extrabold">{c.origen}</p>
                <p className="mt-1">{c.consejo}</p>
              </li>
            ))}
          </ul>
        </section>

        {ajustes.whatsapp && (
          <section aria-label="Ayuda con tu talla" className="flex flex-wrap items-center justify-between gap-4 rounded-bloque bg-[linear-gradient(110deg,#fff4d1,#ffe3f2)] p-6 text-tinta isla-clara">
            <div>
              <p className="font-display text-2xl font-extrabold">¿Sigues con dudas?</p>
              <p>Dinos tus medidas y la prenda que te gusta, y te confirmamos la talla.</p>
            </div>
            <a href={waLink(ajustes.whatsapp, '¡Hola Chévere! Necesito ayuda con mi talla.')} target="_blank" rel="noopener noreferrer"
               className="wa-3d flex h-12 items-center gap-2 rounded-2xl px-5 font-extrabold">
              <WhatsAppIcon className="h-5 w-5" /> Preguntar por WhatsApp
            </a>
          </section>
        )}
      </div>
    </>
  )
}
