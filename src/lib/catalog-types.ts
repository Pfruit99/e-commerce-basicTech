/** Tipos del catálogo tal como los entrega la API y los usa la tienda. Dinero siempre en centavos. */

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  /** Claves de `specs` que se ofrecen como filtro en esta categoría. */
  filterKeys: string[];
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  /** Slug de la categoría. */
  category: string;
  /** Precio de la variante por defecto, en centavos de USD. */
  priceCents: number;
  stock: number;
  popularity: number;
  isNew: boolean;
  specs: Record<string, string>;
  variantId: string;
  sku: string;
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

/** Datos para los filtros del listado, calculados sobre toda la categoría. */
export type CatalogFacets = {
  brands: [name: string, count: number][];
  specs: { key: string; options: [value: string, count: number][] }[];
  priceBounds: [min: number, max: number];
  histogram: number[];
};
