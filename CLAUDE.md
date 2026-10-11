# basicTech

Ecommerce de productos de computación (PC, monitores, teclados, mouses, audio, componentes).
Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind 4, shadcn/ui (Base UI), PostgreSQL y Prisma.

**Roadmap completo y estado de cada fase: `doc/plan.md`.** Léelo antes de planificar trabajo nuevo y actualízalo cuando cambie una fase, una ruta o una limitación.
**Modelo de datos, roles, flujos de estado, API routes y errores: `doc/modelo-datos.md`** (el esquema de `prisma/schema.prisma` debe coincidir con su sección 3).
**Diseño visual: `.interface-design/system.md`** (dirección «datasheet técnico»).

@AGENTS.md

## Estado actual

Interfaz completa con datos de ejemplo. Base de datos definida con Prisma 7 (`prisma/schema.prisma`, migración inicial, `src/lib/db.ts`) y con seed del catálogo de ejemplo (`prisma/seed.ts`). La tienda (home, categoría, producto, carrito, checkout, favoritos) ya lee el catálogo de la base; admin, cuenta y pedidos siguen con mock. Auth.js y pagos sin iniciar.

## Comandos

- `npm run dev`: servidor en http://localhost:3000
- `npm test`: Vitest sobre la lógica de `src/lib`
- Un solo archivo: `npx vitest run src/lib/cart.test.ts`; por nombre: `npx vitest run -t "texto"`
- `npm run lint`, `npx tsc --noEmit`, `npm run build`
- Base de datos (requiere Docker y `.env` copiado de `.env.example`): `npm run db:up`, `npm run db:deploy` (aplica migraciones), `npm run db:migrate` (crea una nueva), `npm run db:seed` (carga el catálogo de ejemplo, repetible), `npm run db:studio`. Tras clonar o cambiar el esquema: `npm run db:generate` (el cliente en `src/generated/` no se versiona).

## Convenciones

- Interfaz en español. Dinero en centavos (`priceCents`) formateado con `formatPrice` (`src/lib/format.ts`). `formatUsd` es solo para las pantallas que aún leen mocks en dólares.
- La lógica de negocio va en funciones puras de `src/lib/*.ts`, con su test al lado (`*.test.ts`). Los componentes solo la usan.
- Los componentes de `src/components/ui/` los genera shadcn (`npx shadcn@latest add <nombre>`). Usan Base UI: el patrón es `render={<Link />}`, no `asChild`.
- La tienda vive en `src/app/(tienda)/`; `src/app/admin/` tiene su propio layout.
- Datos de ejemplo en `src/lib/mock-*.ts`. Al conectar el backend se reemplazan, no se mezclan.
- Reglas obligatorias de `doc/plan.md` §11: formularios en páginas dedicadas (no modales), escrituras por Route Handlers (no Server Actions), estado global con Zustand, formularios con react-hook-form + Zod.
- Etiquetas y cifras (precios, importes, specs, SKU) usan `.spec-label` y `.spec-value` de `globals.css` (Geist Mono, tabular). Colores siempre con tokens semánticos (`bg-card`, `text-muted-foreground`), nunca grises literales.
- Los errores esperados se lanzan como `AppError` (`src/lib/errors.ts`) y `toErrorResponse` los traduce a HTTP; un error desconocido nunca expone su mensaje.

## Arquitectura

- Estado del cliente (carrito, favoritos): `createPersistedStore` (`src/lib/persisted-store.ts`) envuelve `localStorage` para `useSyncExternalStore` y valida con `parse` lo leído. `cart-store.ts` y `favorites-store.ts` son hooks finos sobre él; la lógica real está en `cart.ts` y `favorites.ts`. Pendiente migrarlo a Zustand (`plan.md` §11).
- Catálogo: las páginas leen con `src/lib/server/catalog.ts` (`use cache`, etiqueta `catalog`), nunca llamando a su propia API. Los componentes de cliente usan `/api/products` (listado paginado o `?ids=` vía `useCatalogProducts`). Cada Route Handler va envuelto en `handler()` (`src/lib/api-handler.ts`).
- Las acciones del admin, login, registro y pago son inertes (muestran un aviso de demostración). No asumas que persisten nada.
- Ninguna pantalla se ha probado en un navegador (`tsc`, `build`, `lint` y tests sí pasan).
- `error.tsx` y `global-error.tsx` reciben `retry()`; en este Next reemplaza al antiguo `reset`. Ante dudas de API de Next, lee `node_modules/next/dist/docs/`.

## Cuidados

- Con Cache Components, no uses `new Date()` ni datos dinámicos en componentes de servidor sin envolverlos; el build falla.
- Tras mover o renombrar rutas, borra `.next` y luego corre `npx next typegen` antes de `npx tsc --noEmit`: sin `.next`, `PageProps`, `LayoutProps` y `RouteContext` no existen y `tsc` falla.
- `npm run build` necesita la base levantada (`npm run db:up`): el catálogo se prerenderiza con datos de PostgreSQL.
- `/admin/*` y `/cuenta/*` no tienen control de acceso todavía. No publicar así.
- Secretos solo por variables de entorno. No hacer commit de `.env`.