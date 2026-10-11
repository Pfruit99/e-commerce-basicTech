import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { loginUrl } from "@/lib/authz";

/**
 * Primera barrera, optimista: sin cookie de sesión, `/cuenta` y `/admin` redirigen al login.
 * Solo mira si la cookie existe; la sesión real, el rol y el bloqueo se comprueban en el servidor
 * (layouts protegidos y `requireUser`/`requireAdmin` en cada Route Handler).
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(new URL(loginUrl(pathname, search), request.url));
}

export const config = {
  matcher: ["/cuenta", "/cuenta/:path*", "/admin", "/admin/:path*"],
};
