import type { CollectionConfig } from 'payload'
import { catalogo, rolDe, tieneRol } from '../access/roles'
import { limiteSpam } from '../hooks/limiteSpam'

/**
 * Reseñas de clientes. Cualquiera puede enviar una desde la ficha de producto,
 * pero no se muestra en la tienda hasta que alguien de catálogo la aprueba.
 */
export const Reviews: CollectionConfig = {
  slug: 'resenas',
  labels: { singular: 'Reseña', plural: 'Reseñas' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'producto', 'estrellas', 'aprobada', 'createdAt'],
    group: 'Catálogo',
    description: 'Las reseñas nuevas llegan sin aprobar. Márcalas como aprobadas para que se vean en la tienda.',
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => (rolDe(req.user) ? true : { aprobada: { equals: true } }),
    create: () => true,
    update: catalogo,
    delete: catalogo,
  },
  hooks: {
    // Máx. 3 reseñas por persona y 40 en total por hora
    beforeValidate: [limiteSpam({ porIp: 3, global: 40 })],
  },
  fields: [
    { name: 'producto', type: 'relationship', relationTo: 'productos', required: true },
    {
      type: 'row',
      fields: [
        { name: 'nombre', type: 'text', required: true, maxLength: 60 },
        { name: 'ciudad', type: 'text', maxLength: 40 },
        { name: 'estrellas', type: 'number', required: true, min: 1, max: 5 },
      ],
    },
    { name: 'texto', type: 'textarea', required: true, minLength: 10, maxLength: 800 },
    {
      name: 'foto',
      label: 'Foto del cliente',
      type: 'upload',
      relationTo: 'media',
      access: { create: ({ req }) => tieneRol(req.user, 'catalogo'), update: ({ req }) => tieneRol(req.user, 'catalogo') },
      admin: { description: 'Si el cliente envía una foto por otro canal, súbela aquí.' },
    },
    {
      name: 'aprobada',
      type: 'checkbox',
      defaultValue: false,
      // Un visitante no puede auto-aprobar su reseña
      access: { create: ({ req }) => tieneRol(req.user, 'catalogo'), update: ({ req }) => tieneRol(req.user, 'catalogo') },
      admin: { position: 'sidebar' },
    },
    {
      // Código (hash) de la IP de quien envió la reseña; solo sirve para el freno anti-spam
      name: 'ipHash',
      type: 'text',
      index: true,
      access: { read: ({ req }) => tieneRol(req.user), create: () => true, update: () => false },
      admin: { hidden: true },
    },
  ],
}
