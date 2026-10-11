import { describe, expect, it } from "vitest";

import { authorize, loginUrl, requiredAccess, safeRedirect } from "./authz";

describe("authorize", () => {
  const customer = { id: "u1", role: "CUSTOMER", status: "ACTIVE" };
  const admin = { id: "u2", role: "ADMIN", status: "ACTIVE" };

  it("sin sesión no entra a nada protegido", () => {
    expect(authorize(null, "user")).toEqual({ ok: false, code: "UNAUTHENTICATED" });
    expect(authorize(undefined, "admin")).toEqual({ ok: false, code: "UNAUTHENTICATED" });
  });
  it("un cliente entra a su cuenta pero no al admin", () => {
    expect(authorize(customer, "user")).toEqual({ ok: true });
    expect(authorize(customer, "admin")).toEqual({ ok: false, code: "FORBIDDEN" });
  });
  it("un admin entra a ambos", () => {
    expect(authorize(admin, "user")).toEqual({ ok: true });
    expect(authorize(admin, "admin")).toEqual({ ok: true });
  });
  it("un usuario bloqueado se trata como sin sesión, aunque sea admin", () =>
    expect(authorize({ ...admin, status: "BLOCKED" }, "admin")).toEqual({ ok: false, code: "UNAUTHENTICATED" }));
  it("sin rol no es admin", () => expect(authorize({ id: "u3" }, "admin")).toEqual({ ok: false, code: "FORBIDDEN" }));
});

describe("requiredAccess", () => {
  it("protege /admin y /cuenta con sus subrutas", () => {
    expect(requiredAccess("/admin")).toBe("admin");
    expect(requiredAccess("/admin/productos/1/editar")).toBe("admin");
    expect(requiredAccess("/cuenta")).toBe("user");
    expect(requiredAccess("/cuenta/pedidos")).toBe("user");
  });
  it("deja públicas el resto, incluidas rutas con prefijo parecido", () => {
    expect(requiredAccess("/")).toBeNull();
    expect(requiredAccess("/login")).toBeNull();
    expect(requiredAccess("/administracion")).toBeNull();
    expect(requiredAccess("/cuentas")).toBeNull();
  });
});

describe("safeRedirect", () => {
  it("acepta rutas internas", () => {
    expect(safeRedirect("/cuenta/pedidos")).toBe("/cuenta/pedidos");
    expect(safeRedirect("/categoria/pc?sort=name")).toBe("/categoria/pc?sort=name");
  });
  it("rechaza destinos externos o raros", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "evil.com", "javascript:alert(1)", "/a\nb", ""]) {
      expect(safeRedirect(bad)).toBe("/cuenta");
    }
    expect(safeRedirect(null, "/")).toBe("/");
    expect(safeRedirect("/" + "a".repeat(600))).toBe("/cuenta");
  });
});

describe("loginUrl", () => {
  it("codifica la ruta de vuelta", () =>
    expect(loginUrl("/cuenta/pedidos", "?x=1")).toBe("/login?next=%2Fcuenta%2Fpedidos%3Fx%3D1"));
});
