import type { Metadata } from "next";

import { FavoritesView } from "@/components/account/favorites-view";

export const metadata: Metadata = { title: "Favoritos | basicTech" };

export default function FavoritesPage() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Favoritos</h2>
      <FavoritesView />
    </section>
  );
}
