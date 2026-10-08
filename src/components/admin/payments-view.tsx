"use client";

import { useMemo, useState } from "react";

import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { RowActions } from "@/components/admin/row-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { filterPayments, paymentTotals } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabels, paymentStatusLabels, type Payment, type PaymentStatus } from "@/lib/mock-admin";

const dateFormat = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" });
const statuses: PaymentStatus[] = ["paid", "pending", "failed", "refunded"];

/** Solo UI: las acciones no modifican los pagos. */
export function PaymentsView({ payments }: { payments: Payment[] }) {
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [notice, setNotice] = useState("");
  const totals = useMemo(() => paymentTotals(payments), [payments]);
  const visible = useMemo(() => filterPayments(payments, status), [payments, status]);
  const demo = (text: string) => () => setNotice(`Demostración: ${text}`);

  return (
    <div className="space-y-6">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map((s) => (
          <li key={s}>
            <Card>
              <CardHeader className="space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{paymentStatusLabels[s]}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{formatPrice(totals[s])}</CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          value={[status]}
          onValueChange={(v) => v[0] && setStatus(v[0] as PaymentStatus | "all")}
          variant="outline"
          aria-label="Filtrar por estado"
        >
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
          {statuses.map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {paymentStatusLabels[s]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {visible.length} {visible.length === 1 ? "pago" : "pagos"}
          {notice && <span role="status"> · {notice}</span>}
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pago</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Sin pagos con ese estado.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-mono text-xs">{p.id}</p>
                    <p className="text-xs text-muted-foreground">Pedido #{p.orderId}</p>
                  </TableCell>
                  <TableCell>{p.customer}</TableCell>
                  <TableCell>{paymentMethodLabels[p.method]}</TableCell>
                  <TableCell>{dateFormat.format(new Date(p.date))}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(p.amount)}</TableCell>
                  <TableCell>
                    <RowActions
                      label={`Acciones del pago ${p.id}`}
                      actions={[
                        { label: "Ver detalle", onSelect: demo("el detalle aún no existe.") },
                        ...(p.status === "pending" ? [{ label: "Marcar como pagado", onSelect: demo("no se modificó el pago.") }] : []),
                        ...(p.status === "paid" ? [{ label: "Reembolsar", destructive: true, separated: true, onSelect: demo("no se reembolsó nada.") }] : []),
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
