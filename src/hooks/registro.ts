import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionSlug } from 'payload'

type Hook = CollectionAfterChangeHook & CollectionAfterDeleteHook

/**
 * Deja constancia en "Registro de cambios" de quién creó, editó, publicó,
 * despublicó o eliminó algo, y cuándo.
 */
export const registrar =
  (coleccion: CollectionSlug, campoTitulo: string): Hook =>
  async (args) => {
    const { doc, req } = args
    const operation = 'operation' in args ? args.operation : 'delete'
    const previousDoc = 'previousDoc' in args ? args.previousDoc : undefined
    if (!req.user || req.context?.sinRegistro) return doc

    let accion: string = operation === 'create' ? 'creó' : operation === 'delete' ? 'eliminó' : 'editó'
    const antes = previousDoc?._status
    const ahora = doc?._status
    if (operation === 'update' && antes !== ahora) {
      if (ahora === 'published') accion = 'publicó'
      if (antes === 'published' && ahora === 'draft') accion = 'despublicó'
    }

    await req.payload.create({
      collection: 'registro',
      data: {
        accion,
        coleccion,
        documentoId: String(doc.id),
        titulo: String(doc?.[campoTitulo] ?? doc.id),
        usuario: req.user.id,
      },
      req,
      overrideAccess: true,
      context: { sinRegistro: true },
    })
    return doc
  }
