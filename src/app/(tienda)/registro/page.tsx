import type { Metadata } from "next";

import { AuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Crear cuenta | basicTech" };

export default function RegisterPage() {
  return (
    <div className="px-4 py-16">
      <AuthForm mode="register" />
    </div>
  );
}
