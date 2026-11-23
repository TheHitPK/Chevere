import type { Metadata } from 'next'
import { PaginaInfo, TarjetaInfo } from '@/components/store/PaginaInfo'

export const metadata: Metadata = {
  title: 'Envíos y entregas',
  description: 'Chévere despacha desde Maracaibo: delivery en la ciudad, encomienda a toda Venezuela y retiro en tienda.',
}

const PASOS = [
  ['Eliges tu prenda', 'Mírala en 360°, escoge talla y color, y toca "Consultar por WhatsApp".'],
  ['Confirmamos contigo', 'Te decimos si hay disponibilidad, cómo te queda mejor recibirla y cuánto cuesta el envío.'],
  ['Despachamos', 'Sale tu pedido desde Maracaibo y te pasamos el número de guía o los datos del repartidor.'],
  ['Recibes y pagas el envío', 'El envío lo pagas tú al recibir tu paquete.'],
]

export default function Envios() {
  return (
    <PaginaInfo titulo="Envíos y entregas" mensajeWa="¡Hola Chévere! Tengo una pregunta sobre el envío."
      intro="Despachamos desde Maracaibo a toda Venezuela. Tú eliges cómo recibir tu pedido y te confirmamos el costo antes de enviarlo.">
      <section aria-labelledby="t-formas">
        <h2 id="t-formas" className="text-3xl font-extrabold">Tres formas de recibir tu pedido</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          <TarjetaInfo titulo="Delivery en Maracaibo" icono={<><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17h7l3-7h3M9 7h4l2 5" /></>}>
            <p>Nuestro repartidor te lo lleva a tu casa o trabajo.</p>
            <p>El costo depende de tu zona. Te lo confirmamos por WhatsApp antes de salir.</p>
          </TarjetaInfo>
          <TarjetaInfo titulo="Encomienda a todo el país" icono={<><rect x="2" y="7" width="13" height="10" rx="1.5" /><path d="M15 10h4l3 3v4h-7" /><circle cx="6.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></>}>
            <p>Enviamos por la empresa de encomiendas que prefieras, como MRW, Zoom o Tealca.</p>
            <p>Puedes recibirlo en tu dirección o retirarlo en la agencia más cercana.</p>
          </TarjetaInfo>
          <TarjetaInfo titulo="Retiro en tienda" icono={<><path d="M4 10l1.5-5h13L20 10M5 10v9h14v-9" /><path d="M9 19v-5h6v5" /></>}>
            <p>Pasa a buscar tu pedido en Maracaibo, sin costo de envío.</p>
            <p>Te damos la dirección y el horario al confirmar tu pedido.</p>
          </TarjetaInfo>
        </ul>
      </section>

      <section aria-labelledby="t-costo" className="rounded-bloque bg-sol/30 p-6 ring-1 ring-sol">
        <h2 id="t-costo" className="text-2xl font-extrabold">¿Quién paga el envío?</h2>
        <p className="mt-2 max-w-3xl">El envío lo paga el cliente <strong>al recibir el pedido</strong>: al repartidor en Maracaibo, o a la empresa de encomiendas en el resto del país (cobro en destino). El precio que ves en cada producto no incluye el envío.</p>
      </section>

      <section aria-labelledby="t-pasos">
        <h2 id="t-pasos" className="text-3xl font-extrabold">Cómo funciona</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-bloque bg-card p-5 ring-1 ring-line">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sol font-display text-lg font-extrabold text-tinta ring-2 ring-tinta" aria-hidden="true">{i + 1}</span>
              <div><h3 className="font-bold">{t}</h3><p className="text-ink-soft">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="t-recibir">
        <h2 id="t-recibir" className="text-3xl font-extrabold">Al recibir tu pedido</h2>
        <ul className="mt-4 grid max-w-3xl list-disc gap-2 pl-5">
          <li>Revisa que el paquete llegue cerrado y en buen estado.</li>
          <li>Pruébate la prenda con cuidado y conserva la etiqueta.</li>
          <li>Si algo no está bien, escríbenos ese mismo día con una foto. Mira cómo lo resolvemos en <a href="/cambios" className="font-semibold text-magenta-700 underline underline-offset-4 dark:text-magenta-100">Cambios y devoluciones</a>.</li>
        </ul>
      </section>
    </PaginaInfo>
  )
}
