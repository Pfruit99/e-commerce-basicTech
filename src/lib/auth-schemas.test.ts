import { describe, expect, it } from "vitest";

import { authErrorMessage, loginSchema, registerSchema } from "./auth-schemas";

const messages = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

describe("loginSchema", () => {
  it("normaliza el email a minúsculas y sin espacios", () =>
    expect(loginSchema.parse({ email: "  Ana@Mail.COM ", password: "x" })).toEqual({ email: "ana@mail.com", password: "x" }));
  it("exige email válido y contraseña", () =>
    expect(messages(loginSchema.safeParse({ email: "no-es-email", password: "" }))).toEqual({
      email: "Email inválido.",
      password: "Ingresá tu contraseña.",
    }));
});

describe("registerSchema", () => {
  const valid = { name: "Ana Pérez", email: "ana@mail.com", password: "12345678", confirmPassword: "12345678" };

  it("acepta datos válidos", () => expect(registerSchema.safeParse(valid).success).toBe(true));
  it("exige 8 caracteres como mínimo y 128 como máximo", () => {
    expect(messages(registerSchema.safeParse({ ...valid, password: "1234567", confirmPassword: "1234567" })).password).toBe(
      "Mínimo 8 caracteres.",
    );
    const long = "a".repeat(129);
    expect(messages(registerSchema.safeParse({ ...valid, password: long, confirmPassword: long })).password).toBe(
      "Máximo 128 caracteres.",
    );
  });
  it("marca la confirmación cuando no coincide", () =>
    expect(messages(registerSchema.safeParse({ ...valid, confirmPassword: "otra-cosa" }))).toEqual({
      confirmPassword: "Las contraseñas no coinciden.",
    }));
  it("exige nombre", () => expect(messages(registerSchema.safeParse({ ...valid, name: " " })).name).toBe("Ingresá tu nombre."));
});

describe("authErrorMessage", () => {
  it("traduce los códigos conocidos", () => {
    expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 })).toBe("Email o contraseña incorrectos.");
    expect(authErrorMessage({ code: "USER_ALREADY_EXISTS", status: 422 })).toBe("Ya existe una cuenta con ese email.");
    expect(authErrorMessage({ status: 429 })).toMatch(/Demasiados intentos/);
  });
  it("muestra el mensaje de un 403 (cuenta bloqueada)", () =>
    expect(authErrorMessage({ status: 403, message: "Tu cuenta está bloqueada." })).toBe("Tu cuenta está bloqueada."));
  it("no expone mensajes desconocidos", () =>
    expect(authErrorMessage({ code: "X", status: 500, message: "stack interno" })).toBe(
      "No pudimos completar la operación. Probá de nuevo.",
    ));
});
