import { CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pedido confirmado | basicTech" };

async function OrderNumber({ searchParams }: { searchParams: PageProps<"/checkout/confirmacion">["searchParams"] }) {
  const { orden } = await searchParams;
  const value = typeof orden === "string" && /^[A-Z0-9]{8}$/.test(orden) ? orden : null;
  return value ? (
    <p className="text-muted-foreground">
      Tu número de pedido es <span className="font-mono font-medium text-foreground">{value}</span>.
    </p>
  ) : null;
}

export default function ConfirmationPage({ searchParams }: PageProps<"/checkout/confirmacion">) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <CircleCheck className="size-14 text-primary" strokeWidth={1.25} />
      <h1 className="text-3xl font-semibold tracking-tight">¡Gracias por tu compra!</h1>
      <Suspense>
        <OrderNumber searchParams={searchParams} />
      </Suspense>
      <p className="text-sm text-muted-foreground">Te enviaremos los detalles por email (demostración).</p>
      <Button render={<Link href="/" />}>Volver a la tienda</Button>
    </div>
  );
}
