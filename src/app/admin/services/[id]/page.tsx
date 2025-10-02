
import { getServiceById, getServices } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/admin/service-detail-client";

export async function generateStaticParams() {
  try {
    const services = await getServices();
    return services.map((service) => ({
      id: service.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// This is now a Server Component responsible for data fetching.
export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: serviceId } = await params;
  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  // We pass the fetched data to a Client Component that handles interaction.
  return <ServiceDetailClient initialService={service} />;
}
