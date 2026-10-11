import { z } from "zod";

/** Mismos límites que `emailAndPassword` en `src/lib/auth.ts`. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const email = z
  .string()
  .trim()
  .min(1, "Ingresá tu email.")
  .max(254, "Email demasiado largo.")
  .pipe(z.email("Email inválido."))
  .transform((v) => v.toLowerCase());

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña.").max(PASSWORD_MAX, "Contraseña demasiado larga."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresá tu nombre.").max(100, "Nombre demasiado largo."),
    email,
    password: z
      .string()
      .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres.`)
      .max(PASSWORD_MAX, `Máximo ${PASSWORD_MAX} caracteres.`),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;

/** Traduce los errores de Better Auth a un mensaje para el formulario, sin filtrar detalles internos. */
export function authErrorMessage(error: { status?: number; code?: string; message?: string } | null | undefined): string {
  if (!error) return "No pudimos completar la operación. Probá de nuevo.";
  if (error.status === 429) return "Demasiados intentos. Esperá un minuto y probá de nuevo.";
  if (error.status === 403) return error.message || "No tenés permiso para entrar.";
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email o contraseña incorrectos.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Ya existe una cuenta con ese email.";
    case "PASSWORD_TOO_SHORT":
      return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
    case "PASSWORD_TOO_LONG":
      return `La contraseña puede tener hasta ${PASSWORD_MAX} caracteres.`;
    default:
      return "No pudimos completar la operación. Probá de nuevo.";
  }
}
