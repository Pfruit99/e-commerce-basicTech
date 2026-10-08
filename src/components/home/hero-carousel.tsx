"use client";

import { ChevronLeft, ChevronRight, Keyboard, Laptop, Monitor, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

type Slide = {
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
  icon: LucideIcon;
  /** Degradado con tokens del tema para que funcione en claro y oscuro. */
  gradient: string;
};

const slides: Slide[] = [
  {
    eyebrow: "Nuevos ingresos",
    title: "Potencia sin complicaciones",
    cta: { label: "Ver computadoras", href: "/categoria/pc" },
    icon: Laptop,
    gradient: "from-primary/25 via-primary/10 to-background",
  },
  {
    eyebrow: "Desde US$119",
    title: "Más pantalla, mejor trabajo",
    cta: { label: "Ver monitores", href: "/categoria/monitores" },
    icon: Monitor,
    gradient: "from-chart-2/25 via-chart-2/10 to-background",
  },
  {
    eyebrow: "Armá tu setup",
    title: "Teclados y mouses para cada estilo",
    cta: { label: "Ver periféricos", href: "/categoria/teclados" },
    icon: Keyboard,
    gradient: "from-chart-4/25 via-chart-4/10 to-background",
  },
];

const AUTOPLAY_MS = 6000;

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Autoavance en pausa al pasar el cursor o enfocar, y desactivado si el usuario pide menos movimiento.
  useEffect(() => {
    if (!api || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [api, paused]);

  return (
    <section
      aria-label="Destacados"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="ml-0">
          {slides.map(({ eyebrow, title, cta, icon: Icon, gradient }, i) => (
            <CarouselItem
              key={title}
              className="pl-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <div className={`bg-gradient-to-r ${gradient}`}>
                <div className="mx-auto flex h-52 max-w-7xl items-center justify-between gap-6 px-4 sm:h-60 sm:px-14">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-primary">{eyebrow}</p>
                    <h2 className="max-w-md text-2xl font-light tracking-tight sm:text-4xl">{title}</h2>
                    <Button render={<Link href={cta.href} />}>{cta.label}</Button>
                  </div>
                  <Icon className="hidden size-36 shrink-0 text-primary/30 sm:block" strokeWidth={1} aria-hidden />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <Button
          variant="secondary"
          size="icon"
          aria-label="Diapositiva anterior"
          onClick={() => api?.scrollPrev()}
          className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full sm:inline-flex"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Diapositiva siguiente"
          onClick={() => api?.scrollNext()}
          className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full sm:inline-flex"
        >
          <ChevronRight />
        </Button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === selected}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === selected ? "w-6 bg-primary" : "w-1.5 bg-foreground/30"}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
