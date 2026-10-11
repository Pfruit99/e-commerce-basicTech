"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type FieldValues, type Path, type UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  PASSWORD_MIN,
  authErrorMessage,
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth-schemas";
import { safeRedirect } from "@/lib/authz";

type FieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: string;
  autoComplete: string;
  hint?: string;
  error?: string;
  register: UseFormRegister<T>;
};

function Field<T extends FieldValues>({ name, label, type = "text", autoComplete, hint, error, register }: FieldProps<T>) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...register(name)}
      />
      {error ? (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Tras entrar o registrarse, vuelve a `?next=` (solo rutas internas) y refresca lo que dependía de la sesión. */
function useAfterAuth() {
  const router = useRouter();
  const next = safeRedirect(useSearchParams().get("next"));
  const done = () => {
    router.replace(next);
    router.refresh();
  };
  return { next, done };
}

function FormShell({
  title,
  onSubmit,
  error,
  footer,
  children,
}: {
  title: string;
  onSubmit: () => void;
  error: string | null;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {children}
      <p className="text-center text-sm text-muted-foreground">{footer}</p>
    </form>
  );
}

export function LoginForm() {
  const { next, done } = useAfterAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) return setError(authErrorMessage(error));
    done();
  });

  return (
    <FormShell
      title="Iniciar sesión"
      onSubmit={onSubmit}
      error={error}
      footer={
        <>
          ¿No tenés cuenta?{" "}
          <Link href={`/registro?next=${encodeURIComponent(next)}`} className="text-primary hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <Field name="email" label="Email" type="email" autoComplete="email" register={register} error={formState.errors.email?.message} />
      <Field
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        register={register}
        error={formState.errors.password?.message}
      />
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </FormShell>
  );
}

export function RegisterForm() {
  const { next, done } = useAfterAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError(null);
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) return setError(authErrorMessage(error));
    done();
  });

  const errors = formState.errors;
  return (
    <FormShell
      title="Crear cuenta"
      onSubmit={onSubmit}
      error={error}
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <Field name="name" label="Nombre y apellido" autoComplete="name" register={register} error={errors.name?.message} />
      <Field name="email" label="Email" type="email" autoComplete="email" register={register} error={errors.email?.message} />
      <Field
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        hint={`Mínimo ${PASSWORD_MIN} caracteres.`}
        register={register}
        error={errors.password?.message}
      />
      <Field
        name="confirmPassword"
        label="Repetí la contraseña"
        type="password"
        autoComplete="new-password"
        register={register}
        error={errors.confirmPassword?.message}
      />
      <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </FormShell>
  );
}
