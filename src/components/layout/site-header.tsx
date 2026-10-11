import { Menu, Search, User } from "lucide-react";
import Link from "next/link";

import { CartButton } from "@/components/cart/cart-button";
import { FavoritesLink } from "@/components/layout/favorites-link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type NavCategory = { name: string; href: string };

const perks = ["Envío confiable", "Devoluciones fáciles", "Pago seguro"];

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="hidden bg-foreground text-background md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs">
          <span>Envíos a todo el país</span>
          <ul className="flex gap-6">
            {perks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle className="px-4 pt-4">Categorías</SheetTitle>
            <nav className="flex flex-col p-4">
              {categories.map((c) => (
                <Link key={c.href} href={c.href} className="rounded-md px-3 py-2 hover:bg-muted">
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-xl font-bold tracking-tight">
          basic<span className="text-primary">Tech</span>
        </Link>

        <div className="relative mx-2 hidden max-w-xl flex-1 sm:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="¿Qué estás buscando?" className="pl-9" aria-label="Buscar" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <FavoritesLink />
          <CartButton />
          <Link href="/login" aria-label="Mi cuenta" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <User className="size-5" />
          </Link>
        </div>
      </div>

      <nav className="hidden border-t md:block">
        <ul className="mx-auto flex h-10 max-w-7xl items-center gap-6 px-4 text-sm">
          {categories.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="text-muted-foreground transition-colors hover:text-primary">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
