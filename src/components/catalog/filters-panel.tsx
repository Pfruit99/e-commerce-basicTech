"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/format";

export type FilterGroup = { key: string; label: string; options: [value: string, count: number][] };

type Props = {
  brands: [string, number][];
  groups: FilterGroup[];
  bounds: [number, number];
  histogram: number[];
  selectedBrands: string[];
  selectedSpecs: Record<string, string[]>;
  price: [number, number];
  onBrandsChange: (brands: string[]) => void;
  onSpecChange: (key: string, values: string[]) => void;
  onPriceChange: (price: [number, number]) => void;
  onReset: () => void;
};

function toggle(list: string[], value: string, on: boolean) {
  return on ? [...list, value] : list.filter((v) => v !== value);
}

function CheckList({
  options,
  selected,
  onChange,
}: {
  options: [string, number][];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map(([value, count]) => (
        <li key={value}>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(value)}
              onCheckedChange={(checked) => onChange(toggle(selected, value, checked))}
            />
            <span>{value}</span>
            <span className="text-xs text-muted-foreground">{count}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function FiltersPanel(props: Props) {
  const { brands, groups, bounds, histogram, price, selectedBrands, selectedSpecs } = props;
  const [brandQuery, setBrandQuery] = useState("");
  const [min, max] = bounds;
  const peak = Math.max(1, ...histogram);
  const visibleBrands = brands.filter(([b]) => b.toLowerCase().includes(brandQuery.toLowerCase()));

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-semibold">Filtros</h2>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={props.onReset}>
          Limpiar
        </Button>
      </div>

      <Accordion multiple defaultValue={["brand", "price", ...groups.map((g) => g.key)]} className="px-4">
        <AccordionItem value="brand">
          <AccordionTrigger>Marca</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Buscar marca..."
                className="pl-8"
                aria-label="Buscar marca"
              />
            </div>
            <CheckList options={visibleBrands} selected={selectedBrands} onChange={props.onBrandsChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Precio</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex h-12 items-end gap-px" aria-hidden>
              {histogram.map((n, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/25"
                  style={{ height: `${Math.max(4, (n / peak) * 100)}%` }}
                />
              ))}
            </div>
            <Slider
              min={min}
              max={max}
              step={100}
              value={price}
              onValueChange={(v) => Array.isArray(v) && props.onPriceChange([v[0], v[1]])}
              aria-label="Rango de precio"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(price[0])}</span>
              <span>{formatPrice(price[1])}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {groups.map((g) => (
          <AccordionItem key={g.key} value={g.key}>
            <AccordionTrigger>{g.label}</AccordionTrigger>
            <AccordionContent>
              <CheckList
                options={g.options}
                selected={selectedSpecs[g.key] ?? []}
                onChange={(values) => props.onSpecChange(g.key, values)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
