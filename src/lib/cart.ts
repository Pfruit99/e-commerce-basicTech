import type { CatalogProduct } from "./catalog-types";

export type CartItem = { productId: string; qty: number };
export type CartLine = { product: CatalogProduct; qty: number; subtotal: number };
export type CartTotals = { itemCount: number; subtotal: number; shipping: number; total: number };

/** Montos en centavos de USD: envío US$15, gratis desde US$500. */
export const FREE_SHIPPING_THRESHOLD = 50_000;
export const SHIPPING_FLAT = 1_500;

const clampQty = (qty: number, stock: number) => Math.min(Math.max(0, Math.trunc(qty)), stock);

export function addItem(items: CartItem[], product: CatalogProduct, qty = 1): CartItem[] {
  const current = items.find((i) => i.productId === product.id)?.qty ?? 0;
  const next = clampQty(current + qty, product.stock);
  if (next === 0) return items;
  return current === 0
    ? [...items, { productId: product.id, qty: next }]
    : items.map((i) => (i.productId === product.id ? { ...i, qty: next } : i));
}

/** Fija la cantidad; 0 o menos elimina la línea. */
export function setQuantity(items: CartItem[], product: CatalogProduct, qty: number): CartItem[] {
  const next = clampQty(qty, product.stock);
  if (next === 0) return removeItem(items, product.id);
  return items.map((i) => (i.productId === product.id ? { ...i, qty: next } : i));
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

/** Resuelve productos y descarta los que ya no existen. */
export function cartLines(items: CartItem[], find: (id: string) => CatalogProduct | undefined): CartLine[] {
  return items.flatMap((i) => {
    const product = find(i.productId);
    return product ? [{ product, qty: i.qty, subtotal: product.priceCents * i.qty }] : [];
  });
}

export function cartTotals(lines: CartLine[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  return { itemCount, subtotal, shipping, total: subtotal + shipping };
}

/** Valida datos leídos de almacenamiento externo, que no son de confianza. */
export function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: CartItem[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { productId, qty } = entry as Record<string, unknown>;
    if (typeof productId !== "string" || seen.has(productId)) continue;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 999) continue;
    seen.add(productId);
    out.push({ productId, qty });
  }
  return out;
}
