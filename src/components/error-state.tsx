"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Fallback de error para `error.tsx`. No muestra `error.message`: en producción Next lo oculta y no debe filtrarse. */
export function ErrorState({
  error,
  retry,
  className = "py-24",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  className?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className={`mx-auto flex max-w-md flex-col items-center gap-3 px-4 text-center ${className}`}>
      <p className="spec-label">Error</p>
      <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
      <p className="text-muted-foreground">No pudimos cargar esta página. Probá de nuevo en unos segundos.</p>
      {error.digest && <p className="spec-value text-xs text-muted-foreground">Código: {error.digest}</p>}
      <Button className="mt-2" onClick={() => retry()}>
        Reintentar
      </Button>
    </div>
  );
}
