import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, products } from "@/lib/mock-data";
import { requirePageAccess } from "@/lib/server/session";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function EditProductPage({ params }: PageProps<"/admin/productos/[id]/editar">) {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("admin", "/admin/productos");
  const product = getProductById((await params).id);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={`Editar ${product.name}`} description={product.brand} />
      <ProductForm product={product} />
    </>
  );
}
