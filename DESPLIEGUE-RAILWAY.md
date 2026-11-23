# Publicar Chévere en Railway (plan Hobby + volumen)

Todo vive en Railway, en un solo proyecto:

| Pieza | Qué es | Qué guarda |
|---|---|---|
| **Servicio `chevere`** | La tienda + el panel `/admin` | Nada permanente (se rehace en cada despliegue) |
| **Volumen `/data`** | Disco permanente del servicio `chevere` | Las fotos (`/data/media`) |
| **Servicio `Postgres`** | Base de datos | Productos, pedidos, empleados, reseñas |

El archivo `railway.json` ya le dice a Railway cómo compilar, migrar la base y arrancar.

---

## Paso 1 · Subir el código a GitHub

Igual que en `DESPLIEGUE.md`, Paso 1 (repositorio **privado**; verifica que no se suban `.env`, `chevere.db` ni `media/`).

## Paso 2 · Crear el proyecto en Railway

1. Entra a <https://railway.com>, activa el plan **Hobby** y pulsa **New Project → Deploy from GitHub repo** → elige `chevere`.
   El primer despliegue va a fallar porque faltan las variables: es lo esperado.
2. En el mismo proyecto: **+ Create → Database → PostgreSQL**. Queda un servicio llamado `Postgres`.
3. Haz clic derecho sobre el servicio `chevere` → **Attach volume** → *Mount path*: `/data`.
4. Servicio `chevere` → **Settings → Networking → Generate Domain** (te da `algo.up.railway.app`).

## Paso 3 · Variables del servicio `chevere`

Servicio `chevere` → **Variables → Raw Editor**, pega esto y cambia el secreto:

```
PAYLOAD_SECRET=PEGA-AQUI-UNA-CADENA-ALEATORIA-DE-48-CARACTERES
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_PUBLIC_URL=${{Postgres.DATABASE_PUBLIC_URL}}
MEDIA_DIR=/data/media
NEXT_PUBLIC_SERVER_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

- Secreto nuevo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` (no reutilices el de tu computadora).
- `DATABASE_PUBLIC_URL` solo se usa **mientras se compila** (la red interna de Railway no existe en ese momento y la portada se pre-genera leyendo la base). La tienda en marcha usa la red interna, que no cobra tráfico.
- Con dominio propio, cambia `NEXT_PUBLIC_SERVER_URL` a `https://tudominio.com` y vuelve a desplegar.

Pulsa **Deploy**. En cada despliegue Railway: compila → aplica migraciones y crea categorías (`railway:predeploy`) → arranca.

## Paso 4 · Topes para que la factura nunca se dispare (hazlo ya)

1. Servicio `chevere` → **Settings → Resource Limits**: **1 vCPU y 1 GB RAM**. Postgres: **0,5 vCPU y 0,5 GB**.
2. **Workspace → Usage → Usage limits**: alerta a 8 USD y límite duro a 12 USD. Con el límite duro, Railway apaga los servicios en vez de cobrarte de más.

## Paso 5 · Cuenta de administrador y puesta a punto

Igual que en `DESPLIEGUE.md`, Pasos 5, 6 y 7 (la dirección es la de Railway en vez de la de Vercel). La comprobación de R2 se cambia por: subes una foto, haces **Redeploy** y la foto sigue ahí.

---

## Cuánto cuesta al mes (precios de Railway, nov. 2026)

Tarifas: RAM 10 USD/GB-mes · CPU 20 USD/vCPU-mes · volumen 0,15 USD/GB-mes · tráfico de salida 0,05 USD/GB.
El plan Hobby cuesta **5 USD e incluye 5 USD de consumo**: pagas 5 USD o tu consumo, lo que sea mayor.

| Concepto | Uso típico de una tienda pequeña | USD/mes |
|---|---|---|
| Tienda: RAM | ~300–450 MB siempre encendida | 3,00 – 4,50 |
| Tienda: CPU | ~0,02–0,05 vCPU de media | 0,40 – 1,00 |
| Postgres: RAM + CPU | ~80–150 MB | 0,90 – 1,60 |
| Volúmenes (fotos + base) | 1–3 GB | 0,15 – 0,45 |
| Tráfico de salida | 10–40 GB (sobre todo fotos) | 0,50 – 2,00 |
| **Consumo total** | | **≈ 5 – 9,50** |
| **Lo que pagas** | | **≈ 5 – 10 USD** |

Con poco tráfico al principio lo normal es quedar en **5–7 USD/mes**. Lo que más pesa es la RAM de la tienda, porque se cobra las 24 h aunque nadie entre.
El plan Hobby admite volúmenes de hasta 5 GB; si las fotos 360° lo superan, pasa las fotos a R2 (ver abajo).

## Qué ya se ajustó para gastar menos CPU y RAM

- **Memoria acotada** (`start:railway`): el motor de JavaScript limpia memoria al llegar a ~384 MB en vez de crecer hasta 1–2 GB.
- **Solo WebP** en las imágenes optimizadas: generar AVIF gasta varias veces más CPU, y las fotos ya se guardan en WebP al subirlas.
- **Caché de imágenes de 30 días**: cada tamaño de foto se optimiza una vez, no cada 4 horas.
- **Máximo 5 conexiones a Postgres** y se cierran tras 30 s sin uso: menos RAM en la base.
- **1 sola réplica** y sin regiones extra.

## Más ahorro, de mayor a menor impacto

1. **Cloudflare gratis delante del dominio** (proxy naranja activado + regla de caché para `/api/media/file/*` y `/_next/image*`). Las fotos se sirven desde Cloudflare: casi cero tráfico de salida y mucha menos CPU. Es lo que más ahorra cuando hay visitas.
2. **Base en Neon (gratis) en vez de Postgres de Railway**: ahorras ~1–1,5 USD/mes. A cambio son dos proveedores, y las consultas viajan por internet (un poco más lentas).
3. **Fotos en R2 en vez del volumen**: R2 no cobra tráfico de salida y tiene 10 GB gratis. Conviene cuando las fotos pasen de ~3 GB o el tráfico crezca. Basta con añadir las variables `R2_*` (ver `.env.example`); `MEDIA_DIR` deja de usarse. Las fotos que ya estén en el volumen habría que subirlas al bucket.
4. **Dormir el servicio** (`"sleepApplication": true` en `railway.json`): sin visitas durante 10 min se apaga y casi no cobra RAM. Pero el primer cliente espera **10–20 s**, y eso puede espantar a quien llega desde WhatsApp. No lo recomiendo para la tienda.
5. Sube las fotos ya recortadas (menos de 3000 px). El servidor gasta menos CPU y RAM procesándolas.

## Cosas a saber

- Un servicio con volumen se cae **unos segundos** en cada despliegue (Railway no puede tener dos copias usando el mismo disco). Despliega en horas de poco tráfico.
- **Copias de seguridad**: activa *Backups* en el volumen de `Postgres` y en el de `chevere` (pestaña *Backups* de cada volumen).
- Si al subir fotos aparece `EACCES: permission denied, mkdir '/data/media'`, añade la variable `RAILWAY_RUN_UID=0` al servicio `chevere`.
- El error *"Faltan variables de entorno en Railway"* dice exactamente cuál falta.
- Si aparece *Out of memory / heap limit* en los registros, sube 384 a 512 en el script `start:railway` de `package.json` (el gasto sube ~1 USD/mes).
