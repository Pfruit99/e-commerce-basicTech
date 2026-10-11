import type { ReactNode } from "react";
import { Suspense } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { requirePageAccess } from "@/lib/server/session";

/** Comprueba la sesión en el servidor antes de mostrar nada de la cuenta (el proxy solo mira la cookie). */
async function AccountGate({ children }: { children: ReactNode }) {
  await requirePageAccess("user", "/cuenta");
  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <AccountNav />
      <div>{children}</div>
    </div>
  );
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Mi cuenta</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando tu cuenta…</p>}>
        <AccountGate>{children}</AccountGate>
      </Suspense>
    </div>
  );
}
