import { FREE_SHIPPING_THRESHOLD, type CartTotals } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function OrderSummary({ totals }: { totals: CartTotals }) {
  const missing = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal ({totals.itemCount})</span>
        <span>{formatPrice(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Envío</span>
        <span>{totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping)}</span>
      </div>
      {totals.subtotal > 0 && missing > 0 && (
        <p className="text-xs text-primary">Te faltan {formatPrice(missing)} para el envío gratis.</p>
      )}
      <div className="flex justify-between border-t pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
}
