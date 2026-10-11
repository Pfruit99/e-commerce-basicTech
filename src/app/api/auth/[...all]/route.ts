import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Registro, inicio y cierre de sesión y lectura de la sesión (`/api/auth/sign-up/email`, `/api/auth/sign-in/email`...).
export const { GET, POST } = toNextJsHandler(auth);
