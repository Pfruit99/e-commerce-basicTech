import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const metadata: Metadata = {
  title: "Administración | basicTech",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r bg-card p-4 md:flex">
        <Link href="/admin" className="px-3 pt-2 text-xl font-bold tracking-tight">
          basic<span className="text-primary">Tech</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">Admin</span>
        </Link>
        <AdminNav />
        <p className="mt-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Maqueta con datos de ejemplo. Aún sin control de acceso.
        </p>
      </aside>

      <div className="min-w-0">
        <AdminTopbar />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
