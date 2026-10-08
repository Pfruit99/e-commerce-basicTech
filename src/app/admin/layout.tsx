import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Administración | basicTech",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-semibold tracking-tight">Administración</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Maqueta de demostración con datos de ejemplo. Aún sin control de acceso.
      </p>
      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
