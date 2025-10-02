
import type { ReactNode } from "react";
import { AdminDataProvider } from "@/contexts/admin-data-context";
import { getBrands } from "@/lib/actions/brands";
import { getModels } from "@/lib/actions/models";
import { getServices } from "@/lib/actions/services";
import { getCoupons } from "@/lib/actions/coupons";
import { getSettings } from "@/lib/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { seedDatabase } from "@/lib/seed-db";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Fetch data once here and provide it to all admin pages via context.
  // Only run seeding in development or when not building
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PHASE) {
    await seedDatabase();
  }
  const [brands, models, services, coupons, settings] = await Promise.all([
    getBrands(),
    getModels(),
    getServices(),
    getCoupons(),
    getSettings(),
  ]);

  return (
    <AdminDataProvider 
        initialBrands={brands} 
        initialModels={models} 
        initialServices={services}
        initialCoupons={coupons}
        initialSettings={settings}
    >
        <AdminShell>
            {children}
        </AdminShell>
    </AdminDataProvider>
  );
}
