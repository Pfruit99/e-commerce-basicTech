import { describe, expect, it } from "vitest";

import { categories, products } from "./mock-data";
import { buildSeedData, skuFor, slugify, toCents } from "./seed-data";

describe("seed-data", () => {
  it("slugify quita acentos y símbolos", () => {
    expect(slugify("Mouse Básico M100")).toBe("mouse-basico-m100");
    expect(slugify("  HyperX!  ")).toBe("hyperx");
  });

  it("toCents redondea sin errores de coma flotante", () => {
    expect(toCents(799)).toBe(79900);
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it("skuFor rellena el id con ceros", () => {
    expect(skuFor("7")).toBe("BT-0007");
    expect(skuFor("22")).toBe("BT-0022");
  });

  it("convierte el catálogo de ejemplo completo", () => {
    const data = buildSeedData(categories, products);
    expect(data.categories).toHaveLength(6);
    expect(data.products).toHaveLength(22);

    const skus = data.products.map((p) => p.variant.sku);
    expect(new Set(skus).size).toBe(skus.length);

    const zenith = data.products.find((p) => p.name === "Notebook Zenith 15")!;
    expect(zenith.variant).toEqual({ sku: "BT-0001", priceCents: 79900, stock: 12, options: {}, isDefault: true });
    expect(zenith.brandSlug).toBe("asus");
  });

  it("deduplica marcas y toda referencia apunta a una existente", () => {
    const data = buildSeedData(categories, products);
    const brandSlugs = data.brands.map((b) => b.slug);
    expect(new Set(brandSlugs).size).toBe(brandSlugs.length);
    expect(brandSlugs).toContain("logitech");

    const categorySlugs = new Set(data.categories.map((c) => c.slug));
    for (const p of data.products) {
      expect(brandSlugs).toContain(p.brandSlug);
      expect(categorySlugs.has(p.categorySlug as never)).toBe(true);
    }
  });
});
