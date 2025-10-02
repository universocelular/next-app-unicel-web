
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/home/hero-section";
import { getModels } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { PopupDisplay } from "@/components/popups/popup-display";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 300; // 5 minutos de caché

// Componente de loading para la página principal
function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Skeleton className="h-12 w-96 mx-auto mb-4" />
      <Skeleton className="h-6 w-64 mx-auto mb-8" />
      <Skeleton className="h-12 w-80 mx-auto mb-8" />
    </div>
  );
}

export default async function HomePage() {
  // Prefetch crítico: cargar modelos y servicios en paralelo
  const [allModels] = await Promise.all([
    getModels(),
    // Prefetch servicios para caché (no bloquea la carga)
    getServices().catch(() => null)
  ]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<HomePageSkeleton />}>
          <HeroSection allModels={allModels} />
        </Suspense>
      </main>
      <PopupDisplay />
    </div>
  );
}
