"use client";

import { ChevronLeft, ChevronRight, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { FiltersPanel } from "@/components/catalog/filters-panel";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SortKey } from "@/lib/catalog";
import { toSearchParams, type ProductQuery } from "@/lib/catalog-api";
import type { CatalogCategory, CatalogFacets, CatalogProduct, Page } from "@/lib/catalog-types";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Popularidad" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre (A-Z)" },
];

/** Espera tras el último cambio de filtro antes de pedir resultados (el slider dispara muchos). */
const DEBOUNCE_MS = 250;

type Result = { key: string; page: Page<CatalogProduct> } | { key: string; error: true };

/**
 * Listado de una categoría. La primera página llega renderizada desde el servidor; cada cambio de filtro,
 * orden o página se pide a `GET /api/products`. Los filtros (`facets`) se calculan sobre toda la categoría.
 */
export function CatalogView({
  category,
  facets,
  initial,
}: {
  category: CatalogCategory;
  facets: CatalogFacets;
  initial: Page<CatalogProduct>;
}) {
  const bounds = facets.priceBounds;
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [price, setPrice] = useState<[number, number]>(bounds);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [attempt, setAttempt] = useState(0);

  // El rango completo no se envía: así la consulta inicial coincide con la página que vino del servidor.
  const query: Partial<ProductQuery> = {
    category: category.slug,
    brands: selectedBrands,
    specs: selectedSpecs,
    minPrice: price[0] > bounds[0] ? price[0] : undefined,
    maxPrice: price[1] < bounds[1] ? price[1] : undefined,
    sort,
    page,
    pageSize: initial.pageSize,
  };
  const key = toSearchParams(query).toString();
  const initialKey = toSearchParams({ category: category.slug, pageSize: initial.pageSize }).toString();

  const [result, setResult] = useState<Result>({ key: initialKey, page: initial });

  useEffect(() => {
    // Ya hay resultados para esta consulta (p. ej. la página del servidor); tras un error, `attempt` reintenta.
    if (key === result.key && !("error" in result)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?${key}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`GET /api/products respondió ${res.status}`);
        setResult({ key, page: (await res.json()) as Page<CatalogProduct> });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({ key, error: true });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `result` se omite a propósito: solo se pide de nuevo cuando cambia la consulta o se reintenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const loading = result.key !== key;
  const current = "page" in result ? result.page : null;
  const totalPages = current ? Math.max(1, Math.ceil(current.total / current.pageSize)) : 1;

  // Cualquier cambio de filtro u orden vuelve a la primera página.
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const panel = (
    <FiltersPanel
      brands={facets.brands}
      groups={facets.specs.map((s) => ({ key: s.key, label: s.key, options: s.options }))}
      bounds={bounds}
      histogram={facets.histogram}
      selectedBrands={selectedBrands}
      selectedSpecs={selectedSpecs}
      price={price}
      onBrandsChange={withReset(setSelectedBrands)}
      onSpecChange={(k, values) => {
        setSelectedSpecs((s) => ({ ...s, [k]: values }));
        setPage(1);
      }}
      onPriceChange={withReset(setPrice)}
      onReset={() => {
        setSelectedBrands([]);
        setSelectedSpecs({});
        setPrice(bounds);
        setPage(1);
      }}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block">{panel}</aside>

      <div>
        <div className="flex flex-wrap items-center gap-3 border-b pb-4">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
              <SlidersHorizontal /> Filtros
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetTitle className="sr-only">Filtros</SheetTitle>
              <div className="p-4">{panel}</div>
            </SheetContent>
          </Sheet>

          <ToggleGroup
            value={[layout]}
            onValueChange={(v) => v[0] && setLayout(v[0] as "grid" | "list")}
            variant="outline"
            aria-label="Vista"
          >
            <ToggleGroupItem value="list" aria-label="Vista de lista">
              <List />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Vista de grilla">
              <LayoutGrid />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Ordenar por:</span>
            <Select items={sortOptions} value={sort} onValueChange={(v) => v && withReset(setSort)(v as SortKey)}>
              <SelectTrigger className="w-52" aria-label="Ordenar por">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
          {loading
            ? "Buscando…"
            : current
              ? `${current.total} ${current.total === 1 ? "resultado" : "resultados"}`
              : "No pudimos cargar los resultados."}
        </p>

        {!loading && !current ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
            <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
              Reintentar
            </Button>
          </div>
        ) : current && current.items.length === 0 && !loading ? (
          <p className="py-16 text-center text-muted-foreground">No hay productos con esos filtros.</p>
        ) : (
          current && (
            <div
              aria-busy={loading}
              className={`${loading ? "opacity-60 transition-opacity" : ""} ${
                layout === "grid" ? "mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3" : "mt-4 flex flex-col gap-6"
              }`}
            >
              {current.items.map((p) => (
                <ProductCard key={p.id} product={p} layout={layout} />
              ))}
            </div>
          )
        )}

        {current && totalPages > 1 && (
          <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-3 text-sm">
            <Button variant="outline" size="icon" aria-label="Página anterior" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              <ChevronLeft />
            </Button>
            <span className="spec-value text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Página siguiente"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
