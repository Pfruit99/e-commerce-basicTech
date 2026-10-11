import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RegisterForm } from "@/components/account/auth-form";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = { title: "Crear cuenta | basicTech" };

/** Con sesión no tiene sentido registrarse otra vez: se va a la cuenta. */
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
        <RegisterForm />
      </Suspense>
    </div>
  );
}
