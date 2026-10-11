import { z } from "zod";

import { countBy, priceBounds, priceHistogram, sortProducts, type SortKey } from "./catalog";
import type { CatalogFacets, CatalogProduct, Page } from "./catalog-types";
import { AppError } from "./errors";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;
/** Máximo de ids por petición en `GET /api/products?ids=`. */
export const MAX_IDS = 50;

/** Valores de `sort` en la API (`doc/modelo-datos.md` §7) y su equivalente en la interfaz. */
export const API_SORT = { popularity: "popular", price_asc: "price-asc", price_desc: "price-desc", name: "name" } as const;
export type ApiSort = keyof typeof API_SORT;

export const SORT_TO_API: Record<SortKey, ApiSort> = {
  popular: "popularity",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  name: "name",
};

export type ProductQuery = {
  category?: string;
  brands: string[];
  /** Centavos, inclusive. */
  minPrice?: number;
  maxPrice?: number;
  /** Valores permitidos por clave de spec. */
  specs: Record<string, string[]>;
  sort: SortKey;
  page: number;
  pageSize: number;
};

const text = z.string().trim().min(1).max(100);
const cents = z.coerce.number().int().min(0).max(100_000_000);

const listSchema = z
  .object({
    category: text.optional(),
    brand: z.array(text).max(50).default([]),
    minPrice: cents.optional(),
    maxPrice: cents.optional(),
    sort: z.enum(Object.keys(API_SORT) as [ApiSort, ...ApiSort[]]).default("popularity"),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  })
  .strict()
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: "minPrice no puede ser mayor que maxPrice",
    path: ["minPrice"],
  });

const idsSchema = z.array(z.string().trim().min(1).max(64)).min(1).max(MAX_IDS);

function validationError(error: z.ZodError): AppError {
  return new AppError("VALIDATION", "Parámetros inválidos.", {
    details: error.issues.map((i) => ({
      // Un parámetro desconocido no tiene ruta: se nombra por sus claves.
      field: i.code === "unrecognized_keys" ? i.keys.join(",") : i.path.join("."),
      message: i.message,
    })),
  });
}

/**
 * Valida la query de `GET /api/products`. Las specs llegan como `spec.<Clave>=valor` (repetible).
 * Rechaza parámetros desconocidos. Lanza `AppError("VALIDATION")`.
 */
export function parseProductQuery(params: URLSearchParams): ProductQuery {
  const specs: Record<string, string[]> = {};
  const rest: Record<string, unknown> = { brand: params.getAll("brand") };

  for (const [key, value] of params) {
    if (key.startsWith("spec.")) {
      const name = key.slice(5);
      const parsed = text.safeParse(value);
      if (!name || name.length > 50 || !parsed.success) {
        throw new AppError("VALIDATION", "Parámetros inválidos.", { details: [{ field: key, message: "Spec inválida" }] });
      }
      (specs[name] ??= []).push(parsed.data);
    } else if (key !== "brand") {
      rest[key] = value;
    }
  }

  const result = listSchema.safeParse(rest);
  if (!result.success) throw validationError(result.error);
  const q = result.data;
  return {
    category: q.category,
    brands: q.brand,
    minPrice: q.minPrice,
    maxPrice: q.maxPrice,
    specs,
    sort: API_SORT[q.sort],
    page: q.page,
    pageSize: q.pageSize,
  };
}

/** Valida `ids=a,b,c`. Devuelve `null` si no viene el parámetro. */
export function parseIds(params: URLSearchParams): string[] | null {
  const raw = params.get("ids");
  if (raw === null) return null;
  const result = idsSchema.safeParse([...new Set(raw.split(","))]);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

/** Arma la query string de `GET /api/products` a partir de una `ProductQuery`. */
export function toSearchParams(q: Partial<ProductQuery>): URLSearchParams {
  const params = new URLSearchParams();
  if (q.category) params.set("category", q.category);
  for (const b of q.brands ?? []) params.append("brand", b);
  if (q.minPrice !== undefined) params.set("minPrice", String(q.minPrice));
  if (q.maxPrice !== undefined) params.set("maxPrice", String(q.maxPrice));
  for (const [key, values] of Object.entries(q.specs ?? {})) for (const v of values) params.append(`spec.${key}`, v);
  if (q.sort && q.sort !== "popular") params.set("sort", SORT_TO_API[q.sort]);
  if (q.page && q.page > 1) params.set("page", String(q.page));
  if (q.pageSize && q.pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(q.pageSize));
  return params;
}

/** Forma mínima de una fila de producto leída con Prisma (`include` de categoría, marca y variante por defecto). */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  popularity: number;
  isNew: boolean;
  specs: unknown;
  category: { slug: string };
  brand: { name: string };
  variants: { id: string; sku: string; priceCents: number; stock: number }[];
};

/** `specs` es `Json` en la base: se queda solo con pares texto/texto. */
function toSpecs(raw: unknown): Record<string, string> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).filter((e): e is [string, string] => typeof e[1] === "string"));
}

/** Convierte una fila de la base al tipo de la tienda. Sin variante por defecto no se puede vender: `null`. */
export function toCatalogProduct(row: ProductRow): CatalogProduct | null {
  const variant = row.variants[0];
  if (!variant) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand.name,
    category: row.category.slug,
    priceCents: variant.priceCents,
    stock: variant.stock,
    popularity: row.popularity,
    isNew: row.isNew,
    specs: toSpecs(row.specs),
    variantId: variant.id,
    sku: variant.sku,
  };
}

/** Ordena y corta una página. El orden se hace aquí porque el precio vive en la variante (ver `listProducts`). */
export function paginate(items: CatalogProduct[], sort: SortKey, page: number, pageSize: number): Page<CatalogProduct> {
  const sorted = sortProducts(items, sort);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
}

/** Filtros del listado calculados sobre todos los productos de la categoría. */
export function buildFacets(products: CatalogProduct[], filterKeys: string[]): CatalogFacets {
  const bounds = priceBounds(products);
  return {
    brands: countBy(products, (p) => p.brand),
    specs: filterKeys.map((key) => ({ key, options: countBy(products, (p) => p.specs[key]) })),
    priceBounds: bounds,
    histogram: priceHistogram(products, bounds),
  };
}

/** Productos de la misma categoría, primero los de la misma marca y luego por popularidad. */
export function rankRelated(product: CatalogProduct, candidates: CatalogProduct[], limit = 4): CatalogProduct[] {
  return candidates
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand) || b.popularity - a.popularity)
    .slice(0, limit);
}

/** Parte una lista en trozos de `size`. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
