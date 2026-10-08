import { describe, expect, it } from "vitest";

import { dashboardStats, filterAdminProducts, filterPayments, filterUsers, orderTotal, paymentTotals } from "./admin";
import type { Order } from "./mock-account";
import type { AdminUser, Payment } from "./mock-admin";
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

describe("filterUsers", () => {
  const users: AdminUser[] = [
    { id: "1", name: "Ana Pérez", email: "ana@x.com", role: "admin", status: "active", createdAt: "2026-01-01", orderCount: 0 },
    { id: "2", name: "Luis Gil", email: "luis@y.com", role: "customer", status: "blocked", createdAt: "2026-01-02", orderCount: 1 },
  ];
  it("sin filtros devuelve todos", () => expect(filterUsers(users, "", "all")).toHaveLength(2));
  it("busca por nombre o email sin distinguir mayúsculas", () => {
    expect(filterUsers(users, "PÉREZ", "all").map((u) => u.id)).toEqual(["1"]);
    expect(filterUsers(users, "y.com", "all").map((u) => u.id)).toEqual(["2"]);
  });
  it("filtra por rol y combina con la búsqueda", () => {
    expect(filterUsers(users, "", "customer").map((u) => u.id)).toEqual(["2"]);
    expect(filterUsers(users, "ana", "customer")).toEqual([]);
  });
});

describe("payments", () => {
  const payments: Payment[] = [
    { id: "a", orderId: "o1", customer: "A", method: "card", amount: 100, status: "paid", date: "2026-10-01" },
    { id: "b", orderId: "o2", customer: "B", method: "cash", amount: 50, status: "pending", date: "2026-10-02" },
    { id: "c", orderId: "o3", customer: "C", method: "card", amount: 25, status: "paid", date: "2026-10-03" },
  ];
  it("filterPayments por estado y 'all'", () => {
    expect(filterPayments(payments, "all")).toHaveLength(3);
    expect(filterPayments(payments, "paid").map((p) => p.id)).toEqual(["a", "c"]);
    expect(filterPayments(payments, "failed")).toEqual([]);
  });
  it("paymentTotals suma por estado e incluye estados vacíos", () => {
    expect(paymentTotals(payments)).toEqual({ paid: 125, pending: 50, failed: 0, refunded: 0 });
    expect(paymentTotals([])).toEqual({ paid: 0, pending: 0, failed: 0, refunded: 0 });
  });
});
