
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHydration } from "./providers/hydration-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { isHydrated } = useHydration();

  if (!isHydrated) {
    return <Button variant="ghost" size="icon" disabled={true} />;
  }

  const isDark = theme === "dark";

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
        {isDark ? (
            <span className="text-2xl transition-all">☀️</span>
        ) : (
            <span className="text-2xl transition-all">🌙</span>
        )}
        <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
