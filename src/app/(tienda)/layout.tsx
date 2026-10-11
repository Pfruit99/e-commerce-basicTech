import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategories } from "@/lib/server/catalog";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const categories = (await getCategories()).map((c) => ({ name: c.name, href: `/categoria/${c.slug}` }));

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
    </>
  );
}
