import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./api-handler";
import { AppError } from "./errors";

afterEach(() => vi.restoreAllMocks());

describe("handler", () => {
  it("devuelve la respuesta tal cual si no hay error", async () => {
    const res = await handler(async () => Response.json({ ok: true }))();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("traduce un AppError sin registrarlo", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(async () => {
      throw new AppError("NOT_FOUND", "Producto no encontrado.");
    })();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Producto no encontrado." } });
    expect(log).not.toHaveBeenCalled();
  });

  it("oculta y registra un error inesperado", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(async () => {
      throw new Error("postgres://user:secret@host");
    })();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL");
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(log).toHaveBeenCalledOnce();
  });

  it("pasa los argumentos al handler", async () => {
    const wrapped = handler(async (a: number, b: string) => Response.json({ a, b }));
    expect(await (await wrapped(1, "x")).json()).toEqual({ a: 1, b: "x" });
  });
});
