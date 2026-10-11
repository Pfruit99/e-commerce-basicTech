"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoUser } from "@/lib/mock-account";

type ProfileUser = { name: string; email: string; phone: string };

/**
 * Nombre, email y teléfono vienen de la sesión. La dirección sigue siendo de ejemplo hasta tener
 * `/api/me/addresses`, y guardar todavía no persiste nada (falta `PATCH /api/me`).
 */
export function ProfileForm({ user }: { user: ProfileUser }) {
  const fields = [
    { id: "name", label: "Nombre y apellido", value: user.name, type: "text" },
    { id: "email", label: "Email", value: user.email, type: "email" },
    { id: "phone", label: "Teléfono", value: user.phone, type: "tel" },
    { id: "address", label: "Dirección", value: demoUser.address, type: "text" },
    { id: "city", label: "Ciudad", value: demoUser.city, type: "text" },
    { id: "zip", label: "Código postal", value: demoUser.zip, type: "text" },
  ];
  const [saved, setSaved] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className={`space-y-1.5 ${f.id === "address" ? "sm:col-span-2" : ""}`}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} name={f.id} type={f.type} defaultValue={f.value} required={f.id !== "phone"} onChange={() => setSaved(false)} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Guardar cambios</Button>
        {saved && (
          <span role="status" className="text-xs text-muted-foreground">
            Demostración: los cambios no se guardan.
          </span>
        )}
      </div>
    </form>
  );
}
