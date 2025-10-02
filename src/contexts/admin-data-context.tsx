
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Brand, Model, Service, Coupon, Settings } from '@/lib/db/types';
import { getBrands } from '@/lib/actions/brands';
import { getModels } from '@/lib/actions/models';
import { getServices } from '@/lib/actions/services';
import { getCoupons } from '@/lib/actions/coupons';
import { getSettings } from '@/lib/actions/settings';


interface AdminDataContextType {
  brands: Brand[];
  models: Model[];
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  services: Service[];
  coupons: Coupon[];
  settings: Settings;
  refreshData: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ 
    children,
    initialBrands,
    initialModels,
    initialServices,
    initialCoupons,
    initialSettings
}: { 
    children: ReactNode;
    initialBrands: Brand[];
    initialModels: Model[];
    initialServices: Service[];
    initialCoupons: Coupon[];
    initialSettings: Settings;
}) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [models, setModels] = useState<Model[]>(initialModels);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const refreshData = useCallback(async () => {
    const [newBrands, newModels, newServices, newCoupons, newSettings] = await Promise.all([
      getBrands(),
      getModels(),
      getServices(),
      getCoupons(),
      getSettings(),
    ]);
    setBrands(newBrands);
    setModels(newModels);
    setServices(newServices);
    setCoupons(newCoupons);
    setSettings(newSettings);
  }, []);

  const value = { brands, models, setModels, services, coupons, settings, refreshData };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
