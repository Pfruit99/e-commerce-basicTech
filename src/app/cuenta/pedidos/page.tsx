import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { demoOrders, sortOrdersByDate, statusLabels } from "@/lib/mock-account";
import { getProductById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Mis pedidos | basicTech" };

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" });

export default function OrdersPage() {
  const orders = sortOrdersByDate(demoOrders);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Mis pedidos</h2>
      <ul className="space-y-4">
        {orders.map((order) => {
          const lines = order.items.flatMap((i) => {
            const product = getProductById(i.productId);
            return product ? [{ product, qty: i.qty }] : [];
          });
          const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

          return (
            <li key={order.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-medium">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{dateFormat.format(new Date(order.date))}</p>
                </div>
                <Badge variant={order.status === "delivered" ? "secondary" : "default"}>{statusLabels[order.status]}</Badge>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {lines.map(({ product, qty }) => (
                  <li key={product.id}>
                    {qty} ×{" "}
                    <Link href={`/producto/${product.slug}`} className="hover:text-primary">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-semibold">{formatPrice(total)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
