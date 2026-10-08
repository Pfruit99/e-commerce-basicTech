import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orderTotal } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { demoOrders, sortOrdersByDate, statusLabels } from "@/lib/mock-account";
import { getProductById } from "@/lib/mock-data";

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" });

export default function AdminOrdersPage() {
  const orders = sortOrdersByDate(demoOrders);

  return (
    <>
      <PageHeader title="Pedidos" description="Pedidos recientes de la tienda." />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">#{o.id}</TableCell>
                <TableCell>{dateFormat.format(new Date(o.date))}</TableCell>
                <TableCell>
                  <Badge variant={o.status === "delivered" ? "secondary" : "default"}>{statusLabels[o.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">{o.items.reduce((n, i) => n + i.qty, 0)}</TableCell>
                <TableCell className="text-right">{formatPrice(orderTotal(o, getProductById))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
