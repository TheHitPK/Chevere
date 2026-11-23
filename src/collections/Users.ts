import type { CollectionConfig } from 'payload'
import { campoSoloAdmin, ocultarSalvo, ROLES, rolDe, soloAdmin, tieneRol } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Empleado', plural: 'Empleados' },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 min bloqueado tras 5 intentos fallidos
    tokenExpiration: 60 * 60 * 8, // sesión de una jornada
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'rol', 'activo'],
    group: 'Configuración',
    hidden: ocultarSalvo(), // solo el administrador ve la lista de empleados
  },
  access: {
    // Cada empleado puede ver y editar su propio perfil (nombre, contraseña); el admin, todos
    read: ({ req }) => (tieneRol(req.user) ? true : rolDe(req.user) ? { id: { equals: req.user!.id } } : false),
    update: ({ req }) => (tieneRol(req.user) ? true : rolDe(req.user) ? { id: { equals: req.user!.id } } : false),
    create: soloAdmin,
    delete: soloAdmin,
    // Permite entrar al panel solo a cuentas activas con rol
    admin: ({ req }) => !!rolDe(req.user),
  },
  fields: [
    { name: 'nombre', type: 'text', required: true },
    {
      name: 'rol',
      type: 'select',
      required: true,
      defaultValue: 'catalogo',
      options: [...ROLES],
      // Nadie puede subirse de rol a sí mismo
      access: { create: campoSoloAdmin, update: campoSoloAdmin },
      admin: { description: 'Define qué puede ver y hacer este empleado en el panel.' },
    },
    {
      name: 'activo',
      type: 'checkbox',
      defaultValue: true,
      access: { create: campoSoloAdmin, update: campoSoloAdmin },
      admin: { description: 'Desmárcalo para quitarle el acceso sin borrar su historial.' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // La primera cuenta creada (pantalla de registro inicial) siempre es administradora
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) {
            data.rol = 'admin'
            data.activo = true
          }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        // Evita quedarse sin administradores
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          where: { rol: { equals: 'admin' }, activo: { equals: true }, id: { not_equals: id } },
          req,
        })
        if (totalDocs === 0) throw new Error('No puedes eliminar al último administrador activo.')
      },
    ],
  },
  timestamps: true,
}
