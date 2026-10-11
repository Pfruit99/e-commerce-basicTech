import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PASSWORD, agent, api, cleanupTestUsers, db, signUp, streamedRedirect, testEmail } from "./helpers";

beforeAll(cleanupTestUsers);
afterAll(async () => {
  await cleanupTestUsers();
  await db.$disconnect();
});

const SESSION_COOKIE = "better-auth.session_token";

/** Texto propio de cada página del admin: se comprueba que el admin lo ve y que nadie más lo recibe. */
const ADMIN_PAGES = {
  "/admin": "Últimos pagos",
  "/admin/pagos": "Cobros por pedido",
  "/admin/usuarios": "Clientes y administradores registrados",
};

describe("registro (POST /api/auth/sign-up/email)", () => {
  it("crea la cuenta, inicia sesión y deja una cookie httpOnly", async () => {
    const email = testEmail("signup");
    const res = await agent().post("/api/auth/sign-up/email").send({ name: "Ana Prueba", email, password: PASSWORD }).expect(200);

    expect(res.body.user).toMatchObject({ email, name: "Ana Prueba", role: "CUSTOMER", status: "ACTIVE" });
    const cookie = ([] as string[]).concat(res.headers["set-cookie"] ?? []).find((c) => c.startsWith(SESSION_COOKIE));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("nunca devuelve la contraseña ni su hash", async () => {
    const res = await agent().post("/api/auth/sign-up/email").send({ name: "Sin Hash", email: testEmail("nohash"), password: PASSWORD }).expect(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain(PASSWORD);
    expect(body).not.toMatch(/password/i);
  });

  it("ignora un rol enviado por el cliente: nadie se registra como ADMIN", async () => {
    const email = testEmail("escalada");
    const res = await agent().post("/api/auth/sign-up/email").send({ name: "Pícaro", email, password: PASSWORD, role: "ADMIN", status: "ACTIVE" });
    const stored = await db.user.findUnique({ where: { email }, select: { role: true } });
    if (res.status === 200) expect(stored?.role).toBe("CUSTOMER");
    else expect(stored).toBeNull();
  });

  it("guarda el hash en Account (credential), no en texto plano", async () => {
    const { user } = await signUp("Con Hash");
    const account = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    expect(account?.password).toBeTruthy();
    expect(account?.password).not.toBe(PASSWORD);
  });

  it("rechaza un email ya registrado", async () => {
    const { email } = await signUp();
    const res = await agent().post("/api/auth/sign-up/email").send({ name: "Otra", email, password: PASSWORD });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(res.body.code).toMatch(/USER_ALREADY_EXISTS/);
  });

  it("rechaza una contraseña de menos de 8 caracteres", async () => {
    const res = await agent().post("/api/auth/sign-up/email").send({ name: "Corta", email: testEmail("corta"), password: "1234567" }).expect(400);
    expect(res.body.code).toBe("PASSWORD_TOO_SHORT");
  });
});

describe("inicio de sesión (POST /api/auth/sign-in/email)", () => {
  it("con credenciales válidas abre sesión y get-session la devuelve", async () => {
    const { email } = await signUp("Luis Login");
    const a = agent();
    await a.post("/api/auth/sign-in/email").send({ email, password: PASSWORD }).expect(200);
    const session = await a.get("/api/auth/get-session").expect(200);
    expect(session.body.user).toMatchObject({ email, name: "Luis Login" });
  });

  it("con contraseña incorrecta responde 401 sin decir qué falló", async () => {
    const { email } = await signUp();
    const res = await agent().post("/api/auth/sign-in/email").send({ email, password: "otra-clave-123" }).expect(401);
    expect(res.body.code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  it("un email inexistente da el mismo error que una contraseña mala", async () => {
    const res = await agent().post("/api/auth/sign-in/email").send({ email: testEmail("fantasma"), password: PASSWORD }).expect(401);
    expect(res.body.code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  it("un usuario bloqueado no puede entrar", async () => {
    const { email, user } = await signUp("Bloqueado");
    await db.user.update({ where: { id: user.id }, data: { status: "BLOCKED" } });
    const res = await agent().post("/api/auth/sign-in/email").send({ email, password: PASSWORD }).expect(403);
    expect(res.body.message).toMatch(/bloqueada/);
  });

  it("limita los intentos: el sexto en un minuto desde la misma IP recibe 429", async () => {
    const a = agent();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await a.post("/api/auth/sign-in/email").send({ email: testEmail("fuerza"), password: "mala-clave-123" })).status);
    }
    expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
    expect(statuses[5]).toBe(429);
  });
});

describe("cierre de sesión (POST /api/auth/sign-out)", () => {
  it("invalida la sesión en el servidor", async () => {
    const { agent: a } = await signUp("Cierra Sesión");
    await a.post("/api/auth/sign-out").send({}).expect(200);
    const session = await a.get("/api/auth/get-session").expect(200);
    expect(session.body).toBeNull();
  });
});

describe("rutas protegidas", () => {
  it.each(["/cuenta", "/cuenta/pedidos", "/admin", "/admin/productos/nuevo"])(
    "sin cookie, %s redirige al login con vuelta (proxy)",
    async (path) => {
      const res = await api().get(path).expect(307);
      expect(res.headers.location).toBe(`/login?next=${encodeURIComponent(path)}`);
    },
  );

  it("con una cookie falsa pasa el proxy pero el servidor redirige y no envía el contenido", async () => {
    const res = await api().get("/admin").set("Cookie", `${SESSION_COOKIE}=falso`).expect(200);
    expect(streamedRedirect(res.text)).toBe("/login?next=%2Fadmin");
    expect(res.text).not.toContain("Últimos pagos");
  });

  it("un cliente ve su cuenta con sus datos", async () => {
    const { agent: a } = await signUp("Carla Cliente");
    const res = await a.get("/cuenta").expect(200);
    expect(res.text).toContain("Carla Cliente");
    expect(streamedRedirect(res.text)).toBeNull();
  });

  it("un cliente no entra al admin: se le redirige a la tienda sin enviar el contenido", async () => {
    const { agent: a } = await signUp("Carla Cliente");
    for (const [path, marker] of Object.entries(ADMIN_PAGES)) {
      const res = await a.get(path).expect(200);
      expect(streamedRedirect(res.text)).toBe("/");
      expect(res.text).not.toContain(marker);
    }
  });

  it("un administrador entra al admin", async () => {
    const { agent: a, user } = await signUp("Admin Prueba");
    await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    for (const [path, marker] of Object.entries(ADMIN_PAGES)) {
      const res = await a.get(path).expect(200);
      expect(streamedRedirect(res.text)).toBeNull();
      expect(res.text).toContain(marker);
      expect(res.text).toContain("Admin Prueba");
    }
  });

  it("si se bloquea a un usuario con sesión abierta, pierde el acceso en la siguiente petición", async () => {
    const { agent: a, user } = await signUp("Pierde Acceso");
    await db.user.update({ where: { id: user.id }, data: { status: "BLOCKED" } });
    const res = await a.get("/cuenta").expect(200);
    expect(streamedRedirect(res.text)).toBe("/login?next=%2Fcuenta");
    expect(res.text).not.toContain("Pierde Acceso");
  });
});
