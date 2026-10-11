import { describe, expect, it } from "vitest";

import { formatPrice, formatUsd } from "./format";

// Intl separa número y símbolo con un espacio duro; se normaliza para comparar.
const plain = (s: string) => s.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("convierte centavos a dólares sin decimales si son enteros", () => {
    expect(plain(formatPrice(79900))).toBe("799 US$");
    expect(plain(formatPrice(149900))).toBe("1499 US$");
  });
  it("muestra los centavos cuando los hay", () => expect(plain(formatPrice(1999))).toBe("19,99 US$"));
  it("formatea cero", () => expect(plain(formatPrice(0))).toBe("0 US$"));
});

describe("formatUsd", () => {
  it("formatea dólares enteros", () => expect(plain(formatUsd(799))).toBe("799 US$"));
});
