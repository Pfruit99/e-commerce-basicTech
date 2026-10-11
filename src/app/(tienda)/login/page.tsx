import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/account/auth-form";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "Iniciar sesión | basicTech" };

/** Con sesión no tiene sentido volver a entrar: se va a la cuenta. */
async function RedirectIfSignedIn() {
  if (await getSession()) redirect("/cuenta");
  return null;
}

export default function Page() {
  return (
    <div className="px-4 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <Suspense fallback={<div className="mx-auto h-96 w-full max-w-sm rounded-2xl border bg-card" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
