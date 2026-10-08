"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import type { CartLine } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartLines({ lines, compact = false }: { lines: CartLine[]; compact?: boolean }) {
  const { setQty, remove } = useCart();

  return (
    <ul className="divide-y">
      {lines.map(({ product, qty, subtotal }) => (
        <li key={product.id} className="flex gap-3 py-4">
          <ProductImage category={product.category} className={`shrink-0 rounded-lg ${compact ? "size-16" : "size-24"}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <Link href={`/producto/${product.slug}`} className="block truncate text-sm font-medium hover:text-primary">
                  {product.name}
                </Link>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Quitar ${product.name}`} onClick={() => remove(product.id)}>
                <Trash2 />
              </Button>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center rounded-lg border">
                <Button variant="ghost" size="icon" aria-label="Disminuir cantidad" onClick={() => setQty(product, qty - 1)}>
                  <Minus />
                </Button>
                <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Aumentar cantidad"
                  disabled={qty >= product.stock}
                  onClick={() => setQty(product, qty + 1)}
                >
                  <Plus />
                </Button>
              </div>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
