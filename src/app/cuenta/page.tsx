import type { Metadata } from "next";

import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Mi perfil | basicTech" };

export default function ProfilePage() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Mi perfil</h2>
      <ProfileForm />
    </section>
  );
}
