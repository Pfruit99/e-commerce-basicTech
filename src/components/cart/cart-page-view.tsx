"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { CartLines } from "@/components/cart/cart-lines";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { cartLines, cartTotals } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/mock-data";

export function CartPageView() {
  const { items, clear } = useCart();
  const lines = cartLines(items, getProductById);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <ShoppingCart className="size-12 text-muted-foreground" strokeWidth={1.25} />
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button render={<Link href="/" />}>Seguir comprando</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <CartLines lines={lines} />
        <Button variant="link" className="px-0 text-muted-foreground" onClick={clear}>
          Vaciar carrito
        </Button>
      </div>
      <aside className="h-fit space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Resumen</h2>
        <OrderSummary totals={cartTotals(lines)} />
        <Button size="lg" className="w-full" render={<Link href="/checkout" />}>
          Finalizar compra
        </Button>
      </aside>
    </div>
  );
}
