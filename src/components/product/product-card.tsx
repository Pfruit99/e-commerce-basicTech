import Link from "next/link";

import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const specs = Object.values(product.specs).slice(0, 3);
  const lowStock = product.stock <= 5;
  const isList = layout === "list";

  return (
    <article className={`group relative ${isList ? "flex gap-4" : ""}`}>
      <Link
        href={`/producto/${product.slug}`}
        className={`relative block overflow-hidden rounded-xl ring-1 ring-border ${isList ? "w-40 shrink-0 sm:w-56" : ""}`}
      >
        <ProductImage
          category={product.category}
          className="aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
        />
        {product.isNew && <Badge className="absolute top-3 left-3">Nuevo</Badge>}
      </Link>
      <FavoriteButton
        productId={product.id}
        productName={product.name}
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 size-8 rounded-full"
      />

      <div className={`mt-3 space-y-1.5 ${isList ? "mt-0 flex-1" : ""}`}>
        <p className="spec-label">{product.brand}</p>
        <Link
          href={`/producto/${product.slug}`}
          className="block text-[15px] leading-snug font-medium tracking-tight hover:text-primary"
        >
          {product.name}
        </Link>
        <ul className="spec-value flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
          {specs.map((s, i) => (
            <li key={s} className="flex gap-1.5">
              {i > 0 && <span aria-hidden>·</span>}
              {s}
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between pt-1">
          <span className="spec-value text-base font-semibold">{formatPrice(product.price)}</span>
          {lowStock && (
            <span className="spec-value text-xs text-destructive">
              {product.stock === 0 ? "Agotado" : `Quedan ${product.stock}`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
