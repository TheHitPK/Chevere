# Cómo publicar Chévere en la nube (Vercel + Neon + Cloudflare R2)

Tiempo estimado: 45–60 minutos la primera vez. No necesitas saber programar para seguir estos pasos.

**Qué hace cada servicio**

| Servicio | Para qué sirve | Qué guarda |
|---|---|---|
| **GitHub** | Guarda tu código | El código (nunca contraseñas ni fotos) |
| **Neon** | Base de datos (Postgres) | Productos, pedidos, empleados, reseñas |
| **Cloudflare R2** | Almacén de archivos | Las fotos y las secuencias 360° |
| **Vercel** | Ejecuta la tienda en internet | Nada: solo corre el código |

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

## Paso 2 · Crear la base de datos en Neon

1. Crea una cuenta en <https://neon.tech> y un proyecto nuevo (nombre `chevere`). Elige la región más cercana a tus clientes.
2. Pulsa **Connect** y copia **dos** direcciones (empiezan por `postgres://`):
   - la **pooled** (activa la opción *Connection pooling*; el host trae `-pooler`) → será `DATABASE_URL`
   - la **directa** (con *Connection pooling* apagado) → será `DATABASE_URL_UNPOOLED`

Déjalas a mano para el Paso 4. No hay que crear tablas: se crean solas en el primer despliegue.

## Paso 3 · Crear el almacén de fotos en Cloudflare R2

1. Crea una cuenta en <https://dash.cloudflare.com> y entra a **R2 Object Storage**. Puede pedirte un método de pago para activarlo, aunque incluye una capa gratuita; revisa las condiciones vigentes.
2. **Create bucket** → nombre `chevere-media`. No lo hagas público: la tienda sirve las fotos por su propia dirección.
3. Copia tu **Account ID** (aparece en la página de R2).
4. **Manage API Tokens → Create API token**, permiso **Object Read & Write**, limitado al bucket `chevere-media`. Copia el **Access Key ID** y el **Secret Access Key** (el secreto se muestra una sola vez).

## Paso 4 · Publicar en Vercel

1. Crea una cuenta en <https://vercel.com> e inicia sesión con GitHub.
2. **Add New → Project**, elige el repositorio `chevere` y **antes de pulsar Deploy** abre *Environment Variables* y agrega estas 8:

| Nombre | Valor |
|---|---|
| `PAYLOAD_SECRET` | Una cadena aleatoria nueva (ver abajo). **No** reutilices la de tu computadora |
| `DATABASE_URL` | La dirección *pooled* de Neon |
| `DATABASE_URL_UNPOOLED` | La dirección directa de Neon |
| `R2_ACCOUNT_ID` | Tu Account ID de Cloudflare |
| `R2_BUCKET` | `chevere-media` |
| `R2_ACCESS_KEY_ID` | El Access Key ID |
| `R2_SECRET_ACCESS_KEY` | El Secret Access Key |
| `NEXT_PUBLIC_SERVER_URL` | `https://NOMBRE-DE-TU-PROYECTO.vercel.app` (el nombre que le pongas en Vercel; sin `/` al final) |

**Generar el `PAYLOAD_SECRET`:**
- Mac/Linux: `openssl rand -base64 48`
- Windows (con Node instalado): `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

3. Pulsa **Deploy**. No cambies el comando de construcción: el proyecto ya trae `vercel-build`, que en cada despliegue (a) crea o actualiza las tablas, (b) crea las categorías si no existen y (c) compila la tienda.

> **Sobre el plan de Vercel:** el plan gratuito (*Hobby*) está pensado para uso personal y no comercial según sus términos. Para una tienda que vende, revisa los términos vigentes; lo normal es necesitar el plan *Pro*.

Si falta alguna variable, el despliegue se detiene con un mensaje que dice exactamente cuál. Agrégala y pulsa *Redeploy*.

## Paso 5 · Crear tu cuenta de administrador (hazlo enseguida)

1. Entra a `https://TU-DIRECCION.vercel.app/admin`.
2. Registra tu cuenta. **La primera cuenta que se crea siempre es administradora**, así que hazlo en cuanto termine el despliegue, antes de compartir la dirección con nadie.
3. Desde **Empleados** crea las demás cuentas con su rol (catálogo, ventas, lectura).

No ejecutes `npm run seed` en producción: crearía cuentas de ejemplo con una contraseña conocida (`Cambiar.2026`).

## Paso 6 · Dejar la tienda lista

En el panel (`/admin`):

1. **Configuración → Ajustes de la tienda**: pon tu número real de WhatsApp (viene uno de ejemplo) y revisa el aviso para clientes. Deja activo el **Modo catálogo**.
2. **Categorías**: sube las fotos de portada y las fotos de modelos (ya están creadas Damas, Caballeros, Niños, Accesorios y Calzado con sus subcategorías).
3. **Productos → Crear nuevo**: carga productos con fotos reales. Un producto necesita al menos una variante (color + talla + SKU + stock) para poder publicarse; los borradores sí se pueden guardar incompletos.

## Paso 7 · Lista de comprobación después de publicar

- [ ] La portada y una categoría cargan.
- [ ] Puedes entrar a `/admin` con tu cuenta.
- [ ] Subes una foto y aparece en tu bucket de R2 (Cloudflare → R2 → `chevere-media`).
- [ ] Publicas un producto y su ficha (`/p/...`) carga con la foto.
- [ ] El botón **Consultar por WhatsApp** abre el chat con el número correcto.
- [ ] Envías una reseña de prueba: aparece en el panel como *no aprobada* y no se ve en la tienda.
- [ ] `https://TU-DIRECCION/api/graphql` responde *404* (GraphQL está apagado a propósito).

## Dominio propio

Vercel → tu proyecto → **Settings → Domains** → agrega `tudominio.com` y sigue las instrucciones de DNS. Después cambia `NEXT_PUBLIC_SERVER_URL` a `https://tudominio.com` y pulsa **Redeploy** (esa variable se "congela" al compilar, así que sin redeploy no se actualiza el sitemap ni los datos para buscadores).

---

## Qué cambió en el código para la nube

- **Base de datos:** con `DATABASE_URL` de Neon se usa Postgres; las tablas cambian solo mediante migraciones (`src/migrations`), nunca "por sorpresa".
- **Fotos:** con las variables `R2_*` las imágenes se guardan en R2. Sin ellas (en tu computadora) siguen en la carpeta `media/`.
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
| Las fotos no cargan (404) | Las variables `R2_*` están mal o el token no tiene permiso sobre el bucket | Revisa que el token tenga *Object Read & Write* en `chevere-media` |
| No puedes iniciar sesión en `/admin` | `NEXT_PUBLIC_SERVER_URL` no coincide con la dirección que usas | Corrígela (con `https://`, sin `/` final) y haz *Redeploy* |
| Error 429 al enviar una reseña o suscripción | El freno anti-spam se activó | Es normal si se envían muchas seguidas; se libera pasada una hora |

## Pendiente (siguiente fase)

- **Pasarela de pago.** Mientras tanto puedes vender con Pago Móvil o Zelle manual: el pedido queda *Pendiente de pago*, el cliente envía la referencia y tu equipo lo pasa a *Pagado* (eso descuenta el stock solo).
- Copias de seguridad: revisa la retención de historial de tu plan en Neon y programa una exportación periódica de la base.
- Si el tráfico crece, servir las fotos directamente desde un dominio público de R2 (en lugar de pasar por Vercel) baja el costo y acelera la tienda.
