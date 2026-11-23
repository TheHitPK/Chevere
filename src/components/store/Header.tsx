import Image from 'next/image'
import Link from 'next/link'
import { getAjustes, getMenu } from '@/lib/store'
import { WhatsAppIcon, waLink } from './whatsapp'
import { CartButton, FavCount } from './cart'
import { PausarAnimaciones } from './PausarAnimaciones'
import { SearchBox } from './SearchBox'
import { ThemeToggle } from './ThemeToggle'
import { IconoMenu, claveMenu, tonoMenu } from './IconoMenu'

/**
 * Encabezado en dos barras moradas con relieve 3D:
 *  1) Franja de avisos: los mensajes rotan girando como un cubo (solo CSS).
 *  2) Barra de navegación flotante tipo "losa": grosor visible, bisel de luz,
 *     buscador hundido y botones en relieve que se presionan al hacer clic.
 */
export async function Header() {
  const [menu, ajustes] = await Promise.all([getMenu(), getAjustes()])
  const avisos = ajustes.catalogo
    ? ['Compra en línea muy pronto', 'Pide por WhatsApp y te atendemos', 'Mira cada prenda en 360°', 'Enviamos a toda Venezuela']
    : ['Enviamos a toda Venezuela', 'Mira cada prenda en 360°', 'Atención personalizada', 'Pago seguro con tarjeta o PayPal']

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[60] focus:rounded-full focus:bg-sol focus:px-4 focus:py-2 focus:text-tinta">Saltar al contenido</a>

      {/* ---------- Franja de avisos ---------- */}
      <div className="barra-3d barra-avisos relative overflow-hidden text-white" role="region" aria-label="Avisos">
        <div className="aviso-cubo mx-auto h-[38px] max-w-7xl pl-4 pr-12 sm:px-48">
          {avisos.map((a, i) => (
            <p key={a} className="aviso-cara flex items-center justify-center gap-2 whitespace-nowrap text-[12.5px] font-bold tracking-wide sm:text-[13px]" style={{ ['--i' as string]: i }} aria-hidden={i > 0}>
              <span className="text-sol max-sm:hidden" aria-hidden="true">✦</span><span className="truncate">{a}</span><span className="text-sol max-sm:hidden" aria-hidden="true">✦</span>
            </p>
          ))}
        </div>
        <PausarAnimaciones />
      </div>

      {/* ---------- Barra de navegación flotante ---------- */}
      <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4">
        <div className="losa-3d relative mx-auto flex max-w-7xl items-center gap-2 rounded-tarjeta px-3 py-2 text-white lg:gap-5 lg:px-5">
          {/* Menú desplegable vertical (escritorio y celular) */}
          <details className="group/menu">
            <summary className="boton-3d flex h-11 cursor-pointer list-none items-center gap-2 rounded-2xl px-3 text-sm font-extrabold [&::-webkit-details-marker]:hidden" aria-label="Abrir menú de categorías">
              <svg viewBox="0 0 24 24" className="h-6 w-6 group-open/menu:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
              <svg viewBox="0 0 24 24" className="hidden h-6 w-6 group-open/menu:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              <span className="max-sm:hidden">Menú</span>
            </summary>
            <nav aria-label="Categorías" className="absolute inset-x-0 top-full z-50 mt-3 max-h-[80dvh] overflow-y-auto rounded-[1.75rem] border border-line bg-card p-3 text-ink shadow-2xl lg:inset-x-auto lg:left-0 lg:w-[420px]">
              <ul className="flex flex-col gap-2">
                {menu.map((c, i) => {
                  const clave = claveMenu(c.nombre, c.slug)
                  return (
                    <li key={c.id}>
                      <details className="filter group/cat rounded-[1.25rem] bg-[var(--tono)] shadow-[0_4px_0_rgb(74_0_43/0.85)] transition-transform duration-300 open:-translate-y-0.5" style={{ ['--tono' as string]: tonoMenu(clave, i) }}>
                        <summary className="flex cursor-pointer list-none items-center gap-3.5 p-2 pr-3 [&::-webkit-details-marker]:hidden">
                          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-white shadow-[0_4px_10px_rgb(29_10_22/0.14),0_0_0_1px_rgb(29_10_22/0.06)]">
                            <IconoMenu clave={clave} />
                          </span>
                          <span className="rotulo-menu flex-1">{c.nombre}</span>
                          <span className="chev grid h-[30px] w-[30px] place-items-center rounded-full bg-white text-magenta-900 shadow-sm" aria-hidden="true">⌄</span>
                        </summary>
                        <ul className="body grid grid-cols-2 gap-1.5 px-3 pb-3">
                          <li><Link href={c.url} className="block rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-magenta-700">Ver todo</Link></li>
                          {c.hijos.map((h) => <li key={h.id}><Link href={h.url} className="block rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-tinta hover:bg-magenta-100">{h.nombre}</Link></li>)}
                        </ul>
                      </details>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-line px-2 pt-3 sm:hidden">
                <span className="font-semibold">Modo claro / oscuro</span>
                <span className="rounded-2xl bg-[#7a0047] text-white"><ThemeToggle /></span>
              </div>
            </nav>
          </details>

          {/* Logo real, sin fondo, como sello que sobresale de la barra (se compacta al hacer scroll) */}
          <Link href="/" className="logo-barra group/logo relative -my-4 block shrink-0" aria-label="Chévere, inicio">
            <Image src="/brand/logo-transparente-320.webp" alt="" width={320} height={241} priority sizes="120px"
                   className="h-[60px] w-auto transition duration-500 group-hover/logo:-rotate-3 group-hover/logo:scale-105 sm:h-[78px]" />
          </Link>

          <SearchBox variante="oscuro" className="ml-auto w-full max-w-xs max-md:hidden" />

          <div className="flex items-center gap-1 max-md:ml-auto">
            <Link href="/buscar" className="boton-3d grid h-11 w-11 place-items-center rounded-2xl md:hidden" aria-label="Buscar">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </Link>
            <span className="max-sm:hidden"><ThemeToggle /></span>
            <Link href="/favoritos" className="boton-3d flex h-11 min-w-11 items-center justify-center gap-1 rounded-2xl px-2.5 text-sm" aria-label="Favoritos">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
              <FavCount />
            </Link>
            {ajustes.catalogo ? (
              ajustes.whatsapp && (
                <a href={waLink(ajustes.whatsapp, '¡Hola Chévere! Quiero hacer una consulta.')} target="_blank" rel="noopener noreferrer"
                   className="wa-3d ml-1 flex h-11 items-center gap-2 rounded-2xl px-3.5 text-sm font-extrabold" aria-label="Escríbenos por WhatsApp">
                  <WhatsAppIcon className="h-5 w-5" /><span className="max-sm:hidden">WhatsApp</span>
                </a>
              )
            ) : <CartButton />}
          </div>
        </div>
      </header>
    </>
  )
}
