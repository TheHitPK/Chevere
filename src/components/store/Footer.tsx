import Image from 'next/image'
import Link from 'next/link'
import { getAjustes, getMenu } from '@/lib/store'

const PAGOS = ['Visa', 'Mastercard', 'PayPal', 'Zelle', 'Pago Móvil', 'Binance Pay']

export async function Footer() {
  const [menu, ajustes] = await Promise.all([getMenu(), getAjustes()])
  return (
    <footer className="bg-chevere text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Image src="/brand/logo-transparente.webp" alt="Chévere" width={600} height={451} sizes="240px" className="h-auto w-56 drop-shadow-[0_10px_18px_rgb(61_0_36/0.45)]" />
          <p className="mt-4 max-w-xs text-white/85">Moda con buena vibra para toda la familia. Mira cada prenda en 360° antes de comprarla.</p>
          <ul className="mt-5 flex gap-2" aria-label="Redes sociales">
            {[
              ['Instagram', 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5h.01'],
              ['TikTok', 'M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 5'],
              ['WhatsApp', 'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z'],
            ].map(([n, d]) => (
              <li key={n}>
                <a href="#" aria-label={n} className="grid h-11 w-11 place-items-center rounded-full bg-white/12 transition hover:-translate-y-0.5 hover:bg-sol hover:text-tinta">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d={d} /></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {[menu.slice(0, 3), menu.slice(3)].map((grupo, i) => (
          <div key={i} className="grid gap-6">
            {grupo.map((c) => (
              <div key={c.id}>
                <h2 className="font-display text-lg font-extrabold"><Link href={c.url} className="hover:text-sol">{c.nombre}</Link></h2>
                <ul className="mt-2 space-y-1 text-sm text-white/80">
                  {c.hijos.slice(0, 4).map((h) => <li key={h.id}><Link href={h.url} className="hover:text-sol hover:underline">{h.nombre}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        ))}
        <div>
          <h2 className="font-display text-lg font-extrabold">Contacto</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-white/85">
            {ajustes.whatsapp && <li>WhatsApp: <span className="select-all font-semibold">{ajustes.whatsapp}</span></li>}
            <li>Email: <span className="select-all font-semibold">hola@chevere.shop</span></li>
            <li>Lun a sáb, 9:00 a 18:00</li>
          </ul>
          <h2 className="mt-6 font-display text-lg font-extrabold">Ayuda</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-white/85">
            <li><Link href="/envios" className="hover:text-sol hover:underline">Envíos y entregas</Link></li>
            <li><Link href="/cambios" className="hover:text-sol hover:underline">Cambios y devoluciones</Link></li>
            <li><Link href="/guia-de-tallas" className="hover:text-sol hover:underline">Guía de tallas</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-white/80">
          <p>© {new Date().getFullYear()} Chévere. Todos los derechos reservados.</p>
          {ajustes.catalogo ? (
            <p className="text-xs font-semibold text-white/80">Pago en línea: muy pronto</p>
          ) : (
            <ul className="flex flex-wrap gap-2" aria-label="Métodos de pago">
              {PAGOS.map((p) => <li key={p} className="rounded-md bg-white/12 px-2.5 py-1 text-xs font-semibold text-white">{p}</li>)}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
