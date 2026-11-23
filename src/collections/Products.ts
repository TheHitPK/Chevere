import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { catalogo, publicadoOEmpleado, soloAdmin } from '../access/roles'
import { slugField } from '../fields/slug'
import { registrar } from '../hooks/registro'

export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'Única'] as const

/** Ordena los frames 360° por nombre de archivo (00.jpg, 01.jpg… 71.jpg), aunque se suban desordenados. */
const ordenarFrames360: CollectionBeforeChangeHook = async ({ data, req }) => {
  const variantes = data.variantes as { frames360?: (number | string | { id: number | string })[] }[] | undefined
  if (!variantes?.length) return data
  for (const v of variantes) {
    const ids = (v.frames360 ?? []).map((f) => (typeof f === 'object' ? f.id : f))
    if (ids.length < 2) continue
    const { docs } = await req.payload.find({
      collection: 'media',
      where: { id: { in: ids } },
      limit: ids.length,
      depth: 0,
      req,
    })
    docs.sort((a, b) => String(a.filename).localeCompare(String(b.filename), undefined, { numeric: true }))
    v.frames360 = docs.map((d) => d.id)
    // Marca esas imágenes como frames para que no aparezcan en la galería de fotos
    await Promise.all(
      docs.filter((d) => d.tipo !== 'frame360').map((d) =>
        req.payload.update({ collection: 'media', id: d.id, data: { tipo: 'frame360' }, req, overrideAccess: true }),
      ),
    )
  }
  return data
}

export const Products: CollectionConfig = {
  slug: 'productos',
  labels: { singular: 'Producto', plural: 'Productos' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'categoria', 'precio', 'stockTotal', '_status', 'updatedAt'],
    group: 'Catálogo',
    listSearchableFields: ['nombre', 'marca', 'variantes.sku'],
    description:
      'Para retirar un producto de la tienda usa "Despublicar": deja de verse en la web pero se conserva para pedidos e historial.',
  },
  // Borradores = vista previa antes de publicar; historial de versiones para deshacer cambios
  versions: { drafts: { autosave: false }, maxPerDoc: 25 },
  access: {
    read: publicadoOEmpleado,
    readVersions: ({ req }) => !!req.user,
    create: catalogo,
    update: catalogo, // incluye publicar y despublicar
    delete: soloAdmin, // borrar definitivamente: solo el administrador
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'nombre', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'categoria',
                  type: 'relationship',
                  relationTo: 'categorias',
                  required: true,
                  filterOptions: { padre: { exists: true } },
                  admin: { description: 'Elige la subcategoría (ej. Damas › Jeans).', width: '50%' },
                },
                { name: 'marca', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'calce',
              label: 'Calce de la talla',
              type: 'select',
              defaultValue: 'normal',
              options: [
                { label: 'Normal: pide tu talla de siempre', value: 'normal' },
                { label: 'Talla pequeño (ej. ropa de Asia): pide una más', value: 'pequena' },
                { label: 'Talla grande: si dudas, pide la menor', value: 'grande' },
              ],
              admin: { description: 'Se muestra como aviso junto al selector de tallas en la tienda.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'precio', type: 'number', required: true, min: 0, admin: { step: 0.01, width: '33%', description: 'En USD' } },
                {
                  name: 'precioOferta',
                  label: 'Precio de oferta',
                  type: 'number',
                  min: 0,
                  admin: { step: 0.01, width: '33%' },
                  validate: (v: number | null | undefined, { siblingData }: { siblingData: { precio?: number } }) =>
                    v == null || siblingData.precio == null || v < siblingData.precio || 'Debe ser menor que el precio normal.',
                },
                { name: 'genero', label: 'Público', type: 'select', options: ['Dama', 'Caballero', 'Niño', 'Niña', 'Unisex'], admin: { width: '33%' } },
              ],
            },
            { name: 'descripcion', label: 'Descripción', type: 'richText' },
            {
              type: 'row',
              fields: [
                { name: 'composicion', label: 'Composición', type: 'text', admin: { width: '50%', placeholder: '100% algodón peinado' } },
                { name: 'cuidados', type: 'textarea', admin: { width: '50%', placeholder: 'Lavar a máquina en frío…' } },
              ],
            },
          ],
        },
        {
          label: 'Fotos',
          fields: [
            {
              name: 'imagenes',
              label: 'Fotos del producto',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              filterOptions: { tipo: { not_equals: 'frame360' } },
              admin: { description: 'La primera es la portada. Arrastra para reordenar. Incluye primeros planos de costuras y texturas.' },
            },
          ],
        },
        {
          label: 'Variantes y stock',
          fields: [
            {
              name: 'variantes',
              type: 'array',
              // Obligatoria al publicar (los borradores pueden guardarse incompletos): sin variantes la ficha pública fallaría
              required: true,
              minRows: 1,
              labels: { singular: 'Variante', plural: 'Variantes' },
              admin: {
                initCollapsed: false,
                description: 'Una fila por combinación de color y talla. Los frames 360° se cargan una sola vez por color.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'color', type: 'text', required: true, admin: { width: '25%' } },
                    { name: 'colorHex', label: 'Muestra', type: 'text', admin: { width: '15%', placeholder: '#C2007A' }, validate: (v: string | null | undefined) => !v || /^#[0-9a-f]{6}$/i.test(v) || 'Formato #RRGGBB' },
                    { name: 'talla', type: 'select', required: true, options: [...TALLAS], admin: { width: '15%' } },
                    { name: 'sku', label: 'SKU', type: 'text', required: true, admin: { width: '25%' } },
                    { name: 'stock', type: 'number', required: true, min: 0, defaultValue: 0, admin: { width: '20%' } },
                  ],
                },
                {
                  name: 'frames360',
                  label: 'Secuencia 360°',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: {
                    description:
                      'Sube 36 o 72 fotos del giro (mismo encuadre y fondo) con nombres 00, 01, 02… Se ordenan solas al guardar. Basta con cargarlas en la primera talla de cada color.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    slugField('nombre'),
    {
      name: 'stockTotal',
      label: 'Stock total',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            ((siblingData.variantes as { stock?: number }[] | undefined) ?? []).reduce((s, v) => s + (v.stock ?? 0), 0),
        ],
      },
    },
    { name: 'destacado', type: 'checkbox', admin: { position: 'sidebar', description: 'Aparece en el carrusel de la home.' } },
    { name: 'nuevo', label: 'Nuevo ingreso', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'vendidos',
      label: 'Unidades vendidas',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Se actualiza solo con los pedidos pagados. Ordena por "popularidad".' },
    },
    {
      name: 'actualizadoPor',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
      hooks: { beforeChange: [({ req, value }) => req.user?.id ?? value] },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // SKU únicos dentro del producto
        const skus = ((data?.variantes as { sku?: string }[] | undefined) ?? []).map((v) => v.sku?.trim()).filter(Boolean)
        const dup = skus.find((s, i) => skus.indexOf(s) !== i)
        if (dup) throw new Error(`El SKU "${dup}" está repetido en dos variantes.`)
        return data
      },
    ],
    beforeChange: [ordenarFrames360],
    afterChange: [registrar('productos', 'nombre')],
    afterDelete: [registrar('productos', 'nombre')],
  },
}
