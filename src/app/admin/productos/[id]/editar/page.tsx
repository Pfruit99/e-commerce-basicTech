import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, products } from "@/lib/mock-data";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function EditProductPage({ params }: PageProps<"/admin/productos/[id]/editar">) {
  const product = getProductById((await params).id);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={`Editar ${product.name}`} description={product.brand} />
      <ProductForm product={product} />
    </>
  );
}
