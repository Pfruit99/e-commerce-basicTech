/** Código de error de dominio y su estado HTTP. Es el contrato de errores de la API. */
export const ERROR_STATUS = {
  VALIDATION: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  STOCK_INSUFFICIENT: 409,
  INVALID_TRANSITION: 409,
  CONFLICT: 409,
  BUSINESS_RULE: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  EXTERNAL_SERVICE: 502,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export type ErrorBody = { error: { code: ErrorCode; message: string; details?: unknown } };

/** Error esperado, con mensaje seguro de mostrar. Todo lo demás se trata como fallo interno. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, options?: { details?: unknown; cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.details = options?.details;
  }
}

const INTERNAL_MESSAGE = "Ocurrió un error inesperado. Probá de nuevo más tarde.";

/**
 * Traduce cualquier error lanzado a estado y cuerpo HTTP.
 * Los errores no esperados no filtran su mensaje, y los 5xx no exponen `details`.
 */
export function toErrorResponse(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof AppError) {
    const status = ERROR_STATUS[err.code];
    const exposeDetails = status < 500 && err.details !== undefined;
    return {
      status,
      body: { error: { code: err.code, message: err.message, ...(exposeDetails ? { details: err.details } : {}) } },
    };
  }
  return { status: ERROR_STATUS.INTERNAL, body: { error: { code: "INTERNAL", message: INTERNAL_MESSAGE } } };
}
