import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { requirePageAccess } from "@/lib/server/session";

export default async function NewProductPage() {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("admin", "/admin/productos/nuevo");
  return (
    <>
      <PageHeader title="Nuevo producto" />
      <ProductForm />
    </>
  );
}
