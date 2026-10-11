import { toErrorResponse } from "./errors";

/**
 * Envuelve un Route Handler: traduce lo lanzado con `toErrorResponse` y registra una sola vez los 5xx.
 * Los 4xx son tráfico normal y no se registran (`doc/modelo-datos.md` §7.1).
 */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      const { status, body } = toErrorResponse(err);
      if (status >= 500) console.error(err);
      return Response.json(body, { status });
    }
  };
}
