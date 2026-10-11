"use client";

import { Heart, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSignOut } from "@/components/account/use-sign-out";

const links = [
  { href: "/cuenta", label: "Mi perfil", icon: User },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <nav aria-label="Cuenta" className="flex gap-2 overflow-x-auto md:flex-col">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
              active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted md:mt-4"
      >
        <LogOut className="size-4" /> Cerrar sesión
      </button>
    </nav>
  );
}
