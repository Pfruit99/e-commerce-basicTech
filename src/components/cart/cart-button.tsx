"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { CartLines } from "@/components/cart/cart-lines";
import { OrderSummary } from "@/components/cart/order-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cartLines, cartTotals } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { useCatalogProducts } from "@/lib/use-catalog-products";

export function CartButton() {
  const { items } = useCart();
  const { find, loading } = useCatalogProducts(items.map((i) => i.productId));
  const lines = cartLines(items, find);
  const totals = cartTotals(lines);
  // El contador sale del carrito guardado para no parpadear mientras llegan los precios.
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label={`Carrito (${itemCount})`} className="relative" />}>
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">{itemCount}</Badge>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>

        {loading && lines.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">Cargando…</p>
        ) : lines.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">Todavía no agregaste productos.</p>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <CartLines lines={lines} compact />
          </div>
        )}

        {lines.length > 0 && (
          <SheetFooter className="border-t">
            <OrderSummary totals={totals} />
            <SheetClose render={<Link href="/checkout" />} className={buttonVariants({ size: "lg" })}>
              Finalizar compra
            </SheetClose>
            <SheetClose render={<Link href="/carrito" />} className={buttonVariants({ variant: "outline" })}>
              Ver carrito
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
