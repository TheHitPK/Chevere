import type { CollectionConfig } from 'payload'
import { ocultarSalvo, soloAdmin } from '../access/roles'

/** Historial de acciones de los empleados. Solo lectura, solo para el administrador. */
export const Registro: CollectionConfig = {
  slug: 'registro',
  labels: { singular: 'Registro de cambios', plural: 'Registro de cambios' },
  admin: {
    group: 'Configuración',
    useAsTitle: 'titulo',
    defaultColumns: ['createdAt', 'usuario', 'accion', 'coleccion', 'titulo'],
    hidden: ocultarSalvo(),
    description: 'Quién cambió qué y cuándo. No se puede editar.',
  },
  defaultSort: '-createdAt',
  access: {
    read: soloAdmin,
    create: () => false, // solo lo escriben los hooks del sistema
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'accion', type: 'text', required: true },
    { name: 'coleccion', label: 'Sección', type: 'text', required: true },
    { name: 'documentoId', type: 'text', admin: { hidden: true } },
    { name: 'titulo', type: 'text' },
    { name: 'usuario', type: 'relationship', relationTo: 'users' },
  ],
}
