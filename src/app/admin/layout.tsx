import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { requirePageAccess } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Administración | basicTech",
  robots: { index: false, follow: false },
};

/** Solo administradores: la sesión y el rol se comprueban en el servidor en cada petición. */
async function AdminGate({ children }: { children: ReactNode }) {
  const { user } = await requirePageAccess("admin", "/admin");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r bg-card p-4 md:flex">
        <Link href="/admin" className="px-3 pt-2 text-xl font-bold tracking-tight">
          basic<span className="text-primary">Tech</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">Admin</span>
        </Link>
        <AdminNav />
        <p className="mt-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Maqueta con datos de ejemplo: las acciones todavía no guardan cambios.
        </p>
      </aside>

      <div className="min-w-0">
        <AdminTopbar userName={user.name} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Verificando acceso…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
