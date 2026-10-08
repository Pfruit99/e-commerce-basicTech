"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites-store";
import { getProductById, type Product } from "@/lib/mock-data";

export function FavoritesView() {
  const { ids } = useFavorites();
  const items = ids.flatMap((id) => {
    const product = getProductById(id);
    return product ? [product] : [];
  }) satisfies Product[];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Heart className="size-12 text-muted-foreground" strokeWidth={1.25} />
        <p className="text-muted-foreground">Todavía no marcaste favoritos.</p>
        <Button render={<Link href="/" />}>Explorar productos</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
