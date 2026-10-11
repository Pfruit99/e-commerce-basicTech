import { describe, expect, it } from "vitest";

import { api } from "./helpers";

type Product = { id: string; slug: string; name: string; brand: string; category: string; priceCents: number; specs: Record<string, string> };

describe("GET /api/categories", () => {
  it("devuelve las seis categorías del seed", async () => {
    const res = await api().get("/api/categories").expect(200).expect("Content-Type", /json/);
    expect(res.body.items.map((c: { slug: string }) => c.slug)).toEqual(["pc", "monitores", "teclados", "mouses", "audio", "componentes"]);
    expect(res.body.items[0]).toMatchObject({ name: "PC", filterKeys: expect.any(Array) });
  });
});

describe("GET /api/products", () => {
  it("pagina con 12 por defecto y devuelve el total", async () => {
    const res = await api().get("/api/products").expect(200);
    expect(res.body).toMatchObject({ total: 22, page: 1, pageSize: 12 });
    expect(res.body.items).toHaveLength(12);
  });

  it("filtra por categoría y ordena por precio ascendente", async () => {
    const res = await api().get("/api/products").query({ category: "pc", sort: "price_asc" }).expect(200);
    const prices = res.body.items.map((p: Product) => p.priceCents);
    expect(res.body.total).toBe(5);
    expect(res.body.items.every((p: Product) => p.category === "pc")).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("combina marca repetible, spec y rango de precio (en centavos)", async () => {
    const res = await api().get("/api/products?category=pc&brand=MSI&brand=Dell&spec.RAM=32%20GB&maxPrice=160000").expect(200);
    expect(res.body.items.map((p: Product) => p.name)).toEqual(["PC Gamer Titan"]);
  });

  it("la segunda página no repite productos de la primera", async () => {
    const [p1, p2] = await Promise.all([
      api().get("/api/products").query({ pageSize: 10, page: 1 }).expect(200),
      api().get("/api/products").query({ pageSize: 10, page: 2 }).expect(200),
    ]);
    const ids1 = new Set(p1.body.items.map((p: Product) => p.id));
    expect(p2.body.items.some((p: Product) => ids1.has(p.id))).toBe(false);
  });

  it("?ids= devuelve solo los existentes, en el orden pedido", async () => {
    const list = await api().get("/api/products").query({ category: "audio" }).expect(200);
    const [a, b] = list.body.items.map((p: Product) => p.id);
    const res = await api().get("/api/products").query({ ids: `${b},no-existe,${a}` }).expect(200);
    expect(res.body.items.map((p: Product) => p.id)).toEqual([b, a]);
  });

  it.each([
    ["parámetro desconocido", "foo=1", "foo"],
    ["número inválido", "page=abc", "page"],
    ["pageSize excesivo", "pageSize=500", "pageSize"],
    ["orden desconocido", "sort=random", "sort"],
    ["rango invertido", "minPrice=500&maxPrice=100", "minPrice"],
    ["ids vacío", "ids=", ""],
  ])("400 VALIDATION por %s", async (_name, query, field) => {
    const res = await api().get(`/api/products?${query}`).expect(400);
    expect(res.body.error.code).toBe("VALIDATION");
    if (field) expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });
});

describe("GET /api/products/[slug]", () => {
  it("devuelve el detalle con precio en centavos y SKU", async () => {
    const res = await api().get("/api/products/mouse-mx-master").expect(200);
    expect(res.body).toMatchObject({ name: "Mouse MX Master", brand: "Logitech", priceCents: 9900, sku: "BT-0014" });
  });

  it("404 con el formato de error común", async () => {
    const res = await api().get("/api/products/no-existe").expect(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Producto no encontrado." } });
  });
});
