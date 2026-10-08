import { describe, expect, it } from "vitest";

import { getProductBySlug, getRelatedProducts, products } from "./mock-data";

describe("mock-data", () => {
  it("genera slugs únicos y sin acentos", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => /^[a-z0-9-]+$/.test(s))).toBe(true);
  });

  it("busca un producto por slug", () => {
    const p = products[0];
    expect(getProductBySlug(p.slug)).toBe(p);
    expect(getProductBySlug("no-existe")).toBeUndefined();
  });

  it("relacionados: misma categoría, sin el propio y respetando el límite", () => {
    const p = products.find((x) => x.category === "monitores")!;
    const related = getRelatedProducts(p, 2);
    expect(related).toHaveLength(2);
    expect(related.every((r) => r.category === "monitores" && r.id !== p.id)).toBe(true);
  });
});
