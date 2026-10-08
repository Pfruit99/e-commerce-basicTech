import type { Order } from "./mock-account";
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
