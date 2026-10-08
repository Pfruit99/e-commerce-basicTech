import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/lib/mock-data";

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo de la tienda: precios, stock y categorías."
        actions={
          <Link href="/admin/productos/nuevo" className={buttonVariants()}>
            <Plus /> Nuevo producto
          </Link>
        }
      />
      <ProductsTable products={products} />
    </>
  );
}
