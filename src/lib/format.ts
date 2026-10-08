const usd = new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return usd.format(value);
}
