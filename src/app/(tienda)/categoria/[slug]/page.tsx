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
import { DEFAULT_PAGE_SIZE, buildFacets, paginate } from "@/lib/catalog-api";
import { getCategories, getCategory, getCategoryProducts } from "@/lib/server/catalog";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  return { title: category ? `${category.name} | basicTech` : "basicTech" };
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  const products = await getCategoryProducts(category.slug);
  const facets = buildFacets(products, category.filterKeys);
  const initial = paginate(products, "popular", 1, DEFAULT_PAGE_SIZE);

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
        <CatalogView category={category} facets={facets} initial={initial} />
      </div>
    </>
  );
}
