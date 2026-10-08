import type { Metadata } from "next";

import { AuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Iniciar sesión | basicTech" };

export default function LoginPage() {
  return (
    <div className="px-4 py-16">
      <AuthForm mode="login" />
    </div>
  );
}
