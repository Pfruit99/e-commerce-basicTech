import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth, type Session } from "@/lib/auth";
import { authorize, loginUrl, type AccessLevel } from "@/lib/authz";
import { AppError } from "@/lib/errors";

/**
 * Sesión validada contra la base (no solo la cookie). Es dato de la petición: usar dentro de `<Suspense>`.
 * `cache` evita repetir la consulta cuando layout y página la piden en la misma petición.
 */
export const getSession = cache(async (): Promise<Session | null> => auth.api.getSession({ headers: await headers() }));

/** Para Route Handlers: devuelve la sesión o lanza `UNAUTHENTICATED` / `FORBIDDEN`. */
async function requireApi(level: AccessLevel): Promise<Session> {
  const session = await getSession();
  const result = authorize(session?.user, level);
  if (!result.ok) {
    throw new AppError(result.code, result.code === "FORBIDDEN" ? "No tenés permiso." : "Iniciá sesión para continuar.");
  }
  return session!;
}

export const requireUser = () => requireApi("user");
export const requireAdmin = () => requireApi("admin");

/** Para páginas y layouts: sin sesión redirige al login con vuelta a `returnTo`; sin permiso, a la tienda. */
export async function requirePageAccess(level: AccessLevel, returnTo: string): Promise<Session> {
  const session = await getSession();
  const result = authorize(session?.user, level);
  if (!result.ok) redirect(result.code === "FORBIDDEN" ? "/" : loginUrl(returnTo));
  return session!;
}
