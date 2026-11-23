import type { CollectionConfig } from 'payload'
import { ocultarSalvo, soloAdmin, tieneRol, ventas } from '../access/roles'
import { registrar } from '../hooks/registro'

export const ESTADOS = [
  { label: 'Pendiente de pago', value: 'pendiente' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Preparando', value: 'preparando' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
] as const

export const Orders: CollectionConfig = {
  slug: 'pedidos',
  labels: { singular: 'Pedido', plural: 'Pedidos' },
  admin: {
    useAsTitle: 'numero',
    defaultColumns: ['numero', 'clienteNombre', 'total', 'estado', 'createdAt'],
    group: 'Ventas',
    hidden: ocultarSalvo('ventas', 'lectura'),
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => tieneRol(req.user, 'ventas', 'lectura'),
    // Los pedidos los crea el checkout (servidor, con overrideAccess); a mano solo el admin
    create: soloAdmin,
    update: ventas,
    delete: soloAdmin,
  },
  fields: [
    { name: 'numero', label: 'N.º de pedido', type: 'text', unique: true, admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      options: [...ESTADOS],
      admin: { position: 'sidebar' },
    },
    { name: 'guia', label: 'N.º de guía de envío', type: 'text', admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Cliente',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'clienteNombre', label: 'Nombre', type: 'text', required: true },
            { name: 'clienteEmail', label: 'Email', type: 'email', required: true },
            { name: 'clienteTelefono', label: 'Teléfono', type: 'text' },
          ],
        },
        { name: 'direccion', label: 'Dirección de envío', type: 'textarea' },
      ],
    },
    {
      name: 'items',
      label: 'Artículos',
      type: 'array',
      minRows: 1,
      // Lo comprado no se modifica después del pago
      access: { update: ({ req }) => tieneRol(req.user) },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'producto', type: 'relationship', relationTo: 'productos', required: true },
            { name: 'sku', label: 'SKU', type: 'text', required: true },
            { name: 'cantidad', type: 'number', required: true, min: 1, defaultValue: 1 },
            { name: 'precioUnitario', type: 'number', required: true, min: 0 },
          ],
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      admin: { readOnly: true },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            const items = siblingData.items as { cantidad?: number; precioUnitario?: number }[] | undefined
            if (!items) return value
            return Math.round(items.reduce((s, i) => s + (i.cantidad ?? 0) * (i.precioUnitario ?? 0), 0) * 100) / 100
          },
        ],
      },
    },
    { name: 'notas', label: 'Notas internas', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data.numero) {
          const { totalDocs } = await req.payload.count({ collection: 'pedidos', req })
          data.numero = `CH-${String(totalDocs + 1001)}`
        }
        return data
      },
    ],
    afterChange: [
      // Al pasar a "Pagado" se descuenta el stock de cada talla y se suma a "vendidos" (orden por popularidad).
      // Si luego se cancela, se devuelve.
      async ({ doc, previousDoc, req, operation }) => {
        const antes = operation === 'create' ? 'pendiente' : previousDoc?.estado
        const pagadoAhora = doc.estado === 'pagado' && !['pagado', 'preparando', 'enviado', 'entregado'].includes(antes)
        const cancelado = doc.estado === 'cancelado' && ['pagado', 'preparando', 'enviado'].includes(antes)
        if (!pagadoAhora && !cancelado) return doc
        const signo = pagadoAhora ? -1 : 1
        for (const item of (doc.items ?? []) as { producto: number | { id: number }; sku: string; cantidad: number }[]) {
          const id = typeof item.producto === 'object' ? item.producto.id : item.producto
          const p = await req.payload.findByID({ collection: 'productos', id, depth: 0, draft: true, req, overrideAccess: true })
          const variantes = (p.variantes ?? []).map((v) =>
            v.sku === item.sku ? { ...v, stock: Math.max(0, (v.stock ?? 0) + signo * item.cantidad) } : v,
          )
          await req.payload.update({
            collection: 'productos',
            id,
            data: { variantes, vendidos: Math.max(0, (p.vendidos ?? 0) - signo * item.cantidad) },
            req,
            overrideAccess: true,
            context: { sinRegistro: true },
          })
        }
        return doc
      },
      registrar('pedidos', 'numero'),
    ],
    afterDelete: [registrar('pedidos', 'numero')],
  },
}
