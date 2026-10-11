# basicTech

Tienda online de productos de computación: PC, monitores, teclados, mouses, audio y componentes.

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind 4 · shadcn/ui (Base UI) · PostgreSQL 18 · Prisma 7 · Better Auth · Zod · Vitest.

## Estado

| Parte | Estado |
| --- | --- |
| Catálogo (home, categorías, ficha de producto) | Lee de PostgreSQL. Filtros, orden y paginación por API |
| Carrito, checkout y favoritos | Funcionan en el navegador (`localStorage`); precios y stock se leen de la API |
| Registro, inicio y cierre de sesión | Reales, con Better Auth |
| `/cuenta` y `/admin` | Protegidas: `/cuenta` para clientes, `/admin` solo para administradores |
| Pedidos, pagos y acciones del admin | Datos de ejemplo. Todavía no guardan nada |

El roadmap completo está en [`doc/plan.md`](doc/plan.md) y el modelo de datos en [`doc/modelo-datos.md`](doc/modelo-datos.md).

## Cómo funciona

```text
Navegador ──► proxy.ts ──► páginas (Server Components) ──► src/lib/server/* ──► Prisma ──► PostgreSQL
    │                                                           ▲
    └──────► /api/* (Route Handlers) ───────────────────────────┘
```

- **Catálogo.** Las páginas leen la base con `src/lib/server/catalog.ts`. Esas lecturas se cachean una hora con `use cache` y la etiqueta `catalog`. Los componentes de cliente piden a `/api/products`: el listado al cambiar un filtro, y el carrito y los favoritos con `?ids=`.
- **Dinero.** Siempre en centavos (`priceCents`). Solo se convierte a dólares al mostrarlo (`formatPrice`).
- **Autenticación.** Better Auth con email y contraseña:
  - Las contraseñas se guardan con hash scrypt.
  - La sesión se guarda en la tabla `Session` y viaja en una cookie `httpOnly` y `SameSite=Lax`. Con HTTPS, la cookie también es `secure`.
  - Hay límite de intentos: 5 inicios de sesión y 3 registros por minuto y por IP.
- **Rutas protegidas.** Tres capas:
  1. `src/proxy.ts` manda al login a quien llega sin cookie de sesión. Es solo una redirección rápida: no valida nada.
  2. Cada layout y cada página de `/cuenta` y `/admin` valida la sesión en el servidor con `requirePageAccess`. Revisa la sesión, el rol y si el usuario está bloqueado.
  3. Los Route Handlers que exigen sesión usan `requireUser()` o `requireAdmin()`.
- **Errores de la API.** Todas las respuestas de error tienen la forma `{ "error": { "code", "message", "details?" } }`. Un error inesperado nunca expone detalles internos.
- **Lógica de negocio.** Vive en funciones puras de `src/lib/*.ts`, cada una con su test al lado.

### API

| Método y ruta | Descripción |
| --- | --- |
| `GET /api/categories` | Categorías |
| `GET /api/products` | Listado con filtros. Parámetros: `category`, `brand` (repetible), `minPrice` y `maxPrice` en centavos, `spec.<Clave>`, `sort` (`popularity`, `price_asc`, `price_desc`, `name`), `page` y `pageSize` (máximo 48) |
| `GET /api/products?ids=a,b` | Productos por id (máximo 50) |
| `GET /api/products/[slug]` | Detalle de un producto, o `404` |
| `/api/auth/*` | Better Auth: `sign-up/email`, `sign-in/email`, `sign-out` y `get-session` |

## Puesta en marcha

Necesitas Node.js 22 o superior y Docker.

```bash
npm install
cp .env.example .env          # cambia las contraseñas y genera BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:up                 # PostgreSQL en Docker, solo en 127.0.0.1:5432
npm run db:deploy             # aplica las migraciones
npm run db:generate           # genera el cliente de Prisma (src/generated, no se versiona)
npm run db:seed               # carga el catálogo de ejemplo; si .env define SEED_ADMIN_*, crea ese administrador
npm run dev                   # http://localhost:3000
```text

Para entrar al admin, define `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env`, corre `npm run db:seed` e inicia sesión con esa cuenta. Las cuentas creadas desde `/registro` son siempre de cliente.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` / `build` / `start` | Desarrollo, build de producción y servidor de producción. **El build necesita la base levantada**, porque el catálogo se prerenderiza con datos reales |
| `npm test` | Tests unitarios (Vitest) de `src/lib` |
| `npm run test:api` | Tests de integración (Supertest) contra un servidor en marcha |
| `npm run lint`, `npx tsc --noEmit` | Lint y comprobación de tipos |
| `npm run db:up` / `db:down` | Levanta o detiene PostgreSQL |
| `npm run db:migrate` | Crea una migración nueva tras cambiar `prisma/schema.prisma` |
| `npm run db:deploy` / `db:seed` / `db:studio` | Aplica migraciones, carga datos de ejemplo y abre Prisma Studio |

### Tests de la API

`npm run test:api` prueba la API con un servidor real. Cubre el catálogo (filtros, paginación y errores `400`/`404`) y la autenticación: registro, login, sesión, roles, usuario bloqueado, límite de intentos y que una página protegida no envíe su contenido a quien no tiene permiso.

```bash
npm run db:up && npm run db:seed
npm run build && npm start    # en otra terminal; debe coincidir con BETTER_AUTH_URL
npm run test:api              # usa API_BASE_URL, por defecto http://localhost:3000
```

Los usuarios que crean los tests usan el dominio `@api-test.basictech.local` y se borran al terminar.

## Estructura

```text
prisma/              Esquema, migraciones y seed
src/proxy.ts         Redirección rápida de /cuenta y /admin sin cookie de sesión
src/app/(tienda)/    Tienda: home, categoría, producto, carrito, checkout, login, registro, cuenta
src/app/admin/       Panel de administración
src/app/api/         Route Handlers (catálogo y Better Auth)
src/components/      Componentes; ui/ los genera shadcn
src/lib/             Lógica pura con sus tests (catálogo, carrito, autorización, esquemas Zod, errores)
src/lib/server/      Acceso a datos y sesión, solo para el servidor
tests/api/           Tests de integración de la API
doc/                 Plan del proyecto y modelo de datos
```

## Seguridad

- Los secretos van solo en `.env`, que no se sube al repositorio.
- `/registro` no permite elegir el rol: el campo `role` lo controla el servidor.
- Un usuario bloqueado no puede iniciar sesión y pierde el acceso en su siguiente petición.
- El parámetro `?next=` del login solo acepta rutas internas, así que no se puede usar para redirigir a otro sitio.
