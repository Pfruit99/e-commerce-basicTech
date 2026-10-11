"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { OrderSummary } from "@/components/cart/order-summary";
import { ProductsLoadState } from "@/components/product/products-load-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cartLines, cartTotals } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { useCatalogProducts } from "@/lib/use-catalog-products";

const STEPS = ["Datos", "Envío", "Pago"] as const;

const paymentMethods = [
  { value: "card", label: "Tarjeta de crédito o débito", hint: "Se completa en la pasarela de pago segura." },
  { value: "transfer", label: "Transferencia bancaria", hint: "Te enviamos los datos por email." },
  { value: "cash", label: "Efectivo al retirar", hint: "Pagás cuando retirás tu pedido." },
];

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

/** Solo UI: no se envía ni se guarda nada, y no se piden datos de tarjeta. */
export function CheckoutView() {
  const router = useRouter();
  const { items, clear } = useCart();
  const { find, loading, error, retry } = useCatalogProducts(items.map((i) => i.productId));
  const lines = cartLines(items, find);
  const totals = cartTotals(lines);

  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState("card");

  if (lines.length === 0 && (loading || error)) return <ProductsLoadState error={error} onRetry={retry} />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">No hay productos para pagar.</p>
        <Button render={<Link href="/" />}>Ir a la tienda</Button>
      </div>
    );
  }

  const next = (e: FormEvent) => {
    e.preventDefault();
    setStep((s) => s + 1);
  };

  const confirm = (e: FormEvent) => {
    e.preventDefault();
    const order = crypto.randomUUID().slice(0, 8).toUpperCase();
    clear();
    router.push(`/checkout/confirmacion?orden=${order}`);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        <ol className="mb-8 flex items-center gap-3 text-sm">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
              <span
                className={`flex size-7 items-center justify-center rounded-full border text-xs ${
                  i < step ? "border-primary bg-primary text-primary-foreground" : i === step ? "border-primary text-primary" : "text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={i === step ? "font-medium" : "text-muted-foreground"}>{label}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-border" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <form onSubmit={next} className="max-w-lg space-y-4">
            <Field id="name" label="Nombre y apellido">
              <Input id="name" name="name" autoComplete="name" required minLength={2} />
            </Field>
            <Field id="email" label="Email">
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field id="phone" label="Teléfono">
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required pattern="[0-9+()\s-]{7,}" title="Solo números, al menos 7 dígitos" />
            </Field>
            <Button type="submit" size="lg">Continuar</Button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={next} className="max-w-lg space-y-4">
            <Field id="address" label="Dirección">
              <Input id="address" name="address" autoComplete="street-address" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="city" label="Ciudad">
                <Input id="city" name="city" autoComplete="address-level2" required />
              </Field>
              <Field id="zip" label="Código postal">
                <Input id="zip" name="zip" autoComplete="postal-code" required />
              </Field>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(0)}>Volver</Button>
              <Button type="submit" size="lg">Continuar</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={confirm} className="max-w-lg space-y-5">
            <RadioGroup value={payment} onValueChange={(v) => setPayment(String(v))} aria-label="Método de pago">
              {paymentMethods.map((m) => (
                <Label key={m.value} htmlFor={`pay-${m.value}`} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[[data-checked]]:border-primary">
                  <RadioGroupItem id={`pay-${m.value}`} value={m.value} className="mt-0.5" />
                  <span className="space-y-0.5">
                    <span className="block font-medium">{m.label}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{m.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Demostración: no se procesa ningún pago ni se solicitan datos de tarjeta.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>Volver</Button>
              <Button type="submit" size="lg">Confirmar pedido · {formatPrice(totals.total)}</Button>
            </div>
          </form>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Tu pedido</h2>
        <ul className="space-y-2 text-sm">
          {lines.map(({ product, qty, subtotal }) => (
            <li key={product.id} className="flex justify-between gap-3">
              <span className="truncate">{qty} × {product.name}</span>
              <span className="shrink-0">{formatPrice(subtotal)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary totals={totals} />
      </aside>
    </div>
  );
}
