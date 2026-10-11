"use client";

import { LogOut, Package, Settings, User } from "lucide-react";
import Link from "next/link";

import { useSignOut } from "@/components/account/use-sign-out";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

/** Acceso a la cuenta en la cabecera: «Ingresar» sin sesión, menú con el nombre con sesión. */
export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const signOut = useSignOut();

  if (isPending || !session) {
    return (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        className={buttonVariants({ variant: "ghost", size: "icon" })}
        aria-busy={isPending}
      >
        <User className="size-5" />
      </Link>
    );
  }

  const { user } = session;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Cuenta de ${user.name}`} />}>
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
          {initials || <User className="size-4" />}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/cuenta" />}>
          <User /> Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/cuenta/pedidos" />}>
          <Package /> Mis pedidos
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <Settings /> Administración
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
