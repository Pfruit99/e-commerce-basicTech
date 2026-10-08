import { ArrowRight, Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/lib/mock-data";

const benefits = [
  { icon: Truck, title: "Envío a todo el país", text: "Seguimiento en cada paso" },
  { icon: RotateCcw, title: "Devoluciones fáciles", text: "Hasta 30 días" },
  { icon: ShieldCheck, title: "Pago seguro", text: "Tus datos protegidos" },
  { icon: Headset, title: "Soporte técnico", text: "Te asesoramos antes de comprar" },
];

const bestSellers = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

function SectionHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline">
          Ver todo <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
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
                    className="aspect-square rounded-xl transition-colors group-hover:from-primary/20"
                  />
                  <span className="mt-2 block text-sm font-medium group-hover:text-primary">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading title="Más vendidos" href="/categoria/pc" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12">
          <h2 className="text-2xl font-semibold">Armá tu setup completo</h2>
          <p className="mt-2 max-w-md text-primary-foreground/80">
            Combiná monitor, teclado y mouse y llevate envío gratis en compras seleccionadas.
          </p>
          <Button variant="secondary" className="mt-5" render={<Link href="/categoria/teclados" />}>
            Ver periféricos
          </Button>
        </section>

        <section>
          <SectionHeading title="Recién llegados" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Marcas" />
          <ul className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <li key={b} className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
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
