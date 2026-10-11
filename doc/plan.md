# Plan del proyecto: tienda de computación basicTech

Ecommerce de productos de computación: PC, monitores, teclados, mouses, audio y componentes.

- **Stack:** Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), PostgreSQL y Prisma.
- **Estrategia:** primero la interfaz completa con datos de ejemplo, después el backend.
- **Referencia visual:** captura "Stella" (listado con filtros laterales, tarjetas de producto, header con buscador). Adaptada a computación.
- **Estado (2026-10-11):** interfaz completa. Catálogo de la tienda leído desde PostgreSQL (API de catálogo). Registro, login y rutas protegidas con Better Auth. Pedidos, pagos y acciones del admin siguen con datos de ejemplo.

---

## 1. Decisiones de diseño

| Tema | Decisión |
| --- | --- |
| Marca | "basicTech" con logo de texto provisional |
| Color de acento | Turquesa (`oklch(0.6 0.12 195)` en claro, `oklch(0.75 0.12 195)` en oscuro) |
| Tema | Claro, oscuro y sistema, con toggle en el header (`next-themes`, clase `dark`) |
| Idioma | Español |
| Moneda | USD, formateada con `Intl.NumberFormat` (`src/lib/format.ts`) |
| Filtros por categoría | Propios de cada tipo de producto (RAM, tamaño, conexión...) en lugar de talla y color |
| Imágenes | Marcadores con ícono por categoría (`ProductImage`) hasta tener fotos reales |

## 2. Fases de la interfaz

| Fase | Contenido | Estado |
| --- | --- | --- |
| 0 | Setup: Next.js, Tailwind, shadcn/ui, tokens de color, tema claro/oscuro | Hecha |
| 1 | Layout global: header (barra de beneficios, buscador, categorías, carrito, favoritos, cuenta), footer y menú móvil | Hecha |
| 2 | Home: hero, categorías, más vendidos, banner, recién llegados, marcas, beneficios | Hecha |
| 3 | Listado por categoría con filtros, orden, vista grilla/lista y paginación pendiente | Hecha (sin paginación) |
| 4 | Detalle de producto: galería, compra, pestañas de specs/descripción/reseñas, relacionados | Hecha |
| 5 | Carrito (panel y página), checkout en 3 pasos y confirmación | Hecha |
| 6 | Login, registro, perfil, pedidos y favoritos | Hecha |
| 7 | Admin: resumen, tabla de productos, formulario de producto y pedidos | Hecha |
| 8 | Panel de administración propio (menú lateral y barra superior, sin cabecera de tienda) con gestión de productos (editar, eliminar), pagos y usuarios | Hecha |
| 9 | Hero de la home compacto y en carrusel (3 diapositivas, autoavance con pausa, flechas y puntos) | Hecha |
| 10 | Rediseño "datasheet técnico": neutros con matiz turquesa, Geist Mono para specs y cifras (`.spec-label`, `.spec-value` en `globals.css`), tarjeta de producto, home y resumen del admin. Falta aplicarlo a detalle de producto, carrito, checkout, cuenta y el resto del admin | Parcial |

## 3. Mapa de rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Home |
| `/categoria/[slug]` | Listado con filtros. Slugs: `pc`, `monitores`, `teclados`, `mouses`, `audio`, `componentes` |
| `/producto/[slug]` | Detalle de producto |
| `/carrito` | Carrito |
| `/checkout` | Checkout en pasos: datos, envío, pago |
| `/checkout/confirmacion?orden=XXXXXXXX` | Pedido confirmado |
| `/login`, `/registro` | Acceso con Better Auth. Aceptan `?next=` (solo rutas internas) |
| `/cuenta` | Perfil |
| `/cuenta/pedidos` | Pedidos |
| `/cuenta/favoritos` | Favoritos |
| `/admin` | Resumen: tarjetas, ventas de 7 días, stock a reponer, últimos pagos |
| `/admin/productos` | Tabla de productos con búsqueda, filtro y acciones (editar, ver, eliminar) |
| `/admin/productos/nuevo` | Alta de producto |
| `/admin/productos/[id]/editar` | Edición de producto (formulario precargado) |
| `/admin/pedidos` | Pedidos |
| `/admin/pagos` | Pagos con totales por estado y filtro por estado |
| `/admin/usuarios` | Usuarios con búsqueda, filtro por rol y acciones |
| `/api/auth/*` | Better Auth: `sign-up/email`, `sign-in/email`, `sign-out`, `get-session` |
| `GET /api/categories` | Categorías (`{ items }`) |
| `GET /api/products` | Listado con filtros, orden y paginación (`{ items, total, page, pageSize }`), o `?ids=a,b` para el carrito y favoritos |
| `GET /api/products/[slug]` | Detalle de un producto activo; `404` si no existe |

## 4. Estructura del código

```
src/
├─ app/                  Rutas. `(tienda)/` agrupa la tienda con su cabecera y pie; `admin/` tiene su propio layout
├─ components/
│  ├─ ui/                Componentes shadcn/ui generados
│  ├─ layout/            Header, footer, enlace de favoritos
│  ├─ theme/             Proveedor y toggle de tema
│  ├─ catalog/           Vista de catálogo y panel de filtros
│  ├─ product/           Tarjeta, imagen, galería, panel de compra, favorito
│  ├─ cart/              Panel, líneas, resumen y página del carrito
│  ├─ checkout/          Checkout en pasos
│  ├─ account/           Navegación, formularios y favoritos de la cuenta
│  ├─ home/              Carrusel del hero
│  └─ admin/             Menú, barra superior, tablas, formularios y acciones de fila
└─ lib/
   ├─ server/catalog.ts  Lecturas del catálogo con Prisma y `use cache` (páginas y Route Handlers)
   ├─ catalog-api.ts     Validación de query (Zod), conversión de filas, facetas y paginación
   ├─ catalog-types.ts   Tipos del catálogo (precios en centavos)
   ├─ api-handler.ts     Envoltorio de errores para Route Handlers
   ├─ auth.ts            Configuración de Better Auth (solo servidor); auth-client.ts para el cliente
   ├─ authz.ts           Reglas de acceso puras: authorize, requiredAccess, safeRedirect
   ├─ auth-schemas.ts    Esquemas Zod de login y registro, y mensajes de error
   ├─ server/session.ts  getSession, requireUser, requireAdmin, requirePageAccess
   ├─ use-catalog-products.ts  Hook que pide productos por id a la API
   ├─ seed-data.ts       Conversión del mock para el seed
   ├─ mock-data.ts       Categorías y 22 productos de ejemplo (fuente del seed; el admin aún los lee)
   ├─ mock-account.ts    Usuario y pedidos de ejemplo
   ├─ mock-admin.ts      Usuarios, pagos y ventas de ejemplo para el admin
   ├─ catalog.ts         Filtrar, ordenar, contar marcas, histograma de precios
   ├─ cart.ts            Lógica pura del carrito y envío
   ├─ favorites.ts       Lógica pura de favoritos
   ├─ admin.ts           Estadísticas, búsquedas y totales de pagos del admin
   ├─ persisted-store.ts Store sobre localStorage
   ├─ cart-store.ts      Hook `useCart`
   ├─ favorites-store.ts Hook `useFavorites`
   └─ format.ts          `formatPrice` (centavos) y `formatUsd` (dólares, solo pantallas con mock)
```

Regla seguida: la lógica de negocio vive en funciones puras de `src/lib/*.ts` con tests al lado (`*.test.ts`). Los componentes solo la usan.

## 5. Reglas de negocio ya implementadas (con datos de ejemplo)

- **Envío:** US$15, gratis desde US$500 de subtotal. Carrito vacío no paga envío.
- **Stock:** la cantidad en carrito nunca supera el stock del producto.
- **Stock bajo:** 5 unidades o menos se marcan como "bajo"; 0 es "agotado".
- **Filtros:** marca, rango de precio y specs propias de cada categoría, combinables.
- **Orden:** popularidad, precio ascendente o descendente, nombre.
- **Persistencia:** carrito y favoritos se guardan en `localStorage` y se validan al leerlos.

## 6. Calidad y pruebas

- **Tests:** Vitest, 107 tests unitarios sobre `src/lib` (`npm test`) y 35 de integración con Supertest contra el servidor real (`npm run test:api`, en `tests/api/`).
- **Comprobaciones:** `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` y `npm run test:api` en verde (2026-10-11).
- **Errores:** `error.tsx` y `not-found.tsx` en `(tienda)` y `admin`, más `global-error.tsx`. En esta versión de Next el reintento es `retry()`. Contrato de errores de la API en `src/lib/errors.ts` y `doc/modelo-datos.md` (7.1).
- **No verificado:** ninguna pantalla se probó en un navegador. Falta revisar a mano el toggle de tema, filtros, slider, carrito, checkout y formularios, en claro y oscuro y a ancho móvil.
- **Dependencias:** `npm audit` marca vulnerabilidades altas en `braces`, dentro de la cadena de `eslint` (solo desarrollo). No se aplicó `npm audit fix --force` porque degrada Next a v14.

## 7. Limitaciones conocidas

- **Acciones del admin inertes:** editar, eliminar, bloquear, cambiar rol y reembolsar muestran un aviso de demostración y no cambian datos.
- **Perfil sin guardar:** `/cuenta` muestra nombre, email y teléfono de la sesión, pero guardar no persiste (falta `PATCH /api/me`) y la dirección es de ejemplo. Sin recuperación de contraseña ni verificación de email.
- **Pago simulado:** no se piden ni procesan datos de tarjeta. El número de pedido es aleatorio y no se guarda.
- **404 con estado 200:** una URL inexistente como `/producto/nope` muestra la página "no encontrada" pero responde HTTP 200, por el streaming de Cache Components. Revisar con datos reales por el efecto en SEO.
- **Sin búsqueda funcional** en el header ni comparador de productos. El listado pagina por la API.
- **El build necesita la base:** las páginas del catálogo se prerenderizan con datos de PostgreSQL, así que `npm run build` falla sin `npm run db:up`.
- **Orden y paginación en memoria:** la API filtra en la base pero ordena y corta en el servidor de Next, porque el precio vive en la variante. Suficiente para el catálogo actual; revisar con miles de productos.
- **Admin, cuenta y pedidos siguen con mock:** usan ids `1`…`22` y montos en dólares (`formatUsd`), no los productos de la base.
- **Fotos y reseñas de ejemplo.** Las reseñas están escritas a mano en la página de producto.
- **Proyecto en OneDrive:** la sincronización de `.git` y `node_modules` puede dar problemas. Valorar moverlo fuera.

## 8. Próximas etapas (backend)

Orden propuesto:

1. **Modelo de datos con Prisma y PostgreSQL:** hecho. 12 tablas en `prisma/schema.prisma` (detalle en `doc/modelo-datos.md`), dinero en centavos, cliente en `src/lib/db.ts`. `prisma`, `@prisma/client` y `@prisma/adapter-pg` fijados en 7.10.0 exacto (sin `^`).
2. **Migraciones y seed:** migración inicial hecha (`prisma/migrations/20261009000000_init`), aplicada y verificada contra el contenedor de `docker-compose.yml` (Postgres 18.6, 2026-10-10): 12 tablas, 7 `CHECK`, sin diferencias con `schema.prisma` y el cliente con `@prisma/adapter-pg` consulta bien. Seed hecho (`prisma/seed.ts`, `npm run db:seed`): 6 categorías, 16 marcas y 22 productos con una variante cada uno (SKU `BT-0001`…, precios en centavos). Idempotente (upsert por slug y SKU). La conversión vive en `src/lib/seed-data.ts` con su test. No crea usuarios: falta decidir el hash de contraseñas.
3. **Catálogo real:** hecho para la tienda (2026-10-10). Home, categoría, producto, cabecera y pie leen de la base con `src/lib/server/catalog.ts` (una consulta con `include`, sin N+1, cacheada con la etiqueta `catalog`). El listado filtra y pagina con `GET /api/products`; carrito, checkout y favoritos resuelven productos con `?ids=`. Precios en centavos en toda la tienda. Falta: el admin y la cuenta siguen con mock.
4. **Autenticación:** hecha (2026-10-11) con Better Auth (detalle en `doc/modelo-datos.md` §7). Incluye registro e inicio de sesión con react-hook-form + Zod, menú de usuario y cierre de sesión. `/cuenta` exige sesión y `/admin` el rol `ADMIN`: el proxy redirige sin cookie y el servidor valida en el layout y en cada página. Se bloquea a usuarios `BLOCKED` y hay límite de intentos. El seed crea un admin con `SEED_ADMIN_*`.
5. **Carrito y favoritos persistentes:** migrar los stores a Zustand (§11) y pasar de `localStorage` a base de datos para usuarios con sesión, conservando el carrito de invitado.
6. **Pedidos y pagos:** crear pedidos en el servidor, recalcular precios y stock allí (no confiar en el cliente), integrar una pasarela de pago y confirmar por webhook.
7. **Admin real:** CRUD de productos y gestión de pedidos con autorización por rol.
8. **Imágenes reales:** almacenamiento y optimización con `next/image`.
9. **Pulido:** búsqueda, paginación, comparador, SEO (metadatos, sitemap, 404 correcto), accesibilidad y pruebas end to end.

### Requisitos de seguridad a respetar

- Secretos solo en variables de entorno, nunca en el repositorio.
- No escribir sesiones propias: usar una librería de autenticación probada.
- Comprobar autorización (no solo autenticación) antes de devolver datos.
- Validar y sanear toda entrada del cliente en el servidor.
- Antes de añadir una dependencia, revisar que esté mantenida y sin vulnerabilidades conocidas.

## 9. Cómo ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # tests de la lógica
npm run lint
npm run build
```

## 10. Historial de commits

| Commit | Contenido |
| --- | --- |
| `70ec35f` | Commit inicial con `.gitignore` |
| `56e4f3d` | Scaffold, shadcn/ui, header, footer y toggle de tema |
| `104bd20` | Ignorar archivos locales de herramientas |
| `6889345` | Home y listado con filtros |
| `cfc6bc9` | Detalle de producto |
| `8067c31` | Carrito, checkout y confirmación |
| `9b3216b` | Login, cuenta y favoritos |
| `fcece2b` | Admin |
| `06b02b6` | Documento del plan |
| `4b5d0e2` | Panel de administración propio y carrusel del hero |
| `4b68bdd` | `CLAUDE.md` apuntando al plan |
| `c9dadd3` | Dejar de versionar estado local de sesión |
| `6c26185` | PostgreSQL con Prisma 7 y modelo de datos documentado |
| `b86ade7` | Rediseño "datasheet técnico" (tokens, tarjeta, home, resumen admin) |
| `22eddab` | Páginas de error y contrato de errores de la API |
| `b333874` | `CLAUDE.md` y plan actualizados con base de datos, diseño y errores |

## 11. Reglas_configuracion

Estas reglas mandan sobre cualquier otra indicación de los documentos.

- Al crear datos nuevos no uses modales: usa páginas dedicadas para los formularios.
- No uses Server Actions: todas las escrituras van por Route Handlers (`src/app/api/`, contrato en `doc/modelo-datos.md` §7).
- Para el estado global usa Zustand.
- Para formularios usa react-hook-form y Zod. Los esquemas Zod se comparten con la validación de los Route Handlers.

**Pendiente de aplicar al código existente** (ninguna de estas librerías está instalada aún):

- Carrito y favoritos usan `createPersistedStore` (propio, sobre `useSyncExternalStore`). Migrarlos a Zustand con su middleware `persist`, manteniendo la validación de lo leído y las funciones puras de `cart.ts` y `favorites.ts`.
- Los formularios actuales (login, registro, perfil, checkout, producto del admin) son inertes y sin librería. Pasarlos a react-hook-form + Zod al conectarlos al backend.
