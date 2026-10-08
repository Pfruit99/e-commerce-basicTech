import Link from "next/link";

import { categories } from "@/components/layout/site-header";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold">
            basic<span className="text-primary">Tech</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Computadoras, monitores y periféricos al mejor precio.
          </p>
        </div>
        <div>
          <p className="font-medium">Categorías</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="hover:text-primary">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Ayuda</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Envíos y devoluciones</li>
            <li>Garantía</li>
            <li>Contacto</li>
          </ul>
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">
        © basicTech. Todos los derechos reservados.
      </p>
    </footer>
  );
}
