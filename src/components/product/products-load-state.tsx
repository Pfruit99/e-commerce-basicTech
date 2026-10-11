import { Button } from "@/components/ui/button";

/** Aviso mientras se piden productos a la API, o si falló la petición. */
export function ProductsLoadState({ error, onRetry }: { error: boolean; onRetry: () => void }) {
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">No pudimos cargar los productos.</p>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }
  return (
    <p className="py-16 text-center text-sm text-muted-foreground" aria-live="polite">
      Cargando productos…
    </p>
  );
}
