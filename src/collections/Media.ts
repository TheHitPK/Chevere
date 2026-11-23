import type { CollectionConfig } from 'payload'
import sharp from 'sharp'
import { catalogo, ocultarSalvo } from '../access/roles'

/**
 * Fotos de producto y frames 360°.
 * Cualquier JPG/PNG/WebP subido se convierte a WebP y se generan tamaños para web.
 * Para una secuencia 360°: seleccionar las 36/72 fotos a la vez en "Subida múltiple".
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    group: 'Catálogo',
    hidden: ocultarSalvo('catalogo'),
    defaultColumns: ['filename', 'alt', 'tipo', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: catalogo,
    update: catalogo,
    delete: catalogo,
  },
  upload: {
    // En Railway, MEDIA_DIR apunta al volumen (p. ej. /data/media) para que las fotos sobrevivan a los despliegues.
    // Sin MEDIA_DIR se usa la carpeta media/ del proyecto (local). Con R2 activo este valor no se usa.
    ...(process.env.MEDIA_DIR ? { staticDir: process.env.MEDIA_DIR } : {}),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'miniatura', width: 160, height: 200, fit: 'cover', formatOptions: { format: 'webp' } },
      { name: 'tarjeta', width: 600, height: 750, fit: 'cover', formatOptions: { format: 'webp' } },
      // Versión ultraligera para el "poster" del visor 360° (LCP)
      { name: 'poster', width: 480, height: 600, fit: 'inside', formatOptions: { format: 'webp', options: { quality: 60 } } },
    ],
    adminThumbnail: 'miniatura',
    focalPoint: true,
  },
  hooks: {
    beforeChange: [
      // Detecta si la imagen tiene zonas transparentes (foto con el fondo quitado)
      async ({ data, req }) => {
        const buf = req.file?.data
        if (!buf) return data
        try {
          const img = sharp(buf)
          const meta = await img.metadata()
          if (meta.hasAlpha) {
            const stats = await img.stats()
            data.transparente = (stats.channels[3]?.min ?? 255) < 200
          } else data.transparente = false
        } catch {}
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      admin: { description: 'Describe la imagen para personas con lector de pantalla. Ej.: "Costura doble del cuello".' },
      hooks: {
        // En subidas masivas de 360° no obligamos a escribir 72 descripciones
        beforeValidate: [({ value, data }) => value || (data?.filename ? String(data.filename).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') : value)],
      },
    },
    {
      name: 'transparente',
      label: 'Fondo transparente',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true, description: 'Se detecta al subir. Las fotos sin fondo se muestran como siluetas.' },
    },
    {
      name: 'tipo',
      type: 'select',
      defaultValue: 'foto',
      options: [
        { label: 'Foto', value: 'foto' },
        { label: 'Frame 360°', value: 'frame360' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
