import type { Metadata } from "next";

import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = { title: "Carrito | basicTech" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Tu carrito</h1>
      <CartPageView />
    </div>
  );
}
