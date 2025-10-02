
"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLoader } from "@/components/layout/global-loader";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <div className="font-body antialiased">
        <GlobalLoader />
        {children}
        <Toaster />
      </div>
    </ThemeProvider>
  );
};
