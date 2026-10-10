import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFoundState({
  title = "No encontramos lo que buscabas",
  href = "/",
  action = "Volver a la tienda",
  className = "py-24",
}: {
  title?: string;
  href?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-md flex-col items-center gap-3 px-4 text-center ${className}`}>
      <p className="spec-label">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">Puede que el enlace esté roto o que el producto ya no esté disponible.</p>
      <Button className="mt-2" render={<Link href={href} />}>
        {action}
      </Button>
    </div>
  );
}
