import { getModelById } from "@/lib/actions/models";
import { getServiceById } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { SubServiceSelection } from "@/components/model/subservice-selection";
import { Header } from "@/components/layout/header";

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
