# Chévere — tienda online + panel de gestión

Un solo proyecto, construido con Next.js 16, Payload CMS 3 y Tailwind CSS 4:
- **La tienda pública** (`/`) incluye la home, las páginas de categoría con filtros, la ficha de producto con visor 360°, el buscador, los favoritos y el carrito.
- **El panel de gestión** (`/admin`) lo usan los empleados, con permisos según su rol.

## La tienda

| Página | Ruta | Qué tiene |
|---|---|---|
| Home | `/` | Portada que cambia según la hora del visitante, colecciones, la sección "desliza y gira", destacados, nuevos ingresos, testimonios y boletín |
| Categoría | `/c/damas`, `/c/damas/jeans` | Filtros (talla, color, marca, precio, disponibilidad), orden, contador en vivo y vista rápida 360° |
| Producto | `/p/franela-sol-oversize` | Visor 360° por color, fotos con lupa, guía de tallas, carrito con animación, reseñas, relacionados y barra fija en móvil |
| Buscar | `/buscar?q=reloj` | Resultados (el buscador del encabezado da sugerencias en vivo) |
| Favoritos | `/favoritos` | Productos guardados con el corazón |

**Portada según la hora.** Un script en `<head>` lee la hora local del visitante y marca el momento del día (amanecer 5–11 h, mediodía 11–16 h, atardecer 16–19 h, noche el resto), antes de pintar la página. Los colores, el sol y la luna, el titular y la luz sobre la prenda cambian con transiciones suaves. Todo está en `globals.css` (variables `--m-*`), y los botones permiten ver los otros momentos o recorrer el día en bucle.

**Desliza y gira.** La prenda gira y el cielo pasa del amanecer a la noche siguiendo el scroll, solo con CSS (`animation-timeline`). En navegadores sin soporte se muestra un bloque estático que gira por sí solo. Con "reducir movimiento" activado, todas las animaciones se desactivan.

**Imágenes de muestra.** Las fotos y secuencias 360° que trae el seed están dibujadas por `src/demo/generar.ts` y sirven solo para probar. Reemplázalas desde el panel con fotos reales.

**Modo catálogo (activo por ahora).** Mientras no haya pago en línea, la tienda muestra los productos y sus precios sin carrito. En la ficha, el botón **"Consultar por WhatsApp"** abre una conversación con el producto, el color, la talla, el precio y el enlace ya escritos. Se controla en el panel, en **Configuración → Ajustes de la tienda**, donde también se cambian el número de WhatsApp y el aviso para los clientes. Cuando el pago esté listo, se desactiva esa casilla y vuelven el carrito y el botón de pagar.

**Fotos de modelos (banda de Damas y tarjeta de portada).** En el panel, entra a **Categorías → Damas → "Fotos de modelos para la banda"** y sube de 3 a 5 fotos verticales de personas reales. El mismo campo existe en las demás categorías principales.
- Si las fotos tienen el **fondo quitado** (PNG transparente, hecho con Canva o remove.bg), el sistema lo detecta solo y las muestra de pie, una junto a otra, como una franja de siluetas.
- Si tienen fondo, se muestran como tarjetas verticales.
- Mientras no haya fotos, la tarjeta de la portada usa su ilustración de siempre.

**Inventario.** Cuando un pedido pasa a *Pagado*, el sistema descuenta el stock de cada talla y suma a "Unidades vendidas" (que define el orden "Más vendidos"). Si después se cancela, el stock se devuelve.

# Panel de gestión

## Roles

| Rol | Productos y categorías | Pedidos | Empleados y registro |
|---|---|---|---|
| **Administrador** | Todo, incluido borrar definitivamente | Todo | Agregar, quitar acceso, cambiar rol, ver registro |
| **Gestor de catálogo** | Crear, editar, publicar y despublicar. No puede borrar | No los ve | — |
| **Ventas / despacho** | Solo ver | Cambiar estado y guía de envío | — |
| **Solo lectura** | Solo ver | Solo ver | — |

Otras reglas que aplica el panel:

- Nadie puede cambiarse su propio rol.
- La primera cuenta que se registra siempre queda como administrador.
- No se puede eliminar al último administrador activo.
- Un empleado desactivado pierde el acceso al momento, y su historial se conserva.
- Tras 5 intentos de contraseña fallidos, la cuenta se bloquea 15 minutos.
- Todo lo que se crea, edita, publica, despublica o elimina queda en **Registro de cambios**, con autor y hora.

## Retirar un producto

Para sacar un producto de la tienda, se **despublica**. Deja de verse en la web, pero se conserva para los pedidos y el historial, y se puede volver a publicar. Cada producto guarda además sus últimas 25 versiones, así que un cambio se puede revertir.

## Cargar un producto con 360°

1. Ve a **Productos → Crear nuevo** y completa nombre, categoría, precio, descripción y composición.
2. En la pestaña **Fotos**, sube las fotos normales: modelo, costuras y etiqueta.
3. En **Variantes y stock**, agrega una fila por cada combinación de color y talla, con su SKU y su stock.
4. En la primera fila de cada color, sube en **Secuencia 360°** las 36 o 72 fotos del giro, nombradas 00, 01, 02… Al guardar se ordenan solas y se convierten a WebP.
5. Pulsa **Guardar borrador**, revisa el resultado y luego **Publicar**.

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env      # pon un PAYLOAD_SECRET largo y aleatorio
npm run seed              # opcional: categorías y 4 empleados de ejemplo
npm run dev               # http://localhost:3000/admin
```

Las cuentas de ejemplo usan la contraseña `Cambiar.2026`, que debe cambiarse al entrar. Las cuentas son `admin@`, `catalogo@`, `ventas@` y `lectura@chevere.shop`. Si no ejecutas el seed, la primera cuenta que registres en `/admin` será la del administrador.

Para comprobar los permisos, ejecuta `npm run test:access`. Hace 20 pruebas de qué puede y qué no puede hacer cada rol.

## Producción

> **Guía paso a paso para publicar en Vercel + Neon + Cloudflare R2: [DESPLIEGUE.md](./DESPLIEGUE.md).**

- **Base de datos.** Define `DATABASE_URL=postgres://…` (por ejemplo Neon o Supabase) y el panel usará Postgres automáticamente. Sin esa variable usa SQLite, que sirve solo para desarrollo.
- **Imágenes.** Ya está integrado Cloudflare R2: si defines `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`, las fotos se guardan allí; sin ellas, en la carpeta `media/` (solo para local).
- Usa siempre HTTPS y un `PAYLOAD_SECRET` distinto en cada entorno.
- **Esquema de la base.** Con SQLite (local), Payload sincroniza las tablas solo; si al arrancar aparece un error del tipo "index … already exists", el esquema ya está al día: arranca con `DB_PUSH=no npm run dev`. Con Postgres el esquema solo cambia mediante migraciones (`npm run migrate:create -- nombre`); `vercel-build` las aplica en cada despliegue con `npm run migrate`.
- Define `NEXT_PUBLIC_SERVER_URL` (por ejemplo `https://chevere.shop`) para que el sitemap, Open Graph y los datos estructurados usen la URL real.
- **Pendiente:** el checkout con pasarela de pago (Stripe, PayPal o Pago Móvil). Por ahora el botón de pagar del carrito está desactivado.

## Estructura

```
src/access/roles.ts        roles y reglas de acceso
src/collections/           Productos, Categorías, Imágenes, Pedidos, Empleados, Registro
src/hooks/registro.ts      registro de cambios
src/seed.ts                datos iniciales
src/tests/access.test.ts   pruebas de permisos
```

## Guía de tallas

- Página pública en `/guia-de-tallas`: cómo medirse, buscador "¿Cuál es mi talla?" y tablas de Damas, Caballeros, Niños y Calzado (VE/EU ↔ US).
- Todas las medidas viven en `src/lib/tallas.ts`. Si tu mercancía calza distinto, cambia los números ahí y se actualizan la página, el buscador y el modal de cada producto.
- En el panel, cada producto tiene el campo **Calce de la talla** (Normal / Talla pequeño / Talla grande). Si eliges "Talla pequeño" (típico en ropa de Asia), la ficha muestra el aviso "pide una talla más".

## Ver la tienda en tu computadora

1. Instala Node.js (versión LTS) desde https://nodejs.org.
2. Descomprime `chevere-local.zip` en una carpeta.
3. Windows: doble clic en `iniciar.bat`. Mac: doble clic en `iniciar.command`.
4. Se abre http://localhost:3210. El panel está en http://localhost:3210/admin.

El paquete local ya trae la base de datos de demostración (`chevere.db`), las fotos (`media/`) y un `.env` con `DB_PUSH=no`.
