import { ArrowRight, Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { getBestSellers, getBrandNames, getCategories, getNewArrivals } from "@/lib/server/catalog";

const benefits = [
  { icon: Truck, title: "Envío a todo el país", text: "Seguimiento en cada paso" },
  { icon: RotateCcw, title: "Devoluciones fáciles", text: "Hasta 30 días" },
  { icon: ShieldCheck, title: "Pago seguro", text: "Tus datos protegidos" },
  { icon: Headset, title: "Soporte técnico", text: "Te asesoramos antes de comprar" },
];

function SectionHeading({ title, index, href }: { title: string; index: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between border-b pb-3">
      <div>
        <p className="spec-label">{index}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline">
          Ver todo <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [categories, bestSellers, newArrivals, brands] = await Promise.all([
    getCategories(),
    getBestSellers(8),
    getNewArrivals(4),
    getBrandNames(),
  ]);

  return (
    <>
      <HeroCarousel />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12">
        <section aria-labelledby="cats">
          <h2 id="cats" className="sr-only">
            Categorías
          </h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="group block text-center">
                  <ProductImage
                    category={c.slug}
                    className="aspect-square rounded-xl ring-1 ring-border transition-shadow group-hover:ring-primary"
                  />
                  <span className="mt-2 block text-sm font-medium group-hover:text-primary">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading index="01 / Ranking" title="Más vendidos" href="/categoria/pc" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-2xl border bg-card px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div>
            <p className="spec-label text-primary">Setup</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Armá tu setup completo</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Combiná monitor, teclado y mouse y llevate envío gratis en compras seleccionadas.
            </p>
          </div>
          <Button size="lg" className="shrink-0" render={<Link href="/categoria/teclados" />}>
            Ver periféricos <ArrowRight className="size-4" />
          </Button>
        </section>

        <section>
          <SectionHeading index="02 / Novedades" title="Recién llegados" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading index="03 / Fabricantes" title="Marcas" />
          <ul className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <li key={b} className="spec-value rounded-md border px-3 py-1.5 text-sm text-muted-foreground">
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-6 text-primary" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
