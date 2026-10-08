import { describe, expect, it } from "vitest";

import { countBy, filterProducts, priceBounds, priceHistogram, sortProducts, type Filters } from "./catalog";
import type { Product } from "./mock-data";

const mk = (id: string, brand: string, price: number, specs: Record<string, string> = {}, popularity = 0): Product => ({
  id, slug: id, name: `P${id}`, brand, category: "pc", price, stock: 1, popularity, isNew: false, specs,
});

const items = [
  mk("1", "Asus", 100, { RAM: "8 GB" }, 10),
  mk("2", "HP", 200, { RAM: "16 GB" }, 50),
  mk("3", "Asus", 300, { RAM: "16 GB" }, 30),
];
const all: Filters = { brands: [], minPrice: 0, maxPrice: 1000, specs: {} };

describe("filterProducts", () => {
  it("devuelve todo sin restricciones", () => expect(filterProducts(items, all)).toHaveLength(3));
  it("filtra por marca", () =>
    expect(filterProducts(items, { ...all, brands: ["Asus"] }).map((p) => p.id)).toEqual(["1", "3"]));
  it("incluye los extremos del rango de precio", () =>
    expect(filterProducts(items, { ...all, minPrice: 200, maxPrice: 300 }).map((p) => p.id)).toEqual(["2", "3"]));
  it("filtra por spec y combina con marca", () =>
    expect(filterProducts(items, { ...all, brands: ["Asus"], specs: { RAM: ["16 GB"] } }).map((p) => p.id)).toEqual(["3"]));
  it("ignora specs vacías", () => expect(filterProducts(items, { ...all, specs: { RAM: [] } })).toHaveLength(3));
});

describe("sortProducts", () => {
  it("ordena por popularidad por defecto sin mutar", () => {
    expect(sortProducts(items, "popular").map((p) => p.id)).toEqual(["2", "3", "1"]);
    expect(items[0].id).toBe("1");
  });
  it("ordena por precio", () => {
    expect(sortProducts(items, "price-asc").map((p) => p.id)).toEqual(["1", "2", "3"]);
    expect(sortProducts(items, "price-desc").map((p) => p.id)).toEqual(["3", "2", "1"]);
  });
});

describe("countBy / priceBounds / priceHistogram", () => {
  it("cuenta marcas de mayor a menor", () => expect(countBy(items, (p) => p.brand)).toEqual([["Asus", 2], ["HP", 1]]));
  it("ignora valores indefinidos", () => expect(countBy(items, (p) => p.specs.Otro)).toEqual([]));
  it("calcula límites de precio", () => {
    expect(priceBounds(items)).toEqual([100, 300]);
    expect(priceBounds([])).toEqual([0, 0]);
  });
  it("reparte en tramos y mete el máximo en el último", () => {
    const h = priceHistogram(items, [100, 300], 4);
    expect(h).toEqual([1, 0, 1, 1]);
    expect(h.reduce((a, b) => a + b)).toBe(3);
  });
});
