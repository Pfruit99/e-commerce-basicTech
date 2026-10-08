import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto flex h-72 max-w-7xl flex-col justify-center gap-4 px-4">
        <h1 className="text-4xl font-light tracking-tight sm:text-6xl">
          Potencia <br /> sin complicaciones
        </h1>
        <Button className="w-fit">Ver ofertas</Button>
      </div>
    </section>
  );
}
