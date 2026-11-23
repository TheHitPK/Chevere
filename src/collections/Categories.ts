import type { CollectionConfig, Where } from 'payload'
import { catalogo } from '../access/roles'
import { slugField } from '../fields/slug'
import { registrar } from '../hooks/registro'

export const Categories: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoría', plural: 'Categorías' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'padre', 'orden', 'visible'],
    group: 'Catálogo',
    description: 'Categorías principales (Damas, Caballeros…) y sus subcategorías.',
  },
  access: {
    read: () => true,
    create: catalogo,
    update: catalogo,
    delete: catalogo,
  },
  defaultSort: 'orden',
  fields: [
    { name: 'nombre', type: 'text', required: true },
    slugField('nombre'),
    {
      name: 'padre',
      label: 'Categoría principal',
      type: 'relationship',
      relationTo: 'categorias',
      filterOptions: ({ id }): Where => (id ? { padre: { exists: false }, id: { not_equals: id } } : { padre: { exists: false } }),
      admin: { description: 'Déjalo vacío si esta ES una categoría principal.' },
    },
    { name: 'imagen', type: 'upload', relationTo: 'media' },
    {
      name: 'fondoBanda',
      label: 'Foto de fondo de la banda',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { tipo: { not_equals: 'frame360' } },
      admin: {
        description: 'Foto horizontal (ideal 1600 × 800 o más) para el encabezado de la categoría y su tarjeta en la portada. Las personas deben quedar hacia el centro o la derecha: a la izquierda va el título.',
        condition: (data) => !data?.padre,
      },
    },
    {
      name: 'modelos',
      label: 'Fotos de modelos para la banda',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      maxRows: 6,
      filterOptions: { tipo: { not_equals: 'frame360' } },
      admin: {
        description:
          'Entre 3 y 5 fotos verticales de personas reales. Ideal: PNG con el fondo quitado (Canva o remove.bg) para que se vean como una franja de siluetas; con fondo se muestran como tarjetas. Arrastra para ordenar.',
        condition: (data) => !data?.padre,
      },
    },
    { name: 'orden', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'visible', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const hijos = await req.payload.count({ collection: 'categorias', where: { padre: { equals: id } }, req })
        const productos = await req.payload.count({ collection: 'productos', where: { categoria: { equals: id } }, req })
        if (hijos.totalDocs || productos.totalDocs) {
          throw new Error(
            `Esta categoría tiene ${hijos.totalDocs} subcategorías y ${productos.totalDocs} productos. Muévelos antes de eliminarla, o márcala como no visible.`,
          )
        }
      },
    ],
    afterChange: [registrar('categorias', 'nombre')],
    afterDelete: [registrar('categorias', 'nombre')],
  },
}
