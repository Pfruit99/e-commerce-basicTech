import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Nuevo producto" />
      <ProductForm />
    </>
  );
}
