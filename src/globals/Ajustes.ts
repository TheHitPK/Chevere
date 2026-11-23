import type { GlobalConfig } from 'payload'
import { soloAdmin } from '../access/roles'

/**
 * Ajustes generales de la tienda. Solo el administrador los cambia.
 * "Modo catálogo": la tienda muestra productos y precios, sin carrito ni pago;
 * el cliente consulta por WhatsApp. Se apaga cuando el pago en línea esté listo.
 */
export const Ajustes: GlobalConfig = {
  slug: 'ajustes',
  label: 'Ajustes de la tienda',
  admin: { group: 'Configuración' },
  access: { read: () => true, update: soloAdmin },
  fields: [
    {
      name: 'modoCatalogo',
      label: 'Modo catálogo (sin pago en línea)',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Activado: se ocultan el carrito y el pago, y cada producto tiene el botón "Consultar por WhatsApp". Desactívalo cuando el pago en línea esté listo.' },
    },
    {
      name: 'whatsapp',
      label: 'Número de WhatsApp',
      type: 'text',
      defaultValue: '+58 412 000 0000',
      admin: { description: 'Con código de país, por ejemplo +58 412 123 4567. Aparece en el botón de consulta y en el pie de página.' },
      validate: (v: string | null | undefined) => !v || /^\+?[\d\s()-]{8,20}$/.test(v) || 'Escribe solo el número, con el código de país (+58…).',
    },
    {
      name: 'mensajeCatalogo',
      label: 'Aviso para los clientes',
      type: 'text',
      defaultValue: 'Muy pronto podrás comprar en línea. Mientras tanto, escríbenos por WhatsApp y te atendemos.',
    },
  ],
}
