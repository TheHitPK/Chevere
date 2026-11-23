/**
 * Carga inicial: árbol de categorías, empleados, catálogo de MUESTRA con fotos y 360°,
 * reseñas y pedidos de ejemplo. Uso:  npm run seed   (solo actúa si la base está vacía)
 * Las imágenes de muestra se generan al vuelo; se reemplazan por fotos reales desde el panel.
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import type { Producto } from './payload-types'
import { categoriaWebp, detalleWebp, frameWebp, type Forma } from './demo/generar'
import { ARBOL } from './lib/arbol-categorias'


const PORTADAS: Record<string, Parameters<typeof categoriaWebp>> = {
  Damas: ['#f6c1d6', '#e8a0bf', [
    { forma: 'vestido', base: '#FF6F61', acento: '#FFD21F', x: 300, y: 520, s: 1.5, r: -6 },
    { forma: 'franela', base: '#C2007A', acento: '#FFD21F', x: 560, y: 600, s: 1.1, r: 8 },
  ]],
  Caballeros: ['#f4f5f8', '#dde2ea', [
    { forma: 'camisa', base: '#E9DFCB', acento: '#7FA7C9', x: 330, y: 500, s: 1.45, r: -4 },
    { forma: 'pantalon', base: '#26324A', acento: '#e8b04a', x: 570, y: 640, s: 1.05, r: 6 },
  ]],
  'Niños / Niñas': ['#5fd8e0', '#00b8c4', [
    { forma: 'franela', base: '#FFA400', acento: '#C2007A', x: 290, y: 540, s: 1.25, r: -10 },
    { forma: 'gorra', base: '#C2007A', acento: '#FFD21F', x: 560, y: 380, s: 1.0, r: 12 },
    { forma: 'franela', base: '#8E7CC3', acento: '#FFD21F', x: 560, y: 720, s: 0.9, r: 10 },
  ]],
  Accesorios: ['#f2dc96', '#c9a227', [
    { forma: 'reloj', base: '#C9A227', acento: '#5a3b1e', x: 300, y: 500, s: 1.3, r: -12 },
    { forma: 'gafas', base: '#1d0a16', acento: '#7a0047', x: 560, y: 700, s: 1.0, r: 8 },
  ]],
  Calzado: ['#ffd27a', '#ffa400', [
    { forma: 'zapatilla', base: '#F5F5F5', acento: '#C2007A', x: 400, y: 420, s: 1.6, r: -8 },
    { forma: 'sandalia', base: '#e3c9a8', acento: '#C2007A', x: 420, y: 720, s: 1.3, r: 4 },
  ]],
}

type Demo = {
  nombre: string; cat: string; forma: Forma; precio: number; oferta?: number; marca: string; genero: string
  colores: { color: string; hex: string; acento: string }[]; tallas: string[]; con360: boolean
  composicion: string; cuidados: string; descripcion: string; destacado?: boolean; nuevo?: boolean
}

const ROPA = ['XS', 'S', 'M', 'L', 'XL']
const LAVADO = 'Lavar a máquina en frío, del revés. No usar cloro. Planchar a temperatura media.'

const PRODUCTOS: Demo[] = [
  { nombre: 'Franela Sol Oversize', cat: 'Damas/Franelas / camisetas', forma: 'franela', precio: 24.9, marca: 'Chévere', genero: 'Dama', colores: [{ color: 'Magenta', hex: '#C2007A', acento: '#FFD21F' }, { color: 'Sol', hex: '#FFD21F', acento: '#C2007A' }], tallas: ROPA, con360: true, composicion: '100% algodón peinado, 180 g/m²', cuidados: LAVADO, descripcion: 'Corte holgado y hombro caído, con el sol de Chévere estampado en serigrafía. Cuello con doble costura que no se deforma.', destacado: true, nuevo: true },
  { nombre: 'Vestido Brisa Caribe', cat: 'Damas/Vestidos', forma: 'vestido', precio: 44.9, oferta: 36.9, marca: 'Chévere', genero: 'Dama', colores: [{ color: 'Coral', hex: '#FF6F61', acento: '#FFD21F' }, { color: 'Turquesa', hex: '#00B8C4', acento: '#FFFFFF' }], tallas: ROPA, con360: true, composicion: '100% viscosa', cuidados: 'Lavar a mano en agua fría. Secar a la sombra.', descripcion: 'Vestido largo y fresco con lazo en la cintura y estampado floral. Ideal para el calor.', destacado: true, nuevo: true },
  { nombre: 'Jean Mom Tiro Alto', cat: 'Damas/Jeans', forma: 'pantalon', precio: 39.9, marca: 'Denim Co.', genero: 'Dama', colores: [{ color: 'Azul medio', hex: '#3B5B8C', acento: '#e8b04a' }], tallas: ROPA, con360: true, composicion: '99% algodón, 1% elastano. Denim de 12 oz', cuidados: LAVADO, descripcion: 'Tiro alto, pierna recta y costuras contrastadas en hilo mostaza. Botón metálico.', destacado: true },
  { nombre: 'Camisa Lino Ávila', cat: 'Caballeros/Camisas', forma: 'camisa', precio: 34.5, marca: 'Chévere', genero: 'Caballero', colores: [{ color: 'Arena', hex: '#E9DFCB', acento: '#7FA7C9' }, { color: 'Celeste', hex: '#7FA7C9', acento: '#E9DFCB' }], tallas: ['S', 'M', 'L', 'XL', 'XXL'], con360: true, composicion: '55% lino, 45% algodón', cuidados: 'Lavar en frío. Planchar húmeda.', descripcion: 'Camisa manga larga en lino transpirable, con bolsillo al pecho y botones de nácar.', destacado: true, nuevo: true },
  { nombre: 'Franela Básica Pro', cat: 'Caballeros/Franelas / camisetas', forma: 'franela', precio: 18.9, marca: 'Chévere', genero: 'Caballero', colores: [{ color: 'Negro', hex: '#1D1D1F', acento: '#FFD21F' }, { color: 'Blanco', hex: '#F5F5F5', acento: '#C2007A' }], tallas: ['S', 'M', 'L', 'XL', 'XXL'], con360: true, composicion: '100% algodón peinado', cuidados: LAVADO, descripcion: 'La básica que no falla: tela gruesa, cuello reforzado y estampado pequeño en el pecho.', nuevo: true },
  { nombre: 'Jean Slim Oscuro', cat: 'Caballeros/Jeans', forma: 'pantalon', precio: 42, marca: 'Denim Co.', genero: 'Caballero', colores: [{ color: 'Índigo', hex: '#26324A', acento: '#e8b04a' }], tallas: ['S', 'M', 'L', 'XL'], con360: false, composicion: '98% algodón, 2% elastano', cuidados: LAVADO, descripcion: 'Corte slim con un toque de elasticidad para moverte cómodo todo el día.' },
  { nombre: 'Conjunto Playa Kids', cat: 'Niños / Niñas/Conjuntos', forma: 'franela', precio: 22, marca: 'Chévere Kids', genero: 'Unisex', colores: [{ color: 'Naranja', hex: '#FFA400', acento: '#C2007A' }, { color: 'Turquesa', hex: '#00B8C4', acento: '#FFD21F' }], tallas: ['2', '4', '6', '8', '10'], con360: true, composicion: '100% algodón', cuidados: LAVADO, descripcion: 'Franela y short a juego para días de playa. Telas suaves que no irritan.', destacado: true, nuevo: true },
  { nombre: 'Pijama Estrellitas', cat: 'Niños / Niñas/Pijamas', forma: 'franela', precio: 19.5, marca: 'Chévere Kids', genero: 'Unisex', colores: [{ color: 'Lila', hex: '#8E7CC3', acento: '#FFD21F' }], tallas: ['2', '4', '6', '8'], con360: false, composicion: '100% algodón interlock', cuidados: LAVADO, descripcion: 'Pijama de dos piezas, tela suave y elástico cómodo en la cintura.' },
  { nombre: 'Reloj Brisa Analógico', cat: 'Accesorios/Relojes analógicos', forma: 'reloj', precio: 59, marca: 'Brisa', genero: 'Unisex', colores: [{ color: 'Dorado', hex: '#C9A227', acento: '#5a3b1e' }], tallas: ['Única'], con360: true, composicion: 'Caja de acero 316L de 40 mm, correa de cuero', cuidados: 'Resistente a salpicaduras (3 ATM). No sumergir.', descripcion: 'Esfera limpia con índices marcados y segundero magenta. Correa de cuero intercambiable.', destacado: true },
  { nombre: 'Reloj Pulso Digital', cat: 'Accesorios/Relojes digitales', forma: 'reloj-digital', precio: 32, marca: 'Pulso', genero: 'Unisex', colores: [{ color: 'Negro', hex: '#2a2a2e', acento: '#1d1d1f' }], tallas: ['Única'], con360: true, composicion: 'Caja de resina, correa de silicona', cuidados: 'Resistente al agua 5 ATM.', descripcion: 'Cronómetro, alarma y luz. Pantalla de alto contraste que se lee al sol.', nuevo: true },
  { nombre: 'Gafas Sol Caribe', cat: 'Accesorios/Gafas de sol', forma: 'gafas', precio: 27, marca: 'Brisa', genero: 'Unisex', colores: [{ color: 'Negro / magenta', hex: '#1d0a16', acento: '#7a0047' }], tallas: ['Única'], con360: false, composicion: 'Montura de acetato, lentes polarizados UV400', cuidados: 'Limpiar con paño de microfibra.', descripcion: 'Montura cuadrada de acetato con lentes polarizados con filtro UV400.' },
  { nombre: 'Gorra Chévere', cat: 'Accesorios/Gorras', forma: 'gorra', precio: 16, marca: 'Chévere', genero: 'Unisex', colores: [{ color: 'Negro', hex: '#1d0a16', acento: '#FFD21F' }], tallas: ['Única'], con360: false, composicion: '100% algodón twill', cuidados: 'Lavar a mano.', descripcion: 'Gorra de seis paneles con el sol bordado y cierre ajustable.', nuevo: true },
  { nombre: 'Zapatilla Ávila Run', cat: 'Calzado/Deportivo', forma: 'zapatilla', precio: 64.9, oferta: 54.9, marca: 'Ávila', genero: 'Unisex', colores: [{ color: 'Blanco / magenta', hex: '#F5F5F5', acento: '#C2007A' }, { color: 'Negro / sol', hex: '#2a2a2e', acento: '#FFD21F' }], tallas: ['36', '37', '38', '39', '40', '41', '42', '43'], con360: true, composicion: 'Capellada de malla transpirable, suela de EVA', cuidados: 'Limpiar con paño húmedo. No meter en lavadora.', descripcion: 'Zapatilla liviana con amortiguación en el talón y malla que deja respirar el pie.', destacado: true, nuevo: true },
  { nombre: 'Sandalia Costa', cat: 'Calzado/Dama', forma: 'sandalia', precio: 29.9, marca: 'Ávila', genero: 'Dama', colores: [{ color: 'Natural', hex: '#e3c9a8', acento: '#C2007A' }], tallas: ['35', '36', '37', '38', '39', '40'], con360: false, composicion: 'Tiras de cuero sintético, plantilla acolchada', cuidados: 'Limpiar con paño húmedo.', descripcion: 'Sandalia plana con plantilla acolchada para caminar todo el día.' },
]

const RESENAS = [
  { p: 'Franela Sol Oversize', nombre: 'Andreína P.', ciudad: 'Caracas', estrellas: 5, texto: 'La tela es gruesa y el estampado no se ha caído después de varios lavados. Verla en 360° me ayudó a decidirme por la talla.' },
  { p: 'Vestido Brisa Caribe', nombre: 'Carla M.', ciudad: 'Valencia', estrellas: 5, texto: 'Fresco y cae precioso. El color coral es igual al de las fotos, eso me encantó.' },
  { p: 'Zapatilla Ávila Run', nombre: 'Luis R.', ciudad: 'Maracaibo', estrellas: 4, texto: 'Muy livianas y cómodas para caminar. Pedí media talla más y quedaron perfectas.' },
  { p: 'Reloj Brisa Analógico', nombre: 'Pedro S.', ciudad: 'Barquisimeto', estrellas: 5, texto: 'Se ve mucho más caro de lo que cuesta. La correa de cuero es suave desde el primer día.' },
  { p: 'Conjunto Playa Kids', nombre: 'Mariela G.', ciudad: 'Puerto La Cruz', estrellas: 5, texto: 'A mi hijo le encantó, la tela es suave y aguanta el agua salada sin desteñirse.' },
  { p: 'Camisa Lino Ávila', nombre: 'Javier T.', ciudad: 'Mérida', estrellas: 4, texto: 'Buena calidad de lino, se arruga lo normal. El color arena combina con todo.' },
  { p: 'Jean Mom Tiro Alto', nombre: 'Daniela V.', ciudad: 'Caracas', estrellas: 5, texto: 'Por fin un jean de tiro alto que no aprieta. Las costuras mostaza le dan un toque bonito.' },
]

const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(m)

if ((await payload.count({ collection: 'users' })).totalDocs > 0) {
  log('La base ya tiene datos; no se vuelve a sembrar. Borra chevere.db para empezar de cero.')
  process.exit(0)
}

const subir = async (data: Buffer, name: string, alt: string, tipo: 'foto' | 'frame360' = 'foto') =>
  (await payload.create({
    collection: 'media',
    data: { alt, tipo },
    file: { data, mimetype: 'image/webp', name, size: data.length },
    context: { sinRegistro: true },
  })).id

/** Ejecuta tareas con concurrencia limitada (para no saturar el disco). */
async function enLotes<T>(tareas: (() => Promise<T>)[], n = 6) {
  const out: T[] = new Array(tareas.length)
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < tareas.length) { const k = i++; out[k] = await tareas[k]() } }))
  return out
}

// Empleados
for (const e of [
  { nombre: 'Administración', email: 'admin@chevere.shop', rol: 'admin' },
  { nombre: 'María (catálogo)', email: 'catalogo@chevere.shop', rol: 'catalogo' },
  { nombre: 'José (despacho)', email: 'ventas@chevere.shop', rol: 'ventas' },
  { nombre: 'Contabilidad', email: 'lectura@chevere.shop', rol: 'lectura' },
] as const) {
  await payload.create({ collection: 'users', data: { ...e, password: 'Cambiar.2026', activo: true } })
}
log('Empleados creados')

// Categorías con portada
const subIds: Record<string, number> = {}
let orden = 0
for (const [principal, subs] of Object.entries(ARBOL)) {
  const imagen = await subir(await categoriaWebp(...PORTADAS[principal]), `portada-${principal}.webp`, `Colección ${principal}`)
  const padre = await payload.create({ collection: 'categorias', data: { nombre: principal, orden: orden++, imagen } })
  let o = 0
  for (const sub of subs) {
    const c = await payload.create({ collection: 'categorias', data: { nombre: sub, slug: `${padre.slug}-${sub}`, padre: padre.id, orden: o++ } })
    subIds[`${principal}/${sub}`] = c.id
  }
}
log('Categorías creadas')

// Productos
const idPorNombre: Record<string, number> = {}
let n = 0
for (const p of PRODUCTOS) {
  const slug = p.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const c0 = p.colores[0]
  const imagenes = [
    await subir(await frameWebp(p.forma, c0.hex, c0.acento, 0, 1200), `${slug}-frente.webp`, `${p.nombre}, ${c0.color}, vista frontal`),
    await subir(await detalleWebp(p.forma, c0.hex, c0.acento), `${slug}-detalle.webp`, `${p.nombre}: detalle de costuras y terminaciones`),
    await subir(await frameWebp(p.forma, c0.hex, c0.acento, 180, 1200), `${slug}-espalda.webp`, `${p.nombre}, ${c0.color}, vista posterior`),
  ]
  const variantes: NonNullable<Producto['variantes']> = []
  for (const col of p.colores) {
    let frames360: number[] = []
    if (p.con360) {
      frames360 = await enLotes(
        Array.from({ length: 36 }, (_, i) => async () =>
          subir(await frameWebp(p.forma, col.hex, col.acento, i * 10), `${slug}-${col.color.toLowerCase().replace(/[^a-z]+/g, '-')}-${String(i).padStart(2, '0')}.webp`, `${p.nombre} ${col.color}, giro ${i * 10}°`, 'frame360'),
        ),
      )
    }
    p.tallas.forEach((t, i) => {
      const sku = `${slug.split('-').map((w) => w[0]).join('').toUpperCase()}-${col.color.slice(0, 3).toUpperCase()}-${t.toUpperCase().replace(/\W/g, '')}`
      // stock variable, con alguna talla agotada para probar los filtros
      const stock = (n + i * 3 + col.color.length) % 7 === 0 ? 0 : 3 + ((n * 5 + i * 7) % 14)
      variantes.push({ color: col.color, colorHex: col.hex, talla: t as never, sku, stock, frames360: i === 0 ? frames360 : [] })
    })
  }
  const doc = await payload.create({
    collection: 'productos',
    draft: false,
    data: {
      _status: 'published',
      nombre: p.nombre,
      categoria: subIds[p.cat],
      marca: p.marca,
      precio: p.precio,
      precioOferta: p.oferta,
      genero: p.genero as never,
      composicion: p.composicion,
      cuidados: p.cuidados,
      destacado: !!p.destacado,
      nuevo: !!p.nuevo,
      imagenes,
      variantes,
      descripcion: {
        root: {
          type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
          children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', text: p.descripcion, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }] }],
        },
      },
    },
    context: { sinRegistro: true },
  })
  idPorNombre[p.nombre] = doc.id
  log(`Producto ${++n}/${PRODUCTOS.length}: ${p.nombre}${p.con360 ? ' (con 360°)' : ''}`)
}

// Reseñas aprobadas
for (const r of RESENAS) {
  await payload.create({ collection: 'resenas', data: { producto: idPorNombre[r.p], nombre: r.nombre, ciudad: r.ciudad, estrellas: r.estrellas, texto: r.texto, aprobada: true } })
}

// Pedidos de ejemplo (los pagados descuentan stock y suman "vendidos")
const pedidos: [string, string, number, string][] = [
  ['Andreína Pérez', 'Zapatilla Ávila Run', 2, 'pagado'],
  ['Luis Rangel', 'Franela Sol Oversize', 3, 'pagado'],
  ['Carla Medina', 'Vestido Brisa Caribe', 1, 'pendiente'],
  ['Pedro Salas', 'Franela Sol Oversize', 2, 'pagado'],
]
for (const [cliente, prod, cantidad, estado] of pedidos) {
  const p = await payload.findByID({ collection: 'productos', id: idPorNombre[prod], depth: 0 })
  const v = (p.variantes ?? []).find((x) => (x.stock ?? 0) >= cantidad)!
  const precio = p.precioOferta ?? p.precio
  const o = await payload.create({
    collection: 'pedidos',
    data: { estado: 'pendiente', clienteNombre: cliente, clienteEmail: `${cliente.split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}@ejemplo.com`, direccion: 'Caracas', items: [{ producto: p.id, sku: v.sku, cantidad, precioUnitario: precio }] },
  })
  if (estado === 'pagado') await payload.update({ collection: 'pedidos', id: o.id, data: { estado: 'pagado' } })
}

// Ajustes: la tienda arranca en modo catálogo (sin pago en línea)
await payload.updateGlobal({ slug: 'ajustes', data: { modoCatalogo: true, whatsapp: '+58 412 000 0000' } })

log('Listo: tienda de muestra cargada.')
process.exit(0)
