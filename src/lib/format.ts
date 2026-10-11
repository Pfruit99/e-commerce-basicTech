const usdWhole = new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat("es", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Formatea un importe en centavos de USD. Solo muestra decimales si los hay. */
export function formatPrice(cents: number): string {
  return Number.isInteger(cents / 100) ? usdWhole.format(cents / 100) : usdCents.format(cents / 100);
}

/**
 * Formatea un importe en dólares. Solo para las pantallas que aún leen `mock-account` y `mock-admin`
 * (montos en USD); se elimina cuando pasen a la base.
 */
export function formatUsd(usd: number): string {
  return usdWhole.format(usd);
}
