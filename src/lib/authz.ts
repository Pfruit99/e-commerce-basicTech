/** Reglas de acceso puras: quién entra a qué (`doc/modelo-datos.md` §5). Sin dependencias del servidor. */

export type Role = "CUSTOMER" | "ADMIN";
export type AccessLevel = "user" | "admin";

/** Lo mínimo de un usuario de sesión que hace falta para decidir. */
export type SessionUser = { id: string; role?: string | null; status?: string | null };

export type AccessResult = { ok: true } | { ok: false; code: "UNAUTHENTICATED" | "FORBIDDEN" };

/** Sin sesión o bloqueado: `UNAUTHENTICATED`. Con sesión sin el rol pedido: `FORBIDDEN`. */
export function authorize(user: SessionUser | null | undefined, level: AccessLevel): AccessResult {
  if (!user || user.status === "BLOCKED") return { ok: false, code: "UNAUTHENTICATED" };
  if (level === "admin" && user.role !== "ADMIN") return { ok: false, code: "FORBIDDEN" };
  return { ok: true };
}

/** Nivel de acceso que exige una ruta de página, o `null` si es pública. */
export function requiredAccess(pathname: string): AccessLevel | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/cuenta" || pathname.startsWith("/cuenta/")) return "user";
  return null;
}

/**
 * Destino seguro tras iniciar sesión. Solo acepta rutas internas (`/algo`), para que `?next=` no sirva
 * de redirección abierta a otro sitio (`//evil.com`, `/\evil.com`, `https://...`).
 */
export function safeRedirect(next: string | null | undefined, fallback = "/cuenta"): string {
  if (!next || next.length > 500) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}

/** URL de login que vuelve a `pathname` (con su query) tras entrar. */
export function loginUrl(pathname: string, search = ""): string {
  return `/login?next=${encodeURIComponent(pathname + search)}`;
}
