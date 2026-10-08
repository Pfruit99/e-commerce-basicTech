"use client";

import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { FiltersPanel } from "@/components/catalog/filters-panel";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  countBy,
  filterProducts,
  priceBounds,
  priceHistogram,
  sortProducts,
  type SortKey,
} from "@/lib/catalog";
import type { Category, Product } from "@/lib/mock-data";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Popularidad" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre (A-Z)" },
];

export function CatalogView({ category, products }: { category: Category; products: Product[] }) {
  const bounds = useMemo(() => priceBounds(products), [products]);
  const histogram = useMemo(() => priceHistogram(products, bounds), [products, bounds]);
  const brands = useMemo(() => countBy(products, (p) => p.brand), [products]);
  const groups = useMemo(
    () =>
      category.filterKeys.map((key) => ({
        key,
        label: key,
        options: countBy(products, (p) => p.specs[key]),
      })),
    [category, products],
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({});
  const [price, setPrice] = useState<[number, number]>(bounds);
  const [sort, setSort] = useState<SortKey>("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const visible = useMemo(
    () =>
      sortProducts(
        filterProducts(products, {
          brands: selectedBrands,
          minPrice: price[0],
          maxPrice: price[1],
          specs: selectedSpecs,
        }),
        sort,
      ),
    [products, selectedBrands, price, selectedSpecs, sort],
  );

  const panel = (
    <FiltersPanel
      brands={brands}
      groups={groups}
      bounds={bounds}
      histogram={histogram}
      selectedBrands={selectedBrands}
      selectedSpecs={selectedSpecs}
      price={price}
      onBrandsChange={setSelectedBrands}
      onSpecChange={(key, values) => setSelectedSpecs((s) => ({ ...s, [key]: values }))}
      onPriceChange={setPrice}
      onReset={() => {
        setSelectedBrands([]);
        setSelectedSpecs({});
        setPrice(bounds);
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
            <Select items={sortOptions} value={sort} onValueChange={(v) => v && setSort(v as SortKey)}>
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
          {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
        </p>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No hay productos con esos filtros.</p>
        ) : (
          <div
            className={
              layout === "grid"
                ? "mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3"
                : "mt-4 flex flex-col gap-6"
            }
          >
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} layout={layout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
