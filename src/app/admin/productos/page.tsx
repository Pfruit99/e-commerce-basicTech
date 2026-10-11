import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/lib/mock-data";
import { requirePageAccess } from "@/lib/server/session";

export default async function AdminProductsPage() {
  // El layout también comprueba, pero Next renderiza la página por separado: sin esto su contenido se filtraría.
  await requirePageAccess("admin", "/admin/productos");
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
