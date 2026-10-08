import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogView } from "@/components/catalog/catalog-view";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { categories, getCategory, getProductsByCategory } from "@/lib/mock-data";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return { title: category ? `${category.name} | basicTech` : "basicTech" };
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  const products = getProductsByCategory(category.slug);

  return (
    <>
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl">{category.name}</h1>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2 className="mt-3 mb-6 text-2xl font-semibold">
          {products.length} resultados para {category.name.toLowerCase()}
        </h2>
        <CatalogView category={category} products={products} />
      </div>
    </>
  );
}
