"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EnhancedLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function EnhancedLogo({ 
  width = 150, 
  height = 150, 
  className = "", 
  priority = false 
}: EnhancedLogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      // Efectos de sombra adaptativos según el tema
      "drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]",
      // Filtro para mejorar contraste en modo oscuro
      "dark:brightness-110 dark:contrast-110",
      // Hover effects
      "hover:scale-105 hover:drop-shadow-md dark:hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]",
      // Bordes sutiles para mejor definición
      "rounded-lg",
      "bg-gradient-to-br from-transparent to-transparent",
      "dark:bg-gradient-to-br dark:from-white/5 dark:to-transparent",
      className
    )}>
      {!imageError ? (
        <Image
          src="/logo.png"
          alt="UNIVERSO CELULAR Logo"
          width={width}
          height={height}
          className={cn(
            "object-contain transition-all duration-300",
            // Filtros específicos para el logo
            "filter",
            // En modo claro: sombra sutil
            "drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
            // En modo oscuro: brillo y sombra blanca
            "dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]",
            "dark:brightness-105",
            // Bordes redondeados para el logo
            "rounded-md"
          )}
          priority={priority}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback usando img estática
        <img
          src="/logo.png"
          alt="UNIVERSO CELULAR Logo"
          width={width}
          height={height}
          className={cn(
            "object-contain transition-all duration-300",
            // Filtros específicos para el logo
            "filter",
            // En modo claro: sombra sutil
            "drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
            // En modo oscuro: brillo y sombra blanca
            "dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]",
            "dark:brightness-105",
            // Bordes redondeados para el logo
            "rounded-md"
          )}
        />
      )}
      
      {/* Overlay sutil para mejorar la visibilidad en modo oscuro */}
      <div className={cn(
        "absolute inset-0 rounded-lg pointer-events-none",
        "bg-gradient-to-br from-transparent via-transparent to-transparent",
        "dark:bg-gradient-to-br dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.05]",
        "opacity-0 dark:opacity-100 transition-opacity duration-300"
      )} />
    </div>
  );
}