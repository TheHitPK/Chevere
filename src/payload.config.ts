import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { es } from '@payloadcms/translations/languages/es'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Products } from './collections/Products'
import { Registro } from './collections/Registro'
import { Reviews } from './collections/Reviews'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { Ajustes } from './globals/Ajustes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/* ------------------------------------------------------------------ */
/*  Entorno: local (SQLite + carpeta media/) o nube (Neon + R2)        */
/* ------------------------------------------------------------------ */

const enVercel = Boolean(process.env.VERCEL)
const enRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID)

// Neon da dos direcciones: una "pooled" (para la web) y una directa "UNPOOLED" (para migrar).
// Los comandos `npm run migrate` y `migrate:create` activan MIGRATE=1 y usan la directa si existe.
const migrando = process.env.MIGRATE === '1'
// En Railway la red privada (postgres.railway.internal) no existe mientras se compila, y la portada se
// pre-genera consultando la base. Durante la compilación usamos la dirección pública (DATABASE_PUBLIC_URL).
const compilando = process.env.NEXT_PHASE === 'phase-production-build'
const dbUrl =
  (migrando && process.env.DATABASE_URL_UNPOOLED) ||
  (compilando && process.env.DATABASE_PUBLIC_URL) ||
  process.env.DATABASE_URL ||
  'file:./chevere.db'
const usaPostgres = dbUrl.startsWith('postgres')

const r2 = {
  accountId: process.env.R2_ACCOUNT_ID,
  bucket: process.env.R2_BUCKET,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
}
const usaR2 = Object.values(r2).every(Boolean)
// Vercel Blob: el almacén de archivos de Vercel. Al conectarlo al proyecto, Vercel crea BLOB_READ_WRITE_TOKEN solo.
const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const usaBlob = !usaR2 && Boolean(blobToken)

// En Vercel no hay disco permanente: sin Postgres ni R2 la tienda "funcionaría" pero perdería los datos.
// Preferimos frenar con un mensaje claro a que eso pase en silencio.
if (enVercel) {
  const faltan: string[] = []
  if ((process.env.PAYLOAD_SECRET ?? '').length < 32) faltan.push('PAYLOAD_SECRET (mínimo 32 caracteres)')
  if (!usaPostgres) faltan.push('DATABASE_URL (la dirección de Neon, empieza por postgres://)')
  if (!usaR2 && !usaBlob) faltan.push('BLOB_READ_WRITE_TOKEN (conecta un almacén Blob en Vercel → Storage) o las variables R2_* de Cloudflare R2')
  if (!process.env.NEXT_PUBLIC_SERVER_URL) faltan.push('NEXT_PUBLIC_SERVER_URL (la dirección pública de tu tienda, con https://)')
  if (faltan.length) {
    throw new Error(`Faltan variables de entorno en Vercel:\n - ${faltan.join('\n - ')}\nAgrégalas en Vercel → Settings → Environment Variables y vuelve a desplegar. Guía: DESPLIEGUE.md`)
  }
}

// En Railway las fotos pueden ir a R2 o a un volumen (MEDIA_DIR=/data/media). Sin ninguno de los dos se
// guardarían en el disco del contenedor y se borrarían en cada despliegue.
if (enRailway && !migrando) {
  const faltan: string[] = []
  const secreto = process.env.PAYLOAD_SECRET ?? ''
  if (secreto.length < 32) faltan.push('PAYLOAD_SECRET (mínimo 32 caracteres)')
  if (secreto.includes('PEGA-AQUI')) faltan.push('PAYLOAD_SECRET (todavía tiene el texto de ejemplo de la guía; genera uno nuevo)')
  if (!usaPostgres) faltan.push('DATABASE_URL (usa ${{Postgres.DATABASE_URL}})')
  if (!usaR2 && !process.env.MEDIA_DIR) faltan.push('MEDIA_DIR (la ruta del volumen, p. ej. /data/media) o las variables R2_*')
  if (!process.env.NEXT_PUBLIC_SERVER_URL) faltan.push('NEXT_PUBLIC_SERVER_URL (la dirección pública de tu tienda, con https://)')
  if (faltan.length) {
    throw new Error(`Faltan variables de entorno en Railway:\n - ${faltan.join('\n - ')}\nAgrégalas en Railway → tu servicio → Variables. Guía: DESPLIEGUE-RAILWAY.md`)
  }
}

// Al generar o aplicar migraciones se da R2 por activo (aunque falten las claves): el plugin de R2 añade una columna
// oculta a la tabla de imágenes, y el esquema de Postgres debe incluirla siempre, también al migrar desde cero.
const plugins: Plugin[] = usaR2 || migrando
  ? [
      s3Storage({
        collections: { media: true },
        bucket: r2.bucket ?? 'chevere-media',
        config: {
          region: 'auto',
          // R2_ENDPOINT es opcional: solo hace falta para buckets de jurisdicción UE (…eu.r2.cloudflarestorage.com) o para pruebas
          endpoint: process.env.R2_ENDPOINT || `https://${r2.accountId ?? 'migracion'}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId: r2.accessKeyId ?? 'migracion', secretAccessKey: r2.secretAccessKey ?? 'migracion' },
          forcePathStyle: true,
        },
      }),
    ]
  : []

// Vercel Blob (plan gratis de Vercel: 1 GB). Añade al esquema las mismas columnas ocultas que R2 (_objectKey),
// así que las migraciones existentes sirven tal cual. Se usa solo si no hay R2 configurado.
if (usaBlob) {
  plugins.splice(0, plugins.length, vercelBlobStorage({ collections: { media: true }, token: blobToken }))
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · Chévere', description: 'Panel de gestión de Chévere' },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { es, en }, fallbackLanguage: 'es' },
  collections: [Products, Categories, Media, Reviews, Orders, Subscribers, Users, Registro],
  globals: [Ajustes],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  // La tienda no usa GraphQL (solo la API normal y el panel). Apagarlo cierra una puerta que nadie necesita.
  graphQL: { disable: true },
  // Local / pruebas: SQLite en un archivo. Nube: Postgres (Neon) con migraciones.
  db: usaPostgres
    ? postgresAdapter({
        // Railway: un solo servidor siempre encendido; 5 conexiones sobran y cada una ahorra RAM en Postgres.
        pool: { connectionString: dbUrl, max: enVercel ? 3 : enRailway ? 5 : 10, idleTimeoutMillis: 30_000 },
        migrationDir: path.resolve(dirname, 'migrations'),
        // En Postgres el esquema solo cambia con migraciones (npm run migrate:create), nunca "por sorpresa".
        push: false,
      })
    : // DB_PUSH=no evita la sincronización automática del esquema en desarrollo (útil si ya está al día)
      sqliteAdapter({ client: { url: dbUrl }, push: process.env.DB_PUSH !== 'no' }),
  // Si R2 está configurado, las fotos viajan a R2; si no, se guardan en la carpeta media/ (solo para trabajar en local).
  plugins,
  sharp,
})
