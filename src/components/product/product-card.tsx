import { Heart } from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        className={`relative block overflow-hidden rounded-xl ${isList ? "w-40 shrink-0 sm:w-56" : ""}`}
      >
        <ProductImage
          category={product.category}
          className="aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
        />
        {product.isNew && <Badge className="absolute top-3 left-3">Nuevo</Badge>}
      </Link>
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Agregar ${product.name} a favoritos`}
        className="absolute top-2 right-2 size-8 rounded-full"
      >
        <Heart className="size-4" />
      </Button>

      <div className={`mt-3 space-y-1 ${isList ? "mt-0 flex-1" : ""}`}>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <Link href={`/producto/${product.slug}`} className="block font-medium hover:text-primary">
          {product.name}
        </Link>
        <ul className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          {specs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
          {lowStock && <span className="text-xs text-destructive">¡Quedan {product.stock}!</span>}
        </div>
      </div>
    </article>
  );
}
