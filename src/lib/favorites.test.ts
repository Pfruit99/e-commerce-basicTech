import { describe, expect, it } from "vitest";

import { sanitizeIds, toggleFavorite } from "./favorites";

describe("toggleFavorite", () => {
  it("agrega si no está", () => expect(toggleFavorite(["1"], "2")).toEqual(["1", "2"]));
  it("quita si ya está", () => expect(toggleFavorite(["1", "2"], "1")).toEqual(["2"]));
  it("no muta el original", () => {
    const ids = ["1"];
    toggleFavorite(ids, "2");
    expect(ids).toEqual(["1"]);
  });
});

describe("sanitizeIds", () => {
  it("acepta strings y elimina duplicados", () => expect(sanitizeIds(["a", "a", "b"])).toEqual(["a", "b"]));
  it("descarta tipos inválidos, vacíos y demasiado largos", () =>
    expect(sanitizeIds(["ok", 1, null, "", "x".repeat(65)])).toEqual(["ok"]));
  it("devuelve vacío si no es un arreglo", () => expect(sanitizeIds("a")).toEqual([]));
});
