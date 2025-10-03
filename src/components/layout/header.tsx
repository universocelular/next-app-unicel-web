
"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { EnhancedLogo } from "@/components/ui/enhanced-logo";
import { useHydration } from "../providers/hydration-provider";

export function Header() {
  const { isHydrated } = useHydration();

  return (
    <header className="py-2 px-4 sm:px-6 lg:px-8 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between ">
        <Link href="/" className="flex items-center flex-shrink-0">
          <div className="flex-shrink-0 flex items-center justify-center">
            {isHydrated ? (
              <EnhancedLogo
                width={150}
                height={150}
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 xl:h-32 xl:w-32"
                priority
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 xl:h-32 xl:w-32 bg-muted rounded animate-pulse" />
            )}
          </div>
          <span className="inline-block text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold tracking-tight text-primary leading-none sm:ml-0 md:-ml-2 lg:-ml-4 xl:-ml-6 self-center">UNIVERSO CELULAR</span>
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
