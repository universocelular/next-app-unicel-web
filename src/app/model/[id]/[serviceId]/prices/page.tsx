import { getModelById, getModels } from "@/lib/actions/models";
import { getServiceById, getServices } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { PricingDisplay } from "@/components/model/pricing-display";
import { Header } from "@/components/layout/header";
import { getApplicableServices } from "@/lib/utils";

export async function generateStaticParams() {
  try {
    const [models, services] = await Promise.all([
      getModels(),
      getServices()
    ]);

    const params: { id: string; serviceId: string }[] = [];
    
    for (const model of models) {
      const applicableServices = getApplicableServices(model, services);
      for (const service of applicableServices) {
        params.push({
          id: model.id,
          serviceId: service.id
        });
      }
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function ModelServicePricesPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string; serviceId: string }>;
  searchParams: Promise<{ carrierId?: string; subServiceId?: string }>;
}) {
  const { id: modelId, serviceId } = await params;
  const { carrierId, subServiceId } = await searchParams;
  
  try {
    const [model, service] = await Promise.all([
      getModelById(modelId),
      getServiceById(serviceId)
    ]);

    if (!model || !service) {
      notFound();
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <PricingDisplay 
            model={model} 
            service={service} 
            subServiceId={subServiceId}
            carrierId={carrierId}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading pricing page:", error);
    notFound();
  }
}