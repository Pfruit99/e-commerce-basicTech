import { RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rankRelated } from "@/lib/catalog-api";
import { getCategory, getCategoryProducts, getProductBySlug, getProductSlugs } from "@/lib/server/catalog";

const sampleReviews = [
  { author: "Martín R.", rating: 5, text: "Excelente relación precio-calidad. Llegó rápido y bien embalado." },
  { author: "Lucía G.", rating: 4, text: "Cumple lo que promete. Lo recomiendo." },
  { author: "Diego P.", rating: 5, text: "Justo lo que buscaba para mi setup." },
];

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.name} | basicTech` : "basicTech" };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [category, siblings] = await Promise.all([getCategory(product.category), getCategoryProducts(product.category)]);
  if (!category) notFound();
  const related = rankRelated(product, siblings);
  const specEntries = Object.entries(product.specs);
  const average = sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/categoria/${category.slug}`} />}>{category.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery category={product.category} name={product.name} />

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-primary text-primary" />
              <span>
                {average.toFixed(1)} ({sampleReviews.length} reseñas)
              </span>
            </div>
          </div>

          <ul className="flex flex-wrap gap-2">
            {specEntries.map(([key, value]) => (
              <li key={key} className="rounded-full border px-3 py-1 text-xs">
                <span className="text-muted-foreground">{key}:</span> {value}
              </li>
            ))}
          </ul>

          <Separator />
          <PurchasePanel product={product} />
          <Separator />

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="size-5 text-primary" /> Envío a todo el país
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="size-5 text-primary" /> Devolución gratis dentro de los 30 días
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary" /> 12 meses de garantía oficial
            </li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mt-14">
        <TabsList>
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="mt-4">
          <dl className="max-w-2xl divide-y rounded-xl border">
            {[["Marca", product.brand], ["Categoría", category.name], ...specEntries].map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm even:bg-muted/40">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>

        <TabsContent value="description" className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <p>
            {product.name} de {product.brand}, pensado para quienes buscan rendimiento y confianza en{" "}
            {category.name.toLowerCase()}. Combina {specEntries.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ")}{" "}
            con la garantía y el soporte de basicTech.
          </p>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 max-w-2xl space-y-4">
          {sampleReviews.map((r) => (
            <figure key={r.author} className="rounded-xl border p-4">
              <div className="flex items-center justify-between text-sm">
                <figcaption className="font-medium">{r.author}</figcaption>
                <span className="flex" role="img" aria-label={`${r.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                  ))}
                </span>
              </div>
              <blockquote className="mt-2 text-sm text-muted-foreground">{r.text}</blockquote>
            </figure>
          ))}
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
