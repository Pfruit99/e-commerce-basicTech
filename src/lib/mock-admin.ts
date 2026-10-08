/** Datos de ejemplo para maquetar el panel de administración. Se reemplazan al conectar el backend. */

export type UserRole = "customer" | "admin";
export type UserStatus = "active" | "blocked";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** Fecha ISO (YYYY-MM-DD). */
  createdAt: string;
  orderCount: number;
};

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "card" | "transfer" | "cash";

export type Payment = {
  id: string;
  orderId: string;
  customer: string;
  method: PaymentMethod;
  /** Monto en USD. */
  amount: number;
  status: PaymentStatus;
  /** Fecha ISO (YYYY-MM-DD). */
  date: string;
};

export const roleLabels: Record<UserRole, string> = { customer: "Cliente", admin: "Administrador" };
export const userStatusLabels: Record<UserStatus, string> = { active: "Activo", blocked: "Bloqueado" };
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
  refunded: "Reembolsado",
};
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Efectivo",
};

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Ana Pérez", email: "ana@example.com", role: "admin", status: "active", createdAt: "2026-01-12", orderCount: 3 },
  { id: "u2", name: "Martín Ruiz", email: "martin@example.com", role: "customer", status: "active", createdAt: "2026-02-03", orderCount: 5 },
  { id: "u3", name: "Lucía Gómez", email: "lucia@example.com", role: "customer", status: "active", createdAt: "2026-03-18", orderCount: 2 },
  { id: "u4", name: "Diego Paz", email: "diego@example.com", role: "customer", status: "blocked", createdAt: "2026-04-09", orderCount: 1 },
  { id: "u5", name: "Sofía Torres", email: "sofia@example.com", role: "customer", status: "active", createdAt: "2026-05-21", orderCount: 7 },
  { id: "u6", name: "Pablo Medina", email: "pablo@example.com", role: "customer", status: "active", createdAt: "2026-06-02", orderCount: 0 },
  { id: "u7", name: "Valeria Ríos", email: "valeria@example.com", role: "admin", status: "active", createdAt: "2026-06-30", orderCount: 1 },
  { id: "u8", name: "Tomás Acosta", email: "tomas@example.com", role: "customer", status: "active", createdAt: "2026-08-11", orderCount: 4 },
];

export const adminPayments: Payment[] = [
  { id: "P-1001", orderId: "A1B2C3D4", customer: "Ana Pérez", method: "card", amount: 628, status: "paid", date: "2026-09-28" },
  { id: "P-1002", orderId: "E5F6G7H8", customer: "Martín Ruiz", method: "card", amount: 118, status: "paid", date: "2026-08-14" },
  { id: "P-1003", orderId: "J9K0L1M2", customer: "Sofía Torres", method: "transfer", amount: 89, status: "pending", date: "2026-10-05" },
  { id: "P-1004", orderId: "N3O4P5Q6", customer: "Lucía Gómez", method: "card", amount: 1499, status: "paid", date: "2026-10-02" },
  { id: "P-1005", orderId: "R7S8T9U0", customer: "Diego Paz", method: "card", amount: 229, status: "failed", date: "2026-10-03" },
  { id: "P-1006", orderId: "V1W2X3Y4", customer: "Tomás Acosta", method: "cash", amount: 159, status: "pending", date: "2026-10-06" },
  { id: "P-1007", orderId: "Z5A6B7C8", customer: "Sofía Torres", method: "card", amount: 449, status: "refunded", date: "2026-09-20" },
  { id: "P-1008", orderId: "D9E0F1G2", customer: "Martín Ruiz", method: "transfer", amount: 299, status: "paid", date: "2026-10-07" },
];

/** Ventas diarias de ejemplo (USD) para el gráfico del resumen. */
export const salesLast7Days = [
  { label: "Jue", amount: 820 },
  { label: "Vie", amount: 1240 },
  { label: "Sáb", amount: 1760 },
  { label: "Dom", amount: 940 },
  { label: "Lun", amount: 1380 },
  { label: "Mar", amount: 1120 },
  { label: "Mié", amount: 1910 },
];
