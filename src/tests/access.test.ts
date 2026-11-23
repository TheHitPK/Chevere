/**
 * Comprueba que cada rol puede hacer SOLO lo que le corresponde.
 * Requiere haber corrido `npm run seed`. Uso: npm run test:access
 */
import { getPayload, type CollectionSlug } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const usuario = async (email: string) => {
  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  return { ...docs[0], collection: 'users' as const }
}

const admin = await usuario('admin@chevere.shop')
const cat = await usuario('catalogo@chevere.shop')
const ven = await usuario('ventas@chevere.shop')
const lec = await usuario('lectura@chevere.shop')

const producto = (await payload.find({ collection: 'productos', limit: 1, draft: true })).docs[0]
const pedido = (await payload.find({ collection: 'pedidos', limit: 1 })).docs[0]
const subcat = (await payload.find({ collection: 'categorias', where: { padre: { exists: true } }, limit: 1 })).docs[0]

let ok = 0
let fallos = 0
const esperar = async (desc: string, permitido: boolean, fn: () => Promise<unknown>) => {
  let paso: boolean
  try {
    await fn()
    paso = true
  } catch {
    paso = false
  }
  const bien = paso === permitido
  bien ? ok++ : fallos++
  console.log(`${bien ? '✔' : '✘'} ${desc} → ${paso ? 'permitido' : 'denegado'}${bien ? '' : `  (se esperaba ${permitido ? 'permitido' : 'denegado'})`}`)
}

const nuevoProducto = (u: typeof cat) =>
  payload.create({
    collection: 'productos',
    user: u,
    overrideAccess: false,
    draft: true,
    data: { nombre: `Prueba ${Date.now()}`, categoria: subcat.id, precio: 10, variantes: [{ color: 'Negro', talla: 'M', sku: `T-${Date.now()}`, stock: 1 }] },
  })

const editar = (u: typeof cat, coleccion: CollectionSlug, id: number | string, data: Record<string, unknown>) =>
  payload.update({ collection: coleccion, id, data, user: u, overrideAccess: false })

console.log('\n— Catálogo —')
const creado = await nuevoProducto(cat).catch(() => null)
await esperar('Catálogo crea producto', true, async () => { if (!creado) throw new Error() })
await esperar('Catálogo despublica producto', true, () => editar(cat, 'productos', producto.id, { _status: 'draft' }))
await esperar('Catálogo publica producto', true, () => editar(cat, 'productos', producto.id, { _status: 'published' }))
await esperar('Catálogo BORRA producto', false, () => payload.delete({ collection: 'productos', id: creado!.id, user: cat, overrideAccess: false }))
await esperar('Catálogo ve pedidos', false, async () => { const r = await payload.find({ collection: 'pedidos', user: cat, overrideAccess: false }); if (!r.docs.length) throw new Error() })
await esperar('Catálogo se sube a administrador', false, async () => {
  const r = await editar(cat, 'users', cat.id, { rol: 'admin' })
  if ((r as { rol?: string }).rol !== 'admin') throw new Error()
})

console.log('\n— Ventas —')
await esperar('Ventas cambia estado del pedido', true, () => editar(ven, 'pedidos', pedido.id, { estado: 'enviado', guia: 'MRW-123' }))
await esperar('Ventas crea producto', false, () => nuevoProducto(ven))
await esperar('Ventas cambia precio', false, () => editar(ven, 'productos', producto.id, { precio: 1 }))
await esperar('Ventas borra pedido', false, () => payload.delete({ collection: 'pedidos', id: pedido.id, user: ven, overrideAccess: false }))

console.log('\n— Solo lectura —')
await esperar('Lectura ve pedidos', true, async () => { const r = await payload.find({ collection: 'pedidos', user: lec, overrideAccess: false }); if (!r.docs.length) throw new Error() })
await esperar('Lectura edita pedido', false, () => editar(lec, 'pedidos', pedido.id, { estado: 'cancelado' }))
await esperar('Lectura edita producto', false, () => editar(lec, 'productos', producto.id, { precio: 1 }))

console.log('\n— Público (sin sesión) —')
await editar(cat, 'productos', producto.id, { _status: 'draft' })
await esperar('Público ve producto despublicado', false, async () => {
  const r = await payload.find({ collection: 'productos', where: { id: { equals: producto.id } }, overrideAccess: false })
  if (!r.docs.length) throw new Error()
})
await esperar('Público lista empleados', false, async () => { const r = await payload.find({ collection: 'users', overrideAccess: false }); if (!r.docs.length) throw new Error() })

console.log('\n— Administrador —')
await esperar('Admin borra producto', true, () => payload.delete({ collection: 'productos', id: creado!.id, user: admin, overrideAccess: false }))
await esperar('Admin desactiva a un empleado', true, () => editar(admin, 'users', lec.id, { activo: false }))
await esperar('Empleado desactivado ve pedidos', false, async () => {
  const r = await payload.find({ collection: 'pedidos', user: { ...lec, activo: false }, overrideAccess: false })
  if (!r.docs.length) throw new Error()
})
await editar(admin, 'users', lec.id, { activo: true })
await esperar('Admin borra al último administrador', false, () => payload.delete({ collection: 'users', id: admin.id, user: admin, overrideAccess: false }))

const reg = await payload.find({ collection: 'registro', limit: 50 })
await esperar('Registro de cambios guarda publicar/despublicar/borrar', true, async () => {
  const acciones = new Set(reg.docs.map((d) => d.accion))
  for (const a of ['creó', 'publicó', 'despublicó', 'eliminó']) if (!acciones.has(a)) throw new Error(a)
})

console.log(`\n${ok} correctas, ${fallos} fallidas`)
process.exit(fallos ? 1 : 0)
