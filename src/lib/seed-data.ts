import type { Category, Product } from "./mock-data";

/** Convierte un texto en slug de URL: minúsculas, sin acentos, guiones entre palabras. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** USD a centavos. Redondea para que 19.99 no quede en 1998.9999. */
export function toCents(usd: number): number {
  return Math.round(usd * 100);
}

export type SeedBrand = { slug: string; name: string };

export type SeedProduct = {
  slug: string;
  name: string;
  popularity: number;
  isNew: boolean;
  specs: Record<string, string>;
  categorySlug: string;
  brandSlug: string;
  /** Cada producto del mock se vende como una sola variante sin opciones. */
  variant: { sku: string; priceCents: number; stock: number; options: Record<string, never>; isDefault: true };
};

export type SeedData = { categories: Category[]; brands: SeedBrand[]; products: SeedProduct[] };

/** SKU estable a partir del id del mock: el id 7 da `BT-0007`. */
export function skuFor(productId: string): string {
  return `BT-${productId.padStart(4, "0")}`;
}

/** Traduce el catálogo de ejemplo al modelo de la base (`doc/modelo-datos.md` §3 y §8). */
export function buildSeedData(categories: Category[], products: Product[]): SeedData {
  const brands = new Map<string, SeedBrand>();
  for (const p of products) {
    const slug = slugify(p.brand);
    if (!brands.has(slug)) brands.set(slug, { slug, name: p.brand });
  }

  return {
    categories,
    brands: [...brands.values()],
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      popularity: p.popularity,
      isNew: p.isNew,
      specs: p.specs,
      categorySlug: p.category,
      brandSlug: slugify(p.brand),
      variant: { sku: skuFor(p.id), priceCents: toCents(p.price), stock: p.stock, options: {}, isDefault: true },
    })),
  };
}
