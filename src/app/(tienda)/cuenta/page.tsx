import type { Metadata } from "next";

import { ProfileForm } from "@/components/account/profile-form";
import { requirePageAccess } from "@/lib/server/session";

export const metadata: Metadata = { title: "Mi perfil | basicTech" };

export default async function ProfilePage() {
  const { user } = await requirePageAccess("user", "/cuenta");

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Mi perfil</h2>
      <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone ?? "" }} />
    </section>
  );
}
