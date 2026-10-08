"use client";

import { Heart } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites-store";

type Props = Omit<ComponentProps<typeof Button>, "onClick" | "children"> & { productId: string; productName: string };

export function FavoriteButton({ productId, productName, ...props }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(productId);

  return (
    <Button
      {...props}
      aria-label={active ? `Quitar ${productName} de favoritos` : `Agregar ${productName} a favoritos`}
      aria-pressed={active}
      onClick={() => toggle(productId)}
    >
      <Heart className={active ? "fill-primary text-primary" : ""} />
    </Button>
  );
}
