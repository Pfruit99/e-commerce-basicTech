/** Datos de ejemplo para maquetar la cuenta. Se reemplazan al conectar el backend. */

export type OrderStatus = "pending" | "shipped" | "delivered";

export type Order = {
  id: string;
  /** Fecha ISO (YYYY-MM-DD). */
  date: string;
  status: OrderStatus;
  items: { productId: string; qty: number }[];
};

export const demoUser = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+54 11 5555 0000",
  address: "Av. Siempreviva 742",
  city: "Buenos Aires",
  zip: "C1000",
};

export const demoOrders: Order[] = [
  { id: "A1B2C3D4", date: "2026-09-28", status: "shipped", items: [{ productId: "7", qty: 1 }, { productId: "10", qty: 1 }] },
  { id: "E5F6G7H8", date: "2026-08-14", status: "delivered", items: [{ productId: "14", qty: 2 }] },
  { id: "J9K0L1M2", date: "2026-10-05", status: "pending", items: [{ productId: "22", qty: 1 }] },
];

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  shipped: "En camino",
  delivered: "Entregado",
};

/** Ordena los pedidos del más reciente al más antiguo, sin mutar la lista. */
export function sortOrdersByDate(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.date.localeCompare(a.date));
}
