# Cómo publicar Chévere en la nube (Vercel + Neon + Vercel Blob), plan gratis

Tiempo estimado: 30–45 minutos la primera vez. No necesitas saber programar para seguir estos pasos.
**Ninguno de estos servicios pide tarjeta en su plan gratis.** La base de datos y el almacén de fotos se crean desde el mismo panel de Vercel.

**Qué hace cada servicio**

| Servicio | Para qué sirve | Qué guarda | Límite gratis (aprox.) |
|---|---|---|---|
| **GitHub** | Guarda tu código | El código (nunca contraseñas ni fotos) | — |
| **Neon** (desde Vercel) | Base de datos (Postgres) | Productos, pedidos, empleados, reseñas | 0,5 GB |
| **Vercel Blob** | Almacén de archivos | Las fotos y las secuencias 360° | 1 GB y 10 GB de descarga al mes |
| **Vercel** | Ejecuta la tienda en internet | Nada: solo corre el código | 5.000 optimizaciones de imagen al mes |

Si Blob pasa su límite, Vercel **no cobra**: deja de servir las fotos hasta el mes siguiente. Te avisa por correo antes de llegar. Cuando eso pase, es el momento de pasar al plan Pro.

> **Sobre el plan gratis de Vercel (*Hobby*):** según sus términos es para uso personal y no comercial. Sirve para montar y probar la tienda; para vender de verdad lo normal es pasar a *Pro*. Al pasar no hay que cambiar nada del código ni volver a cargar datos.

Tu tienda arranca en **modo catálogo**: se ven productos y precios, y los clientes consultan por WhatsApp. El pago en línea se agrega después.

---

## Paso 1 · Subir el código a GitHub

1. Crea una cuenta en <https://github.com> y un repositorio **privado** llamado `chevere` (botón *New*, marca *Private*, sin README).
2. En la carpeta del proyecto, abre una terminal y ejecuta:

```bash
git init
git add .
git commit -m "Chévere listo para la nube"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/chevere.git
git push -u origin main
```

3. **Comprobación importante:** entra al repositorio en GitHub y verifica que **no** aparezcan `.env`, `chevere.db` ni la carpeta `media`. El archivo `.gitignore` ya los excluye, pero confírmalo: ahí vive tu clave secreta.

## Paso 2 · Importar el proyecto en Vercel (sin desplegar todavía)

1. Crea una cuenta en <https://vercel.com> con **Continue with GitHub** y elige el plan **Hobby**.
2. **Add New → Project** → elige el repositorio `chevere` → **Import**.
3. Abre **Environment Variables** y agrega estas 2:

| Nombre | Valor |
|---|---|
| `PAYLOAD_SECRET` | Una cadena aleatoria nueva (ver abajo). **No** reutilices la de tu computadora ni copies un texto de ejemplo |
| `NEXT_PUBLIC_SERVER_URL` | `https://chevere.vercel.app` (el nombre que tenga tu proyecto en Vercel; sin `/` al final) |

**Generar el `PAYLOAD_SECRET`** (Windows, en PowerShell; no necesita nada instalado):

```powershell
$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

Copia la línea que sale y pégala como valor.

4. Pulsa **Deploy**. **Va a fallar** con *"Faltan variables de entorno en Vercel"*, porque aún no hay base de datos ni almacén de fotos. Es lo esperado: lo arreglan los pasos 3 y 4.

## Paso 3 · Crear la base de datos (Neon, desde Vercel)

1. En tu proyecto de Vercel → pestaña **Storage** → **Create Database** → **Neon** (Serverless Postgres) → **Continue**.
2. Plan **Free**, región **Washington, D.C. (iad1)**: es donde corre Vercel por defecto, así la tienda va más rápida. Nombre: `chevere-db`.
3. Al terminar, pulsa **Connect Project**, elige `chevere` y marca los entornos *Production* y *Preview*.

Vercel crea solas las variables `DATABASE_URL` y `DATABASE_URL_UNPOOLED`. No hay que copiar nada ni crear tablas: se crean solas en el primer despliegue. Es una base **nueva y vacía**; tus datos locales (`chevere.db`) no se suben.

## Paso 4 · Crear el almacén de fotos (Vercel Blob)

1. Pestaña **Storage** → **Create Database** → **Blob** → **Continue**. Nombre: `chevere-fotos`, acceso **Public**.
2. **Connect Project** → `chevere` → entornos *Production* y *Preview*.

Vercel crea sola la variable `BLOB_READ_WRITE_TOKEN`.

## Paso 5 · Desplegar de verdad

Pestaña **Deployments** → en el último despliegue (el que falló) pulsa **⋯ → Redeploy**.

No cambies el comando de construcción: el proyecto ya trae `vercel-build`, que en cada despliegue (a) crea o actualiza las tablas, (b) crea las categorías si no existen y (c) compila la tienda.

Si falta alguna variable, el despliegue se detiene con un mensaje que dice exactamente cuál. Agrégala y pulsa *Redeploy*.

## Paso 6 · Crear tu cuenta de administrador (hazlo enseguida)

1. Entra a `https://TU-DIRECCION.vercel.app/admin`.
2. Registra tu cuenta. **La primera cuenta que se crea siempre es administradora**, así que hazlo en cuanto termine el despliegue, antes de compartir la dirección con nadie.
3. Desde **Empleados** crea las demás cuentas con su rol (catálogo, ventas, lectura).

No ejecutes `npm run seed` en producción: crearía cuentas de ejemplo con una contraseña conocida (`Cambiar.2026`).

## Paso 7 · Dejar la tienda lista

En el panel (`/admin`):

1. **Configuración → Ajustes de la tienda**: pon tu número real de WhatsApp (viene uno de ejemplo) y revisa el aviso para clientes. Deja activo el **Modo catálogo**.
2. **Categorías**: sube las fotos de portada y las fotos de modelos (ya están creadas Damas, Caballeros, Niños, Accesorios y Calzado con sus subcategorías).
3. **Productos → Crear nuevo**: carga productos con fotos reales. Un producto necesita al menos una variante (color + talla + SKU + stock) para poder publicarse; los borradores sí se pueden guardar incompletos.

## Paso 8 · Lista de comprobación después de publicar

- [ ] La portada y una categoría cargan.
- [ ] Puedes entrar a `/admin` con tu cuenta.
- [ ] Subes una foto y aparece en Vercel → Storage → `chevere-fotos`.
- [ ] Publicas un producto y su ficha (`/p/...`) carga con la foto.
- [ ] El botón **Consultar por WhatsApp** abre el chat con el número correcto.
- [ ] Envías una reseña de prueba: aparece en el panel como *no aprobada* y no se ve en la tienda.
- [ ] `https://TU-DIRECCION/api/graphql` responde *404* (GraphQL está apagado a propósito).

## Dominio propio

Vercel → tu proyecto → **Settings → Domains** → agrega `tudominio.com` y sigue las instrucciones de DNS. Después cambia `NEXT_PUBLIC_SERVER_URL` a `https://tudominio.com` y pulsa **Redeploy** (esa variable se "congela" al compilar, así que sin redeploy no se actualiza el sitemap ni los datos para buscadores).

---

## Qué cambió en el código para la nube

- **Base de datos:** con `DATABASE_URL` de Neon se usa Postgres; las tablas cambian solo mediante migraciones (`src/migrations`), nunca "por sorpresa".
- **Fotos:** con `BLOB_READ_WRITE_TOKEN` las imágenes se guardan en Vercel Blob (o en Cloudflare R2 si configuras las variables `R2_*`, que tienen prioridad). Sin ninguna (en tu computadora) siguen en la carpeta `media/`.
- **Freno anti-spam:** reseñas (3 por persona y 40 en total por hora) y boletín (5 por persona y 100 en total por hora). Se guarda solo un código irreversible de la IP, nunca la IP; si publicas una política de privacidad, menciónalo. Esto frena bots y avalanchas, pero no sustituye un captcha (Cloudflare Turnstile sería el siguiente paso si llega mucho spam). Las reseñas ya requerían tu aprobación.
- **GraphQL apagado:** la tienda no lo usa, y así hay una puerta menos abierta.
- **Variantes obligatorias al publicar:** antes se podía publicar un producto sin variantes y su ficha daba error 500.
- **Avisos claros:** si en Vercel falta una variable, el despliegue se detiene explicando cuál.

## Cuando quieras cambiar la estructura de datos

Si agregas un campo nuevo a una colección (por ejemplo `Products.ts`):

1. En tu computadora, con un Postgres de pruebas (puede ser una *branch* de Neon), ejecuta `npm run migrate:create -- nombre-del-cambio`.
2. Sube a GitHub el archivo nuevo de `src/migrations`.
3. Vercel lo aplica solo en el siguiente despliegue.

Si cambias campos y **no** generas la migración, la web fallará con errores tipo `column ... does not exist`.

## Tu base local (solo para tu computadora)

El paquete trae `chevere.db` **limpia**: las 43 categorías y 4 cuentas de prueba (`admin@`, `catalogo@`, `ventas@` y `lectura@chevere.shop`, contraseña `Cambiar.2026`). No hay productos, pedidos, reseñas ni fotos. Esas cuentas son solo para tu computadora: `chevere.db` no se sube a GitHub y la base de Neon empieza sin cuentas.

- Para volver a ver la tienda con datos de muestra: borra `chevere.db` y la carpeta `media/`, y ejecuta `npm run seed`.
- Si prefieres seguir con tu copia vieja, ejecuta **una vez** `DB_PUSH=yes npm run dev` (en Windows: `set DB_PUSH=yes&& npm run dev`), espera a que arranque y ciérralo. Sin esto le faltan las columnas del freno anti-spam.

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El despliegue falla con *"Faltan variables de entorno en Vercel"* | Falta o está mal una variable | Agrégala en Vercel → Settings → Environment Variables y pulsa *Redeploy* |
| *relation "…" does not exist* | Las migraciones no se aplicaron | Revisa el log del despliegue: el paso `migrate` debe terminar en *Done*. Comprueba `DATABASE_URL_UNPOOLED` |
| Al subir una foto aparece error 413 | Vercel limita cada subida a 4,5 MB | Reduce el peso de la foto (en WebP/JPG casi siempre basta) |
| Las fotos no cargan (404) | El almacén Blob no está conectado al proyecto, o se pasó el límite gratis del mes | Vercel → Storage → `chevere-fotos`: revisa que esté conectado a `chevere` y mira el uso. Si se pasó del límite, toca esperar al mes siguiente o pasar a Pro |
| No puedes iniciar sesión en `/admin` | `NEXT_PUBLIC_SERVER_URL` no coincide con la dirección que usas | Corrígela (con `https://`, sin `/` final) y haz *Redeploy* |
| Error 429 al enviar una reseña o suscripción | El freno anti-spam se activó | Es normal si se envían muchas seguidas; se libera pasada una hora |

## Pendiente (siguiente fase)

- **Pasarela de pago.** Mientras tanto puedes vender con Pago Móvil o Zelle manual: el pedido queda *Pendiente de pago*, el cliente envía la referencia y tu equipo lo pasa a *Pagado* (eso descuenta el stock solo).
- Copias de seguridad: revisa la retención de historial de tu plan en Neon y programa una exportación periódica de la base.
- Si el tráfico crece, pasa a Vercel Pro o mueve las fotos a Cloudflare R2 (variables `R2_*` en `.env.example`), que no cobra la descarga.
