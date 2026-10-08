import { ProductsTable } from "@/components/admin/products-table";
import { products } from "@/lib/mock-data";

export default function AdminProductsPage() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Productos</h2>
      <ProductsTable products={products} />
    </section>
  );
}
