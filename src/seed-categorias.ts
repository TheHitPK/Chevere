/**
 * Seed de PRODUCCIÓN: crea solo el árbol de categorías (Damas, Caballeros, Niños, Accesorios, Calzado
 * y sus subcategorías). No crea empleados, ni productos de muestra, ni contraseñas.
 *
 * Es seguro ejecutarlo muchas veces: si ya existe alguna categoría, no hace nada.
 * Corre solo en cada despliegue de Vercel (script `vercel-build`).
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import { ARBOL } from './lib/arbol-categorias'

const payload = await getPayload({ config })

if ((await payload.count({ collection: 'categorias' })).totalDocs > 0) {
  payload.logger.info('Las categorías ya existen; no se crea nada.')
  process.exit(0)
}

let orden = 0
for (const [principal, subs] of Object.entries(ARBOL)) {
  const padre = await payload.create({ collection: 'categorias', data: { nombre: principal, orden: orden++ } })
  let o = 0
  for (const sub of subs) {
    await payload.create({
      collection: 'categorias',
      data: { nombre: sub, slug: `${padre.slug}-${sub}`, padre: padre.id, orden: o++ },
    })
  }
}
payload.logger.info('Categorías creadas. Las fotos de portada se suben después desde el panel.')
process.exit(0)
