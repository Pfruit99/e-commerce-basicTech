"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

/** Cierra la sesión y vuelve a la tienda, refrescando los componentes de servidor que dependían de ella. */
export function useSignOut() {
  const router = useRouter();
  return async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };
}
