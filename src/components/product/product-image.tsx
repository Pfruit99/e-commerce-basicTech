import { Cpu, Headphones, Keyboard, Monitor, MonitorSmartphone, Mouse, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  pc: MonitorSmartphone,
  monitores: Monitor,
  teclados: Keyboard,
  mouses: Mouse,
  audio: Headphones,
  componentes: Cpu,
};

/** Placeholder hasta contar con fotos reales de producto. */
export function ProductImage({ category, className = "" }: { category: string; className?: string }) {
  const Icon = icons[category] ?? Cpu;
  return (
    <div
      className={`flex items-center justify-center bg-muted/50 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:20px_20px] text-muted-foreground/70 ${className}`}
      aria-hidden
    >
      <Icon className="size-1/3" strokeWidth={1.25} />
    </div>
  );
}
