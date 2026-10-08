"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites-store";

export function FavoritesLink() {
  const { ids } = useFavorites();

  return (
    <Link
      href="/cuenta/favoritos"
      aria-label={`Favoritos (${ids.length})`}
      className={`${buttonVariants({ variant: "ghost", size: "icon" })} relative`}
    >
      <Heart className="size-5" />
      {ids.length > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">{ids.length}</Badge>
      )}
    </Link>
  );
}
