import type { TextField } from 'payload'

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Slug para la URL, generado a partir de otro campo si se deja vacío. */
export const slugField = (desde: string): TextField => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Dirección en la web. Se genera solo a partir del nombre.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const base = data?.[desde]
        return typeof base === 'string' ? slugify(base) : value
      },
    ],
  },
})
