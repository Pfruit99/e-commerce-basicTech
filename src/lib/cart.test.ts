import { describe, expect, it } from "vitest";

import {
  FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, addItem, cartLines, cartTotals, removeItem, sanitizeItems, setQuantity,
} from "./cart";
import type { Product } from "./mock-data";

const mk = (id: string, price: number, stock: number): Product => ({
  id, slug: id, name: id, brand: "B", category: "pc", price, stock, popularity: 0, isNew: false, specs: {},
});
const a = mk("a", 100, 3);
const b = mk("b", 450, 10);
const find = (id: string) => [a, b].find((p) => p.id === id);

describe("addItem", () => {
  it("agrega una línea nueva", () => expect(addItem([], a)).toEqual([{ productId: "a", qty: 1 }]));
  it("suma a una línea existente", () => expect(addItem([{ productId: "a", qty: 1 }], a, 1)).toEqual([{ productId: "a", qty: 2 }]));
  it("no supera el stock", () => expect(addItem([{ productId: "a", qty: 2 }], a, 5)).toEqual([{ productId: "a", qty: 3 }]));
  it("ignora productos sin stock", () => expect(addItem([], mk("c", 1, 0))).toEqual([]));
});

describe("setQuantity / removeItem", () => {
  const items = [{ productId: "a", qty: 2 }];
  it("fija la cantidad dentro del stock", () => {
    expect(setQuantity(items, a, 3)[0].qty).toBe(3);
    expect(setQuantity(items, a, 99)[0].qty).toBe(3);
  });
  it("elimina con cantidad 0 o negativa", () => {
    expect(setQuantity(items, a, 0)).toEqual([]);
    expect(setQuantity(items, a, -2)).toEqual([]);
  });
  it("removeItem quita solo esa línea", () => expect(removeItem([...items, { productId: "b", qty: 1 }], "a")).toEqual([{ productId: "b", qty: 1 }]));
});

describe("cartLines / cartTotals", () => {
  it("descarta productos inexistentes", () =>
    expect(cartLines([{ productId: "zzz", qty: 1 }, { productId: "a", qty: 2 }], find)).toHaveLength(1));
  it("carrito vacío: todo en cero", () =>
    expect(cartTotals([])).toEqual({ itemCount: 0, subtotal: 0, shipping: 0, total: 0 }));
  it("cobra envío bajo el umbral", () => {
    const t = cartTotals(cartLines([{ productId: "a", qty: 2 }], find));
    expect(t).toEqual({ itemCount: 2, subtotal: 200, shipping: SHIPPING_FLAT, total: 200 + SHIPPING_FLAT });
  });
  it("envío gratis desde el umbral (inclusive)", () => {
    const t = cartTotals(cartLines([{ productId: "a", qty: 1 }, { productId: "b", qty: 1 }], find));
    expect(t.subtotal).toBe(550);
    expect(t.shipping).toBe(0);
    expect(FREE_SHIPPING_THRESHOLD).toBeLessThanOrEqual(t.subtotal);
  });
});

describe("sanitizeItems", () => {
  it("acepta datos válidos", () => expect(sanitizeItems([{ productId: "a", qty: 2 }])).toEqual([{ productId: "a", qty: 2 }]));
  it("descarta basura, cantidades inválidas y duplicados", () =>
    expect(
      sanitizeItems([null, 5, { productId: 1, qty: 1 }, { productId: "a", qty: 0 }, { productId: "a", qty: 1.5 },
        { productId: "b", qty: 2 }, { productId: "b", qty: 3 }]),
    ).toEqual([{ productId: "b", qty: 2 }]));
  it("devuelve vacío si no es un arreglo", () => expect(sanitizeItems({ a: 1 })).toEqual([]));
});
