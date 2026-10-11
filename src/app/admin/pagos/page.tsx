import { PageHeader } from "@/components/admin/page-header";
import { PaymentsView } from "@/components/admin/payments-view";
import { adminPayments } from "@/lib/mock-admin";
import { requirePageAccess } from "@/lib/server/session";

export default async function AdminPaymentsPage() {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("admin", "/admin/pagos");
  return (
    <>
      <PageHeader title="Pagos" description="Cobros por pedido, con su estado y método." />
      <PaymentsView payments={adminPayments} />
    </>
  );
}
