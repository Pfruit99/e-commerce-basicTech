import { describe, expect, it } from "vitest";

import { AppError, ERROR_STATUS, toErrorResponse } from "./errors";

describe("toErrorResponse", () => {
  it("mapea un AppError a su estado y conserva código y mensaje", () => {
    const { status, body } = toErrorResponse(new AppError("NOT_FOUND", "Producto no encontrado"));
    expect(status).toBe(404);
    expect(body).toEqual({ error: { code: "NOT_FOUND", message: "Producto no encontrado" } });
  });

  it("incluye details en errores 4xx", () => {
    const details = { variantId: "v1", available: 2 };
    const { status, body } = toErrorResponse(new AppError("STOCK_INSUFFICIENT", "Sin stock", { details }));
    expect(status).toBe(409);
    expect(body.error.details).toEqual(details);
  });

  it("no expone details en errores 5xx", () => {
    const { status, body } = toErrorResponse(
      new AppError("EXTERNAL_SERVICE", "La pasarela no responde", { details: { token: "secreto" } }),
    );
    expect(status).toBe(502);
    expect(body.error).not.toHaveProperty("details");
  });

  it("trata un error desconocido como INTERNAL sin filtrar su mensaje", () => {
    const { status, body } = toErrorResponse(new Error("connection string postgres://user:pass@host"));
    expect(status).toBe(500);
    expect(body.error.code).toBe("INTERNAL");
    expect(body.error.message).not.toContain("postgres");
  });

  it("trata valores que no son Error como INTERNAL", () => {
    expect(toErrorResponse("boom").status).toBe(500);
    expect(toErrorResponse(undefined).status).toBe(500);
  });

  it("conserva la causa original en el AppError para los logs", () => {
    const cause = new Error("db caída");
    const err = new AppError("INTERNAL", "Fallo", { cause });
    expect(err.cause).toBe(cause);
  });

  it("cada código tiene un estado HTTP válido", () => {
    for (const status of Object.values(ERROR_STATUS)) {
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    }
  });
});
