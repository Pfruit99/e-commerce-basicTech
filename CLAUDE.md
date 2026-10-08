# basicTech

Ecommerce de productos de computación (PC, monitores, teclados, mouses, audio, componentes).
Stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind 4, shadcn/ui (Base UI), PostgreSQL y Prisma.

**Roadmap completo y estado de cada fase: `doc/plan.md`.** Léelo antes de planificar trabajo nuevo y actualízalo cuando cambie una fase, una ruta o una limitación.

@AGENTS.md

## Estado actual

Interfaz completa con datos de ejemplo. Backend (Prisma, PostgreSQL, Auth.js, pagos) sin iniciar.

## Comandos

- `npm run dev`: servidor en http://localhost:3000
- `npm test`: Vitest sobre la lógica de `src/lib`
- `npm run lint`, `npx tsc --noEmit`, `npm run build`

## Convenciones

- Interfaz en español. Precios en USD con `formatPrice` (`src/lib/format.ts`).
- La lógica de negocio va en funciones puras de `src/lib/*.ts`, con su test al lado (`*.test.ts`). Los componentes solo la usan.
- Los componentes de `src/components/ui/` los genera shadcn (`npx shadcn@latest add <nombre>`). Usan Base UI: el patrón es `render={<Link />}`, no `asChild`.
- La tienda vive en `src/app/(tienda)/`; `src/app/admin/` tiene su propio layout.
- Datos de ejemplo en `src/lib/mock-*.ts`. Al conectar el backend se reemplazan, no se mezclan.

## Cuidados

- Con Cache Components, no uses `new Date()` ni datos dinámicos en componentes de servidor sin envolverlos; el build falla.
- Tras mover o renombrar rutas, borra `.next` antes de `npx tsc --noEmit` (los tipos de rutas quedan viejos).
- `/admin/*` y `/cuenta/*` no tienen control de acceso todavía. No publicar así.
- Secretos solo por variables de entorno. No hacer commit de `.env`.
