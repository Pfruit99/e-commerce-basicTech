import type { Metadata } from "next";

import { FavoritesView } from "@/components/account/favorites-view";
import { requirePageAccess } from "@/lib/server/session";

export const metadata: Metadata = { title: "Favoritos | basicTech" };

export default async function FavoritesPage() {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("user", "/cuenta/favoritos");
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Favoritos</h2>
      <FavoritesView />
    </section>
  );
}
