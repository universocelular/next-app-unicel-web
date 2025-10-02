
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </Link>
  );
};


export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-1 text-lg font-semibold mb-4"
          >
            <EnhancedLogo
              width={100}
              height={100}
              className="h-20 w-20"
              priority
            />
            <span className="text-primary">UNIVERSO CELULAR</span>
          </Link>
          <MobileNavLink href="/admin">
            <span className="text-xl">🏠</span>
            Visión General
          </MobileNavLink>
          <MobileNavLink href="/admin/brands">
            <span className="text-xl">🏷️</span>
            Marcas y Modelos
          </MobileNavLink>
          <MobileNavLink href="/admin/services">
            <span className="text-xl">🔧</span>
            Servicios
          </MobileNavLink>
           <MobileNavLink href="/admin/prices">
            <span className="text-xl">💵</span>
            Precios
          </MobileNavLink>
          <MobileNavLink href="/admin/payment-methods">
            <span className="text-xl">💳</span>
             Medios de Pago
          </MobileNavLink>
          <MobileNavLink href="/admin/discount-mode">
            <span className="text-xl">💯</span>
            Modo Descuento
          </MobileNavLink>
          <MobileNavLink href="/admin/free-mode">
            <span className="text-xl">🎁</span>
            Modo Gratis
          </MobileNavLink>
          <MobileNavLink href="/admin/coupons">
            <span className="text-xl">🎟️</span>
            Cupones
          </MobileNavLink>
          <MobileNavLink href="/admin/popups">
            <span className="text-xl">📢</span>
            Pop-ups
          </MobileNavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
