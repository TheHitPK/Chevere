import type { Metadata } from 'next'
import { PaginaInfo, TarjetaInfo } from '@/components/store/PaginaInfo'

export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description: 'Si tu prenda no te quedó bien o llegó con un problema, en Chévere lo resolvemos contigo por WhatsApp.',
}

export default function Cambios() {
  return (
    <PaginaInfo titulo="Cambios y devoluciones" mensajeWa="¡Hola Chévere! Necesito ayuda con un pedido que recibí."
      intro="Queremos que quedes feliz con tu compra. Si algo no salió bien, lo conversamos contigo y buscamos juntos la mejor solución.">
      <section aria-labelledby="t-como">
        <h2 id="t-como" className="text-3xl font-extrabold">Cómo lo resolvemos</h2>
        <p className="mt-2 max-w-3xl text-ink-soft">No aplicamos una regla igual para todos: atendemos cada caso de forma personal y llegamos a un acuerdo contigo.</p>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          <TarjetaInfo titulo="1. Escríbenos" icono={<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" />}>
            <p>Cuéntanos por WhatsApp qué pasó, lo antes posible después de recibir tu pedido.</p>
          </TarjetaInfo>
          <TarjetaInfo titulo="2. Mándanos una foto" icono={<><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M8 6l1.5-2h5L16 6" /></>}>
            <p>Una foto de la prenda y de su etiqueta nos ayuda a entender el caso rápido.</p>
          </TarjetaInfo>
          <TarjetaInfo titulo="3. Acordamos la solución" icono={<path d="M4 9h13l-3-3M20 15H7l3 3" />}>
            <p>Según el caso, puede ser otra talla, otro color, otra prenda u otra salida que nos funcione a los dos.</p>
          </TarjetaInfo>
        </ol>
      </section>

      <section aria-labelledby="t-casos">
        <h2 id="t-casos" className="text-3xl font-extrabold">Casos más comunes</h2>
        <dl className="mt-5 grid max-w-3xl gap-5">
          <div><dt className="font-bold">La talla no me quedó</dt><dd className="text-ink-soft">Escríbenos y revisamos si tenemos tu talla disponible. Para acertar a la primera, usa la <a href="/guia-de-tallas" className="font-semibold text-magenta-700 underline underline-offset-4 dark:text-magenta-100">guía de tallas</a> antes de pedir.</dd></div>
          <div><dt className="font-bold">La prenda llegó con un defecto</dt><dd className="text-ink-soft">Avísanos apenas lo notes, con una foto del detalle, y lo solucionamos contigo.</dd></div>
          <div><dt className="font-bold">Me llegó un producto distinto al que pedí</dt><dd className="text-ink-soft">Fue un error nuestro: escríbenos y lo corregimos.</dd></div>
        </dl>
      </section>

      <section aria-labelledby="t-ayuda" className="rounded-bloque bg-sol/30 p-6 ring-1 ring-sol">
        <h2 id="t-ayuda" className="text-2xl font-extrabold">Para poder ayudarte mejor</h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5">
          <li>Conserva la prenda sin usar ni lavar, con su etiqueta.</li>
          <li>Guarda el empaque y el comprobante de tu compra.</li>
          <li>Escríbenos pronto: mientras antes nos avises, más opciones tenemos.</li>
        </ul>
      </section>
    </PaginaInfo>
  )
}
