import { describe, expect, it } from "vitest";

import { demoOrders, sortOrdersByDate } from "./mock-account";
import { getProductById } from "./mock-data";

describe("sortOrdersByDate", () => {
  it("ordena del más reciente al más antiguo sin mutar", () => {
    const sorted = sortOrdersByDate(demoOrders);
    expect(sorted.map((o) => o.date)).toEqual(["2026-10-05", "2026-09-28", "2026-08-14"]);
    expect(demoOrders[0].date).toBe("2026-09-28");
  });
});

describe("demoOrders", () => {
  it("solo referencia productos existentes", () => {
    for (const order of demoOrders) {
      for (const item of order.items) expect(getProductById(item.productId)).toBeDefined();
    }
  });
});
