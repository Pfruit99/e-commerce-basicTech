import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { paginate, toCatalogProduct, type ProductQuery, type ProductRow } from "@/lib/catalog-api";
import type { CatalogCategory, CatalogProduct, Page } from "@/lib/catalog-types";
import { db } from "@/lib/db";

/**
 * Lecturas del catálogo. Las usan las páginas (Server Components) y los Route Handlers de `/api`.
 * Todas se cachean con la etiqueta `catalog`: el admin real deberá llamar a `revalidateTag(CATALOG_TAG, "max")`
 * al crear, editar o archivar productos. Requieren la base levantada también durante `next build`.
 */
export const CATALOG_TAG = "catalog";

const productInclude = {
  category: { select: { slug: true } },
  brand: { select: { name: true } },
  variants: { where: { isDefault: true }, take: 1, select: { id: true, sku: true, priceCents: true, stock: true } },
} satisfies Prisma.ProductInclude;

/** Solo productos visibles: sin archivar y con variante por defecto. */
const active = { archivedAt: null, variants: { some: { isDefault: true } } } satisfies Prisma.ProductWhereInput;

function toProducts(rows: ProductRow[]): CatalogProduct[] {
  return rows.flatMap((r) => toCatalogProduct(r) ?? []);
}

export async function getCategories(): Promise<CatalogCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.category.findMany({
    select: { slug: true, name: true, description: true, filterKeys: true },
    orderBy: { id: "asc" },
  });
}

export async function getCategory(slug: string): Promise<CatalogCategory | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.category.findUnique({ where: { slug }, select: { slug: true, name: true, description: true, filterKeys: true } });
}

/** Todos los productos activos de una categoría, para calcular los filtros del listado. */
export async function getCategoryProducts(slug: string): Promise<CatalogProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: { ...active, category: { slug } }, include: productInclude });
  return toProducts(rows);
}

/**
 * Listado filtrado y paginado de `GET /api/products`.
 * Filtra en la base (categoría, marca, precio de la variante por defecto y specs). Ordena y pagina en memoria
 * porque Prisma no ordena por un campo de una relación uno a muchos (el precio vive en la variante). Con un
 * catálogo grande conviene una consulta SQL propia o guardar el precio por defecto en `Product`.
 */
export async function listProducts(q: ProductQuery): Promise<Page<CatalogProduct>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const where: Prisma.ProductWhereInput = {
    ...active,
    ...(q.category ? { category: { slug: q.category } } : {}),
    ...(q.brands.length > 0 ? { brand: { name: { in: q.brands } } } : {}),
    ...(q.minPrice !== undefined || q.maxPrice !== undefined
      ? { variants: { some: { isDefault: true, priceCents: { gte: q.minPrice, lte: q.maxPrice } } } }
      : {}),
    AND: Object.entries(q.specs)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => ({ OR: values.map((v) => ({ specs: { path: [key], equals: v } })) })),
  };

  const rows = await db.product.findMany({ where, include: productInclude });
  return paginate(toProducts(rows), q.sort, q.page, q.pageSize);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const row = await db.product.findFirst({ where: { ...active, slug }, include: productInclude });
  return row ? toCatalogProduct(row) : null;
}

/** Productos activos por id, en el orden pedido. Los que no existen o están archivados se omiten. */
export async function getProductsByIds(ids: string[]): Promise<CatalogProduct[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: { ...active, id: { in: ids } }, include: productInclude });
  const byId = new Map(toProducts(rows).map((p) => [p.id, p]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

export async function getBestSellers(limit: number): Promise<CatalogProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: active,
    include: productInclude,
    orderBy: [{ popularity: "desc" }, { name: "asc" }],
    take: limit,
  });
  return toProducts(rows);
}

export async function getNewArrivals(limit: number): Promise<CatalogProduct[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { ...active, isNew: true },
    include: productInclude,
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    take: limit,
  });
  return toProducts(rows);
}

/** Marcas con al menos un producto activo, por nombre. */
export async function getBrandNames(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const brands = await db.brand.findMany({
    where: { products: { some: active } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return brands.map((b) => b.name);
}

/** Slugs de todos los productos activos, para `generateStaticParams`. */
export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: active, select: { slug: true } });
  return rows.map((r) => r.slug);
}
