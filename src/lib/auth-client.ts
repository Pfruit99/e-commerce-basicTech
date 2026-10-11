"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";

/** Cliente de Better Auth para componentes de cliente. Usa el mismo origen (`/api/auth`). */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
