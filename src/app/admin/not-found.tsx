import { NotFoundState } from "@/components/not-found-state";

export default function AdminNotFound() {
  return (
    <NotFoundState title="No encontramos este recurso" href="/admin" action="Volver al resumen" className="py-16" />
  );
}
