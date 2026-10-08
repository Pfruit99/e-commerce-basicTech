"use client";

import { Check, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

/** Solo UI: el carrito real llega con la lógica de backend. */
export function PurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const outOfStock = product.stock === 0;

  const change = (next: number) => {
    setQty(Math.min(product.stock, Math.max(1, next)));
    setAdded(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-3xl font-semibold text-primary">{formatPrice(product.price)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Hasta 6 cuotas sin interés</p>
      </div>

      <p className={`text-sm ${product.stock <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
        {outOfStock ? "Sin stock" : product.stock <= 5 ? `¡Quedan solo ${product.stock}!` : "En stock"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border">
          <Button variant="ghost" size="icon" aria-label="Disminuir cantidad" disabled={qty <= 1} onClick={() => change(qty - 1)}>
            <Minus />
          </Button>
          <span className="w-8 text-center tabular-nums" aria-live="polite">
            {qty}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Aumentar cantidad"
            disabled={qty >= product.stock}
            onClick={() => change(qty + 1)}
          >
            <Plus />
          </Button>
        </div>

        <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => setAdded(true)}>
          {added ? <Check /> : <ShoppingCart />}
          {added ? "Agregado al carrito" : "Agregar al carrito"}
        </Button>

        <Button
          variant="outline"
          size="icon-lg"
          aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={favorite}
          onClick={() => setFavorite((f) => !f)}
        >
          <Heart className={favorite ? "fill-primary text-primary" : ""} />
        </Button>
      </div>
    </div>
  );
}
