"use client";

import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { FavoriteButton } from "@/components/product/favorite-button";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { CatalogProduct } from "@/lib/catalog-types";
import { formatPrice } from "@/lib/format";

/** El carrito de invitado persiste en localStorage; el precio se vuelve a leer de la API al mostrarlo. */
export function PurchasePanel({ product }: { product: CatalogProduct }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  const change = (next: number) => {
    setQty(Math.min(product.stock, Math.max(1, next)));
    setAdded(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-3xl font-semibold text-primary">{formatPrice(product.priceCents)}</p>
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

        <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => {
            add(product, qty);
            setAdded(true);
          }}>
          {added ? <Check /> : <ShoppingCart />}
          {added ? "Agregado al carrito" : "Agregar al carrito"}
        </Button>

        <FavoriteButton productId={product.id} productName={product.name} variant="outline" size="icon-lg" />
      </div>
    </div>
  );
}
