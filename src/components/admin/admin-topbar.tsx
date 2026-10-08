"use client";

import { ExternalLink, Menu } from "lucide-react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { demoUser } from "@/lib/mock-account";

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetTitle className="px-4 pt-4 text-lg font-bold">
            basic<span className="text-primary">Tech</span> <span className="text-xs font-normal text-muted-foreground">Admin</span>
          </SheetTitle>
          <div className="p-3">
            <AdminNav />
          </div>
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Ver tienda <ExternalLink />
        </Link>
        <ThemeToggle />
        <div className="flex items-center gap-2 pl-2">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary"
          >
            {demoUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <span className="hidden text-sm sm:block">{demoUser.name}</span>
        </div>
      </div>
    </header>
  );
}
