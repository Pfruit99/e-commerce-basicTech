import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Nuevo producto</h2>
      <ProductForm />
    </section>
  );
}
