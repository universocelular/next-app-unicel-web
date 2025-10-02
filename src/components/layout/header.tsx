
"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";
import { useHydration } from "../providers/hydration-provider";

export function Header() {
  const { isHydrated } = useHydration();

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center flex-shrink-0 -space-x-2">
          {isHydrated ? (
            <EnhancedLogo
              width={150}
              height={150}
              className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
              priority
            />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 bg-muted rounded animate-pulse" />
          )}
          <span className="hidden sm:inline-block text-base md:text-lg font-bold tracking-tight text-primary -ml-4">UNIVERSO CELULAR</span>
        </Link>
        
        <div className="flex-1">
          {/* This space is intentionally left blank now */}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
