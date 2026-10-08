import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Finalizar compra | basicTech" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Finalizar compra</h1>
      <CheckoutView />
    </div>
  );
}
