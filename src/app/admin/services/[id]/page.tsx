
import { getServiceById } from "@/lib/actions/services";
import { notFound } from "next/navigation";
import { ServiceDetailClient } from "@/components/admin/service-detail-client";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: serviceId } = await params;
  const service = await getServiceById(serviceId);

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient initialService={service} />;
}
