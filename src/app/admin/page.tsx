import { AlertTriangle, CreditCard, DollarSign, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, LOW_STOCK_LIMIT, paymentTotals } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { demoOrders } from "@/lib/mock-account";
import { adminPayments, adminUsers, salesLast7Days } from "@/lib/mock-admin";
import { getProductById, products } from "@/lib/mock-data";

export default function AdminDashboard() {
  const stats = dashboardStats(products, demoOrders, getProductById);
  const totals = paymentTotals(adminPayments);
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock);
  const recentPayments = [...adminPayments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const peak = Math.max(...salesLast7Days.map((d) => d.amount));

  const cards = [
    { title: "Cobrado", value: formatPrice(totals.paid), note: undefined, icon: DollarSign },
    { title: "Pedidos", value: String(stats.orderCount), note: `${stats.pendingOrderCount} pendientes`, icon: ShoppingBag },
    { title: "Usuarios", value: String(adminUsers.length), note: undefined, icon: Users },
    {
      title: "Stock bajo o agotado",
      value: String(stats.lowStockCount + stats.outOfStockCount),
      note: undefined,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <PageHeader title="Resumen" description="Vista general de la tienda (datos de ejemplo)." />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, note, icon: Icon }) => (
          <li key={title}>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="spec-label">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-baseline gap-2">
                <span className="spec-value text-3xl font-semibold tracking-tight">{value}</span>
                {note && <span className="spec-value text-xs text-muted-foreground">{note}</span>}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ventas de los últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex h-48 items-end gap-3" aria-label="Ventas diarias en dólares">
              {salesLast7Days.map((d) => (
                <li key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="spec-value text-xs text-muted-foreground">{formatPrice(d.amount)}</span>
                  <div className="w-full rounded-t-sm bg-primary/80" style={{ height: `${(d.amount / peak) * 75}%` }} />
                  <span className="spec-label">{d.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Reponer stock</CardTitle>
            <Link href="/admin/productos" className="text-xs text-primary hover:underline">
              Ver productos
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate">{p.name}</span>
                  <span className={p.stock === 0 ? "shrink-0 font-medium text-destructive" : "shrink-0 text-muted-foreground"}>
                    {p.stock === 0 ? "Agotado" : `${p.stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" /> Últimos pagos
          </CardTitle>
          <Link href="/admin/pagos" className="text-xs text-primary hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate">
                  <span className="font-mono text-xs text-muted-foreground">{p.id}</span> · {p.customer}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <PaymentStatusBadge status={p.status} />
                  <span className="spec-value w-20 text-right font-medium">{formatPrice(p.amount)}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
