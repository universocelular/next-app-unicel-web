import { getModelById } from "@/lib/actions/models";
import { getServiceById } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { CarrierSelection } from "@/components/model/carrier-selection";
import { Header } from "@/components/layout/header";

export default async function ModelServiceUnlockPage({ 
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
          <CarrierSelection model={model} service={service} />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading carrier selection page:", error);
    notFound();
  }
}
