"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, type Product } from "@/lib/mock-data";

const categoryItems = categories.map((c) => ({ value: c.slug, label: c.name }));

/** Solo UI: no crea ni modifica ningún producto. Con `product` precarga sus datos. */
export function ProductForm({ product }: { product?: Product }) {
  const [category, setCategory] = useState<string | null>(product?.category ?? null);
  const [submitted, setSubmitted] = useState(false);
  const selected = categories.find((c) => c.slug === category);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required minLength={3} defaultValue={product?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" required defaultValue={product?.brand} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoría</Label>
          <Select items={categoryItems} value={category} onValueChange={(v) => setCategory(v)}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Elegí una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio (USD)</Label>
          <Input id="price" name="price" type="number" min={1} step="0.01" required defaultValue={product?.price} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min={0} step={1} required defaultValue={product?.stock} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" rows={4} />
        </div>
      </div>

      {selected && (
        <fieldset key={selected.slug} className="space-y-3 rounded-xl border p-4">
          <legend className="px-1 text-sm font-medium">Especificaciones de {selected.name}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {selected.filterKeys.map((key) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`spec-${key}`}>{key}</Label>
                <Input id={`spec-${key}`} name={`spec-${key}`} defaultValue={product?.specs[key]} />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!category}>
          {product ? "Guardar cambios" : "Guardar producto"}
        </Button>
        <Button variant="outline" render={<Link href="/admin/productos" />}>
          Cancelar
        </Button>
        {submitted && (
          <span role="status" className="text-xs text-muted-foreground">
            Demostración: los cambios no se guardan.
          </span>
        )}
      </div>
    </form>
  );
}
