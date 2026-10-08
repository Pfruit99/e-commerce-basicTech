/** Agrega o quita un id de la lista de favoritos, sin mutarla. */
export function toggleFavorite(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/** Valida datos leídos de almacenamiento externo, que no son de confianza. */
export function sanitizeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 64))];
}
