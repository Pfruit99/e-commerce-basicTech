import { Badge } from "@/components/ui/badge";
import { paymentStatusLabels, type PaymentStatus } from "@/lib/mock-admin";

const variants: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variants[status]}>{paymentStatusLabels[status]}</Badge>;
}
