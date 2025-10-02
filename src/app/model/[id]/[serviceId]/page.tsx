import { getModelById, getModels } from "@/lib/actions/models";
import { getServiceById, getServices } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { SubServiceSelection } from "@/components/model/subservice-selection";
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

export default async function ModelServicePage({ 
  params 
}: { 
  params: Promise<{ id: string; serviceId: string }> 
}) {
  const { id: modelId, serviceId } = await params;
  
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
          <SubServiceSelection model={model} service={service} />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading model service page:", error);
    notFound();
  }
}