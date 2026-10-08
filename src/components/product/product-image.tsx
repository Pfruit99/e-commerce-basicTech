import { Cpu, Headphones, Keyboard, Monitor, MonitorSmartphone, Mouse, type LucideIcon } from "lucide-react";

import type { CategorySlug } from "@/lib/mock-data";

const icons: Record<CategorySlug, LucideIcon> = {
  pc: MonitorSmartphone,
  monitores: Monitor,
  teclados: Keyboard,
  mouses: Mouse,
  audio: Headphones,
  componentes: Cpu,
};

/** Placeholder hasta contar con fotos reales de producto. */
export function ProductImage({ category, className = "" }: { category: CategorySlug; className?: string }) {
  const Icon = icons[category];
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-muted to-muted/40 text-muted-foreground/60 ${className}`}
      aria-hidden
    >
      <Icon className="size-1/3" strokeWidth={1.25} />
    </div>
  );
}
