import type { Order } from "./mock-account";
import type { AdminUser, Payment, PaymentStatus, UserRole } from "./mock-admin";
import type { CategorySlug, Product } from "./mock-data";

export const LOW_STOCK_LIMIT = 5;

/** Total del pedido en USD; ignora productos que ya no existen. */
export function orderTotal(order: Order, find: (id: string) => Product | undefined): number {
  return order.items.reduce((sum, i) => sum + (find(i.productId)?.price ?? 0) * i.qty, 0);
}

export type DashboardStats = {
  productCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  orderCount: number;
  pendingOrderCount: number;
  revenue: number;
};

export function dashboardStats(
  products: Product[],
  orders: Order[],
  find: (id: string) => Product | undefined,
): DashboardStats {
  return {
    productCount: products.length,
    lowStockCount: products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_LIMIT).length,
    outOfStockCount: products.filter((p) => p.stock === 0).length,
    orderCount: orders.length,
    pendingOrderCount: orders.filter((o) => o.status === "pending").length,
    revenue: orders.reduce((sum, o) => sum + orderTotal(o, find), 0),
  };
}

/** Busca por nombre o marca (sin distinguir mayúsculas) y opcionalmente por categoría. */
export function filterAdminProducts(items: Product[], query: string, category: CategorySlug | "all"): Product[] {
  const q = query.trim().toLowerCase();
  return items.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (q === "" || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)),
  );
}

/** Busca usuarios por nombre o email y opcionalmente por rol. */
export function filterUsers(users: AdminUser[], query: string, role: UserRole | "all"): AdminUser[] {
  const q = query.trim().toLowerCase();
  return users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (q === "" || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
}

export function filterPayments(payments: Payment[], status: PaymentStatus | "all"): Payment[] {
  return status === "all" ? payments : payments.filter((p) => p.status === status);
}

/** Suma de montos por estado de pago; siempre incluye los cuatro estados. */
export function paymentTotals(payments: Payment[]): Record<PaymentStatus, number> {
  const totals: Record<PaymentStatus, number> = { paid: 0, pending: 0, failed: 0, refunded: 0 };
  for (const p of payments) totals[p.status] += p.amount;
  return totals;
}
