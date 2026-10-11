import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";

import { db } from "@/lib/db";

/**
 * Configuración de Better Auth: email y contraseña (hash scrypt de la librería), sesiones en la tabla
 * `Session` con cookie httpOnly (y `secure` cuando la URL es https). El handler está en `/api/auth/[...all]`.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      // Los gestiona el servidor: `input: false` impide que el cliente los fije al registrarse.
      role: { type: ["CUSTOMER", "ADMIN"], required: false, defaultValue: "CUSTOMER", input: false },
      status: { type: ["ACTIVE", "BLOCKED"], required: false, defaultValue: "ACTIVE", input: false },
      phone: { type: "string", required: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Un usuario bloqueado no puede iniciar sesión (`doc/modelo-datos.md` §5).
        before: async (session) => {
          const user = await db.user.findUnique({ where: { id: session.userId }, select: { status: true } });
          if (user?.status === "BLOCKED") {
            throw new APIError("FORBIDDEN", { message: "Tu cuenta está bloqueada. Escribinos para revisarla." });
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
