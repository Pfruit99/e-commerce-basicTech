import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-semibold tracking-tight">Mi cuenta</h1>
      <p className="mb-6 text-sm text-muted-foreground">Vista de demostración con datos de ejemplo.</p>
      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
