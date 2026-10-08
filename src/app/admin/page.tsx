import { AlertTriangle, DollarSign, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, LOW_STOCK_LIMIT } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { demoOrders } from "@/lib/mock-account";
import { getProductById, products } from "@/lib/mock-data";

export default function AdminDashboard() {
  const stats = dashboardStats(products, demoOrders, getProductById);
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock);

  const cards = [
    { title: "Ingresos (ejemplo)", value: formatPrice(stats.revenue), icon: DollarSign },
    { title: "Pedidos", value: `${stats.orderCount} (${stats.pendingOrderCount} pendientes)`, icon: ShoppingBag },
    { title: "Productos", value: String(stats.productCount), icon: Package },
    { title: "Stock bajo o agotado", value: String(stats.lowStockCount + stats.outOfStockCount), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon }) => (
          <li key={title}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{value}</CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reponer stock</h2>
        <ul className="divide-y rounded-xl border">
          {lowStock.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/producto/${p.slug}`} className="hover:text-primary">
                {p.name}
              </Link>
              <span className={p.stock === 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
                {p.stock === 0 ? "Agotado" : `${p.stock} u.`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
