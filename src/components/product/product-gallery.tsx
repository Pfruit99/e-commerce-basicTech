"use client";

import { useState } from "react";

import { ProductImage } from "@/components/product/product-image";

const VIEWS = ["Frente", "Lateral", "Detalle", "Caja"];

/** Galería con miniaturas. Usa marcadores hasta tener fotos reales. */
export function ProductGallery({ category, name }: { category: string; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <ProductImage category={category} className="aspect-square w-full rounded-2xl" />
      <p className="sr-only" aria-live="polite">
        {name}: vista {VIEWS[active]}
      </p>
      <ul className="grid grid-cols-4 gap-3">
        {VIEWS.map((view, i) => (
          <li key={view}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver ${view}`}
              aria-pressed={active === i}
              className={`w-full overflow-hidden rounded-lg border-2 transition-colors ${
                active === i ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <ProductImage category={category} className="aspect-square" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
