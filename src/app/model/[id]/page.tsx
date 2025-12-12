import { getModelById, getModels } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { ServiceSelection } from "@/components/model/service-selection";
import { Header } from "@/components/layout/header";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateStaticParams() {
  try {
    const models = await getModels();
    const topModels = models.slice(0, 50);

    return topModels.map((model) => ({
      id: model.id,
    }));
  } catch (error) {
    console.error("Error generating static params for top models:", error);
    return [];
  }
}

function ServiceSelectionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Skeleton className="h-8 w-64 mx-auto mb-4" />
      <Skeleton className="h-6 w-48 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: modelId } = await params;
  
  try {
    // Optimización: cargar modelo primero, servicios después
    const model = await getModelById(modelId);
    
    if (!model) {
      notFound();
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<ServiceSelectionSkeleton />}>
            <ServiceSelectionWrapper model={model} />
          </Suspense>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading model page:", error);
    notFound();
  }
}

// Componente wrapper para cargar servicios de forma lazy
async function ServiceSelectionWrapper({ model }: { model: any }) {
  const services = await getServices();
  return <ServiceSelection model={model} allServices={services} />;
}
