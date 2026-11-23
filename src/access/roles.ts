import type { Access, FieldAccess } from 'payload'

/**
 * Roles del panel Chévere
 *  - admin:    todo, incluido gestionar empleados y borrar definitivamente
 *  - catalogo: productos, categorías, fotos y secuencias 360° (puede despublicar, no borrar)
 *  - ventas:   pedidos (ver y cambiar estado / guía de envío). Ve productos, no los edita
 *  - lectura:  consulta productos y pedidos, sin editar nada
 */
export const ROLES = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Gestor de catálogo', value: 'catalogo' },
  { label: 'Ventas / despacho', value: 'ventas' },
  { label: 'Solo lectura', value: 'lectura' },
] as const

export type Rol = (typeof ROLES)[number]['value']

type MaybeUser = object | null | undefined

export const rolDe = (user: MaybeUser): Rol | undefined => {
  if (!user) return undefined
  const u = user as { collection?: string; rol?: Rol; activo?: boolean }
  if (u.collection && u.collection !== 'users') return undefined
  // Un empleado desactivado pierde todos los permisos aunque conserve la sesión
  if (u.activo === false) return undefined
  return u.rol
}

export const tieneRol = (user: MaybeUser, ...roles: Rol[]) => {
  const rol = rolDe(user)
  return !!rol && (rol === 'admin' || roles.includes(rol))
}

/* ---------- reglas de acceso reutilizables ---------- */

export const soloAdmin: Access = ({ req }) => tieneRol(req.user)

export const catalogo: Access = ({ req }) => tieneRol(req.user, 'catalogo')

export const ventas: Access = ({ req }) => tieneRol(req.user, 'ventas')

export const cualquierEmpleado: Access = ({ req }) => !!rolDe(req.user)

/** Público ve solo lo publicado; los empleados ven también borradores y despublicados. */
export const publicadoOEmpleado: Access = ({ req }) => {
  if (rolDe(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const campoSoloAdmin: FieldAccess = ({ req }) => tieneRol(req.user)

/** Ocultar una colección del menú si el rol no la usa. */
export const ocultarSalvo =
  (...roles: Rol[]) =>
  ({ user }: { user: MaybeUser }) =>
    !tieneRol(user, ...roles)
