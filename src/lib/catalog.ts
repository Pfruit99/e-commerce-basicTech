import type { Product } from "./mock-data";

export type Filters = {
  brands: string[];
  minPrice: number;
  maxPrice: number;
  /** Valores permitidos por clave de spec; vacío = sin restricción. */
  specs: Record<string, string[]>;
};

export type SortKey = "popular" | "price-asc" | "price-desc" | "name";

export function filterProducts(items: Product[], f: Filters): Product[] {
  return items.filter((p) => {
    if (f.brands.length > 0 && !f.brands.includes(p.brand)) return false;
    if (p.price < f.minPrice || p.price > f.maxPrice) return false;
    return Object.entries(f.specs).every(
      ([key, allowed]) => allowed.length === 0 || allowed.includes(p.specs[key]),
    );
  });
}

export function sortProducts(items: Product[], key: SortKey): Product[] {
  const copy = [...items];
  switch (key) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return copy.sort((a, b) => b.popularity - a.popularity);
  }
}

/** Marcas con la cantidad de productos, ordenadas de mayor a menor. */
export function countBy(items: Product[], pick: (p: Product) => string | undefined): [string, number][] {
  const map = new Map<string, number>();
  for (const p of items) {
    const v = pick(p);
    if (v) map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
}

export function priceBounds(items: Product[]): [number, number] {
  if (items.length === 0) return [0, 0];
  const prices = items.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}

/** Cantidad de productos por tramo de precio, para el histograma del slider. */
export function priceHistogram(items: Product[], [min, max]: [number, number], buckets = 20): number[] {
  const bins = new Array<number>(buckets).fill(0);
  const span = max - min || 1;
  for (const p of items) {
    const i = Math.min(buckets - 1, Math.floor(((p.price - min) / span) * buckets));
    bins[i]++;
  }
  return bins;
}
