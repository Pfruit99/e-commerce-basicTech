"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Solo UI: no autentica ni guarda credenciales. La sesión real se conectará con
 * una librería de autenticación en la fase de backend.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [submitted, setSubmitted] = useState(false);
  const isRegister = mode === "register";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>

      {isRegister && (
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre y apellido</Label>
          <Input id="name" name="name" autoComplete="name" required minLength={2} />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : 1}
        />
        {isRegister && <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>}
      </div>

      <Button type="submit" size="lg" className="w-full">
        {isRegister ? "Crear cuenta" : "Entrar"}
      </Button>

      {submitted && (
        <p role="status" className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Demostración: la autenticación todavía no está conectada.{" "}
          <Link href="/cuenta" className="text-primary underline">
            Ver mi cuenta de ejemplo
          </Link>
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
        <Link href={isRegister ? "/login" : "/registro"} className="text-primary hover:underline">
          {isRegister ? "Iniciá sesión" : "Registrate"}
        </Link>
      </p>
    </form>
  );
}
