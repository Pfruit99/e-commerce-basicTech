import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import request from "supertest";

import { PrismaClient } from "../../src/generated/prisma/client";

/** Servidor contra el que corre la suite. Debe coincidir con BETTER_AUTH_URL (Better Auth valida el origen). */
export const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

/** Dominio reservado para los usuarios de prueba; `cleanupTestUsers` borra todo lo que termine así. */
export const TEST_DOMAIN = "@api-test.basictech.local";

const run = Date.now().toString(36);
let counter = 0;

/** Email único por prueba y por ejecución. */
export function testEmail(tag: string): string {
  return `${tag}-${run}-${++counter}${TEST_DOMAIN}`;
}

/** IP distinta por prueba (vía `X-Forwarded-For`) para que el límite de peticiones no se mezcle entre pruebas. */
export function testIp(): string {
  const n = Math.floor(Math.random() * 250) + 1;
  return `10.${n}.${++counter % 250}.${(Date.now() % 250) + 1}`;
}

export const api = () => request(BASE_URL);

/** Agente con cookies persistentes y los encabezados que espera Better Auth. */
export function agent(ip = testIp()) {
  const a = request.agent(BASE_URL);
  a.set("Origin", BASE_URL).set("X-Forwarded-For", ip);
  return a;
}

export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

export async function cleanupTestUsers() {
  await db.user.deleteMany({ where: { email: { endsWith: TEST_DOMAIN } } });
}

export const PASSWORD = "clave-de-prueba-123";

/** Registra un usuario y devuelve el agente ya con su cookie de sesión. */
export async function signUp(name = "Usuario Prueba", email = testEmail("user")) {
  const a = agent();
  const res = await a.post("/api/auth/sign-up/email").send({ name, email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`sign-up falló: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent: a, email, user: res.body.user as { id: string; name: string; role: string } };
}

/** Texto de una página que redirige desde el servidor durante el streaming (redirect() dentro de Suspense). */
export function streamedRedirect(html: string): string | null {
  return html.match(/NEXT_REDIRECT;replace;([^;]+);/)?.[1] ?? null;
}
