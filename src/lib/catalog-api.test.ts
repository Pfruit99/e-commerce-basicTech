import { describe, expect, it } from "vitest";

import {
  MAX_IDS, buildFacets, chunk, paginate, parseIds, parseProductQuery, rankRelated, toCatalogProduct, toSearchParams,
  type ProductRow,
} from "./catalog-api";
import type { CatalogProduct } from "./catalog-types";
import { AppError } from "./errors";

const qs = (s: string) => new URLSearchParams(s);

const mk = (id: string, brand: string, priceCents: number, extra: Partial<CatalogProduct> = {}): CatalogProduct => ({
  id, slug: id, name: `P${id}`, brand, category: "pc", priceCents, stock: 1, popularity: 0, isNew: false, specs: {},
  variantId: `v${id}`, sku: id, ...extra,
});

function validationDetails(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).code).toBe("VALIDATION");
    return (err as AppError).details;
  }
  throw new Error("no lanzó");
}

describe("parseProductQuery", () => {
  it("aplica valores por defecto", () =>
    expect(parseProductQuery(qs(""))).toEqual({
      category: undefined, brands: [], minPrice: undefined, maxPrice: undefined, specs: {}, sort: "popular", page: 1, pageSize: 12,
    }));

  it("lee filtros repetibles, specs y orden", () => {
    const q = parseProductQuery(qs("category=pc&brand=Asus&brand=HP&minPrice=1000&maxPrice=5000&spec.RAM=16 GB&spec.RAM=8 GB&sort=price_desc&page=2"));
    expect(q).toMatchObject({
      category: "pc", brands: ["Asus", "HP"], minPrice: 1000, maxPrice: 5000, specs: { RAM: ["16 GB", "8 GB"] }, sort: "price-desc", page: 2,
    });
  });

  it("rechaza parámetros desconocidos", () => {
    const details = validationDetails(() => parseProductQuery(qs("foo=1")));
    expect(details).toEqual([{ field: "foo", message: expect.any(String) }]);
  });

  it("rechaza números inválidos, pageSize excesivo y orden desconocido", () => {
    validationDetails(() => parseProductQuery(qs("minPrice=-1")));
    validationDetails(() => parseProductQuery(qs("page=abc")));
    validationDetails(() => parseProductQuery(qs("pageSize=500")));
    validationDetails(() => parseProductQuery(qs("sort=random")));
  });

  it("rechaza un rango de precio invertido", () => {
    const details = validationDetails(() => parseProductQuery(qs("minPrice=500&maxPrice=100")));
    expect(details).toEqual([{ field: "minPrice", message: "minPrice no puede ser mayor que maxPrice" }]);
  });

  it("rechaza specs sin nombre o vacías", () => {
    validationDetails(() => parseProductQuery(qs("spec.=x")));
    validationDetails(() => parseProductQuery(qs("spec.RAM=")));
  });
});

describe("parseIds", () => {
  it("devuelve null sin parámetro", () => expect(parseIds(qs(""))).toBeNull());
  it("separa por comas y quita duplicados", () => expect(parseIds(qs("ids=a,b,a"))).toEqual(["a", "b"]));
  it("rechaza vacíos y demasiados ids", () => {
    validationDetails(() => parseIds(qs("ids=")));
    validationDetails(() => parseIds(qs(`ids=${Array.from({ length: MAX_IDS + 1 }, (_, i) => i).join(",")}`)));
  });
});

describe("toSearchParams", () => {
  it("omite valores por defecto y vuelve a parsear igual", () => {
    const params = toSearchParams({ category: "pc", brands: ["Asus"], specs: { RAM: ["16 GB"] }, sort: "price-asc", page: 1 });
    expect(params.toString()).toBe("category=pc&brand=Asus&spec.RAM=16+GB&sort=price_asc");
    expect(parseProductQuery(params)).toMatchObject({ category: "pc", brands: ["Asus"], specs: { RAM: ["16 GB"] }, sort: "price-asc" });
  });
});

describe("toCatalogProduct", () => {
  const row: ProductRow = {
    id: "p1", slug: "zenith", name: "Zenith", popularity: 5, isNew: true,
    specs: { RAM: "16 GB", raro: 3, lista: ["x"] },
    category: { slug: "pc" }, brand: { name: "Asus" },
    variants: [{ id: "v1", sku: "BT-0001", priceCents: 79900, stock: 12 }],
  };

  it("aplana categoría, marca y variante, y descarta specs que no son texto", () =>
    expect(toCatalogProduct(row)).toEqual({
      id: "p1", slug: "zenith", name: "Zenith", brand: "Asus", category: "pc", priceCents: 79900, stock: 12,
      popularity: 5, isNew: true, specs: { RAM: "16 GB" }, variantId: "v1", sku: "BT-0001",
    }));

  it("sin variante devuelve null", () => expect(toCatalogProduct({ ...row, variants: [] })).toBeNull());
  it("specs que no son objeto quedan vacías", () => expect(toCatalogProduct({ ...row, specs: ["a"] })?.specs).toEqual({}));
});

describe("paginate", () => {
  const items = [mk("1", "A", 300), mk("2", "A", 100), mk("3", "A", 200)];
  it("ordena antes de cortar y devuelve el total", () =>
    expect(paginate(items, "price-asc", 1, 2)).toEqual({ items: [items[1], items[2]], total: 3, page: 1, pageSize: 2 }));
  it("página fuera de rango queda vacía", () => expect(paginate(items, "popular", 5, 2).items).toEqual([]));
});

describe("buildFacets", () => {
  it("cuenta marcas y specs y calcula el rango de precio", () => {
    const f = buildFacets([mk("1", "Asus", 100, { specs: { RAM: "8 GB" } }), mk("2", "HP", 300, { specs: { RAM: "8 GB" } })], ["RAM"]);
    expect(f.brands).toEqual([["Asus", 1], ["HP", 1]]);
    expect(f.specs).toEqual([{ key: "RAM", options: [["8 GB", 2]] }]);
    expect(f.priceBounds).toEqual([100, 300]);
    expect(f.histogram.reduce((a, b) => a + b)).toBe(2);
  });
});

describe("rankRelated", () => {
  it("misma categoría, sin el propio, primero la misma marca", () => {
    const base = mk("1", "Asus", 100);
    const others = [base, mk("2", "HP", 1, { popularity: 99 }), mk("3", "Asus", 1, { popularity: 1 }), mk("4", "Asus", 1, { category: "audio" })];
    expect(rankRelated(base, others).map((p) => p.id)).toEqual(["3", "2"]);
  });
});

describe("chunk", () => {
  it("parte en trozos", () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]));
  it("lista vacía", () => expect(chunk([], 3)).toEqual([]));
});
