"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { RowActions } from "@/components/admin/row-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filterAdminProducts, LOW_STOCK_LIMIT } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { categories, type CategorySlug, type Product } from "@/lib/mock-data";

const categoryItems = [{ value: "all", label: "Todas las categorías" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))];

/** Solo UI: editar abre el formulario; eliminar y los cambios no se guardan. */
export function ProductsTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => filterAdminProducts(products, query, category), [products, query, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o marca" className="pl-9" aria-label="Buscar productos" />
        </div>
        <Select items={categoryItems} value={category} onValueChange={(v) => v && setCategory(v as CategorySlug | "all")}>
          <SelectTrigger className="w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visible.length} {visible.length === 1 ? "producto" : "productos"}
        {notice && <span role="status"> · {notice}</span>}
      </p>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </TableCell>
                  <TableCell>{categories.find((c) => c.slug === p.category)?.name}</TableCell>
                  <TableCell className="text-right">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-right">
                    {p.stock === 0 ? (
                      <Badge variant="destructive">Agotado</Badge>
                    ) : p.stock <= LOW_STOCK_LIMIT ? (
                      <Badge variant="secondary">{p.stock} (bajo)</Badge>
                    ) : (
                      p.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      label={`Acciones de ${p.name}`}
                      actions={[
                        { label: "Editar", href: `/admin/productos/${p.id}/editar` },
                        { label: "Ver en la tienda", href: `/producto/${p.slug}` },
                        { label: "Eliminar", destructive: true, separated: true, onSelect: () => setToDelete(p) },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se podrá deshacer cuando el panel esté conectado.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setNotice("Demostración: no se eliminó nada.");
                setToDelete(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
