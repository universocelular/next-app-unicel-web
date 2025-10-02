"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { HydrationProvider } from "./providers/hydration-provider";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <HydrationProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={true}
        storageKey="theme"
        {...props}
      >
        {children}
      </NextThemesProvider>
    </HydrationProvider>
  );
}
