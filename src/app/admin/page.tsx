
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading del componente admin dashboard
const DashboardClient = dynamic(
  () => import("@/components/admin/dashboard-client").then(mod => ({ default: mod.DashboardClient })),
  {
    loading: () => <AdminDashboardSkeleton />,
  }
);

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

// This page now relies entirely on the AdminDataProvider in the layout
// for its data. It's a simple server component that renders the client component.
export default function AdminDashboard() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
