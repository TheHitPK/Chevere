import type { CollectionConfig } from 'payload'
import { ocultarSalvo, soloAdmin, tieneRol } from '../access/roles'
import { limiteSpam } from '../hooks/limiteSpam'

/** Suscriptores del boletín. Se dan de alta desde la home; los ve ventas y administración. */
export const Subscribers: CollectionConfig = {
  slug: 'suscriptores',
  labels: { singular: 'Suscriptor', plural: 'Suscriptores' },
  admin: { useAsTitle: 'email', group: 'Ventas', defaultColumns: ['email', 'createdAt'], hidden: ocultarSalvo('ventas') },
  access: {
    read: ({ req }) => tieneRol(req.user, 'ventas'),
    create: () => true,
    update: soloAdmin,
    delete: soloAdmin,
  },
  hooks: {
    // Máx. 5 altas por persona y 100 en total por hora
    beforeValidate: [limiteSpam({ porIp: 5, global: 100 })],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    {
      // Código (hash) de la IP; solo sirve para el freno anti-spam
      name: 'ipHash',
      type: 'text',
      index: true,
      access: { read: ({ req }) => tieneRol(req.user), create: () => true, update: () => false },
      admin: { hidden: true },
    },
  ],
}
