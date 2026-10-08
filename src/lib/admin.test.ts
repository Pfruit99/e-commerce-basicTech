import { describe, expect, it } from "vitest";

import { dashboardStats, filterAdminProducts, orderTotal } from "./admin";
import type { Order } from "./mock-account";
import type { Product } from "./mock-data";

const mk = (id: string, name: string, brand: string, category: Product["category"], price: number, stock: number): Product => ({
  id, slug: id, name, brand, category, price, stock, popularity: 0, isNew: false, specs: {},
});

const items = [
  mk("1", "Notebook Zenith", "Asus", "pc", 800, 10),
  mk("2", "Monitor Odyssey", "Samsung", "monitores", 200, 3),
  mk("3", "Mouse Viper", "Razer", "mouses", 50, 0),
];
const find = (id: string) => items.find((p) => p.id === id);
const orders: Order[] = [
  { id: "A", date: "2026-10-01", status: "pending", items: [{ productId: "1", qty: 1 }, { productId: "2", qty: 2 }] },
  { id: "B", date: "2026-10-02", status: "delivered", items: [{ productId: "3", qty: 1 }, { productId: "zzz", qty: 4 }] },
];

describe("orderTotal", () => {
  it("suma precio por cantidad", () => expect(orderTotal(orders[0], find)).toBe(1200));
  it("ignora productos inexistentes", () => expect(orderTotal(orders[1], find)).toBe(50));
});

describe("dashboardStats", () => {
  it("calcula conteos e ingresos", () =>
    expect(dashboardStats(items, orders, find)).toEqual({
      productCount: 3,
      lowStockCount: 1,
      outOfStockCount: 1,
      orderCount: 2,
      pendingOrderCount: 1,
      revenue: 1250,
    }));
  it("devuelve ceros sin datos", () =>
    expect(dashboardStats([], [], find)).toEqual({
      productCount: 0, lowStockCount: 0, outOfStockCount: 0, orderCount: 0, pendingOrderCount: 0, revenue: 0,
    }));
});

describe("filterAdminProducts", () => {
  it("sin filtros devuelve todo", () => expect(filterAdminProducts(items, "", "all")).toHaveLength(3));
  it("busca por nombre o marca sin distinguir mayúsculas", () => {
    expect(filterAdminProducts(items, "  ODYSSEY ", "all").map((p) => p.id)).toEqual(["2"]);
    expect(filterAdminProducts(items, "razer", "all").map((p) => p.id)).toEqual(["3"]);
  });
  it("combina búsqueda y categoría", () => {
    expect(filterAdminProducts(items, "o", "pc").map((p) => p.id)).toEqual(["1"]);
    expect(filterAdminProducts(items, "zenith", "monitores")).toEqual([]);
  });
});
