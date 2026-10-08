import { PageHeader } from "@/components/admin/page-header";
import { PaymentsView } from "@/components/admin/payments-view";
import { adminPayments } from "@/lib/mock-admin";

export default function AdminPaymentsPage() {
  return (
    <>
      <PageHeader title="Pagos" description="Cobros por pedido, con su estado y método." />
      <PaymentsView payments={adminPayments} />
    </>
  );
}
